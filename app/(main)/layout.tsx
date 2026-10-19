import { Navbar } from "@/components/navbar";

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Navbar />
      <main className="main-pad flex-1">
        <div className="container-app">{children}</div>
      </main>
      <footer className="footer">
        <div className="container-app">
          Firmware 嵌入式开发社 · Powered by Next.js + Supabase
        </div>
      </footer>
    </>
  );
}
