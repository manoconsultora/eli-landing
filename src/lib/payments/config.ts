export type PaymentsConfig = {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  idempotencySecret: string;
  statusTokenSecret: string;
  mercadoPagoAccessToken?: string;
  mercadoPagoNotificationUrl?: string;
  providerMode: "mercadopago" | "stub";
  providerEnvironment: "test" | "production";
  publicBaseUrl: string;
};

export function isPreviewTestEnvironment(providerEnvironment = process.env.MP_ENVIRONMENT) {
  return process.env.VERCEL_ENV === "preview" && providerEnvironment === "test";
}

export function isTestPaymentEnvironment(providerEnvironment = process.env.MP_ENVIRONMENT) {
  if (isPreviewTestEnvironment(providerEnvironment)) return true;
  if (providerEnvironment !== "test" || process.env.NODE_ENV !== "development") return false;
  try {
    const urls = [process.env.SUPABASE_URL, process.env.ELI_PUBLIC_BASE_URL];
    return urls.every((value) => value && ["localhost", "127.0.0.1", "[::1]"].includes(new URL(value).hostname));
  } catch {
    return false;
  }
}

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`missing_server_configuration:${name}`);
  return value;
}

export function paymentsConfig(): PaymentsConfig {
  const providerMode = process.env.MP_PROVIDER_MODE === "stub" ? "stub" : "mercadopago";
  const providerEnvironment = process.env.MP_ENVIRONMENT;

  if (providerEnvironment !== "test" && providerEnvironment !== "production") {
    throw new Error("missing_or_invalid_provider_environment");
  }

  if (providerMode === "stub" && process.env.NODE_ENV === "production") {
    throw new Error("stub_provider_forbidden_in_production");
  }

  return {
    supabaseUrl: required("SUPABASE_URL").replace(/\/$/, ""),
    supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
    idempotencySecret: required("PAYMENTS_IDEMPOTENCY_SECRET"),
    statusTokenSecret: required("PAYMENTS_STATUS_TOKEN_SECRET"),
    mercadoPagoAccessToken: process.env.MP_ACCESS_TOKEN?.trim(),
    mercadoPagoNotificationUrl: process.env.MP_NOTIFICATION_URL?.trim(),
    providerMode,
    providerEnvironment,
    publicBaseUrl: required("ELI_PUBLIC_BASE_URL").replace(/\/$/, ""),
  };
}
