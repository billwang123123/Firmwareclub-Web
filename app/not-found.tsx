import { LinkButton } from "@/components/ui/button";
import { getT } from "@/lib/i18n-server";

export default async function NotFound() {
  const t = await getT();
  return (
    <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "60vh" }}>
      <h1 className="hero-title" style={{ fontSize: "2.5rem" }}>{t("notFound.title")}</h1>
      <p className="muted mt-2">{t("notFound.desc")}</p>
      <LinkButton href="/" className="mt-4">{t("notFound.back")}</LinkButton>
    </div>
  );
}
