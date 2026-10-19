import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users } from "lucide-react";

export const metadata = { title: "管理后台" };

export default async function AdminPage() {
  await requireAdmin();
  return (
    <div className="stack-y-4">
      <h1 className="h1">管理后台</h1>
      <div className="card-grid">
        <Link href="/blog/manage" className="card card-hover" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="card-header">
            <div className="card-title flex items-center gap-2" style={{ fontSize: "1rem" }}>
              <BookOpen size={16} /> 日志管理
            </div>
            <p className="card-desc">创建、编辑、删除社团日志文章</p>
          </div>
          <div className="card-content" style={{ paddingTop: 0 }}>
            <span className="text-sm muted">共 1 个操作入口</span>
          </div>
        </Link>
        <Link href="/members/manage" className="card card-hover" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="card-header">
            <div className="card-title flex items-center gap-2" style={{ fontSize: "1rem" }}>
              <Users size={16} /> 成员管理
            </div>
            <p className="card-desc">维护社团成员介绍页的内容</p>
          </div>
          <div className="card-content" style={{ paddingTop: 0 }}>
            <span className="text-sm muted">共 1 个操作入口</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
