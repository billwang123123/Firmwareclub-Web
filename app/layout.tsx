import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Firmware 嵌入式开发社",
  description: "嵌入式开发技术交流社区",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="app-shell">
        {children}
      </body>
    </html>
  );
}
