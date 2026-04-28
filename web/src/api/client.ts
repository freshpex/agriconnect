import axios from "axios";
import { API_URL, AUTH_TOKEN_KEY, AUTH_USER_KEY } from "../config";

type AuthExpiredListener = () => void;

const listeners = new Set<AuthExpiredListener>();

export const api = axios.create({
  baseURL: API_URL,
  timeout: 18_000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      listeners.forEach((listener) => listener());
    }
    return Promise.reject(error);
  }
);

export function onAuthExpired(listener: AuthExpiredListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
