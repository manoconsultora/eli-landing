import { NextRequest, NextResponse } from "next/server";

import { lookupSubscription, PaymentsError } from "@/lib/payments/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/subscriptions/:id — capability-protected server-side provider lookup.
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const attemptId = request.nextUrl.searchParams.get("attempt") ?? "";
    const statusToken = request.headers.get("x-eli-payment-status-token") ?? "";
    const subscription = await lookupSubscription(id, attemptId, statusToken);
    return NextResponse.json(
      { ok: true, subscription },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch (error) {
    if (error instanceof PaymentsError) {
      return NextResponse.json({ ok: false, code: error.code }, { status: error.httpStatus });
    }
    return NextResponse.json({ ok: false, code: "subscription_lookup_failed" }, { status: 503 });
  }
}
