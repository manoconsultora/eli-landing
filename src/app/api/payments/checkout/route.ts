import { NextRequest, NextResponse } from "next/server";

import {
  beginCheckout,
  parseCheckoutInput,
  PaymentsError,
} from "@/lib/payments/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_LENGTH = 12_000;

export async function POST(request: NextRequest) {
  try {
    const declaredLength = Number(request.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_BODY_LENGTH) {
      return NextResponse.json({ ok: false, code: "payload_too_large" }, { status: 413 });
    }
    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_LENGTH) {
      return NextResponse.json({ ok: false, code: "payload_too_large" }, { status: 413 });
    }
    const checkout = await beginCheckout(parseCheckoutInput(JSON.parse(rawBody)));
    return NextResponse.json({ ok: true, checkout }, { status: checkout.active ? 201 : 202 });
  } catch (error) {
    if (error instanceof PaymentsError) {
      return NextResponse.json(
        { ok: false, code: error.code, message: error.message },
        { status: error.httpStatus },
      );
    }
    return NextResponse.json(
      {
        ok: false,
        code: "checkout_unavailable",
        message: "El checkout no está disponible temporalmente.",
      },
      { status: 503 },
    );
  }
}
