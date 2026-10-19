"use client";

import { useI18n, type Locale } from "@/lib/i18n";
import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const router = useRouter();

  function switchTo(l: Locale) {
    if (l === locale) return;
    setLocale(l);
    // Refresh so server components re-render with the new cookie
    router.refresh();
  }

  const baseBtn = {
    padding: "0.25rem 0.625rem",
    borderRadius: "9999px",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 500,
    transition: "background 0.15s, color 0.15s",
  } as const;

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
        onClick={() => switchTo("zh")}
        style={{
          ...baseBtn,
          background: locale === "zh" ? "hsl(var(--foreground))" : "transparent",
          color: locale === "zh" ? "white" : "hsl(var(--muted-foreground))",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
        }}
      >
        <Globe size={11} /> 中
      </button>
      <button
        type="button"
        onClick={() => switchTo("en")}
        style={{
          ...baseBtn,
          background: locale === "en" ? "hsl(var(--foreground))" : "transparent",
          color: locale === "en" ? "white" : "hsl(var(--muted-foreground))",
        }}
      >
        EN
      </button>
    </div>
  );
}
