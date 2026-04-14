import api from "./client";
import type { AuthResponse } from "../types";

export const authApi = {
  register(data: {
    name: string;
    phone: string;
    password: string;
    role?: string;
  }) {
    return api.post<AuthResponse>("/auth/register", data);
  },

  login(data: { phone: string; password: string }) {
    return api.post<AuthResponse>("/auth/login", data);
  },

  getMe() {
    return api.get<{ user: AuthResponse["user"] }>("/auth/me");
  },
};
