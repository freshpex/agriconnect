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
    const data = err.response?.data;
    // Log full response in dev so we can diagnose API issues
    if (process.env.NODE_ENV !== "production") {
      console.error(
        `[NAC] Error status: ${status}, response:`,
        JSON.stringify(data)
      );
    }
    const msg =
      data?.message ||
      data?.error ||
      data?.detail ||
      data?.title ||
      (typeof data === "string" ? data : null) ||
      "Nokia NaC API request failed";
    throw new NacApiError(msg, status);
  }
  throw err;
}

export function createNacClient(): AxiosInstance {
  const client = axios.create({
    baseURL: config.nac.baseUrl,
    headers: {
      "Content-Type": "application/json",
      "x-rapidapi-key": config.nac.rapidApiKey,
      "x-rapidapi-host": config.nac.host,
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
