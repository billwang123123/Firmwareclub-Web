import "server-only";
import { cookies } from "next/headers";
import en from "@/messages/en.json";
import zh from "@/messages/zh.json";

export type Locale = "zh" | "en";
const messages = { zh, en } as const;

export async function getLocale(): Promise<Locale> {
  const c = await cookies();
  const v = c.get("locale")?.value;
  return v === "en" ? "en" : "zh";
}

export async function getT() {
  const locale = await getLocale();
  return function t(key: string): string {
    return key.split(".").reduce<any>((acc, k) => acc?.[k], messages[locale]) ?? key;
  };
}
