import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

// Validate required env vars in production
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value && isProduction) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || "";
}

function firstEnv(keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key];
    if (value) return value;
  }
  if (isProduction) {
    throw new Error(
      `Missing required environment variable: ${keys.join(" or ")}`
    );
  }
  return "";
}

function boolEnv(key: string, fallback = false): boolean {
  const value = process.env[key];
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function serviceConfig({
  baseUrlKey,
  hostKey,
  prodBaseUrl,
  sandboxBaseUrl,
  prodHost,
  sandboxHost,
  useSandbox,
}: {
  baseUrlKey: string;
  hostKey: string;
  prodBaseUrl: string;
  sandboxBaseUrl?: string;
  prodHost: string;
  sandboxHost?: string;
  useSandbox: boolean;
}) {
  return {
    baseUrl:
      process.env[baseUrlKey] ||
      (useSandbox && sandboxBaseUrl ? sandboxBaseUrl : prodBaseUrl),
    rapidApiHost:
      process.env[hostKey] ||
      (useSandbox && sandboxHost ? sandboxHost : prodHost),
  };
}

const useNacSandbox = boolEnv("NAC_USE_SANDBOX") || boolEnv("NAC_DEV_MODE");

const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/agriconnect",
  jwt: {
    secret: isProduction
      ? requireEnv("JWT_SECRET")
      : process.env.JWT_SECRET || "dev-secret-change-me",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
  },
  nac: {
    apiKey: firstEnv([
      "NAC_APPLICATION_KEY",
      "NAC_API_KEY",
      "NAC_RAPID_API_KEY",
    ]),
    projectId: process.env.NAC_PROJECT_ID || "",
    useSandbox: useNacSandbox,
    services: {
      simSwap: serviceConfig({
        baseUrlKey: "NAC_SIM_SWAP_BASE_URL",
        hostKey: "NAC_SIM_SWAP_RAPID_API_HOST",
        prodBaseUrl: "https://sim-swap.p-eu.rapidapi.com/sim-swap/sim-swap/v0",
        sandboxBaseUrl:
          "https://simswap.p-eu.rapidapi.com/sim-swap/sim-swap/v0",
        prodHost: "sim-swap.nokia.rapidapi.com",
        sandboxHost: "simswap.nokia-dev.rapidapi.com",
        useSandbox: useNacSandbox,
      }),
      numberVerification: serviceConfig({
        baseUrlKey: "NAC_NUMBER_VERIFICATION_BASE_URL",
        hostKey: "NAC_NUMBER_VERIFICATION_RAPID_API_HOST",
        prodBaseUrl:
          "https://number-verification-verify.p-eu.rapidapi.com/number-verification/v0",
        prodHost: "number-verification-verify.nokia.rapidapi.com",
        useSandbox: useNacSandbox,
      }),
      kycMatch: serviceConfig({
        baseUrlKey: "NAC_KYC_MATCH_BASE_URL",
        hostKey: "NAC_KYC_MATCH_RAPID_API_HOST",
        prodBaseUrl: "https://kyc-match.p-eu.rapidapi.com/kyc-match/v0",
        prodHost: "kyc-match.nokia.rapidapi.com",
        useSandbox: useNacSandbox,
      }),
      locationVerification: serviceConfig({
        baseUrlKey: "NAC_LOCATION_VERIFICATION_BASE_URL",
        hostKey: "NAC_LOCATION_VERIFICATION_RAPID_API_HOST",
        prodBaseUrl: "https://location-verification.p-eu.rapidapi.com",
        sandboxBaseUrl: "https://location-verification5.p-eu.rapidapi.com",
        prodHost: "location-verification.nokia.rapidapi.com",
        sandboxHost: "location-verification5.nokia-dev.rapidapi.com",
        useSandbox: useNacSandbox,
      }),
      deviceStatus: serviceConfig({
        baseUrlKey: "NAC_DEVICE_STATUS_BASE_URL",
        hostKey: "NAC_DEVICE_STATUS_RAPID_API_HOST",
        prodBaseUrl: "https://device-status.p-eu.rapidapi.com",
        sandboxBaseUrl: "https://device-status1.p-eu.rapidapi.com",
        prodHost: "device-status.nokia.rapidapi.com",
        sandboxHost: "device-status1.nokia-dev.rapidapi.com",
        useSandbox: useNacSandbox,
      }),
      qod: serviceConfig({
        baseUrlKey: "NAC_QOD_BASE_URL",
        hostKey: "NAC_QOD_RAPID_API_HOST",
        prodBaseUrl: "https://quality-of-service-on-demand.p-eu.rapidapi.com",
        sandboxBaseUrl: "https://qos-on-demand2.p-eu.rapidapi.com",
        prodHost: "quality-of-service-on-demand.nokia.rapidapi.com",
        sandboxHost: "qos-on-demand2.nokia-dev.rapidapi.com",
        useSandbox: useNacSandbox,
      }),
    },
  },
} as const;

export default config;
