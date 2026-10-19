import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { dayjs } from "@/lib/dayjs";
import { Cpu, Zap, BookOpen, Users, ArrowRight, MessageCircle } from "lucide-react";
import { getT } from "@/lib/i18n-server";

export default async function HomePage() {
  const supabase = await createClient();
  const t = await getT();
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
        <div className="hero-eyebrow">{t("home.eyebrow")}</div>
        <h1 className="hero-title">
          {t("home.title").split("\n").map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </h1>
        <p className="hero-desc">{t("home.desc")}</p>
        <div className="hero-pills">
          <span className="hero-pill"><Cpu size={12} /> STM32</span>
          <span className="hero-pill"><Zap size={12} /> Arduino</span>
          <span className="hero-pill">📡 ESP32</span>
          <span className="hero-pill">🐧 {t("tags.嵌入式Linux")}</span>
          <span className="hero-pill">⏱ RTOS</span>
        </div>
        <div className="hero-actions">
          <LinkButton href="/forum">
            <MessageCircle size={16} /> {t("home.openForum")}
          </LinkButton>
          <LinkButton href="/blog" variant="outline">
            <BookOpen size={16} /> {t("home.browseBlog")}
          </LinkButton>
          <LinkButton href="/members" variant="ghost">
            <Users size={16} /> {t("home.meetMembers")}
          </LinkButton>
        </div>
      </section>

      <section className="stack-y-4">
        <div className="flex items-center justify-between">
          <h2 className="h2">{t("blog.title")}</h2>
          <Link href="/blog" className="text-sm muted flex items-center gap-1" style={{ textDecoration: "none" }}>
            {t("blog.viewAll")} <ArrowRight size={12} />
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
          <div className="empty-state">{t("blog.empty")}</div>
        )}
      </section>

      <section className="stack-y-4">
        <div className="flex items-center justify-between">
          <h2 className="h2">{t("forum.title")}</h2>
          <Link href="/forum" className="text-sm muted flex items-center gap-1" style={{ textDecoration: "none" }}>
            {t("blog.viewAll")} <ArrowRight size={12} />
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
                      <span className="badge badge-secondary">{t(`tags.${p.tag}` as any)}</span>
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
          <div className="empty-state">{t("forum.empty")}</div>
        )}
      </section>
    </div>
  );
}
