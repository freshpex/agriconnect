import api from "./client";
import type { AuthResponse } from "../types";

type SignupRole = Exclude<AuthResponse["user"]["role"], "admin">;

export const authApi = {
  register(data: {
    name: string;
    phone: string;
    password: string;
    role?: SignupRole;
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
