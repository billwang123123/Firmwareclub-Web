import { Suspense } from "react";
import { ForumList } from "@/components/forum/forum-list";

export const metadata = { title: "论坛 · Firmware 嵌入式开发社" };

export default function ForumPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">加载中...</p>}>
      <ForumList />
    </Suspense>
  );
}
