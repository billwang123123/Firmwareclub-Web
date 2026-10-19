"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LikeButton } from "@/components/forum/like-button";
import { Markdown } from "@/components/markdown";
import { dayjs } from "@/lib/dayjs";
import { Reply, Trash2 } from "lucide-react";
import type { PostWithAuthor, ReplyWithAuthor } from "@/lib/types";

type Props = {
  post: PostWithAuthor;
  initialReplies: ReplyWithAuthor[];
  currentUserId: string | null;
  isAdmin: boolean;
  likedIds: string[];
};

type ReplyNode = ReplyWithAuthor & { children: ReplyNode[] };

function buildTree(replies: ReplyWithAuthor[]): ReplyNode[] {
  const map = new Map<string, ReplyNode>();
  const roots: ReplyNode[] = [];
  for (const r of replies) map.set(r.id, { ...r, children: [] });
  for (const r of replies) {
    const node = map.get(r.id)!;
    if (r.parent_id && map.has(r.parent_id)) {
      map.get(r.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function ReplyItem({
  reply,
  depth,
  onReply,
  currentUserId,
  isAdmin,
  likedIds,
  onDelete,
}: {
  reply: ReplyNode;
  depth: number;
  onReply: (parentId: string) => void;
  currentUserId: string | null;
  isAdmin: boolean;
  likedIds: string[];
  onDelete: (id: string) => void;
}) {
  return (
    <div style={depth > 0 ? { paddingLeft: "1.5rem", borderLeft: "2px solid hsl(var(--border))" } : {}}>
      <div className="card" style={{ marginBottom: "0.5rem" }}>
        <div className="card-content pt-4 stack-y-2" style={{ padding: "1rem 1rem" }}>
          <div className="flex items-center justify-between text-xs muted">
            <span>
              <span style={{ fontWeight: 500, color: "inherit" }}>{reply.author?.username ?? "匿名"}</span>{" "}· {dayjs(reply.created_at).fromNow()}
            </span>
            {(currentUserId === reply.author_id || isAdmin) && (
              <button
                type="button"
                onClick={() => onDelete(reply.id)}
                className="btn btn-ghost btn-sm"
                style={{ padding: "0.25rem 0.5rem", height: "auto" }}
                aria-label="删除回复"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <Markdown>{reply.body_md}</Markdown>
          <div className="flex items-center gap-2">
            <LikeButton
              targetId={reply.id}
              targetType="reply"
              initialCount={reply.like_count}
              initialLiked={likedIds.includes(reply.id)}
            />
            {depth === 0 && currentUserId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onReply(reply.id)}
              >
                <Reply size={14} /> 回复
              </Button>
            )}
          </div>
        </div>
      </div>
      {reply.children.map((c) => (
        <ReplyItem
          key={c.id}
          reply={c}
          depth={depth + 1}
          onReply={onReply}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          likedIds={likedIds}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export function PostDetail({
  post: initialPost,
  initialReplies,
  currentUserId,
  isAdmin,
  likedIds,
}: Props) {
  const router = useRouter();
  const [post, setPost] = useState(initialPost);
  const [replies, setReplies] = useState(initialReplies);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`post-${post.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "posts", filter: `id=eq.${post.id}` },
        (payload) => {
          setPost((p) => ({ ...p, ...(payload.new as PostWithAuthor) }));
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "posts", filter: `id=eq.${post.id}` },
        () => {
          router.push("/forum");
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "replies", filter: `post_id=eq.${post.id}` },
        async (payload) => {
          const { data } = await supabase
            .from("replies")
            .select("*, author:profiles(id, username, avatar_url)")
            .eq("id", payload.new.id)
            .single();
          if (data) {
            setReplies((prev) =>
              prev.find((r) => r.id === data.id) ? prev : [...prev, data as ReplyWithAuthor],
            );
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "replies", filter: `post_id=eq.${post.id}` },
        (payload) => {
          setReplies((prev) => prev.filter((r) => r.id !== payload.old.id));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [post.id, router, supabase]);

  async function submitReply() {
    if (!draft.trim()) return;
    setSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    await supabase.from("replies").insert({
      post_id: post.id,
      parent_id: replyTo,
      author_id: user.id,
      body_md: draft.trim(),
    });
    setDraft("");
    setReplyTo(null);
    setSubmitting(false);
  }

  async function deleteReply(id: string) {
    if (!confirm("确认删除这条回复？")) return;
    await supabase.from("replies").delete().eq("id", id);
  }

  async function deletePost() {
    if (!confirm("确认删除这个帖子？所有回复也会被删除。")) return;
    await supabase.from("posts").delete().eq("id", post.id);
  }

  const tree = buildTree(replies);

  return (
    <div className="stack-y-6">
      <article className="stack-y-4">
        {post.cover_url && (
          <div className="cover" style={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover_url} alt={post.title} />
          </div>
        )}
        <div className="stack-y-2">
          <div className="flex items-center gap-2 text-xs muted">
            <span className="badge badge-secondary" style={{ fontWeight: 500 }}>{post.tag}</span>
            <span>{post.author?.username ?? "匿名"}</span>
            <span>· {dayjs(post.created_at).fromNow()}</span>
          </div>
          <h1 className="hero-title" style={{ fontSize: "1.875rem" }}>{post.title}</h1>
        </div>
        <Markdown>{post.body_md}</Markdown>
        <div className="flex items-center gap-2">
          <LikeButton
            targetId={post.id}
            targetType="post"
            initialCount={post.like_count}
            initialLiked={likedIds.includes(post.id)}
          />
          {(currentUserId === post.author_id || isAdmin) && (
            <Button variant="ghost" size="sm" onClick={deletePost}>
              <Trash2 size={14} /> 删除帖子
            </Button>
          )}
        </div>
      </article>

      <section className="stack-y-3">
        <h2 className="h2">回复 ({replies.length})</h2>
        {currentUserId ? (
          <div className="stack-y-2">
            {replyTo && (
              <div className="text-xs muted">
                正在回复某条评论{" "}
                <button type="button" className="text-primary" style={{ color: "hsl(var(--primary))" }} onClick={() => setReplyTo(null)}>
                  取消
                </button>
              </div>
            )}
            <textarea
              className="textarea"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="写下你的回复..."
              rows={4}
            />
            <div className="flex justify-end">
              <Button onClick={submitReply} disabled={submitting || !draft.trim()}>
                {submitting ? "发送中..." : "发送回复"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm muted">
            <a href="/login" style={{ color: "hsl(var(--primary))" }}>登录</a>{" "}后即可回复
          </p>
        )}

        {tree.length === 0 ? (
          <p className="text-sm muted text-center py-6">还没有回复，来抢沙发。</p>
        ) : (
          <div className="stack-y-2">
            {tree.map((r) => (
              <ReplyItem
                key={r.id}
                reply={r}
                depth={0}
                onReply={setReplyTo}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                likedIds={likedIds}
                onDelete={deleteReply}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
