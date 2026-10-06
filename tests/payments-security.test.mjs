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
  const checkoutStep = source.split("{step === 3 && (")[1]?.split("{step === 4 && (")[0] ?? "";
  assert.doesNotMatch(checkoutStep, /Enviar enlace de verificación|Reenviar enlace|Verificá tu email antes/);
  assert.match(source, /title="Verificá tu email"/);
  assert.match(source, /¡Tu cuenta fue activada!/);
  assert.match(source, /Bienvenido\/a a ELI/);
  assert.match(source, /Continuar con mi primer consorcio/);
  assert.match(source, /callbackReturnRef\.current/);
  assert.doesNotMatch(source, /function PlanSelection/);
  assert.match(source, /title="Elegí tu plan"/);
  assert.match(source, /payment\?\.operationalReady \? "Todo listo!" : "Pago aprobado, activación pendiente"/);
  assert.match(source, /step === steps\.length - 1 && operationalReady/);
  assert.doesNotMatch(source, /sessionStorage\.setItem\([^;]*cardToken/s);
});

test("checkout copy stays customer-facing while account validation remains silent", async () => {
  const source = await readFile(new URL("../src/components/SignupWizard/SignupWizard.tsx", import.meta.url), "utf8");
  const checkout = source.split("{step === 3 && (")[1]?.split("{step === 4 && (")[0] ?? "";
  assert.doesNotMatch(checkout, /Verificando si ya existe|variables server-side|configuración del checkout para este entorno/);
  assert.match(checkout, /Preparando tu checkout/);
  assert.match(checkout, /Elegí tu plan/);

  const card = await readFile(new URL("../src/components/SignupWizard/MercadoPagoSubscriptionCheckout.tsx", import.meta.url), "utf8");
  assert.match(card, /data-payment-card/);
  assert.match(card, /form-checkout__cardNumber/);
  assert.match(card, /from-\[#F3F4F2\]/);
  assert.match(card, /onToken/);
});

test("the auth callback is wired through both the App Shell and onboarding route", async () => {
  const home = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");
  const onboarding = await readFile(new URL("../src/app/onboarding/page.tsx", import.meta.url), "utf8");
  assert.match(home, /params\.code/);
  assert.match(home, /<SignupWizard \/>/);
  assert.match(home, /Suspense/);
  assert.match(onboarding, /import SignupWizard/);
  assert.match(onboarding, /<SignupWizard \/>/);
});
