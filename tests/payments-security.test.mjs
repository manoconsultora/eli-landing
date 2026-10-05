import assert from "node:assert/strict";
import test from "node:test";

import { matchesMercadoPagoSubscriptionBinding } from "../src/lib/payments/crypto.ts";

test("requires the provider subscription to match the ELI reference, plan, and bound ID", () => {
  const expected = {
    expectedExternalReference: "eli_review_reference",
    expectedPlanId: "plan_review_core",
    expectedSubscriptionId: "subscription_review_1",
    requireBoundSubscription: true,
  };
  const subscription = {
    id: "subscription_review_1",
    external_reference: "eli_review_reference",
    preapproval_plan_id: "plan_review_core",
  };

  assert.equal(matchesMercadoPagoSubscriptionBinding({ ...expected, subscription }), true);
  assert.equal(
    matchesMercadoPagoSubscriptionBinding({
      ...expected,
      subscription: { ...subscription, external_reference: "eli_other_reference" },
    }),
    false,
  );
  assert.equal(
    matchesMercadoPagoSubscriptionBinding({
      ...expected,
      subscription: { ...subscription, preapproval_plan_id: "plan_review_pro" },
    }),
    false,
  );
  assert.equal(
    matchesMercadoPagoSubscriptionBinding({
      ...expected,
      subscription: { ...subscription, id: "subscription_review_2" },
    }),
    false,
  );
  assert.equal(
    matchesMercadoPagoSubscriptionBinding({
      ...expected,
      subscription: { ...subscription, id: undefined },
    }),
    false,
  );
});
