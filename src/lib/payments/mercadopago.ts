import { paymentsConfig } from "./config";

const API_BASE = "https://api.mercadopago.com";
const PREAPPROVAL_ENDPOINT = "https://api.mercadopago.com/preapproval";
const TIMEOUT_MS = 12_000;
const SAFE_CAUSE_FIELDS = new Set(["code", "description", "message", "type", "field", "path"]);

function redactProviderText(value: string, secrets: string[], maxLength = 80) {
  let safe = value;
  for (const secret of secrets) {
    if (secret.length >= 4) safe = safe.split(secret).join("[REDACTED]");
  }
  return safe
    .replace(/\bBearer\s+\S+/gi, "Bearer [REDACTED]")
    .replace(/\b(?:APP_USR|TEST)-[A-Za-z0-9_-]{8,}\b/g, "[REDACTED_TOKEN]")
    .replace(/(\b(?:cvv|cvc|security[_ -]?code)\s*[:=]\s*)\S+/gi, "$1[REDACTED]")
    .replace(/(?:\d[ -]?){13,19}/g, "[REDACTED_CARD_NUMBER]")
    .slice(0, maxLength);
}

function safeProviderCause(value: unknown, secrets: string[]): unknown {
  if (Array.isArray(value)) return value.slice(0, 1).map((item) => safeProviderCause(item, secrets));
  if (!value || typeof value !== "object") {
    return typeof value === "string" ? redactProviderText(value, secrets) : undefined;
  }

  const safe: Record<string, string | number | boolean> = {};
  let retainedFields = 0;
  for (const [key, field] of Object.entries(value as Record<string, unknown>)) {
    const normalizedKey = key.toLowerCase();
    if (/token|auth|card|pan|cvv|security|password|secret|number/.test(normalizedKey)) continue;
    if (!SAFE_CAUSE_FIELDS.has(normalizedKey)) continue;
    if (typeof field === "string") safe[normalizedKey] = redactProviderText(field, secrets, 60);
    else if (typeof field === "number" || typeof field === "boolean") safe[normalizedKey] = field;
    else continue;
    retainedFields += 1;
    if (retainedFields === 2) break;
  }
  return Object.keys(safe).length ? safe : undefined;
}

async function safeProviderDetails(response: Response, secrets: string[]) {
  try {
    const body = await response.json() as Record<string, unknown>;
    const details: Record<string, unknown> = {};
    for (const field of ["error", "message"] as const) {
      if (typeof body?.[field] === "string") {
        details[field] = redactProviderText(body[field] as string, secrets);
      }
    }
    const cause = safeProviderCause(body?.cause, secrets);
    if (cause !== undefined) details.cause = cause;
    return JSON.stringify(details);
  } catch {
    // Never retain a raw response body: it may contain credentials or card data.
    return "";
  }
}

export type MercadoPagoSubscription = {
  id: string;
  status: string;
  external_reference?: string;
  preapproval_plan_id?: string;
  init_point?: string;
  auto_recurring?: {
    start_date?: string;
    end_date?: string;
    transaction_amount?: number;
    currency_id?: string;
  };
};

export type MercadoPagoPayment = {
  id: string | number;
  status: string;
  status_detail?: string;
  external_reference?: string;
  transaction_amount?: number;
  currency_id?: string;
  date_approved?: string;
  date_created?: string;
  metadata?: Record<string, unknown>;
};

export type MercadoPagoAuthorizedPayment = {
  id: string | number;
  status: string;
  preapproval_id?: string;
  payment_id?: string | number;
  payment?: { id?: string | number; status?: string };
  transaction_amount?: number;
  currency_id?: string;
};

export type MercadoPagoPreapprovalPlan = {
  id: string;
  status?: string;
};

function subscriptionNotificationUrl() {
  const value = paymentsConfig().mercadoPagoNotificationUrl;
  if (!value) throw new Error("mercadopago_notification_url_required");

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("mercadopago_notification_url_invalid");
  }
  if (url.protocol !== "https:" || url.username || url.password || value.length > 500) {
    throw new Error("mercadopago_notification_url_invalid");
  }
  return url.toString();
}

async function mpFetch<T>(path: string, init?: RequestInit, sensitiveValues: string[] = []): Promise<T> {
  const config = paymentsConfig();
  if (!config.mercadoPagoAccessToken) throw new Error("mercadopago_test_access_token_required");
  const secrets = [config.mercadoPagoAccessToken, ...sensitiveValues];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = path.startsWith("https://") ? path : `${API_BASE}${path}`;
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${config.mercadoPagoAccessToken}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    if (!response.ok) {
      const rawRequestId = response.headers.get("x-request-id") ?? "unknown";
      const requestId = /^[A-Za-z0-9._:-]{1,64}$/.test(rawRequestId) ? rawRequestId : "unknown";
      const details = await safeProviderDetails(response, secrets);
      throw new Error(`mercadopago_request_failed:${response.status}:${requestId}${details && details !== "{}" ? `:${details}` : ""}`);
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export async function createPreapproval(input: {
  trustedOffer: { preapprovalPlanId: string; reason: string };
  payerEmail: string;
  cardToken: string;
  externalReference: string;
}) {
  const config = paymentsConfig();
  if (config.providerMode === "stub") {
    return {
      id: `stub-preapproval-${input.externalReference}`,
      status: "authorized",
      external_reference: input.externalReference,
    } satisfies MercadoPagoSubscription;
  }

  void PREAPPROVAL_ENDPOINT;
  const trustedOffer = input.trustedOffer;
  return mpFetch("/preapproval", {
    method: "POST",
    body: JSON.stringify({
      preapproval_plan_id: trustedOffer.preapprovalPlanId,
      payer_email: input.payerEmail,
      card_token_id: input.cardToken,
      external_reference: input.externalReference,
      reason: trustedOffer.reason,
      back_url: `${config.publicBaseUrl}/onboarding`,
      notification_url: subscriptionNotificationUrl(),
      status: "authorized",
    }),
  }, [input.cardToken]) as Promise<MercadoPagoSubscription>;
}

export function getPreapproval(id: string) {
  return mpFetch<MercadoPagoSubscription>(
    `https://api.mercadopago.com/preapproval/${encodeURIComponent(id)}`,
  );
}

export function getPreapprovalPlan(id: string) {
  return mpFetch<MercadoPagoPreapprovalPlan>(
    `https://api.mercadopago.com/preapproval_plan/${encodeURIComponent(id)}`,
  );
}

export function getPayment(id: string) {
  return mpFetch<MercadoPagoPayment>(`/v1/payments/${encodeURIComponent(id)}`);
}

export function getAuthorizedPayment(id: string) {
  return mpFetch<MercadoPagoAuthorizedPayment>(
    `/authorized_payments/${encodeURIComponent(id)}`,
  );
}

export async function findPaymentsByExternalReference(externalReference: string) {
  const result = await mpFetch<{ results?: MercadoPagoPayment[] }>(
    `/v1/payments/search?external_reference=${encodeURIComponent(externalReference)}&sort=date_created&criteria=desc`,
  );
  return result.results ?? [];
}

export function updatePreapproval(
  id: string,
  status: "paused" | "authorized" | "canceled",
) {
  return mpFetch<MercadoPagoSubscription>(
    `https://api.mercadopago.com/preapproval/${encodeURIComponent(id)}`,
    { method: "PUT", body: JSON.stringify({ status }) },
  );
}
