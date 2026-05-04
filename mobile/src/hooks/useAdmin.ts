import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/admin";
import type { AccountTypeChangeStatus, User } from "../types";

type Role = User["role"];

export function useAdminUsers(params?: {
  role?: Role | "";
  requestStatus?: AccountTypeChangeStatus | "";
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => adminApi.getUsers(params).then((response) => response.data),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      role,
      isActive,
    }: {
      id: string;
      role?: Role;
      isActive?: boolean;
    }) => adminApi.updateUser(id, { role, isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

export function useReviewFarmerAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      note,
    }: {
      id: string;
      status: "approved" | "rejected";
      note?: string;
    }) => adminApi.reviewFarmerAccess(id, { status, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}
