const DEFAULT_API_URL = "https://node-app-131265199003.us-west1.run.app/api";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export const API_URL = trimTrailingSlash(
  import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_URL
);

export const AUTH_TOKEN_KEY = "agriconnect.token";
export const AUTH_USER_KEY = "agriconnect.user";
export const MOBILE_APP_DOWNLOAD_URL =
  import.meta.env.VITE_MOBILE_APP_URL || "https://expo.dev/accounts/hackere/projects/mobile/builds/926c3199-db03-49ed-a1ba-f3d52448adb2";
export const MOBILE_APP_PROMPT_KEY = "agriconnect.mobileAppPrompt.dismissed";
