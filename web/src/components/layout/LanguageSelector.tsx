import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Languages, Search } from "lucide-react";
import clsx from "clsx";
import {
  GOOGLE_INCLUDED_LANGUAGES,
  TRANSLATION_LANGUAGES,
} from "../../constants/languages";

const SELECTED_LANGUAGE_KEY = "agriconnect.language";

function setGoogleCookie(code: string) {
  const value = `/en/${code}`;
  const host = window.location.hostname;
  document.cookie = `googtrans=${value}; path=/`;
  if (host.includes(".")) {
    document.cookie = `googtrans=${value}; path=/; domain=.${host}`;
  }
}

function clearGoogleCookie() {
  const host = window.location.hostname;
  document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/";
  if (host.includes(".")) {
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; domain=.${host}`;
  }
}

function applyGoogleLanguage(code: string): boolean {
  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (!combo) return false;
  combo.value = code;
  combo.dispatchEvent(new Event("change"));
  return true;
}

export function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);
  const [selectedCode, setSelectedCode] = useState(
    () => localStorage.getItem(SELECTED_LANGUAGE_KEY) || "en"
  );
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: GOOGLE_INCLUDED_LANGUAGES,
            autoDisplay: false,
          },
          "google_translate_element"
        );
        setReady(true);
      }
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else {
      const timer = window.setTimeout(() => setReady(true), 500);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!ready || selectedCode === "en") return;
    const timer = window.setTimeout(() => {
      if (!applyGoogleLanguage(selectedCode)) {
        setGoogleCookie(selectedCode);
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [ready, selectedCode]);

  const selected = TRANSLATION_LANGUAGES.find(
    (language) => language.code === selectedCode
  );

  const languages = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return TRANSLATION_LANGUAGES;
    return TRANSLATION_LANGUAGES.filter(
      (language) =>
        language.name.toLowerCase().includes(needle) ||
        language.region.toLowerCase().includes(needle)
    );
  }, [query]);

  function chooseLanguage(code: string) {
    setSelectedCode(code);
    localStorage.setItem(SELECTED_LANGUAGE_KEY, code);
    setOpen(false);
    setQuery("");

    if (code === "en") {
      clearGoogleCookie();
      window.location.reload();
      return;
    }

    setGoogleCookie(code);
    if (!applyGoogleLanguage(code)) {
      window.setTimeout(() => applyGoogleLanguage(code), 900);
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-sm font-semibold text-stone-800 shadow-sm transition hover:border-leaf-300 hover:bg-leaf-50"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Languages className="h-4 w-4 text-leaf-700" />
        <span className="hidden max-w-28 truncate sm:inline">
          {selected?.name || "Language"}
        </span>
        <span className="sm:hidden">
          {selected?.code.toUpperCase() || "EN"}
        </span>
        <ChevronDown className="h-4 w-4 text-stone-400" />
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-stone-200 bg-white shadow-soft">
          <div className="border-b border-stone-100 p-3">
            <p className="text-sm font-bold text-stone-950">
              Translate AgriConnect
            </p>
            <p className="mt-1 text-xs text-stone-500">
              African language targets only.
            </p>
            <label className="mt-3 flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2">
              <Search className="h-4 w-4 text-stone-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full border-0 bg-transparent text-sm outline-none"
                placeholder="Search language"
              />
            </label>
          </div>

          <div className="max-h-80 overflow-y-auto py-1" role="listbox">
            {languages.map((language) => (
              <button
                key={language.code}
                type="button"
                className={clsx(
                  "flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition hover:bg-leaf-50",
                  language.code === selectedCode && "bg-leaf-50 text-leaf-800"
                )}
                onClick={() => chooseLanguage(language.code)}
                role="option"
                aria-selected={language.code === selectedCode}
              >
                <span>
                  <span className="block font-semibold">{language.name}</span>
                  <span className="text-xs text-stone-500">
                    {language.region}
                  </span>
                </span>
                {language.code === selectedCode ? (
                  <Check className="h-4 w-4 text-leaf-700" />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
