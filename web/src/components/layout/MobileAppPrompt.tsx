import { useEffect, useState } from "react";
import { Download, ExternalLink, Smartphone, X } from "lucide-react";
import {
  MOBILE_APP_DOWNLOAD_URL,
  MOBILE_APP_PROMPT_KEY,
} from "../../config";
import { Button } from "../ui/Button";

export function MobileAppPrompt() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(MOBILE_APP_PROMPT_KEY)) {
      setOpen(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(MOBILE_APP_PROMPT_KEY, new Date().toISOString());
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end bg-stone-950/50 p-4 sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-app-prompt-title"
    >
      <div className="w-full max-w-lg rounded-lg border border-stone-200 bg-white p-5 shadow-soft sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-leaf-50 text-leaf-700">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-black uppercase text-leaf-700">
                Mobile app recommended
              </p>
              <h2
                id="mobile-app-prompt-title"
                className="mt-1 text-2xl font-black text-stone-950"
              >
                Download AgriConnect Mobile
              </h2>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"
            onClick={dismiss}
            aria-label="Close mobile app prompt"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-stone-600">
          Click the download link to use the mobile app for full unrestricted
          access, full offline mode, and automatic sync features when your
          connection comes back.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <a
            href={MOBILE_APP_DOWNLOAD_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-leaf-700 px-4 py-2 text-sm font-semibold text-white shadow-lift transition hover:bg-leaf-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300"
            onClick={dismiss}
          >
            <Download className="h-4 w-4" />
            Download mobile app
            <ExternalLink className="h-4 w-4" />
          </a>
          <Button type="button" variant="outline" onClick={dismiss}>
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  );
}
