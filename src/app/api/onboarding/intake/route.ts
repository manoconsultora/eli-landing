import { NextRequest, NextResponse } from "next/server";

import { receivePlatformOnboardingIntake } from "@/lib/platform-onboarding/intake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PROGRESS_VALUES = ["setup_in_progress", "checkout_started"] as const;

function bearerToken(request: NextRequest) {
  return /^Bearer ([^\s]+)$/.exec(request.headers.get("authorization") ?? "")?.[1] ?? "";
}

export async function POST(request: NextRequest) {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > 4_000) {
    return NextResponse.json({ ok: false, code: "payload_too_large" }, { status: 413 });
  }

  let rawBody: unknown;
  try {
    const text = await request.text();
    if (text.length > 4_000) {
      return NextResponse.json({ ok: false, code: "payload_too_large" }, { status: 413 });
    }
    rawBody = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false, code: "invalid_json" }, { status: 400 });
  }

  const body = rawBody && typeof rawBody === "object" ? rawBody as Record<string, unknown> : {};
  const administrationName = typeof body.administrationName === "string" ? body.administrationName.trim() : "";
  const responsibleName = typeof body.responsibleName === "string" ? body.responsibleName.trim() : "";
  const requestedPlanCode = body.requestedPlanCode;
  const onboardingProgress = body.onboardingProgress;
  if (
    typeof body.checkoutNonce !== "string" || !UUID_PATTERN.test(body.checkoutNonce) ||
    administrationName.length < 2 || administrationName.length > 160 ||
    responsibleName.length < 2 || responsibleName.length > 160 ||
    (requestedPlanCode !== "core" && requestedPlanCode !== "professional") ||
    (onboardingProgress !== undefined && !PROGRESS_VALUES.includes(onboardingProgress as (typeof PROGRESS_VALUES)[number]))
  ) {
    return NextResponse.json({ ok: false, code: "invalid_intake" }, { status: 400 });
  }
  const token = bearerToken(request);
  if (!token) return NextResponse.json({ ok: false, code: "authentication_required" }, { status: 401 });

  try {
    const result = await receivePlatformOnboardingIntake({
      checkoutNonce: body.checkoutNonce,
      administrationName,
      responsibleName,
      requestedPlanCode,
      onboardingProgress: onboardingProgress as (typeof PROGRESS_VALUES)[number] | undefined,
    }, token);
    return NextResponse.json({ ok: true, caseId: result.caseId }, {
      status: 200,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch (error) {
    const code = error instanceof Error ? error.message.split(":", 1)[0] : "intake_unavailable";
    const status = code === "authentication_required" || code === "verified_email_required" ? 401 : 503;
    return NextResponse.json({ ok: false, code }, { status });
  }
}
