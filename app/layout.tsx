import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Firmware 嵌入式开发社",
  description: "嵌入式开发技术交流社区",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="app-shell">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
