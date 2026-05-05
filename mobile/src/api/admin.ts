import api from "./client";
import type {
  AccountTypeChangeStatus,
  PaginatedUsers,
  User,
} from "../types";

type Role = User["role"];

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
  deleteUser(id: string) {
    return api.delete<{ message: string }>(`/admin/users/${id}`);
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
