import { randomUUID } from "crypto";
import { createNacClient } from "./client";

const client = createNacClient();

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

export async function matchKyc(data: KycMatchRequest): Promise<KycMatchResult> {
  const response = await client.post(
    "/passthrough/camara/v1/kyc-match/kyc-match/v0.3/match",
    data,
    { headers: { "x-correlator": randomUUID() } }
  );
  return response.data;
}
