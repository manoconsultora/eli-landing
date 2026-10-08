import { NextResponse } from "next/server";
import { isPreviewTestEnvironment } from "@/lib/payments/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const configured = (name: string) => Boolean(process.env[name]?.trim());

export async function GET() {
  const missing: string[] = [];
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "PAYMENTS_IDEMPOTENCY_SECRET",
    "PAYMENTS_STATUS_TOKEN_SECRET",
    "ELI_PUBLIC_BASE_URL",
    "MP_PROVIDER_MODE",
    "MP_ENVIRONMENT",
    "NEXT_PUBLIC_MP_ENVIRONMENT",
    "NEXT_PUBLIC_MP_PUBLIC_KEY",
  ];

  for (const name of required) {
    if (!configured(name)) missing.push(name);
  }

  const providerMode = process.env.MP_PROVIDER_MODE;
  const providerEnvironment = process.env.MP_ENVIRONMENT;
  if (providerMode && !["mercadopago", "stub"].includes(providerMode)) {
    missing.push("MP_PROVIDER_MODE (usar mercadopago o stub local)");
  }
  if (providerEnvironment && !["test", "production"].includes(providerEnvironment)) {
    missing.push("MP_ENVIRONMENT (usar test o production)");
  }
  if (providerMode === "mercadopago") {
    for (const name of ["MP_ACCESS_TOKEN", "MP_NOTIFICATION_URL"]) {
      if (!configured(name)) missing.push(name);
    }
  }
  if (
    providerEnvironment &&
    process.env.NEXT_PUBLIC_MP_ENVIRONMENT &&
    providerEnvironment !== process.env.NEXT_PUBLIC_MP_ENVIRONMENT
  ) {
    missing.push("NEXT_PUBLIC_MP_ENVIRONMENT (debe coincidir con MP_ENVIRONMENT)");
  }

  return NextResponse.json(
    {
      ready: missing.length === 0,
      missing,
      previewTest: isPreviewTestEnvironment(providerEnvironment),
    },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}
