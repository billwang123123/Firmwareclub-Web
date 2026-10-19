import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { dayjs } from "@/lib/dayjs";
import { MessageSquare, BookOpen, Users } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: posts }, { data: blogs }] = await Promise.all([
    supabase
      .from("posts")
      .select("id, title, tag, reply_count, like_count, created_at, author:profiles(username)")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, cover_url, published_at")
      .order("published_at", { ascending: false })
      .limit(3),
  ]);

  return (
    <div className="stack-y-10">
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-overlay" />
        <div className="hero-content stack-y-2">
          <div className="hero-tag">STM32 · Arduino · ESP32 · RTOS</div>
          <h1 className="hero-title">Firmware 嵌入式开发社</h1>
          <p className="hero-desc">
            在这里交流 STM32、Arduino、ESP32、RTOS、嵌入式 Linux 等技术话题，
            分享项目经验、解决调试难题。加入我们，一起把代码烧进板子里。
          </p>
          <div className="flex gap-3" style={{ paddingTop: "1.25rem", flexWrap: "wrap" }}>
            <LinkButton href="/forum">
              <MessageSquare size={16} /> 进入论坛
            </LinkButton>
            <LinkButton href="/blog" variant="outline">
              <BookOpen size={16} /> 阅读日志
            </LinkButton>
            <LinkButton href="/members" variant="ghost">
              <Users size={16} /> 认识成员
            </LinkButton>
          </div>
          <div className="hero-stats">
            <div>
              <div className="hero-stat-num">{blogs?.length ?? 0}</div>
              <div className="hero-stat-label">日志文章</div>
            </div>
            <div>
              <div className="hero-stat-num">{posts?.length ?? 0}</div>
              <div className="hero-stat-label">技术话题</div>
            </div>
            <div>
              <div className="hero-stat-num">∞</div>
              <div className="hero-stat-label">代码行数</div>
            </div>
          </div>
        </div>
      </section>

      <section className="stack-y-4">
        <div className="flex items-center justify-between">
          <h2 className="h2">最新日志</h2>
          <Link href="/blog" className="text-sm muted" style={{ textDecoration: "none" }}>
            查看全部 →
          </Link>
        </div>
        <div className="card-grid cols-3">
          {blogs?.length ? (
            blogs.map((b) => (
              <Link key={b.id} href={`/blog/${b.slug}`} className="card card-hover" style={{ overflow: "hidden", textDecoration: "none", color: "inherit" }}>
                {b.cover_url && (
                  <div className="cover">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.cover_url} alt={b.title} />
                  </div>
                )}
                <div className="card-header">
                  <h3 className="card-title" style={{ fontSize: "1rem" }}>{b.title}</h3>
                  <p className="card-desc line-clamp-2">{b.excerpt}</p>
                </div>
                <div className="card-content" style={{ paddingTop: 0, paddingBottom: "1.5rem" }}>
                  <span className="text-xs muted">{dayjs(b.published_at).format("YYYY-MM-DD")}</span>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm muted" style={{ gridColumn: "1 / -1" }}>暂无日志文章。</p>
          )}
        </div>
      </section>

      <section className="stack-y-4">
        <div className="flex items-center justify-between">
          <h2 className="h2">最新帖子</h2>
          <Link href="/forum" className="text-sm muted" style={{ textDecoration: "none" }}>
            查看全部 →
          </Link>
        </div>
        <div className="stack-y-2">
          {posts?.length ? (
            posts.map((p) => {
              const author = Array.isArray(p.author) ? p.author[0] : p.author;
              return (
                <Link key={p.id} href={`/forum/${p.id}`} className="post-item">
                  <div className="post-item-main">
                    <div className="post-item-title">
                      <span className="badge badge-secondary">{p.tag}</span>
                      <span className="post-item-title-text">{p.title}</span>
                    </div>
                    <div className="post-item-meta">
                      {author?.username ?? "匿名"} · {dayjs(p.created_at).fromNow()}
                    </div>
                  </div>
                  <div className="post-item-stats">
                    <span>💬 {p.reply_count}</span>
                    <span>♥ {p.like_count}</span>
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="text-sm muted">暂无帖子，来发第一个吧。</p>
          )}
        </div>
      </section>
    </div>
  );
}
