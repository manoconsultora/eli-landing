import assert from "node:assert/strict";
import test from "node:test";
import {
  authReturnParam,
  authReturnStoragePrefix,
  buildLandingAuthCallbackUrl,
  findAuthReturnForEmail,
  hasAuthCallbackError,
  parseAuthReturn,
  pruneAuthReturns,
  readAuthReturnById,
  restoreAuthReturnData,
  sanitizeAuthCallbackUrl,
  serializeAuthReturn,
} from "../src/components/SignupWizard/auth-return.ts";
import { buildCheckoutPayload } from "../src/components/SignupWizard/checkout-payload.ts";

const now = 1_800_000_000_000;
const data = {
  administrationName: "Administración QA Norte",
  responsibleName: "Martin QA",
  email: "qa@example.test",
  buildingName: "Edificio QA Norte",
  address: "Av. Prueba 123",
  units: "48",
  plan: "professional",
};
const nonce = "checkout-nonce-local-0001";

test("authentication callback always returns to the current Landing origin", () => {
  const callback = new URL(buildLandingAuthCallbackUrl(
    "https://eli-landing-git-feat-ob-pay-01-0d2e29-manoconsultoras-projects.vercel.app",
    "professional",
    "00000000-0000-4000-8000-000000000001",
  ));
  assert.equal(callback.origin, "https://eli-landing-git-feat-ob-pay-01-0d2e29-manoconsultoras-projects.vercel.app");
  assert.equal(callback.pathname, "/onboarding");
  assert.equal(callback.searchParams.get("plan"), "professional");
  assert.equal(callback.searchParams.get(authReturnParam), "00000000-0000-4000-8000-000000000001");
  assert.notEqual(callback.hostname, "elidesk.ma-no.work");
});

test("authentication return preserves the wizard data, verification step and nonce", () => {
  const draft = parseAuthReturn(serializeAuthReturn(data, nonce, now), now + 1000);
  assert.deepEqual(draft.data, data);
  assert.equal(draft.step, 1);
  assert.equal(draft.eliSignupSubstep, "verification");
  assert.equal(draft.checkoutNonce, nonce);
});

test("root callback restores the latest valid draft for the authenticated email", () => {
  const other = { ...data, email: "other@example.test" };
  const olderTarget = { ...data, administrationName: "Administración anterior" };
  const entries = new Map([
    [authReturnStoragePrefix + "other", serializeAuthReturn(other, nonce, now + 2000)],
    [authReturnStoragePrefix + "older", serializeAuthReturn(olderTarget, nonce, now)],
    [authReturnStoragePrefix + "latest", serializeAuthReturn(data, nonce, now + 1000)],
  ]);
  const storage = {
    get length() { return entries.size; },
    key: (index) => [...entries.keys()][index],
    getItem: (key) => entries.get(key) ?? null,
  };

  const match = findAuthReturnForEmail(storage, " QA@EXAMPLE.TEST ", now + 3000);
  assert.equal(match.key, authReturnStoragePrefix + "latest");
  assert.equal(match.draft.data.administrationName, "Administración QA Norte");
  assert.equal(match.draft.data.responsibleName, "Martin QA");
  assert.equal(findAuthReturnForEmail(storage, "missing@example.test", now + 3000), null);
});

test("callback, Welcome and a new tab restore both names through checkout payload", () => {
  const id = "00000000-0000-4000-8000-000000000001";
  const key = authReturnStoragePrefix + id;
  const entries = new Map([[key, serializeAuthReturn(data, nonce, now)]]);
  const storage = {
    get length() { return entries.size; },
    key: (index) => [...entries.keys()][index],
    getItem: (itemKey) => entries.get(itemKey) ?? null,
  };

  const callbackDraft = readAuthReturnById(storage, id, now + 1000);
  assert.equal(callbackDraft.data.administrationName, data.administrationName);
  assert.equal(callbackDraft.data.responsibleName, data.responsibleName);
  assert.equal(entries.has(key), true, "Welcome must not consume the cross-tab draft");

  const resumedDraft = findAuthReturnForEmail(storage, data.email, now + 2000);
  const reloadedDraft = findAuthReturnForEmail(storage, data.email, now + 3000);
  assert.deepEqual(reloadedDraft.draft.data, resumedDraft.draft.data);

  const restored = restoreAuthReturnData(
    { ...resumedDraft.draft.data, administrationName: "", responsibleName: "", buildingName: "Consorcio TEST", address: "Av. TEST 1000", units: "12" },
    reloadedDraft.draft.data,
    data.email,
    data.email,
  );
  assert.equal(restored.administrationName, data.administrationName);
  assert.equal(restored.responsibleName, data.responsibleName);
  assert.equal(restored.buildingName, "Consorcio TEST");
  assert.equal(restored.address, "Av. TEST 1000");
  const otherSession = restoreAuthReturnData(
    { ...restored, administrationName: "Otra administración", email: "other@example.test" },
    reloadedDraft.draft.data,
    data.email,
    "other@example.test",
  );
  assert.equal(otherSession.administrationName, data.administrationName);

  const payload = buildCheckoutPayload(
    restored,
    reloadedDraft.draft.checkoutNonce,
    "dummy-test-token",
    null,
    false,
  );
  assert.equal(payload.administrationName, data.administrationName);
  assert.equal(payload.responsibleName, data.responsibleName);
  assert.equal(payload.offerId, data.plan);
  assert.equal(payload.buildingName, "Consorcio TEST");
});

test("auth callback errors are detected and sanitized without exposing provider details", () => {
  const errorUrl = new URL("https://eli.example/onboarding?plan=core&eli_signup_return=draft#access_denied&error_code=otp_expired&error_description=Email+link+is+invalid");
  assert.equal(hasAuthCallbackError(errorUrl), true);
  const sanitized = sanitizeAuthCallbackUrl(errorUrl);
  assert.equal(sanitized.pathname, "/onboarding");
  assert.equal(sanitized.searchParams.get("plan"), "core");
  assert.equal(sanitized.searchParams.get("eli_signup_return"), "draft");
  assert.equal(sanitized.hash, "");
  assert.equal(sanitized.searchParams.has("error_code"), false);
  assert.equal(sanitized.searchParams.has("error_description"), false);
});

test("neither serialization nor restoration retains extra card data or tokens", () => {
  const unsafe = { ...data, cardToken: "dummy-token", cardNumber: "dummy-pan", cvv: "dummy-cvv" };
  const serialized = serializeAuthReturn(unsafe, nonce, now);
  assert.deepEqual(JSON.parse(serialized).data, data);
  const tampered = JSON.parse(serialized);
  tampered.data = unsafe;
  tampered.cardToken = "dummy-token";
  assert.deepEqual(parseAuthReturn(JSON.stringify(tampered), now + 1000).data, data);
  assert.equal("cardToken" in parseAuthReturn(JSON.stringify(tampered), now + 1000), false);
});

test("expired, malformed and unsupported return drafts are rejected", () => {
  const serialized = serializeAuthReturn(data, nonce, now);
  assert.equal(parseAuthReturn(serialized, now + 30 * 60 * 1000), null);
  assert.equal(parseAuthReturn("not json", now), null);
  assert.equal(parseAuthReturn(null, now), null);
  for (const invalid of [{ version: 2 }, { checkoutNonce: "bad" }, { step: 4 }, { data: null }]) {
    assert.equal(parseAuthReturn(JSON.stringify({ ...JSON.parse(serialized), ...invalid }), now), null);
  }
});

test("cleanup removes expired drafts while preserving current drafts and unrelated auth storage", () => {
  const entries = new Map([
    [authReturnStoragePrefix + "expired", serializeAuthReturn(data, nonce, now - 30 * 60 * 1000)],
    [authReturnStoragePrefix + "current", serializeAuthReturn(data, nonce, now)],
    ["unrelated-auth-storage", "unchanged"],
  ]);
  pruneAuthReturns({
    get length() { return entries.size; },
    key: (index) => [...entries.keys()][index],
    getItem: (key) => entries.get(key) ?? null,
    removeItem: (key) => entries.delete(key),
  }, now);
  assert.deepEqual([...entries.keys()], [authReturnStoragePrefix + "current", "unrelated-auth-storage"]);
});
