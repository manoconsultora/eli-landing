export function buildStubReconciliation(attempt: {
  id: string;
  external_reference: string;
  provider_subscription_id: string | null;
  amount: number;
  currency: string;
  created_at: string;
}, cardToken: string) {
  if (!attempt.provider_subscription_id?.startsWith("stub-preapproval-")) {
    throw new Error("stub_subscription_required");
  }
  const start = new Date(attempt.created_at);
  if (!Number.isFinite(start.getTime())) throw new Error("invalid_stub_period");
  const end = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
  const rejected = cardToken.includes("rejected");
  return {
    externalReference: attempt.external_reference,
    subscription: {
      id: attempt.provider_subscription_id,
      status: "authorized",
      external_reference: attempt.external_reference,
      auto_recurring: { start_date: start.toISOString(), end_date: end.toISOString() },
    },
    payment: {
      id: `stub-payment-${attempt.id}`,
      status: rejected ? "rejected" : "approved",
      status_detail: rejected ? "cc_rejected_other_reason" : "accredited",
      external_reference: attempt.external_reference,
      transaction_amount: Number(attempt.amount),
      currency_id: attempt.currency,
      date_approved: rejected ? undefined : start.toISOString(),
    },
    correlationId: `stub:${attempt.id}`,
  };
}
