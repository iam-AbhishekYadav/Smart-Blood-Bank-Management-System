import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthUser, clearAuth, getApiBaseUrl, loadAuth, saveAuth, updateStoredUser } from "@/lib/auth";

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  login: (payload: { user: AuthUser; accessToken: string; refreshToken?: string }, remember: boolean) => void;
  updateUser: (patch: Partial<AuthUser>) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const data = loadAuth();
    if (data?.user && data?.accessToken) {
      setUser(data.user);
      setAccessToken(data.accessToken);
    }
    setIsAuthReady(true);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isAuthReady,
      login: (payload, remember) => {
        saveAuth(payload, remember);
        setUser(payload.user);
        setAccessToken(payload.accessToken);
      },
      updateUser: (patch) => {
        if (!user) return;
        const nextUser = { ...user, ...patch };
        setUser(nextUser);
        updateStoredUser(patch);
      },
      logout: () => {
        const refreshToken = loadAuth()?.refreshToken;
        if (refreshToken) {
          fetch(`${getApiBaseUrl()}/api/auth/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          }).catch(() => undefined);
        }
        clearAuth();
        setUser(null);
        setAccessToken(null);
      },
    }),
    [user, accessToken, isAuthReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider.");
  return ctx;
};
