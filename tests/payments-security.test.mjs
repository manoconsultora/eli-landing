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
  assert.match(source, /hasAuthCallbackError/);
  assert.match(source, /sanitizeAuthCallbackUrl/);
  assert.match(source, /Tu cuenta ya está activada/);
  assert.match(source, /Este enlace venció o ya fue utilizado/);
  assert.match(source, /Solicitar un nuevo enlace/);
  assert.doesNotMatch(source, /function PlanSelection/);
  assert.match(source, /title="Elegí tu plan"/);
  assert.match(source, /title="All Set!"/);
  assert.match(source, /splitTitleWeight/);
  assert.match(source, /font-extrabold/);
  assert.match(source, /font-thin/);
  assert.match(source, /text-\[#2346DD\]/);
  assert.doesNotMatch(source, /Tu pago fue acreditado\./);
  assert.doesNotMatch(source, /El Setup de tu administración sigue pendiente/);
  assert.doesNotMatch(source, /Pago aprobado; activación todavía pendiente\./);
  assert.match(source, /step === steps\.length - 1 && operationalReady/);
  assert.doesNotMatch(source, /sessionStorage\.setItem\([^;]*cardToken/s);
});

test("payment approval ends reconciliation polling without overlapping requests", async () => {
  const polling = await readFile(new URL("../src/components/SignupWizard/payment-polling.ts", import.meta.url), "utf8");
  const wizard = await readFile(new URL("../src/components/SignupWizard/SignupWizard.tsx", import.meta.url), "utf8");

  assert.match(wizard, /startSequentialPolling\(async \(\) =>/);
  assert.match(wizard, /if \(result\.checkout\.paymentApproved\) \{\s*active = false;\s*navigate\(5, 1\);\s*return false;/);
  assert.match(wizard, /if \(result\.checkout\.status === "rejected"\) \{\s*active = false;\s*return false;/);
  assert.match(polling, /timer = setTimeout\(\(\) => void poll\(\), intervalMs\)/);
  assert.doesNotMatch(wizard, /setInterval\(\(\) => void refresh\(\), 3000\)/);
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
  assert.match(card, /\/images\/mercadopago\.svg/);
  assert.match(card, /opacity-60 grayscale/);
});

test("the auth callback is wired through both the App Shell and onboarding route", async () => {
  const home = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");
  const onboarding = await readFile(new URL("../src/app/onboarding/page.tsx", import.meta.url), "utf8");
  assert.match(home, /params\.code/);
  assert.match(home, /authCallbackError/);
  assert.match(home, /<SignupWizard \/>/);
  assert.match(home, /Suspense/);
  assert.match(onboarding, /import SignupWizard/);
  assert.match(onboarding, /<SignupWizard \/>/);
});
