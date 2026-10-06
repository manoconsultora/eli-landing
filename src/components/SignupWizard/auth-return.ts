export type WizardData = {
  administrationName: string;
  responsibleName: string;
  email: string;
  buildingName: string;
  address: string;
  units: string;
  plan: "core" | "professional";
};

export const authReturnParam = "eli_signup_return";
export const authReturnStoragePrefix = "eli-signup-wizard-auth-return:";
const lifetimeMs = 30 * 60 * 1000;

type AuthReturnDraft = {
  version: 1;
  expiresAt: number;
  data: WizardData;
  step: 1;
  eliSignupSubstep: "verification";
  checkoutNonce: string;
};

// Explicit allowlist: extra runtime properties (including card data/tokens)
// cannot be serialized into an authentication-return draft.
export function serializeAuthReturn(data: WizardData, checkoutNonce: string, now = Date.now()) {
  const draft: AuthReturnDraft = {
    version: 1,
    expiresAt: now + lifetimeMs,
    data: {
      administrationName: data.administrationName,
      responsibleName: data.responsibleName,
      email: data.email,
      buildingName: data.buildingName,
      address: data.address,
      units: data.units,
      plan: data.plan,
    },
    step: 1,
    eliSignupSubstep: "verification",
    checkoutNonce,
  };
  return JSON.stringify(draft);
}

export function parseAuthReturn(serialized: string | null, now = Date.now()): AuthReturnDraft | null {
  if (!serialized) return null;
  try {
    const draft = JSON.parse(serialized);
    if (
      draft.version !== 1 || !Number.isFinite(draft.expiresAt) || draft.expiresAt <= now ||
      draft.expiresAt > now + lifetimeMs || draft.step !== 1 || draft.eliSignupSubstep !== "verification" ||
      typeof draft.checkoutNonce !== "string" || !/^[A-Za-z0-9_-]{16,128}$/.test(draft.checkoutNonce) ||
      !draft.data || !["core", "professional"].includes(draft.data.plan) ||
      !["administrationName", "responsibleName", "email", "buildingName", "address", "units"]
        .every((field) => typeof draft.data[field] === "string" && draft.data[field].length <= 254)
    ) return null;
    // Apply the allowlist again when consuming storage, rather than trusting
    // a stored object to be safe to copy into wizard state.
    return JSON.parse(serializeAuthReturn(draft.data, draft.checkoutNonce, draft.expiresAt - lifetimeMs));
  } catch {
    return null;
  }
}

export function authReturnStorageKey(id: string | null) {
  return id && /^[0-9a-f-]{36}$/i.test(id) ? `${authReturnStoragePrefix}${id}` : null;
}

export function pruneAuthReturns(storage: Pick<Storage, "length" | "key" | "getItem" | "removeItem">, now = Date.now()) {
  for (let index = storage.length - 1; index >= 0; index -= 1) {
    const key = storage.key(index);
    if (key?.startsWith(authReturnStoragePrefix) && !parseAuthReturn(storage.getItem(key), now)) {
      storage.removeItem(key);
    }
  }
}
