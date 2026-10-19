"use client";

import { useI18n, type Locale } from "@/lib/i18n";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        border: "1px solid hsl(var(--border))",
        borderRadius: "9999px",
        padding: "0.125rem",
        fontSize: "0.75rem",
        background: "white",
      }}
    >
      <button
        type="button"
        onClick={() => setLocale("zh" as Locale)}
        style={{
          padding: "0.25rem 0.625rem",
          borderRadius: "9999px",
          border: "none",
          background: locale === "zh" ? "hsl(var(--foreground))" : "transparent",
          color: locale === "zh" ? "white" : "hsl(var(--muted-foreground))",
          cursor: "pointer",
          fontFamily: "inherit",
          fontWeight: 500,
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
        }}
      >
        <Globe size={11} /> 中
      </button>
      <button
        type="button"
        onClick={() => setLocale("en" as Locale)}
        style={{
          padding: "0.25rem 0.625rem",
          borderRadius: "9999px",
          border: "none",
          background: locale === "en" ? "hsl(var(--foreground))" : "transparent",
          color: locale === "en" ? "white" : "hsl(var(--muted-foreground))",
          cursor: "pointer",
          fontFamily: "inherit",
          fontWeight: 500,
        }}
      >
        EN
      </button>
    </div>
  );
}
