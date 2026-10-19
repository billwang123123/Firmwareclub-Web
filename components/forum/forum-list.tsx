"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { FORUM_TAGS, type ForumTag } from "@/lib/tags";
import type { PostWithAuthor } from "@/lib/types";
import { dayjs } from "@/lib/dayjs";
import { Plus } from "lucide-react";

export function ForumList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag") as ForumTag | null;
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      setLoading(true);
      let query = supabase
        .from("posts")
        .select(
          "id, author_id, title, body_md, tag, cover_url, like_count, reply_count, created_at, author:profiles(id, username, avatar_url)",
        )
        .order("created_at", { ascending: false })
        .limit(50);
      if (activeTag) query = query.eq("tag", activeTag);
      const { data } = await query;
      setPosts((data as PostWithAuthor[]) ?? []);
      setLoading(false);
    }
    load();
  }, [activeTag]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("posts-list")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        async (payload) => {
          const { data } = await supabase
            .from("posts")
            .select(
              "id, author_id, title, body_md, tag, cover_url, like_count, reply_count, created_at, author:profiles(id, username, avatar_url)",
            )
            .eq("id", payload.new.id)
            .single();
          if (!data) return;
          if (activeTag && data.tag !== activeTag) return;
          setPosts((prev) => {
            if (prev.find((p) => p.id === data.id)) return prev;
            return [data as PostWithAuthor, ...prev];
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "posts" },
        (payload) => {
          setPosts((prev) => prev.filter((p) => p.id !== payload.old.id));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTag]);

  return (
    <div className="stack-y-4">
      <div className="flex items-center justify-between">
        <h1 className="h1">技术论坛</h1>
        <Button onClick={() => router.push("/forum/new")}>
          <Plus size={16} /> 发帖
        </Button>
      </div>
      <div className="tag-pills">
        <a
          href="/forum"
          className={`tag-pill ${!activeTag ? "active" : ""}`}
        >
          全部
        </a>
        {FORUM_TAGS.map((t) => (
          <a
            key={t}
            href={`/forum?tag=${encodeURIComponent(t)}`}
            className={`tag-pill ${activeTag === t ? "active" : ""}`}
          >
            {t}
          </a>
        ))}
      </div>
      {loading ? (
        <p className="text-sm muted">加载中...</p>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          还没有帖子，来发第一个吧。
        </div>
      ) : (
        <div className="stack-y-2">
          {posts.map((p) => (
            <a
              key={p.id}
              href={`/forum/${p.id}`}
              className="post-item"
            >
              <div className="post-item-main">
                <div className="post-item-title">
                  <span className="badge badge-secondary">{p.tag}</span>
                  <span className="post-item-title-text">{p.title}</span>
                </div>
                <div className="post-item-meta">
                  {p.author?.username ?? "匿名"} · {dayjs(p.created_at).fromNow()}
                </div>
              </div>
              <div className="post-item-stats">
                <span>💬 {p.reply_count}</span>
                <span>♥ {p.like_count}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
