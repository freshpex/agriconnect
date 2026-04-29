import { api } from "./client";

export const healthApi = {
  get() {
    return api.get<{ status: string; service: string; version: string }>(
      "/health"
    );
  },
};
