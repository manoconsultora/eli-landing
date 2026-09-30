import { paymentsConfig } from "./config";
import { sha256, stableJson } from "./crypto";
import {
  getAuthorizedPayment,
  getPayment,
  getPreapproval,
  getPreapprovalPlan,
  type MercadoPagoPayment,
} from "./mercadopago";
import { reconcileProviderState } from "./service";
import { databaseRequest, queryValue, rpc } from "./supabase";

type WebhookBody = {
  id?: string | number;
  type?: string;
  action?: string;
  date_created?: string;
  data?: { id?: string | number };
};

type BillingEvent = {
  id: string;
  topic: string;
  resource_id: string;
  request_id: string;
  payload: WebhookBody;
  processing_status: string;
};

const SUBSCRIPTION_TOPICS = new Set([
  "subscription_preapproval_plan",
  "subscription_preapproval",
  "subscription_authorized_payment",
  "payment",
]);

function validProviderId(value: string) {
  return /^[A-Za-z0-9_-]{1,128}$/.test(value);
}

export async function storeWebhook(input: {
  body: WebhookBody;
  requestId: string;
}) {
  const topic = input.body.type?.trim() ?? "";
  const resourceId = String(input.body.data?.id ?? "").trim();
  const notificationId = String(input.body.id ?? "").trim();
  if (
    !SUBSCRIPTION_TOPICS.has(topic) ||
    !validProviderId(resourceId) ||
    !validProviderId(notificationId)
  ) {
    throw new Error("invalid_webhook_envelope");
  }

  // Subscription notifications configured at resource creation do not depend
  // on a secret from the global Webhooks panel. Treat the payload only as an
  // untrusted wake-up signal. The processor authenticates to Mercado Pago and
  // fetches the referenced resource before any local state can change.
  const deliveryFingerprint = sha256(
    `${notificationId}:${stableJson(input.body as Record<string, unknown>)}`,
  );
  const requestId = input.requestId.trim() || `notification:${notificationId}`;
  const rows = await databaseRequest<BillingEvent[]>(
    "billing_events?on_conflict=provider,provider_event_id",
    {
      method: "POST",
      prefer: "resolution=ignore-duplicates,return=representation",
      body: JSON.stringify({
        provider: "mercadopago",
        provider_event_id: deliveryFingerprint,
        event_type: topic,
        topic,
        resource_id: resourceId,
        request_id: requestId,
        signature_valid: false,
        delivery_fingerprint: deliveryFingerprint,
        payload: input.body,
        processing_status: "received",
      }),
    },
  );

  if (rows[0]) return { id: rows[0].id, duplicate: false };
  const existing = await databaseRequest<Array<{ id: string }>>(
    `billing_events?provider=eq.mercadopago&provider_event_id=eq.${queryValue(deliveryFingerprint)}&select=id&limit=1`,
  );
  return { id: existing[0]?.id, duplicate: true };
}

async function attemptByExternalReference(externalReference: string) {
  const rows = await databaseRequest<
    Array<{ external_reference: string; provider_subscription_id: string | null }>
  >(
    `payment_attempts?external_reference=eq.${queryValue(externalReference)}` +
      "&select=external_reference,provider_subscription_id&limit=1",
  );
  return rows[0];
}

async function patchEvent(id: string, values: Record<string, unknown>) {
  await databaseRequest(`billing_events?id=eq.${queryValue(id)}`, {
    method: "PATCH",
    body: JSON.stringify(values),
  });
}

async function isKnownPlan(planId: string) {
  const environment = paymentsConfig().providerEnvironment;
  const rows = await databaseRequest<Array<{ id: string }>>(
    `payment_plan_versions?provider=eq.mercadopago` +
      `&provider_environment=eq.${queryValue(environment)}` +
      `&provider_preapproval_plan_id=eq.${queryValue(planId)}` +
      "&select=id&limit=1",
  );
  return Boolean(rows[0]);
}

export async function processWebhook(eventId: string) {
  const rows = await databaseRequest<BillingEvent[]>(
    `billing_events?id=eq.${queryValue(eventId)}` +
      "&select=id,topic,resource_id,request_id,payload,processing_status&limit=1",
  );
  const event = rows[0];
  if (!event || event.processing_status === "processed" || event.processing_status === "ignored") return;

  const claimed = await rpc<boolean>("claim_payment_webhook_event", {
    p_event_id: event.id,
  });
  if (!claimed) return;

  try {
    if (event.topic === "subscription_preapproval_plan") {
      const plan = await getPreapprovalPlan(event.resource_id);
      if (!(await isKnownPlan(plan.id))) {
        await patchEvent(event.id, {
          processing_status: "ignored",
          processed_at: new Date().toISOString(),
          locked_at: null,
        });
        return;
      }
    } else if (event.topic === "subscription_preapproval") {
      const subscription = await getPreapproval(event.resource_id);
      if (!subscription.external_reference) throw new Error("subscription_external_reference_missing");
      await reconcileProviderState({
        externalReference: subscription.external_reference,
        subscription,
        actor: "mercadopago_webhook",
        correlationId: event.request_id,
      });
    } else if (event.topic === "subscription_authorized_payment") {
      const invoice = await getAuthorizedPayment(event.resource_id);
      if (!invoice.preapproval_id) throw new Error("authorized_payment_preapproval_missing");
      const subscription = await getPreapproval(invoice.preapproval_id);
      if (!subscription.external_reference) throw new Error("subscription_external_reference_missing");
      const paymentId = invoice.payment_id ?? invoice.payment?.id;
      const payment = paymentId ? await getPayment(String(paymentId)) : undefined;
      await reconcileProviderState({
        externalReference: subscription.external_reference,
        subscription,
        payment,
        actor: "mercadopago_webhook",
        correlationId: event.request_id,
      });
    } else if (event.topic === "payment") {
      const payment = await getPayment(event.resource_id);
      if (!payment.external_reference) throw new Error("payment_external_reference_missing");
      const attempt = await attemptByExternalReference(payment.external_reference);
      if (!attempt?.provider_subscription_id) throw new Error("payment_subscription_not_bound");
      const subscription = await getPreapproval(attempt.provider_subscription_id);
      await reconcileProviderState({
        externalReference: payment.external_reference,
        subscription,
        payment: payment as MercadoPagoPayment,
        actor: "mercadopago_webhook",
        correlationId: event.request_id,
      });
    } else {
      await patchEvent(event.id, {
        processing_status: "ignored",
        processed_at: new Date().toISOString(),
        locked_at: null,
      });
      return;
    }

    await patchEvent(event.id, {
      processing_status: "processed",
      processed_at: new Date().toISOString(),
      locked_at: null,
    });
  } catch (error) {
    await patchEvent(event.id, {
      processing_status: "failed",
      next_attempt_at: new Date(Date.now() + 60_000).toISOString(),
      locked_at: null,
      last_error_at: new Date().toISOString(),
      error_message: error instanceof Error ? error.message.slice(0, 500) : "webhook_processing_failed",
    });
    throw error;
  }
}
