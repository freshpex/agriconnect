import axios, { AxiosInstance, AxiosError } from "axios";
import config from "../../config";

export class NacApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "NacApiError";
    this.statusCode = statusCode;
  }
}

/**
 * Wraps Axios errors into safe NacApiError to avoid leaking
 * headers, API keys, or full request details to the client.
 */
function wrapNacError(err: unknown): never {
  if (err instanceof AxiosError) {
    const status = err.response?.status || 502;
    const msg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Nokia NaC API request failed";
    throw new NacApiError(msg, status);
  }
  throw err;
}

export function createNacClient(host: string): AxiosInstance {
  const client = axios.create({
    baseURL: `https://${host}`,
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": config.nac.rapidApiKey,
      "X-RapidAPI-Host": host,
    },
    timeout: 15000,
  });

  // Intercept errors to prevent leaking API keys and request details
  client.interceptors.response.use(
    (response) => response,
    (error) => wrapNacError(error)
  );

  return client;
}
