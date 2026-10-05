import { paymentsConfig } from "./config";

type DatabaseRequest = RequestInit & {
  prefer?: string;
};

export async function databaseRequest<T>(path: string, init: DatabaseRequest = {}) {
  const config = paymentsConfig();
  const { prefer, ...requestInit } = init;
  const response = await fetch(`${config.supabaseUrl}/rest/v1/${path}`, {
    ...requestInit,
    cache: "no-store",
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
      ...requestInit.headers,
    },
  });

  if (!response.ok) {
    const requestId = response.headers.get("x-request-id") ?? "unknown";
    throw new Error(`database_request_failed:${response.status}:${requestId}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function rpc<T>(name: string, body: Record<string, unknown>) {
  return databaseRequest<T>(`rpc/${name}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function queryValue(value: string) {
  return encodeURIComponent(value);
}

function authenticatedConfiguration() {
  const serverUrl = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!serverUrl || !publicUrl || !anonKey || publicUrl !== serverUrl) {
    throw new Error("authenticated_database_configuration_mismatch");
  }
  return { serverUrl, anonKey };
}

export async function verifiedAuthEmail(accessToken: string) {
  if (!accessToken || accessToken.length > 4096 || /\s/.test(accessToken)) return null;
  const { serverUrl, anonKey } = authenticatedConfiguration();
  const response = await fetch(`${serverUrl}/auth/v1/user`, {
    cache: "no-store",
    headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return null;
  const user = (await response.json()) as {
    id?: string;
    email?: string;
    email_confirmed_at?: string | null;
  };
  if (!user.id || !user.email_confirmed_at || !user.email) return null;
  return user.email.trim().toLowerCase();
}

export async function authenticatedRpc<T>(
  accessToken: string,
  name: string,
  body: Record<string, unknown>,
) {
  const { serverUrl, anonKey } = authenticatedConfiguration();
  const response = await fetch(`${serverUrl}/rest/v1/rpc/${name}`, {
    method: "POST",
    cache: "no-store",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`authenticated_rpc_failed:${response.status}`);
  }
  return (await response.json()) as T;
}
