import { NextRequest, NextResponse } from "next/server";

import { drainPaymentEmailOutbox } from "@/lib/payments/resend";
import { applyLifecycle, reconcileUnresolvedAttempts } from "@/lib/payments/service";
import { databaseRequest } from "@/lib/payments/supabase";
import { processWebhook } from "@/lib/payments/webhooks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const secret = process.env.ELI_INTERNAL_JOBS_SECRET?.trim();
  const authorization = request.headers.get("authorization");
  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, code: "unauthorized" }, { status: 401 });
  }

  const events = await databaseRequest<Array<{ id: string }>>(
    "billing_events?processing_status=in.(received,failed,processing)" +
      "&select=id&order=received_at.asc&limit=25",
  );
  let webhookProcessed = 0;
  for (const event of events) {
    try {
      await processWebhook(event.id);
      webhookProcessed += 1;
    } catch {
      // Durable retry metadata was persisted by processWebhook.
    }
  }

  const reconciliation = await reconcileUnresolvedAttempts();
  const lifecycleTransitions = await applyLifecycle();
  const email = await drainPaymentEmailOutbox();
  return NextResponse.json({
    ok: true,
    webhook: { examined: events.length, processed: webhookProcessed },
    reconciliation,
    lifecycleTransitions,
    email,
  });
}
