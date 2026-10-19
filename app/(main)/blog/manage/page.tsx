import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { dayjs } from "@/lib/dayjs";
import { Plus, Pencil } from "lucide-react";

export const metadata = { title: "日志管理" };

export default async function BlogManagePage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, slug, title, published_at")
    .order("published_at", { ascending: false });

  return (
    <div className="stack-y-4">
      <div className="flex items-center justify-between">
        <h1 className="h1">日志管理</h1>
        <LinkButton href="/blog/manage/new">
          <Plus size={16} /> 新建
        </LinkButton>
      </div>
      {!posts?.length ? (
        <p className="text-sm muted">还没有日志。</p>
      ) : (
        <div className="card card-content-p0">
          <div className="divide-y">
            {posts.map((p) => (
              <div key={p.id} className="card-row">
                <div>
                  <Link href={`/blog/${p.slug}`} style={{ fontWeight: 500, textDecoration: "none", color: "inherit" }}>
                    {p.title}
                  </Link>
                  <p className="text-xs muted">{dayjs(p.published_at).format("YYYY-MM-DD")}</p>
                </div>
                <LinkButton href={`/blog/manage/${p.id}/edit`} variant="outline" size="sm">
                  <Pencil size={14} /> 编辑
                </LinkButton>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
