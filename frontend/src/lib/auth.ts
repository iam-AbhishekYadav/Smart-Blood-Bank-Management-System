export type AppRole = "donor" | "recipient" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  bloodGroup?: string;
  phone?: string;
  profilePhoto?: string;
};

const STORAGE_KEY = "sbb_auth";
const SESSION_KEY = "sbb_auth_session";

export const getApiBaseUrl = () => import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export const getRoleHomePath = (role: AppRole) => {
  if (role === "donor") return "/donor/dashboard";
  if (role === "recipient") return "/recipient/dashboard";
  return "/admin/dashboard";
};

export const saveAuth = (
  payload: { user: AuthUser; accessToken: string; refreshToken?: string },
  rememberMe: boolean
) => {
  const value = JSON.stringify(payload);
  if (rememberMe) {
    localStorage.setItem(STORAGE_KEY, value);
    sessionStorage.removeItem(SESSION_KEY);
  } else {
    sessionStorage.setItem(SESSION_KEY, value);
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const hasRememberedAuth = () => Boolean(localStorage.getItem(STORAGE_KEY));

export const loadAuth = () => {
  const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as { user: AuthUser; accessToken: string; refreshToken?: string };
  } catch {
    clearAuth();
    return null;
  }
};

export const clearAuth = () => {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(SESSION_KEY);
};

export const updateAuthTokens = (accessToken: string, refreshToken?: string) => {
  const existing = loadAuth();
  if (!existing?.user) return;
  saveAuth(
    { user: existing.user, accessToken, refreshToken: refreshToken ?? existing.refreshToken },
    hasRememberedAuth()
  );
};

export const updateStoredUser = (patch: Partial<AuthUser>) => {
  const existing = loadAuth();
  if (!existing?.user) return;
  const nextUser = { ...existing.user, ...patch };
  saveAuth(
    { user: nextUser, accessToken: existing.accessToken, refreshToken: existing.refreshToken },
    hasRememberedAuth()
  );
};
