import config from "../../config";
import { createNacClient } from "./client";

const client = createNacClient(config.nac.hosts.qod);

export interface QodSession {
  sessionId: string;
  qosProfile: string;
  device: { phoneNumber: string };
  duration: number;
  startedAt?: string;
  expiresAt?: string;
}

/**
 * Create a Quality-on-Demand session to prioritise network traffic
 * for critical transaction flows (e.g. real-time order confirmations,
 * image uploads during listing creation).
 */
export async function createQodSession(
  phoneNumber: string,
  durationSeconds = 300,
  qosProfile = "QOS_L"
): Promise<QodSession> {
  const response = await client.post("/qod/v0/sessions", {
    qosProfile,
    device: { phoneNumber },
    applicationServer: { ipv4Address: "0.0.0.0/0" },
    duration: durationSeconds,
  });
  return response.data;
}

/**
 * Retrieve an existing QoD session status.
 */
export async function getQodSession(sessionId: string): Promise<QodSession> {
  const response = await client.get(`/qod/v0/sessions/${sessionId}`);
  return response.data;
}

/**
 * Delete / terminate a QoD session.
 */
export async function deleteQodSession(sessionId: string): Promise<void> {
  await client.delete(`/qod/v0/sessions/${sessionId}`);
}
