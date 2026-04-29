import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { authApi } from "../api/auth";
import { onAuthExpired } from "../api/client";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "../config";
import type { Role, User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (
    name: string,
    phone: string,
    password: string,
    role: Role
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): User | null {
  const rawUser = localStorage.getItem(AUTH_USER_KEY);
  if (!rawUser) return null;
  try {
    return JSON.parse(rawUser) as User;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(AUTH_TOKEN_KEY)
  );
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  const persistAuth = useCallback((nextToken: string, nextUser: User) => {
    localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const response = await authApi.getMe();
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.data.user));
    setUser(response.data.user);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      if (!localStorage.getItem(AUTH_TOKEN_KEY)) {
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        await refreshUser();
      } catch {
        clearAuth();
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    boot();
    return () => {
      mounted = false;
    };
  }, [clearAuth, refreshUser]);

  useEffect(() => onAuthExpired(clearAuth), [clearAuth]);

  const login = useCallback(
    async (phone: string, password: string) => {
      const response = await authApi.login({ phone, password });
      persistAuth(response.data.token, response.data.user);
      await refreshUser().catch(() => undefined);
    },
    [persistAuth, refreshUser]
  );

  const register = useCallback(
    async (name: string, phone: string, password: string, role: Role) => {
      const response = await authApi.register({ name, phone, password, role });
      persistAuth(response.data.token, response.data.user);
      await refreshUser().catch(() => undefined);
    },
    [persistAuth, refreshUser]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout: clearAuth,
      refreshUser,
    }),
    [clearAuth, isLoading, login, refreshUser, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
