import config from "../../config";
import { createNacClient } from "./client";

const client = createNacClient(config.nac.services.deviceStatus);

export type ConnectivityStatus =
  | "CONNECTED_SMS"
  | "CONNECTED_DATA"
  | "NOT_CONNECTED"
  | "REACHABLE_SMS"
  | "REACHABLE_DATA";

export interface DeviceStatusResult {
  reachabilityStatus?: ConnectivityStatus;
  connectivityStatus?: ConnectivityStatus;
  lastStatusTime?: string;
}

/**
 * Check whether a buyer/seller device is reachable on the network.
 * Used to provide connectivity status indicators in the marketplace.
 */
export async function checkDeviceStatus(
  phoneNumber: string
): Promise<DeviceStatusResult> {
  const response = await client.post("/connectivity", {
    device: { phoneNumber },
  });
  return response.data;
}
