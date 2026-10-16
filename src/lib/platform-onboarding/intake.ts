import { createHmac } from "node:crypto";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type IntakeInput = {
  checkoutNonce: string;
  administrationName: string;
  responsibleName: string;
  requestedPlanCode: "core" | "professional";
  onboardingProgress?: "setup_in_progress" | "checkout_started";
  paymentStatus?: "not_started" | "pending" | "approved" | "rejected" | "failed";
};

type AuthUser = {
  id?: string;
  email?: string;
  email_confirmed_at?: string | null;
};

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`missing_server_configuration:${name}`);
  return value;
}

export async function receivePlatformOnboardingIntake(
  input: IntakeInput,
  accessToken: string,
) {
  if (!UUID_PATTERN.test(input.checkoutNonce)) throw new Error("invalid_intake_key");
  const supabaseUrl = required("SUPABASE_URL").replace(/\/$/, "");
  const anonKey = required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");
  if (process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "") !== supabaseUrl) {
    throw new Error("authenticated_database_configuration_mismatch");
  }

  const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    cache: "no-store",
    headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}` },
  });
  if (!authResponse.ok) throw new Error("authentication_required");
  const user = (await authResponse.json()) as AuthUser;
  if (!user.id || !user.email || !user.email_confirmed_at) {
    throw new Error("verified_email_required");
  }

  const key = createHmac("sha256", serviceRoleKey)
    .update(`platform-onboarding-intake:${user.id}:${input.checkoutNonce}`)
    .digest("hex");
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/platform_onboarding_receive_landing_intake`, {
    method: "POST",
    cache: "no-store",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      p_idempotency_key: key,
      p_source_user_id: user.id,
      p_contact_name: input.responsibleName.trim(),
      p_contact_email: user.email.trim().toLowerCase(),
      p_organization_name: input.administrationName.trim(),
      p_requested_plan_code: input.requestedPlanCode,
      p_onboarding_progress: input.onboardingProgress ?? "setup_in_progress",
      p_payment_status: input.paymentStatus ?? null,
      p_request_summary: "Alta iniciada desde Landing. El estado de pago se muestra por separado; la bandeja permite seguimiento e intervención sin agregar una aprobación manual al flujo.",
    }),
  });
  if (!response.ok) {
    const requestId = response.headers.get("x-request-id") ?? "unknown";
    throw new Error(`intake_database_unavailable:${response.status}:${requestId}`);
  }
  const caseId = (await response.json()) as unknown;
  if (typeof caseId !== "string" || !UUID_PATTERN.test(caseId)) {
    throw new Error("intake_response_invalid");
  }
  return { caseId, contactEmail: user.email.trim().toLowerCase() };
}
