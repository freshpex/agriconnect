import config from "../../config";
import { createNacClient } from "./client";

const client = createNacClient(config.nac.hosts.numberVerification);

export interface NumberVerifyResult {
  devicePhoneNumberVerified: boolean;
}

/**
 * Silently verify that the user's phone number matches
 * the SIM card on the device (network-level verification).
 */
export async function verifyNumber(
  phoneNumber: string
): Promise<NumberVerifyResult> {
  const response = await client.post("/number-verification/v0/verify", {
    phoneNumber,
  });
  return response.data;
}
