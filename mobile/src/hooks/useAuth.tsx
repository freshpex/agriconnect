import React, { createContext, useContext, useEffect, useState } from "react";
import { storage } from "../utils/storage";
import { authApi } from "../api/auth";
import { onAuthExpired } from "../api/client";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (
    name: string,
    phone: string,
    password: string,
    role?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Listen for 401 events from the API interceptor
  useEffect(() => {
    const unsub = onAuthExpired(() => {
      setToken(null);
      setUser(null);
    });
    return unsub;
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await storage.getToken();
      const storedUser = await storage.getUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        // Verify token is still valid
        try {
          const res = await authApi.getMe();
          setUser(res.data.user);
          await storage.setUser(JSON.stringify(res.data.user));
        } catch {
          await storage.clear();
          setToken(null);
          setUser(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function login(phone: string, password: string) {
    const res = await authApi.login({ phone, password });
    const { token: newToken, user: newUser } = res.data;
    await storage.setToken(newToken);
    await storage.setUser(JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  async function register(
    name: string,
    phone: string,
    password: string,
    role?: string
  ) {
    const res = await authApi.register({ name, phone, password, role });
    const { token: newToken, user: newUser } = res.data;
    await storage.setToken(newToken);
    await storage.setUser(JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  async function logout() {
    await storage.clear();
    setToken(null);
    setUser(null);
  }

  async function refreshUser() {
    const res = await authApi.getMe();
    setUser(res.data.user);
    await storage.setUser(JSON.stringify(res.data.user));
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
