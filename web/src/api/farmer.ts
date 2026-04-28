import { api } from "./client";
import type {
  DeviceStatusResult,
  KycMatchResult,
  LocationVerifyResult,
  User,
} from "../types";

export const farmerApi = {
  updateProfile(data: { name?: string; farmAddress?: string }) {
    return api.put<{ user: User }>("/farmers/profile", data);
  },
  requestFarmerAccess(data: { note?: string }) {
    return api.post<{ message: string; user: User }>(
      "/farmers/request-farmer-access",
      data
    );
  },
  verifyKyc(data: {
    nationalId: string;
    fullName: string;
    dateOfBirth: string;
  }) {
    return api.post<KycMatchResult>("/farmers/verify-kyc", data);
  },
  verifyNumber() {
    return api.post<{ numberVerified: boolean; message: string }>(
      "/farmers/verify-number"
    );
  },
  verifyLocation(data: {
    latitude: number;
    longitude: number;
    radius?: number;
  }) {
    return api.post<LocationVerifyResult>("/farmers/verify-location", data);
  },
  getDeviceStatus(userId: string) {
    return api.get<DeviceStatusResult>(`/farmers/device-status/${userId}`);
  },
};
