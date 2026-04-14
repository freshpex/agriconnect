import config from "../../config";
import { createNacClient } from "./client";

const client = createNacClient(config.nac.hosts.locationVerification);

export interface LocationVerifyRequest {
  device: {
    phoneNumber: string;
  };
  area: {
    areaType: "CIRCLE";
    center: {
      latitude: number;
      longitude: number;
    };
    radius: number;
  };
  maxAge?: number;
}

export interface LocationVerifyResult {
  verificationResult: "TRUE" | "FALSE" | "UNKNOWN" | "PARTIAL";
  lastLocationTime?: string;
  matchRate?: number;
}

/**
 * Verify that a farmer's device is physically near their claimed
 * farm location. Prevents spoofed listings.
 */
export async function verifyLocation(
  phoneNumber: string,
  latitude: number,
  longitude: number,
  radiusMeters = 5000
): Promise<LocationVerifyResult> {
  const payload: LocationVerifyRequest = {
    device: { phoneNumber },
    area: {
      areaType: "CIRCLE",
      center: { latitude, longitude },
      radius: radiusMeters,
    },
    maxAge: 3600,
  };

  const response = await client.post(
    "/location-verification/v0/verify",
    payload
  );
  return response.data;
}
