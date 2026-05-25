import { clearAuth, getApiBaseUrl, loadAuth, updateAuthTokens } from "@/lib/auth";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

const buildHeaders = (token?: string, extra?: HeadersInit): HeadersInit => ({
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...extra,
});

const parseJson = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const refreshSession = async () => {
  const auth = loadAuth();
  if (!auth?.refreshToken) return null;

  const response = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: auth.refreshToken }),
  });
  const data = await parseJson(response);
  if (!response.ok || !data?.accessToken) return null;

  updateAuthTokens(data.accessToken, data.refreshToken);
  return data.accessToken as string;
};

export const apiRequest = async <T = unknown>(
  path: string,
  method: Method = "GET",
  body?: unknown,
  headers?: HeadersInit
): Promise<T> => {
  const auth = loadAuth();
  const token = auth?.accessToken;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const send = (accessToken?: string) =>
    fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers: isFormData
        ? buildHeaders(accessToken, headers)
        : buildHeaders(accessToken, { "Content-Type": "application/json", ...headers }),
      body: body ? (isFormData ? (body as FormData) : JSON.stringify(body)) : undefined,
    });

  let response = await send(token ?? undefined);
  if (response.status === 401 && auth?.refreshToken) {
    const nextAccess = await refreshSession();
    if (nextAccess) {
      response = await send(nextAccess);
    }
  }

  const data = await parseJson(response);
  if (!response.ok) {
    if (response.status === 401) clearAuth();
    throw new Error(data?.message ?? "Request failed");
  }
  return data as T;
};
