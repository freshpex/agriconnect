import { useMutation, useQueryClient } from "@tanstack/react-query";
import { farmerApi } from "../api/farmer";
import { useAuth } from "../state/AuthContext";

export function useUpdateProfile() {
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: farmerApi.updateProfile,
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}

export function useRequestFarmerAccess() {
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: (data: { note?: string }) => farmerApi.requestFarmerAccess(data),
    onSuccess: () => refreshUser(),
  });
}

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

export function useDeviceStatus() {
  return useMutation({
    mutationFn: (userId: string) =>
      farmerApi.getDeviceStatus(userId).then((response) => response.data),
  });
}
