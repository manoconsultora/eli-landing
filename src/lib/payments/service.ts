import { isPreviewTestEnvironment, paymentsConfig } from "./config";
import {
  hmac,
  matchesMercadoPagoSubscriptionBinding,
  newExternalReference,
  sha256,
  stableJson,
} from "./crypto";
import {
  createPreapproval,
  findPaymentsByExternalReference,
  getPayment,
  getPreapproval,
  updatePreapproval,
  type MercadoPagoPayment,
  type MercadoPagoSubscription,
} from "./mercadopago";
import { authenticatedRpc, databaseRequest, queryValue, rpc, verifiedAuthEmail } from "./supabase";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CARD_TOKEN_REGEX = /^[A-Za-z0-9_-]{8,512}$/;

export type CheckoutInput = {
  offerId: "core" | "professional";
  checkoutNonce: string;
  cardToken: string;
  administrationName: string;
  responsibleName: string;
  email: string;
  paymentEmailTest?: string;
  buildingName: string;
  buildingAddress: string;
  units: number;
  targetOrganizationId: string | null;
  newDistinctAdministration: boolean;
};

type CheckoutDecision =
  | { decision: "checkout_created"; checkout: CheckoutRow }
  | { decision: "resume_pending"; organization_id: string; attempt_id: string }
  | { decision: "retry_review_required"; organization_id: string; attempt_id: string }
  | { decision: "desk"; organization_id: string }
  | { decision: "regularize"; organization_id: string }
  | { decision: "selection_required" };

export type AccountInspection = {
  decision: "inspect";
  pending: Array<{
    organization_id: string;
    organization_name: string;
    attempt_id: string | null;
    attempt_status: string | null;
    plan_code: string | null;
  }>;
  organizations: Array<{
    organization_id: string;
    organization_name: string;
    organization_status: string;
    subscription_status: string | null;
    entitlement_state: string | null;
  }>;
};

type CheckoutRow = {
  attempt_id: string;
  organization_id: string;
  onboarding_session_id: string;
  plan_code: string;
  plan_name: string;
  plan_version_id: string;
  provider_preapproval_plan_id: string | null;
  amount: number;
  currency: "ARS";
  external_reference: string;
  attempt_status: string;
  reused: boolean;
};

type AttemptRow = {
  id: string;
  organization_id: string;
  external_reference: string;
  payer_email: string;
  amount: number;
  currency: string;
  status: string;
  provider_subscription_id: string | null;
  provider_status: string | null;
  failure_code: string | null;
  updated_at: string;
  organizations?: { status: string } | Array<{ status: string }> | null;
  onboarding_sessions?: { status: string } | Array<{ status: string }> | null;
  subscriptions:
    | {
        id: string;
        status: string;
        entitlement_state: string;
        first_payment_approved_at: string | null;
        current_period_end: string | null;
        cancel_at_period_end: boolean;
      }
    | Array<{
        id: string;
        status: string;
        entitlement_state: string;
        first_payment_approved_at: string | null;
        current_period_end: string | null;
        cancel_at_period_end: boolean;
      }>
    | null;
};

export class PaymentsError extends Error {
  constructor(
    public readonly code: string,
    public readonly httpStatus: number,
    message: string,
  ) {
    super(message);
  }
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function parseCheckoutInput(value: unknown): CheckoutInput {
  const body = (value ?? {}) as Record<string, unknown>;
  const offerId = body.offerId;
  const email = cleanText(body.email, 254).toLowerCase();
  const paymentEmailTest = cleanText(body.paymentEmailTest, 254).toLowerCase();
  const units = Number(body.units);
  const result: CheckoutInput = {
    offerId: offerId === "professional" ? "professional" : "core",
    checkoutNonce: cleanText(body.checkoutNonce, 128),
    cardToken: cleanText(body.cardToken, 512),
    administrationName: cleanText(body.administrationName, 160),
    responsibleName: cleanText(body.responsibleName, 160),
    email,
    ...(paymentEmailTest ? { paymentEmailTest } : {}),
    buildingName: cleanText(body.buildingName, 160),
    buildingAddress: cleanText(body.buildingAddress, 240),
    units,
    targetOrganizationId: cleanText(body.targetOrganizationId, 36) || null,
    newDistinctAdministration: body.newDistinctAdministration === true,
  };

  if (
    !["core", "professional"].includes(String(offerId)) ||
    !/^[A-Za-z0-9_-]{16,128}$/.test(result.checkoutNonce) ||
    !CARD_TOKEN_REGEX.test(result.cardToken) ||
    !result.administrationName ||
    !result.responsibleName ||
    !EMAIL_REGEX.test(result.email) ||
    !result.buildingName ||
    !result.buildingAddress ||
    !Number.isInteger(units) ||
    units < 1 ||
    units > 9999
    || (result.targetOrganizationId !== null && !/^[0-9a-f-]{36}$/i.test(result.targetOrganizationId))
  ) {
    throw new PaymentsError(
      "invalid_checkout_input",
      400,
      "Revisá los datos del checkout e intentá nuevamente.",
    );
  }
  if (paymentEmailTest && !isPreviewTestEnvironment()) {
    throw new PaymentsError(
      "payment_email_override_forbidden",
      400,
      "El email de pago TEST sólo está disponible en Preview TEST.",
    );
  }
  if (paymentEmailTest && !EMAIL_REGEX.test(paymentEmailTest)) {
    throw new PaymentsError("invalid_payment_email_test", 400, "Revisá el email de pago TEST.");
  }
  return result;
}

async function patchAttempt(attemptId: string, values: Record<string, unknown>) {
  await databaseRequest(`payment_attempts?id=eq.${queryValue(attemptId)}`, {
    method: "PATCH",
    body: JSON.stringify(values),
  });
}

function statusTokenFor(idempotencyHash: string) {
  const config = paymentsConfig();
  return hmac(config.statusTokenSecret, `payment-status:${idempotencyHash}`);
}

export async function inspectAuthenticatedCheckout(accessToken: string) {
  const email = await verifiedAuthEmail(accessToken);
  if (!email) {
    throw new PaymentsError("authentication_required", 401, "Ingresá con tu email para continuar.");
  }
  const result = await authenticatedRpc<AccountInspection>(
    accessToken,
    "resolve_authenticated_payment_checkout",
    { p_action: "inspect" },
  );
  if (result.decision !== "inspect" || !Array.isArray(result.pending) || !Array.isArray(result.organizations)) {
    throw new PaymentsError("account_resolution_unavailable", 503, "No pudimos verificar tu cuenta.");
  }
  return { email, ...result };
}

export async function beginCheckout(input: CheckoutInput, accessToken: string) {
  if (input.paymentEmailTest && !isPreviewTestEnvironment()) {
    throw new PaymentsError(
      "payment_email_override_forbidden",
      400,
      "El email de pago TEST sólo está disponible en Preview TEST.",
    );
  }
  const verifiedEmail = await verifiedAuthEmail(accessToken);
  if (!verifiedEmail || verifiedEmail !== input.email) {
    throw new PaymentsError("authentication_required", 401, "Ingresá con el email indicado para continuar.");
  }
  const config = paymentsConfig();
  const idempotencyHash = hmac(config.idempotencySecret, `checkout:${input.checkoutNonce}`);
  const statusToken = statusTokenFor(idempotencyHash);
  const payloadFingerprint = sha256(
    stableJson({
      offerId: input.offerId,
      administrationName: input.administrationName,
      responsibleName: input.responsibleName,
      email: input.email,
      buildingName: input.buildingName,
      buildingAddress: input.buildingAddress,
      units: input.units,
    }),
  );

  const decision = await authenticatedRpc<CheckoutDecision>(
    accessToken,
    "resolve_authenticated_payment_checkout",
    {
    p_action: "start",
    p_offer_code: input.offerId,
    p_idempotency_key_hash: idempotencyHash,
    p_payload_fingerprint: payloadFingerprint,
    p_external_reference: newExternalReference(),
    p_status_token_hash: sha256(statusToken),
    p_administration_name: input.administrationName,
    p_responsible_name: input.responsibleName,
    p_building_name: input.buildingName,
    p_building_address: input.buildingAddress,
    p_units: input.units,
    p_provider_environment: config.providerEnvironment,
    p_target_organization_id: input.targetOrganizationId,
    p_new_distinct_administration: input.newDistinctAdministration,
  },
  );

  if (decision.decision === "resume_pending") {
    const attempt = await getAttemptById(decision.attempt_id);
    if (attempt.organization_id !== decision.organization_id) {
      throw new PaymentsError("checkout_binding_mismatch", 409, "No pudimos reanudar este pago.");
    }
    return presentAttempt(attempt);
  }
  if (decision.decision === "selection_required") {
    throw new PaymentsError("account_selection_required", 409, "Elegí tu administración para continuar.");
  }
  if (decision.decision === "retry_review_required") {
    throw new PaymentsError("checkout_retry_review_required", 409, "Este pago requiere revisión antes de volver a intentarlo.");
  }
  if (decision.decision === "desk" || decision.decision === "regularize") {
    throw new PaymentsError(
      decision.decision === "desk" ? "manage_subscription_in_desk" : "regularization_required",
      409,
      decision.decision === "desk"
        ? "Tu administración ya tiene una suscripción activa. Gestioná el plan desde ELI Desk."
        : "Esta administración requiere regularización. No iniciamos otro cobro.",
    );
  }
  const checkout = decision.checkout;
  if (!checkout) throw new PaymentsError("checkout_not_created", 500, "No pudimos iniciar el checkout.");

  const current = checkout.reused
    ? await getAttemptById(checkout.attempt_id)
    : await getAttempt(checkout.attempt_id, statusToken);
  if (checkout.reused && current.provider_subscription_id) {
    return presentAttempt(current);
  }

  if (config.providerMode === "mercadopago" && !checkout.provider_preapproval_plan_id) {
    await patchAttempt(checkout.attempt_id, {
      status: "failed",
      failure_code: "provider_plan_not_configured",
      failure_detail: "Mercado Pago TEST preapproval plan mapping is pending",
      resolved_at: new Date().toISOString(),
    });
    throw new PaymentsError(
      "provider_plan_not_configured",
      503,
      "El checkout de prueba todavía requiere configurar el plan TEST de Mercado Pago.",
    );
  }

  const claimed = await rpc<boolean>("claim_payment_attempt_submission", {
    p_attempt_id: checkout.attempt_id,
  });
  if (!claimed) {
    return presentAttempt(await getAttemptById(checkout.attempt_id));
  }

  let preapproval: MercadoPagoSubscription;
  try {
    preapproval = await createPreapproval({
      trustedOffer: {
        preapprovalPlanId: checkout.provider_preapproval_plan_id ?? "stub-plan",
        reason: `ELI ${checkout.plan_name}`,
      },
      payerEmail: input.paymentEmailTest ?? input.email,
      cardToken: input.cardToken,
      externalReference: checkout.external_reference,
    });
  } catch (error) {
    const indeterminate = error instanceof Error && error.name === "AbortError";
    await patchAttempt(checkout.attempt_id, {
      status: indeterminate ? "indeterminate" : "failed",
      failure_code: indeterminate ? "provider_timeout" : "provider_request_failed",
      failure_detail: error instanceof Error ? error.message.slice(0, 500) : "provider_error",
    });
    throw new PaymentsError(
      indeterminate ? "provider_result_indeterminate" : "provider_unavailable",
      indeterminate ? 202 : 502,
      indeterminate
        ? "Mercado Pago sigue procesando la solicitud. Vamos a verificar el resultado."
        : "No pudimos crear la suscripción en Mercado Pago.",
    );
  }

  if (
    config.providerMode === "mercadopago" &&
    !matchesMercadoPagoSubscriptionBinding({
      expectedExternalReference: checkout.external_reference,
      expectedPlanId: checkout.provider_preapproval_plan_id!,
      subscription: preapproval,
    })
  ) {
    await patchAttempt(checkout.attempt_id, {
      status: "failed",
      failure_code: "provider_subscription_binding_mismatch",
      failure_detail: "Mercado Pago returned a subscription outside the selected offer binding",
      resolved_at: new Date().toISOString(),
    });
    throw new PaymentsError(
      "provider_subscription_binding_mismatch",
      409,
      "No pudimos verificar la suscripción creada. El intento quedó bloqueado para revisión.",
    );
  }

  await patchAttempt(checkout.attempt_id, {
    status: "provider_pending",
    provider_subscription_id: preapproval.id,
    provider_status: preapproval.status,
  });

  if (config.providerMode === "stub") {
    await reconcileProviderState({
      externalReference: checkout.external_reference,
      subscription: preapproval,
      payment: {
        id: `stub-payment-${checkout.attempt_id}`,
        status: input.cardToken.includes("rejected") ? "rejected" : "approved",
        status_detail: input.cardToken.includes("rejected") ? "cc_rejected_other_reason" : "accredited",
        external_reference: checkout.external_reference,
        transaction_amount: Number(checkout.amount),
        currency_id: checkout.currency,
      },
      actor: "reconciliation",
      correlationId: `stub:${checkout.attempt_id}`,
    });
  }

  return presentAttempt(await getAttempt(checkout.attempt_id, statusToken), statusToken);
}

export async function getAttempt(attemptId: string, statusToken: string) {
  if (!/^[0-9a-f-]{36}$/i.test(attemptId) || !/^[0-9a-f]{64}$/i.test(statusToken)) {
    throw new PaymentsError("status_not_found", 404, "No encontramos este estado de pago.");
  }
  const path =
    `payment_attempts?id=eq.${queryValue(attemptId)}` +
    `&status_token_hash=eq.${sha256(statusToken)}` +
    `&select=${attemptSelect}`;
  const rows = await databaseRequest<AttemptRow[]>(path);
  if (!rows[0]) throw new PaymentsError("status_not_found", 404, "No encontramos este estado de pago.");
  return rows[0];
}

const attemptSelect =
  "id,organization_id,external_reference,payer_email,amount,currency,status," +
  "provider_subscription_id,provider_status,failure_code,updated_at," +
  "organizations!payment_attempts_organization_id_fkey(status)," +
  "onboarding_sessions!payment_attempts_onboarding_session_id_fkey(status)," +
  "subscriptions!payment_attempts_subscription_organization_fkey(id,status,entitlement_state,first_payment_approved_at,current_period_end,cancel_at_period_end)";

async function getAttemptById(attemptId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(attemptId)) {
    throw new PaymentsError("status_not_found", 404, "No encontramos este estado de pago.");
  }
  const rows = await databaseRequest<AttemptRow[]>(
    `payment_attempts?id=eq.${queryValue(attemptId)}&select=${attemptSelect}&limit=1`,
  );
  if (!rows[0]) throw new PaymentsError("status_not_found", 404, "No encontramos este estado de pago.");
  return rows[0];
}

async function getAuthorizedAttempt(attemptId: string, accessToken: string) {
  let inspection: {
    decision: string;
    attempt?: { attempt_id: string; organization_id: string };
  };
  try {
    inspection = await authenticatedRpc(accessToken, "resolve_authenticated_payment_checkout", {
      p_action: "inspect_attempt",
      p_attempt_id: attemptId,
    });
  } catch {
    throw new PaymentsError("status_not_found", 404, "No encontramos este estado de pago.");
  }
  if (inspection.decision !== "inspect_attempt" || inspection.attempt?.attempt_id !== attemptId) {
    throw new PaymentsError("status_not_found", 404, "No encontramos este estado de pago.");
  }
  const attempt = await getAttemptById(attemptId);
  if (attempt.organization_id !== inspection.attempt.organization_id) {
    throw new PaymentsError("status_not_found", 404, "No encontramos este estado de pago.");
  }
  return attempt;
}

export async function getAuthenticatedAttempt(attemptId: string, accessToken: string) {
  return presentAttempt(await getAuthorizedAttempt(attemptId, accessToken));
}

export function presentAttempt(attempt: AttemptRow, statusToken?: string) {
  const relation = Array.isArray(attempt.subscriptions)
    ? attempt.subscriptions[0]
    : attempt.subscriptions;
  const organization = Array.isArray(attempt.organizations)
    ? attempt.organizations[0]
    : attempt.organizations;
  const session = Array.isArray(attempt.onboarding_sessions)
    ? attempt.onboarding_sessions[0]
    : attempt.onboarding_sessions;
  const paymentApproved = Boolean(relation?.first_payment_approved_at);
  const operationalReady = Boolean(
    paymentApproved &&
    relation?.entitlement_state === "ACTIVE" &&
    organization?.status === "active" &&
    session?.status === "completed"
  );
  return {
    attemptId: attempt.id,
    ...(statusToken ? { statusToken } : {}),
    status: attempt.status,
    providerStatus: attempt.provider_status,
    entitlementState: relation?.entitlement_state ?? "PENDING_PAYMENT",
    paymentApproved,
    operationalReady,
    active: operationalReady,
    currentPeriodEnd: relation?.current_period_end ?? null,
    cancelAtPeriodEnd: relation?.cancel_at_period_end ?? false,
    errorCode: attempt.failure_code,
    updatedAt: attempt.updated_at,
  };
}

export async function reconcileProviderState(input: {
  externalReference: string;
  subscription: MercadoPagoSubscription;
  payment?: MercadoPagoPayment;
  actor: "mercadopago_webhook" | "reconciliation";
  correlationId?: string;
}) {
  if (input.payment?.external_reference && input.payment.external_reference !== input.externalReference) {
    throw new PaymentsError("provider_reference_mismatch", 409, "La referencia del pago no coincide.");
  }

  const config = paymentsConfig();
  if (config.providerMode === "mercadopago") {
    const attempts = await databaseRequest<Array<{
      plan_version_id: string;
      provider_environment: string;
      provider_subscription_id: string | null;
    }>>(
      `payment_attempts?external_reference=eq.${queryValue(input.externalReference)}` +
        "&select=plan_version_id,provider_environment,provider_subscription_id&limit=1",
    );
    const attempt = attempts[0];
    if (
      !attempt ||
      attempt.provider_environment !== config.providerEnvironment ||
      !attempt.provider_subscription_id
    ) {
      throw new PaymentsError("provider_attempt_binding_mismatch", 409, "La suscripción no coincide con un intento válido.");
    }

    const versions = await databaseRequest<Array<{ provider_preapproval_plan_id: string | null }>>(
      `payment_plan_versions?id=eq.${queryValue(attempt.plan_version_id)}` +
        `&provider=eq.mercadopago&provider_environment=eq.${queryValue(attempt.provider_environment)}` +
        "&select=provider_preapproval_plan_id&limit=1",
    );
    const expectedPlanId = versions[0]?.provider_preapproval_plan_id;
    if (
      !expectedPlanId ||
      !matchesMercadoPagoSubscriptionBinding({
        expectedExternalReference: input.externalReference,
        expectedPlanId,
        expectedSubscriptionId: attempt.provider_subscription_id,
        requireBoundSubscription: true,
        subscription: input.subscription,
      })
    ) {
      throw new PaymentsError("provider_subscription_binding_mismatch", 409, "La suscripción no coincide con el plan seleccionado.");
    }
  }

  return rpc("reconcile_payment_state", {
    p_external_reference: input.externalReference,
    p_provider_subscription_id: input.subscription.id,
    p_provider_subscription_status: input.subscription.status,
    p_provider_payment_id: input.payment ? String(input.payment.id) : null,
    p_provider_payment_status: input.payment?.status ?? null,
    p_provider_payment_status_detail: input.payment?.status_detail ?? null,
    p_amount: input.payment?.transaction_amount ?? null,
    p_currency: input.payment?.currency_id ?? null,
    p_period_start:
      input.payment?.date_approved ??
      input.subscription.auto_recurring?.start_date ??
      null,
    p_period_end: null,
    p_provider_snapshot: {
      subscriptionStatus: input.subscription.status,
      paymentStatus: input.payment?.status ?? null,
      paymentStatusDetail: input.payment?.status_detail ?? null,
    },
    p_actor_type: input.actor,
    p_correlation_id: input.correlationId ?? null,
  });
}

export async function reconcileAttempt(attemptId: string, statusToken: string) {
  const attempt = await getAttempt(attemptId, statusToken);
  return reconcileAttemptRow(attempt, () => getAttempt(attemptId, statusToken));
}

export async function reconcileAuthenticatedAttempt(attemptId: string, accessToken: string) {
  const attempt = await getAuthorizedAttempt(attemptId, accessToken);
  return reconcileAttemptRow(attempt, () => getAuthorizedAttempt(attemptId, accessToken));
}

async function reconcileAttemptRow(attempt: AttemptRow, reload: () => Promise<AttemptRow>) {
  if (!attempt.provider_subscription_id) return presentAttempt(attempt);
  const config = paymentsConfig();
  if (config.providerMode === "stub") return presentAttempt(attempt);

  const subscription = await getPreapproval(attempt.provider_subscription_id);
  const candidates = await findPaymentsByExternalReference(attempt.external_reference);
  const candidate = candidates.find((payment) => payment.external_reference === attempt.external_reference);
  const payment = candidate ? await getPayment(String(candidate.id)) : undefined;
  await reconcileProviderState({
    externalReference: attempt.external_reference,
    subscription,
    payment,
    actor: "reconciliation",
    correlationId: `status:${attempt.id}`,
  });
  return presentAttempt(await reload());
}

export async function reconcileUnresolvedAttempts(limit = 25) {
  const config = paymentsConfig();
  if (config.providerMode === "stub") return { examined: 0, reconciled: 0 };
  const rows = await databaseRequest<AttemptRow[]>(
    "payment_attempts?status=in.(submitting,provider_pending,pending_review,indeterminate)" +
      "&provider_subscription_id=not.is.null" +
      "&select=id,organization_id,external_reference,payer_email,amount,currency,status," +
      "provider_subscription_id,provider_status,failure_code,updated_at," +
      "subscriptions!payment_attempts_subscription_organization_fkey(id,status,entitlement_state,first_payment_approved_at,current_period_end,cancel_at_period_end)" +
      `&order=updated_at.asc&limit=${Math.max(1, Math.min(limit, 100))}`,
  );
  let reconciled = 0;
  for (const attempt of rows) {
    try {
      const subscription = await getPreapproval(attempt.provider_subscription_id!);
      const candidates = await findPaymentsByExternalReference(attempt.external_reference);
      const candidate = candidates.find((payment) => payment.external_reference === attempt.external_reference);
      const payment = candidate ? await getPayment(String(candidate.id)) : undefined;
      await reconcileProviderState({
        externalReference: attempt.external_reference,
        subscription,
        payment,
        actor: "reconciliation",
        correlationId: `scheduled:${attempt.id}`,
      });
      reconciled += 1;
    } catch {
      // The durable attempt remains eligible for the next run.
    }
  }
  return { examined: rows.length, reconciled };
}

export async function applyLifecycle() {
  const rows = await rpc<Array<{ transitioned: number }>>("apply_subscription_lifecycle", {
    p_now: new Date().toISOString(),
  });
  return rows[0]?.transitioned ?? 0;
}

export async function lookupSubscription(
  providerSubscriptionId: string,
  attemptId: string,
  statusToken: string,
) {
  const attempt = await getAttempt(attemptId, statusToken);
  if (attempt.provider_subscription_id !== providerSubscriptionId) {
    throw new PaymentsError("subscription_not_found", 404, "No encontramos esta suscripción.");
  }
  const config = paymentsConfig();
  if (config.providerMode === "stub") {
    return {
      id: providerSubscriptionId,
      status: attempt.provider_status ?? "authorized",
      external_reference: attempt.external_reference,
    } satisfies MercadoPagoSubscription;
  }
  return getPreapproval(providerSubscriptionId);
}

const subscriptionLifecycle = {
  pause: "paused",
  reactivate: "authorized",
  cancel: "canceled",
} as const;

export async function applyProviderLifecycleAction(input: {
  providerSubscriptionId: string;
  attemptId: string;
  statusToken: string;
  action: keyof typeof subscriptionLifecycle;
}) {
  const attempt = await getAttempt(input.attemptId, input.statusToken);
  if (attempt.provider_subscription_id !== input.providerSubscriptionId) {
    throw new PaymentsError("subscription_not_found", 404, "No encontramos esta suscripción.");
  }
  const providerStatus = subscriptionLifecycle[input.action];
  if (!providerStatus) {
    throw new PaymentsError("invalid_lifecycle_action", 400, "La acción solicitada no está permitida.");
  }

  const config = paymentsConfig();
  const providerSubscription =
    config.providerMode === "stub"
      ? ({
          id: input.providerSubscriptionId,
          status: providerStatus,
          external_reference: attempt.external_reference,
        } satisfies MercadoPagoSubscription)
      : await updatePreapproval(input.providerSubscriptionId, providerStatus);

  const relation = Array.isArray(attempt.subscriptions)
    ? attempt.subscriptions[0]
    : attempt.subscriptions;
  if (relation) {
    await databaseRequest(`subscriptions?id=eq.${queryValue(relation.id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        provider_status: providerSubscription.status,
        ...(input.action === "cancel"
          ? {
              cancel_at_period_end: true,
              cancellation_requested_at: new Date().toISOString(),
            }
          : {}),
      }),
    });
  }

  return {
    id: providerSubscription.id,
    providerStatus: providerSubscription.status,
    cancelAtPeriodEnd: input.action === "cancel" || relation?.cancel_at_period_end || false,
    entitlementState: relation?.entitlement_state ?? "PENDING_PAYMENT",
  };
}
