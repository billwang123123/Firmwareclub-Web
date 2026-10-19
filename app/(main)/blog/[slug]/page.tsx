import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Markdown } from "@/components/markdown";
import { dayjs } from "@/lib/dayjs";

type Params = { slug: string };

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*, author:profiles(username, avatar_url)")
    .eq("slug", slug)
    .maybeSingle();

  if (!post) notFound();

  const author = Array.isArray(post.author) ? post.author[0] : post.author;

  return (
    <article className="stack-y-6 mx-auto max-w-3xl">
      {post.cover_url && (
        <div className="cover" style={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover_url} alt={post.title} />
        </div>
      )}
      <header className="stack-y-2">
        <h1 className="hero-title" style={{ fontSize: "1.875rem" }}>{post.title}</h1>
        <p className="muted">{post.excerpt}</p>
        <p className="text-xs muted">
          {dayjs(post.published_at).format("YYYY-MM-DD")} · {author?.username ?? ""}
        </p>
      </header>
      <Markdown>{post.body_md}</Markdown>
    </article>
  );
}
