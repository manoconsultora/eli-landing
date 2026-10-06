import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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

test("the initial wizard step has no authentication gate and card data is not stored", async () => {
  const source = await readFile(new URL("../src/components/SignupWizard/SignupWizard.tsx", import.meta.url), "utf8");
  const initialStep = source.split("{step === 0 && (")[1]?.split("{step === 1 && (")[0] ?? "";

  assert.ok(initialStep.length > 0);
  assert.doesNotMatch(initialStep, /requestEmailSignIn|authClient|verifiedEmail|signInNotice/);
  assert.match(source, /disabled=\{!checkoutCanStart\}/);
  assert.match(source, /payment\?\.operationalReady \? "Todo listo!" : "Pago aprobado, activación pendiente"/);
  assert.match(source, /step === steps\.length - 1 && operationalReady/);
  assert.doesNotMatch(source, /sessionStorage\.setItem\([^;]*cardToken/s);
});
