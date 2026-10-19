import { Navbar } from "@/components/navbar";
import { getT } from "@/lib/i18n-server";

export default async function MainLayout({ children }: LayoutProps<"/">) {
  const t = await getT();
  return (
    <>
      <Navbar />
      <main className="main-pad flex-1">
        <div className="container-app">{children}</div>
      </main>
      <footer className="footer">
        <div className="container-app">
          {t("common.siteName")} · {t("footer.tagline")} · Powered by Next.js + Supabase
        </div>
      </footer>
    </>
  );
}
