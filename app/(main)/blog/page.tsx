import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { dayjs } from "@/lib/dayjs";
import { Plus } from "lucide-react";

export const metadata = { title: "日志 · Firmware 嵌入式开发社" };

export default async function BlogListPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, cover_url, published_at, author:profiles(username)")
    .order("published_at", { ascending: false });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = data?.is_admin ?? false;
  }

  return (
    <div className="stack-y-6">
      <div className="flex items-center justify-between">
        <h1 className="h1">社团日志</h1>
        {isAdmin && (
          <LinkButton href="/blog/manage/new">
            <Plus size={16} /> 写新日志
          </LinkButton>
        )}
      </div>
      {posts?.length ? (
        <div className="card-grid cols-3">
          {posts.map((p) => {
            const author = Array.isArray(p.author) ? p.author[0] : p.author;
            return (
              <Link key={p.id} href={`/blog/${p.slug}`} className="card card-hover" style={{ overflow: "hidden", textDecoration: "none", color: "inherit" }}>
                {p.cover_url && (
                  <div className="cover">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.cover_url} alt={p.title} />
                  </div>
                )}
                <div className="card-header">
                  <h3 className="card-title" style={{ fontSize: "1rem" }}>{p.title}</h3>
                  <p className="card-desc line-clamp-3">{p.excerpt}</p>
                </div>
                <div className="card-content" style={{ paddingTop: 0, paddingBottom: "1.5rem" }}>
                  <span className="text-xs muted">
                    {dayjs(p.published_at).format("YYYY-MM-DD")} · {author?.username ?? ""}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-sm muted">还没有日志。</p>
      )}
    </div>
  );
}
