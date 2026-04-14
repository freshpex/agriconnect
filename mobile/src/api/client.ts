import axios from "axios";
import Constants from "expo-constants";
import { storage } from "../utils/storage";

// Read API URL from app.json extra config, fallback to emulator default
const API_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  (__DEV__
    ? "https://agriconnectbackend-qtx3.onrender.com/api" // Android emulator
    : "https://agriconnectbackend-qtx3.onrender.com/api");

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
