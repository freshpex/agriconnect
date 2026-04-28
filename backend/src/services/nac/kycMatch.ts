import config from "../../config";
import { createNacClient } from "./client";

const client = createNacClient(config.nac.services.kycMatch);

export interface KycMatchRequest {
  phoneNumber: string;
  idDocument?: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  birthdate?: string;
}

export interface KycMatchResult {
  phoneNumberMatch?: string | boolean;
  idDocumentMatch?: string | boolean;
  nameMatch?: string | boolean;
  givenNameMatch?: string | boolean;
  familyNameMatch?: string | boolean;
  birthdateMatch?: string | boolean;
}

/**
 * Verify farmer identity by matching provided KYC data against
 * telco records. Returns match status for each field.
 */
export async function matchKyc(data: KycMatchRequest): Promise<KycMatchResult> {
  const response = await client.post("/match", data);
  return response.data;
}
