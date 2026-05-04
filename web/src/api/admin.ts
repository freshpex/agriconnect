import { api } from "./client";
import type {
  PaginatedUsers,
  Role,
  User,
  AccountTypeChangeStatus,
} from "../types";

export const adminApi = {
  getUsers(params?: {
    role?: Role | "";
    requestStatus?: AccountTypeChangeStatus | "";
    search?: string;
    page?: number;
    limit?: number;
  }) {
    return api.get<PaginatedUsers>("/admin/users", { params });
  },
  updateUser(
    id: string,
    data: {
      role?: Role;
      isActive?: boolean;
    }
  ) {
    return api.patch<{ user: User }>(`/admin/users/${id}`, data);
  },
  reviewFarmerAccess(
    id: string,
    data: {
      status: "approved" | "rejected";
      note?: string;
    }
  ) {
    return api.patch<{ user: User }>(`/admin/users/${id}/farmer-access`, data);
  },
};
