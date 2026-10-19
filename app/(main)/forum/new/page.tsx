"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MdEditor } from "@/components/md-editor";
import { FORUM_TAGS, type ForumTag } from "@/lib/tags";
import { uploadFile } from "@/lib/storage";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState<ForumTag>("杂谈");
  const [cover, setCover] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !body.trim()) {
      setError("标题和正文不能为空");
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login?next=/forum/new");
      return;
    }
    let coverUrl: string | null = null;
    if (cover) {
      coverUrl = await uploadFile(supabase, cover, "covers");
    }
    const { data, error } = await supabase
      .from("posts")
      .insert({
        author_id: user.id,
        title: title.trim(),
        body_md: body,
        tag,
        cover_url: coverUrl,
      })
      .select("id")
      .single();
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(`/forum/${data.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl stack-y-4">
      <h1 className="h1">发表新帖</h1>
      <form onSubmit={handleSubmit} className="stack-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">基本信息</CardTitle>
          </CardHeader>
          <CardContent className="stack-y-4">
            <div className="field">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                placeholder="简洁描述你的问题或主题"
                required
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="field">
                <Label htmlFor="tag">标签</Label>
                <select
                  id="tag"
                  className="select"
                  value={tag}
                  onChange={(e) => setTag(e.target.value as ForumTag)}
                >
                  {FORUM_TAGS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <Label htmlFor="cover">封面图（可选）</Label>
                <input
                  id="cover"
                  className="input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCover(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">正文（支持 Markdown + 代码块）</CardTitle>
          </CardHeader>
          <CardContent>
            <MdEditor
              value={body}
              onChange={setBody}
              height={400}
              placeholder="详细描述你的问题，记得贴上代码和报错信息..."
            />
          </CardContent>
        </Card>
        {error && <p className="error-text">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            取消
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "发布中..." : "发布"}
          </Button>
        </div>
      </form>
    </div>
  );
}
