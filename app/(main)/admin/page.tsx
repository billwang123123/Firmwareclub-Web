import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users } from "lucide-react";
import { getT } from "@/lib/i18n-server";

export const metadata = { title: "管理后台" };

export default async function AdminPage() {
  await requireAdmin();
  const t = await getT();
  return (
    <div className="stack-y-4">
      <h1 className="h1">{t("admin.title")}</h1>
      <div className="card-grid">
        <Link href="/blog/manage" className="card card-hover" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="card-header">
            <div className="card-title flex items-center gap-2" style={{ fontSize: "1rem" }}>
              <BookOpen size={16} /> {t("admin.blogCard.title")}
            </div>
            <p className="card-desc">{t("admin.blogCard.desc")}</p>
          </div>
        </Link>
        <Link href="/members/manage" className="card card-hover" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="card-header">
            <div className="card-title flex items-center gap-2" style={{ fontSize: "1rem" }}>
              <Users size={16} /> {t("admin.membersCard.title")}
            </div>
            <p className="card-desc">{t("admin.membersCard.desc")}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
