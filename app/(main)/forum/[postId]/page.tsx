import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostDetail } from "@/components/forum/post-detail";
import type { PostWithAuthor, ReplyWithAuthor } from "@/lib/types";

type Params = { postId: string };

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { postId } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*, author:profiles(id, username, avatar_url)")
    .eq("id", postId)
    .maybeSingle();

  if (!post) notFound();

  const { data: replies } = await supabase
    .from("replies")
    .select("*, author:profiles(id, username, avatar_url)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let likedIds: string[] = [];
  let isAdmin = false;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = data?.is_admin ?? false;

    const { data: likes } = await supabase
      .from("likes")
      .select("target_id")
      .eq("user_id", user.id)
      .in("target_id", [postId, ...(replies?.map((r) => r.id) ?? [])]);
    likedIds = likes?.map((l) => l.target_id) ?? [];
  }

  return (
    <PostDetail
      post={post as PostWithAuthor}
      initialReplies={(replies as ReplyWithAuthor[]) ?? []}
      currentUserId={user?.id ?? null}
      isAdmin={isAdmin}
      likedIds={likedIds}
    />
  );
}
