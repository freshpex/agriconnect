import dotenv from "dotenv";
dotenv.config();

const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/agriconnect",
  jwt: {
    secret: process.env.JWT_SECRET || "dev-secret-change-me",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  nac: {
    apiKey: process.env.NAC_API_KEY || "",
    baseUrl: process.env.NAC_BASE_URL || "https://networkascode.nokia.io/api",
  },
} as const;

export default config;
