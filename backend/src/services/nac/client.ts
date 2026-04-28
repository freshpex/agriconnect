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
      err.response?.data?.detail ||
      "Nokia NaC API request failed";
    throw new NacApiError(msg, status);
  }
  throw err;
}

export interface NacServiceConfig {
  baseUrl: string;
  rapidApiHost: string;
}

export function createNacClient(service: NacServiceConfig): AxiosInstance {
  if (!config.nac.apiKey) {
    throw new NacApiError(
      "Nokia Network as Code API key is not configured. Set NAC_APPLICATION_KEY, NAC_API_KEY, or NAC_RAPID_API_KEY.",
      500
    );
  }

  const client = axios.create({
    baseURL: service.baseUrl,
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": config.nac.apiKey,
      "X-RapidAPI-Host": service.rapidApiHost,
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
