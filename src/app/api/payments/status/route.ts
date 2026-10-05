import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedAttempt, PaymentsError } from "@/lib/payments/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const attemptId = request.nextUrl.searchParams.get("attempt") ?? "";
    const accessToken = /^Bearer ([^\s]+)$/.exec(request.headers.get("authorization") ?? "")?.[1];
    if (!accessToken) {
      throw new PaymentsError("authentication_required", 401, "Ingresá con tu email para continuar.");
    }
    const result = await getAuthenticatedAttempt(attemptId, accessToken);
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
