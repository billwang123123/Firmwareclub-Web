import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { dayjs } from "@/lib/dayjs";
import { Cpu, Zap, BookOpen, Users, ArrowRight, MessageCircle } from "lucide-react";

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
      .select("id, slug, title, excerpt, cover_url, published_at, author:profiles(username)")
      .order("published_at", { ascending: false })
      .limit(6),
  ]);

  return (
    <div className="stack-y-10">
      <section className="hero">
        <div className="hero-eyebrow">Firmware 嵌入式开发社</div>
        <h1 className="hero-title">玩硬件，<br />也写代码</h1>
        <p className="hero-desc">
          STM32、Arduino、ESP32、嵌入式 Linux、RTOS —— 焊板子、调电路、写固件，一起造点真正能跑的东西。
        </p>
        <div className="hero-pills">
          <span className="hero-pill"><Cpu size={12} /> STM32</span>
          <span className="hero-pill"><Zap size={12} /> Arduino</span>
          <span className="hero-pill">📡 ESP32</span>
          <span className="hero-pill">🐧 嵌入式 Linux</span>
          <span className="hero-pill">⏱ RTOS</span>
        </div>
        <div className="hero-actions">
          <LinkButton href="/forum">
            <MessageCircle size={16} /> 打开论坛
          </LinkButton>
          <LinkButton href="/blog" variant="outline">
            <BookOpen size={16} /> 浏览日志
          </LinkButton>
          <LinkButton href="/members" variant="ghost">
            <Users size={16} /> 认识成员
          </LinkButton>
        </div>
      </section>

      <section className="stack-y-4">
        <div className="flex items-center justify-between">
          <h2 className="h2">日志</h2>
          <Link href="/blog" className="text-sm muted flex items-center gap-1" style={{ textDecoration: "none" }}>
            查看全部 <ArrowRight size={12} />
          </Link>
        </div>
        {blogs?.length ? (
          <div className="card-grid cols-3">
            {blogs.map((b) => (
              <Link key={b.id} href={`/blog/${b.slug}`} className="card card-hover" style={{ overflow: "hidden", textDecoration: "none", color: "inherit" }}>
                {b.cover_url && (
                  <div className="cover">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.cover_url} alt={b.title} />
                  </div>
                )}
                <div className="card-header">
                  <h3 className="card-title">{b.title}</h3>
                  <p className="card-desc line-clamp-2">{b.excerpt}</p>
                </div>
                <div className="card-content" style={{ paddingTop: 0, paddingBottom: "1.25rem" }}>
                  <span className="text-xs muted">{dayjs(b.published_at).format("YYYY-MM-DD")}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">还没有日志文章。</div>
        )}
      </section>

      <section className="stack-y-4">
        <div className="flex items-center justify-between">
          <h2 className="h2">最新帖子</h2>
          <Link href="/forum" className="text-sm muted flex items-center gap-1" style={{ textDecoration: "none" }}>
            查看全部 <ArrowRight size={12} />
          </Link>
        </div>
        {posts?.length ? (
          <div className="stack-y-2">
            {posts.map((p) => {
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
            })}
          </div>
        ) : (
          <div className="empty-state">还没有帖子，来发第一个吧。</div>
        )}
      </section>
    </div>
  );
}
