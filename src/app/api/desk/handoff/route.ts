import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { paymentsConfig } from "@/lib/payments/config";
import { getAuthenticatedAttempt, PaymentsError } from "@/lib/payments/service";
import { authenticatedRpc, rpc, verifiedAuthUser } from "@/lib/payments/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0", Pragma: "no-cache" },
  });
}

function getDeskHandoffTarget() {
  const raw = process.env.NEXT_PUBLIC_ELI_DESK_URL?.trim();
  if (!raw) throw new Error("desk_target_missing");
  const target = new URL(raw);
  if (!["http:", "https:"].includes(target.protocol) || target.username || target.password) {
    throw new Error("desk_target_invalid");
  }
  return { origin: target.origin, postUrl: new URL("/auth/handoff", target.origin).toString() };
}

async function ensureDeskMembership(
  accessToken: string,
  userId: string,
  attempt: Awaited<ReturnType<typeof getAuthenticatedAttempt>>,
) {
  if (!attempt.paymentApproved || attempt.entitlementState !== "ACTIVE") {
    throw new PaymentsError("paid_setup_not_ready", 409, "Todavía no se confirmó el acceso a Desk.");
  }

  if (attempt.organizationStatus === "pending_payment") {
    const organizationId = await rpc<string>("provision_paid_onboarding_owner", {
      p_attempt_id: attempt.attemptId,
      p_user_id: userId,
    });
    if (organizationId !== attempt.organizationId) {
      throw new PaymentsError("paid_setup_not_ready", 409, "No pudimos validar el acceso al tenant.");
    }
    return;
  }

  if (attempt.organizationStatus === "active" && attempt.operationalReady) {
    const memberships = await authenticatedRpc<
      Array<{ organization_id: string; membership_role: string; membership_status: string; organization_status: string }>
    >(accessToken, "get_auth_membership_states", {});
    if (
      memberships.some(
        (membership) =>
          membership.organization_id === attempt.organizationId &&
          membership.membership_role === "TENANT_OWNER" &&
          membership.membership_status === "active" &&
          membership.organization_status === "active",
      )
    ) {
      return;
    }
  }

  throw new PaymentsError("paid_setup_not_ready", 409, "Todavía no se confirmó el acceso a Desk.");
}

export async function POST(request: NextRequest) {
  const requestOrigin = request.headers.get("origin");
  if (!requestOrigin || requestOrigin !== request.nextUrl.origin) {
    return json({ ok: false, code: "invalid_origin" }, 403);
  }

  const accessToken = /^Bearer ([^\s]+)$/.exec(request.headers.get("authorization") ?? "")?.[1];
  if (!accessToken) return json({ ok: false, code: "authentication_required" }, 401);

  let attemptId = "";
  try {
    const body = (await request.json()) as { attemptId?: unknown };
    if (typeof body.attemptId !== "string" || !UUID_PATTERN.test(body.attemptId)) {
      return json({ ok: false, code: "invalid_request" }, 400);
    }
    attemptId = body.attemptId;
  } catch {
    return json({ ok: false, code: "invalid_request" }, 400);
  }

  try {
    const user = await verifiedAuthUser(accessToken);
    if (!user) return json({ ok: false, code: "authentication_required" }, 401);

    const attempt = await getAuthenticatedAttempt(attemptId, accessToken);
    if (attempt.status !== "approved") {
      return json({ ok: false, code: "paid_setup_not_ready" }, 409);
    }
    await ensureDeskMembership(accessToken, user.id, attempt);

    const config = paymentsConfig();
    const admin = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: user.email,
    });
    if (error || !data || !data.properties?.hashed_token || data.user.id !== user.id) {
      return json({ ok: false, code: "handoff_unavailable" }, 503);
    }

    const target = getDeskHandoffTarget();
    return json({ ok: true, tokenHash: data.properties.hashed_token, attemptId: attempt.attemptId, postUrl: target.postUrl });
  } catch (error) {
    if (error instanceof PaymentsError) {
      return json({ ok: false, code: error.code }, error.httpStatus);
    }
    return json({ ok: false, code: "handoff_unavailable" }, 503);
  }
}
