import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { storage } from "../utils/storage";

const DEFAULT_API_URL = "https://node-app-131265199003.us-west1.run.app/api";

type ExpoConfigWithHost = {
  hostUri?: string;
  extra?: {
    apiUrl?: string;
  };
};

type ExpoManifestWithHost = {
  debuggerHost?: string;
  hostUri?: string;
};

function getConfiguredApiUrl(): string | undefined {
  return (
    process.env.EXPO_PUBLIC_API_URL ||
    (Constants.expoConfig as ExpoConfigWithHost | null)?.extra?.apiUrl
  );
}

function getExpoHostUri(): string | undefined {
  const constants = Constants as typeof Constants & {
    manifest?: ExpoManifestWithHost | null;
  };

  return (
    (Constants.expoConfig as ExpoConfigWithHost | null)?.hostUri ||
    constants.manifest?.hostUri ||
    constants.manifest?.debuggerHost
  );
}

function getExpoHostApiUrl(localApiUrl: string): string | undefined {
  const hostUri = getExpoHostUri();
  const host = hostUri?.replace(/^[a-z]+:\/\//i, "").split(":")[0];

  if (!host || host === "localhost" || host === "127.0.0.1") {
    return undefined;
  }

  const match = localApiUrl.match(/^(https?):\/\/[^/:]+(:\d+)?(\/.*)?$/);
  const protocol = match?.[1] ?? "http";
  const port = match?.[2] ?? ":3000";
  const path = match?.[3] ?? "/api";

  return `${protocol}://${host}${port}${path}`;
}

function resolveApiUrl(configuredApiUrl?: string): string {
  const apiUrl = configuredApiUrl || DEFAULT_API_URL;
  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(
    apiUrl
  );

  if (!isLocalhost) {
    return apiUrl;
  }

  const expoHostUrl = getExpoHostApiUrl(apiUrl);
  if (expoHostUrl) return expoHostUrl;

  if (Platform.OS === "android") {
    return apiUrl.replace(
      /^(https?:\/\/)(localhost|127\.0\.0\.1)/,
      (_match, protocol: string) => `${protocol}10.0.2.2`
    );
  }

  return apiUrl;
}

// Read API URL from env/app config; Android cannot reach host localhost.
const API_URL = resolveApiUrl(getConfiguredApiUrl());

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
api.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Broadcast channel for 401 events — consumed by useAuth
type AuthListener = () => void;
const authListeners: AuthListener[] = [];

export function onAuthExpired(listener: AuthListener): () => void {
  authListeners.push(listener);
  return () => {
    const idx = authListeners.indexOf(listener);
    if (idx >= 0) authListeners.splice(idx, 1);
  };
}

// Handle 401 responses (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.clear();
      // Notify auth context to reset in-memory state
      authListeners.forEach((fn) => fn());
    }
    return Promise.reject(error);
  }
);

export default api;
