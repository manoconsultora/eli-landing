import { after, NextRequest, NextResponse } from "next/server";

import { processWebhook, storeWebhook } from "@/lib/payments/webhooks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_LENGTH = 64_000;

export async function POST(request: NextRequest) {
  try {
    const requestId = request.headers.get("x-request-id") ?? "";
    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_LENGTH) {
      return new NextResponse(null, { status: 413 });
    }
    const body = JSON.parse(rawBody) as {
      id?: string | number;
      type?: string;
      action?: string;
      date_created?: string;
      data?: { id?: string | number };
    };
    const stored = await storeWebhook({ body, requestId });
    if (stored.id && !stored.duplicate) {
      after(async () => {
        try {
          await processWebhook(stored.id!);
        } catch {
          // The durable inbox retains the error and next retry timestamp.
        }
      });
    }
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    void error;
    return new NextResponse(null, { status: 400 });
  }
}
