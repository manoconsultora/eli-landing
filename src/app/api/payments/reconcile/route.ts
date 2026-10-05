import { NextRequest, NextResponse } from "next/server";

import { PaymentsError, reconcileAttempt } from "@/lib/payments/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { attemptId?: string };
    const statusToken = request.headers.get("x-eli-payment-status-token") ?? "";
    const result = await reconcileAttempt(body.attemptId ?? "", statusToken);
    return NextResponse.json(
      { ok: true, checkout: result },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch (error) {
    if (error instanceof PaymentsError) {
      return NextResponse.json(
        { ok: false, code: error.code, message: error.message },
        { status: error.httpStatus },
      );
    }
    return NextResponse.json(
      { ok: false, code: "reconciliation_unavailable" },
      { status: 503 },
    );
  }
}
