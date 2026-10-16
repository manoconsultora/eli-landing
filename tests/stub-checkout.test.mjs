import assert from "node:assert/strict";
import test from "node:test";
import { buildStubReconciliation } from "../src/lib/payments/stub-checkout.ts";

const attempt = {
  id: "local-attempt",
  external_reference: "local-reference",
  provider_subscription_id: "stub-preapproval-local-reference",
  amount: 1000,
  currency: "ARS",
  created_at: "2026-10-15T04:00:00.000Z",
};

test("approved local fixture includes a stable valid coverage period and reuses payment identity", () => {
  const first = buildStubReconciliation(attempt, "stub-approved-token");
  const retry = buildStubReconciliation(attempt, "another-approved-token");
  assert.deepEqual(first, retry);
  assert.equal(first.payment.status, "approved");
  assert.equal(first.subscription.auto_recurring.start_date, first.payment.date_approved);
  assert.ok(Date.parse(first.subscription.auto_recurring.end_date) > Date.parse(first.payment.date_approved));
  assert.equal(first.payment.transaction_amount, attempt.amount);
});

test("rejected local fixture remains rejected", () => {
  const result = buildStubReconciliation(attempt, "stub-rejected-token");
  assert.equal(result.payment.status, "rejected");
  assert.equal(result.payment.date_approved, undefined);
});

test("local fixture refuses a real provider subscription", () => {
  assert.throws(() => buildStubReconciliation({ ...attempt, provider_subscription_id: "real-subscription" }, "token"), /stub_subscription_required/);
});
