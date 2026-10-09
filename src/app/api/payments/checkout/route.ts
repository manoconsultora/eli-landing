import { NextRequest, NextResponse } from "next/server";

import {
  beginCheckout,
  inspectAuthenticatedCheckout,
  parseCheckoutInput,
  PaymentsError,
} from "@/lib/payments/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_LENGTH = 12_000;

function bearerToken(request: NextRequest) {
  return /^Bearer ([^\s]+)$/.exec(request.headers.get("authorization") ?? "")?.[1] ?? "";
}

export async function GET(request: NextRequest) {
  try {
    const account = await inspectAuthenticatedCheckout(bearerToken(request));
    return NextResponse.json(
      { ok: true, account },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch (error) {
    if (error instanceof PaymentsError) {
      return NextResponse.json({ ok: false, code: error.code }, { status: error.httpStatus });
    }
    return NextResponse.json({ ok: false, code: "account_resolution_unavailable" }, { status: 503 });
  }
}

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
    const checkout = await beginCheckout(parseCheckoutInput(JSON.parse(rawBody)), bearerToken(request));
    return NextResponse.json({ ok: true, checkout }, { status: checkout.active ? 201 : 202 });
  } catch (error) {
    if (error instanceof PaymentsError) {
      return NextResponse.json(
        { ok: false, code: error.code, message: error.message },
        { status: error.httpStatus },
      );
    }
    const code = error && typeof error === "object" && "code" in error
      && (typeof error.code === "string" || typeof error.code === "number")
      ? error.code
      : undefined;
    console.error("checkout_unavailable", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : "Non-Error thrown",
      stack: error instanceof Error ? error.stack : undefined,
      ...(code !== undefined ? { code } : {}),
    });
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
