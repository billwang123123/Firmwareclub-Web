"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import en from "@/messages/en.json";
import zh from "@/messages/zh.json";

export type Locale = "zh" | "en";
const messages = { zh, en } as const;

type Dict = typeof zh;
type Path<T, P extends string = ""> = {
  [K in keyof T]: T[K] extends object
    ? Path<T[K], `${P}${P extends "" ? "" : "."}${K & string}`>
    : `${P}${P extends "" ? "" : "."}${K & string}`;
}[keyof T];

export type TKey = Path<Dict>;

function get(obj: any, path: string): string {
  return path.split(".").reduce((acc, k) => acc?.[k], obj) ?? path;
}

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TKey) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    const saved = document.cookie.match(/(?:^|; )locale=([^;]+)/)?.[1];
    if (saved === "en" || saved === "zh") {
      setLocaleState(saved);
    }
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    document.cookie = `locale=${l}; path=/; max-age=31536000`;
  }

  const t = (key: TKey) => get(messages[locale], key);

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
