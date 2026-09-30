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
