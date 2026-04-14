import config from "../../config";
import { createNacClient } from "./client";

const client = createNacClient(config.nac.hosts.kycMatch);

export interface KycMatchRequest {
  phoneNumber: string;
  idDocument?: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  birthdate?: string;
}

export interface KycMatchResult {
  phoneNumberMatch?: string;
  idDocumentMatch?: string;
  nameMatch?: string;
  givenNameMatch?: string;
  familyNameMatch?: string;
  birthdateMatch?: string;
}

/**
 * Verify farmer identity by matching provided KYC data against
 * telco records. Returns match status for each field.
 */
export async function matchKyc(data: KycMatchRequest): Promise<KycMatchResult> {
  const response = await client.post("/kyc-match/v0/match", data);
  return response.data;
}
