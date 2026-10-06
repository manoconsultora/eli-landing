import assert from "node:assert/strict";
import test from "node:test";
import { authReturnStoragePrefix, parseAuthReturn, pruneAuthReturns, serializeAuthReturn } from "../src/components/SignupWizard/auth-return.ts";

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

test("authentication return preserves the wizard data, payment substep and nonce", () => {
  const draft = parseAuthReturn(serializeAuthReturn(data, nonce, now), now + 1000);
  assert.deepEqual(draft.data, data);
  assert.equal(draft.step, 2);
  assert.equal(draft.eliSignupSubstep, "payment");
  assert.equal(draft.checkoutNonce, nonce);
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
