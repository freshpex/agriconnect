import { useMutation, useQueryClient } from "@tanstack/react-query";
import { farmerApi } from "../api/farmer";
import { useAuth } from "./useAuth";

export function useVerifyKyc() {
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: farmerApi.verifyKyc,
    onSuccess: () => refreshUser(),
  });
}

export function useVerifyNumber() {
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: () => farmerApi.verifyNumber(),
    onSuccess: () => refreshUser(),
  });
}

export function useVerifyLocation() {
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: farmerApi.verifyLocation,
    onSuccess: () => refreshUser(),
  });
}

export function useUpdateProfile() {
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: farmerApi.updateProfile,
    onSuccess: () => {
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useRequestFarmerAccess() {
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: (data: { note?: string }) =>
      farmerApi.requestFarmerAccess(data),
    onSuccess: () => refreshUser(),
  });
}
