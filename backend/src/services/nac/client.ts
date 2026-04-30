import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
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

function shouldLog(): boolean {
  return process.env.NODE_ENV !== "production";
}

function redactUrl(url?: string): string {
  return url || "";
}

function getResponseSummary(data: unknown): Record<string, unknown> {
  if (!data) return {};
  if (Array.isArray(data)) return { type: "array", length: data.length };
  if (typeof data === "object")
    return { type: "object", keys: Object.keys(data) };
  return { type: typeof data };
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

  client.interceptors.request.use((request: InternalAxiosRequestConfig) => {
    (
      request as InternalAxiosRequestConfig & { metadata?: { start: number } }
    ).metadata = { start: Date.now() };

    if (shouldLog()) {
      console.info(
        `[NAC] -> ${request.method?.toUpperCase()} ${redactUrl(request.url)}`
      );
    }

    return request;
  });

  // Intercept errors to prevent leaking API keys and request details
  client.interceptors.response.use(
    (response) => {
      if (shouldLog()) {
        const meta = (
          response.config as InternalAxiosRequestConfig & {
            metadata?: { start: number };
          }
        ).metadata;
        const duration = meta ? Date.now() - meta.start : undefined;
        console.info(
          `[NAC] <- ${response.status} ${redactUrl(response.config.url)}${
            duration !== undefined ? ` ${duration}ms` : ""
          }`,
          getResponseSummary(response.data)
        );
      }
      return response;
    },
    (error) => wrapNacError(error)
  );

  return client;
}
