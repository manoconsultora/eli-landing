import { NextRequest, NextResponse } from "next/server";

import { applyProviderLifecycleAction, PaymentsError } from "@/lib/payments/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedActions = new Set(["pause", "reactivate", "cancel"] as const);

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { attemptId?: string; action?: string };
    if (!allowedActions.has(body.action as "pause" | "reactivate" | "cancel")) {
      throw new PaymentsError("invalid_lifecycle_action", 400, "La acción no está permitida.");
    }
    const statusToken = request.headers.get("x-eli-payment-status-token") ?? "";
    const subscription = await applyProviderLifecycleAction({
      providerSubscriptionId: id,
      attemptId: body.attemptId ?? "",
      statusToken,
      action: body.action as "pause" | "reactivate" | "cancel",
    });
    return NextResponse.json({ ok: true, subscription });
  } catch (error) {
    if (error instanceof PaymentsError) {
      return NextResponse.json(
        { ok: false, code: error.code, message: error.message },
        { status: error.httpStatus },
      );
    }
    return NextResponse.json({ ok: false, code: "lifecycle_action_failed" }, { status: 503 });
  }
}
