import { registerSW } from "virtual:pwa-register";

export const PWA_UPDATE_EVENT = "agriconnect:pwa-update-available";

let updateServiceWorker: ReturnType<typeof registerSW> | null = null;
let updateAvailable = false;

function notifyUpdateAvailable() {
  updateAvailable = true;
  window.dispatchEvent(new Event(PWA_UPDATE_EVENT));
}

export function registerAppServiceWorker() {
  updateServiceWorker = registerSW({
    immediate: true,
    onNeedRefresh() {
      notifyUpdateAvailable();
    },
    onRegisteredSW(_scriptUrl, registration) {
      if (!registration) return;
      if (registration.waiting && navigator.serviceWorker.controller) {
        notifyUpdateAvailable();
      }
      registration.update();
      window.setInterval(
        () => {
          registration.update();
        },
        30 * 60 * 1000
      );
    },
  });
}

export function isPwaUpdateAvailable() {
  return updateAvailable;
}

export function applyPwaUpdate() {
  updateServiceWorker?.(true);
}
