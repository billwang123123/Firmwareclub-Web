"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import en from "@/messages/en.json";
import zh from "@/messages/zh.json";

export type Locale = "zh" | "en";
const messages = { zh, en } as const;

function readCookie(): Locale {
  if (typeof document === "undefined") return "zh";
  const v = document.cookie.match(/(?:^|; )locale=([^;]+)/)?.[1];
  return v === "en" ? "en" : "zh";
}

function get(obj: any, path: string): string {
  return path.split(".").reduce((acc, k) => acc?.[k], obj) ?? path;
}

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    setLocaleState(readCookie());
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    document.cookie = `locale=${l}; path=/; max-age=31536000`;
  }

  const t = (key: string) => get(messages[locale], key);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
