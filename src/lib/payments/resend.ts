import { databaseRequest, queryValue } from "./supabase";

type OutboxRow = {
  id: string;
  template_key: "payment_approved" | "payment_rejected" | "renewal_failed";
  recipient_email: string;
  payload: Record<string, unknown>;
  attempts: number;
};

const content = {
  payment_approved: {
    subject: "Tu suscripción de ELI está activa",
    heading: "Pago aprobado",
    message: "Confirmamos el pago y habilitamos el acceso de tu administración a ELI.",
  },
  payment_rejected: {
    subject: "No pudimos aprobar tu pago de ELI",
    heading: "Pago rechazado",
    message: "Mercado Pago rechazó el primer cobro. Podés volver al checkout y usar otro medio de pago.",
  },
  renewal_failed: {
    subject: "Tuvimos un problema con la renovación de ELI",
    heading: "Renovación pendiente",
    message: "No pudimos confirmar la renovación. Revisá el medio de pago para evitar restricciones de acceso.",
  },
} as const;

async function patchOutbox(id: string, values: Record<string, unknown>) {
  await databaseRequest(`payment_email_outbox?id=eq.${queryValue(id)}`, {
    method: "PATCH",
    body: JSON.stringify(values),
  });
}

export async function drainPaymentEmailOutbox(limit = 20) {
  const enabled = process.env.RESEND_ENABLED === "true";
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  if (!enabled || !apiKey || !from) {
    return { gate: "resend_configuration_required", examined: 0, sent: 0 };
  }

  const rows = await databaseRequest<OutboxRow[]>(
    "payment_email_outbox?status=in.(pending,failed)&next_attempt_at=lte.now()" +
      "&template_key=in.(payment_approved,payment_rejected,renewal_failed)" +
      `&select=id,template_key,recipient_email,payload,attempts&order=created_at.asc&limit=${Math.max(1, Math.min(limit, 100))}`,
  );
  let sent = 0;
  for (const row of rows) {
    const template = content[row.template_key];
    await patchOutbox(row.id, { status: "sending", attempts: row.attempts + 1 });
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `eli-payment-email-${row.id}`,
        },
        body: JSON.stringify({
          from,
          to: [row.recipient_email],
          subject: template.subject,
          html: `<main><h1>${template.heading}</h1><p>${template.message}</p><p>Mercado Pago procesa el pago; ELI confirma tu acceso.</p></main>`,
        }),
      });
      if (!response.ok) throw new Error(`resend_failed:${response.status}`);
      const result = (await response.json()) as { id?: string };
      await patchOutbox(row.id, {
        status: "sent",
        provider_message_id: result.id ?? null,
        sent_at: new Date().toISOString(),
        last_error: null,
      });
      sent += 1;
    } catch (error) {
      await patchOutbox(row.id, {
        status: "failed",
        last_error: error instanceof Error ? error.message.slice(0, 500) : "resend_failed",
        next_attempt_at: new Date(Date.now() + 5 * 60_000).toISOString(),
      });
    }
  }
  return { gate: null, examined: rows.length, sent };
}
