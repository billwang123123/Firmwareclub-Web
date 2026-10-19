"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  targetId: string;
  targetType: "post" | "reply";
  initialCount: number;
  initialLiked: boolean;
};

export function LikeButton({ targetId, targetType, initialCount, initialLiked }: Props) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`like-count-${targetType}-${targetId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "likes",
          filter: `target_id=eq.${targetId}`,
        },
        () => {
          supabase
            .from("likes")
            .select("user_id", { count: "exact", head: false })
            .eq("target_id", targetId)
            .eq("target_type", targetType)
            .then(({ count: c }) => {
              if (typeof c === "number") setCount(c);
            });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetId, targetType]);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("target_id", targetId)
        .eq("target_type", targetType);
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from("likes").insert({
        user_id: user.id,
        target_id: targetId,
        target_type: targetType,
      });
      setLiked(true);
      setCount((c) => c + 1);
    }
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={cn("like-btn", liked && "active")}
    >
      <ThumbsUp size={12} />
      {count}
    </button>
  );
}
