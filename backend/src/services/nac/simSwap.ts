import config from "../../config";
import { createNacClient } from "./client";

const client = createNacClient(config.nac.hosts.simSwap);

export interface SimSwapCheckResult {
  swapped: boolean;
}

export interface SimSwapDateResult {
  latestSimChange: string | null;
}

/**
 * Check if a SIM card has been swapped within a given number of hours.
 * Use case: Detect identity fraud before sensitive operations (KYC, login).
 */
export async function checkSimSwap(
  phoneNumber: string,
  maxAgeHours = 72
): Promise<SimSwapCheckResult> {
  const response = await client.post("/sim-swap/v0/check", {
    phoneNumber,
    maxAge: maxAgeHours,
  });
  return response.data;
}

/**
 * Retrieve the date of the most recent SIM swap.
 */
export async function retrieveSimSwapDate(
  phoneNumber: string
): Promise<SimSwapDateResult> {
  const response = await client.post("/sim-swap/v0/retrieve-date", {
    phoneNumber,
  });
  return response.data;
}
