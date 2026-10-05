import { NextRequest, NextResponse } from "next/server";

import { getAttempt, PaymentsError, presentAttempt } from "@/lib/payments/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const attemptId = request.nextUrl.searchParams.get("attempt") ?? "";
    const statusToken = request.headers.get("x-eli-payment-status-token") ?? "";
    const result = presentAttempt(await getAttempt(attemptId, statusToken));
    return NextResponse.json(
      { ok: true, checkout: result },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch (error) {
    if (error instanceof PaymentsError) {
      return NextResponse.json({ ok: false, code: error.code }, { status: error.httpStatus });
    }
    return NextResponse.json({ ok: false, code: "status_unavailable" }, { status: 503 });
  }
}
