import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import {
  applyPwaUpdate,
  isPwaUpdateAvailable,
  PWA_UPDATE_EVENT,
} from "../../pwa";
import { Button } from "../ui/Button";

export function PwaUpdatePrompt() {
  const [open, setOpen] = useState(() => isPwaUpdateAvailable());

  useEffect(() => {
    function showUpdatePrompt() {
      setOpen(true);
    }

    window.addEventListener(PWA_UPDATE_EVENT, showUpdatePrompt);
    return () => window.removeEventListener(PWA_UPDATE_EVENT, showUpdatePrompt);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-x-4 bottom-24 z-[55] mx-auto max-w-xl rounded-lg border border-leaf-200 bg-white p-4 shadow-soft lg:bottom-6 lg:left-auto lg:right-6 lg:mx-0"
      role="alert"
    >
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-leaf-50 text-leaf-700">
          <RefreshCw className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-black text-stone-950">
                New site version available
              </p>
              <p className="mt-1 text-sm leading-5 text-stone-600">
                Update now to load the latest features without clearing browser
                site data.
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
              onClick={() => setOpen(false)}
              aria-label="Dismiss update prompt"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <Button
            type="button"
            className="mt-3"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={applyPwaUpdate}
          >
            Update now
          </Button>
        </div>
      </div>
    </div>
  );
}
