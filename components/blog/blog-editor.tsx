"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, LinkButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MdEditor } from "@/components/md-editor";
import { uploadFile } from "@/lib/storage";
import { Trash2 } from "lucide-react";

type Initial = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  cover_url?: string | null;
  body_md?: string;
};

type Props = {
  initial?: Initial;
  mode: "create" | "edit";
  backHref: string;
  backLabel: string;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function BlogEditor({ initial = {}, mode, backHref, backLabel }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title ?? "");
  const [slug, setSlug] = useState(initial.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial.excerpt ?? "");
  const [body, setBody] = useState(initial.body_md ?? "");
  const [cover, setCover] = useState<File | null>(null);
  const [coverUrl] = useState<string | null>(initial.cover_url ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    let finalCover = coverUrl;
    if (cover) {
      const url = await uploadFile(supabase, cover, "covers");
      if (url) finalCover = url;
    }
    const finalSlug = slug || slugify(title);
    if (!finalSlug) {
      setError("请填写标题或自定义 slug");
      setSubmitting(false);
      return;
    }
    const payload = {
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim(),
      body_md: body,
      cover_url: finalCover,
    };
    let err;
    if (mode === "create") {
      const { error: e2 } = await supabase
        .from("blog_posts")
        .insert({ ...payload, author_id: user.id });
      err = e2;
    } else if (initial.id) {
      const { error: e2 } = await supabase
        .from("blog_posts")
        .update(payload)
        .eq("id", initial.id);
      err = e2;
    }
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push(`/blog/${finalSlug}`);
  }

  async function handleDelete() {
    if (!initial.id) return;
    if (!confirm("确认删除这篇日志？")) return;
    const supabase = createClient();
    await supabase.from("blog_posts").delete().eq("id", initial.id);
    router.push("/blog");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {mode === "create" ? "写新日志" : "编辑日志"}
        </h1>
        <LinkButton href={backHref} variant="ghost" size="sm">
          ← {backLabel}
        </LinkButton>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={120}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug（URL 片段，留空则自动生成）</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-first-post"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="excerpt">摘要</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                maxLength={300}
                placeholder="一两句话概括本文内容，会显示在列表和详情页头部"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cover">封面图（可选）</Label>
              {coverUrl && (
                <div className="mb-2 aspect-video w-48 overflow-hidden rounded border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverUrl} alt="封面" className="h-full w-full object-cover" />
                </div>
              )}
              <Input
                id="cover"
                type="file"
                accept="image/*"
                onChange={(e) => setCover(e.target.files?.[0] ?? null)}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">正文</CardTitle>
          </CardHeader>
          <CardContent>
            <MdEditor value={body} onChange={setBody} height={500} />
          </CardContent>
        </Card>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex items-center justify-between">
          {mode === "edit" ? (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
              删除
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              取消
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
