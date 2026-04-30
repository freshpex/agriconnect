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
    rapidApiKey: requireEnv("NAC_RAPID_API_KEY"),
    baseUrl: "https://network-as-code.p-eu.rapidapi.com",
    host: "network-as-code.nokia.rapidapi.com",
  },
} as const;

export default config;
