"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, LinkButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { uploadFile } from "@/lib/storage";
import { MEMBER_TAGS } from "@/lib/tags";
import { Trash2 } from "lucide-react";

type Initial = {
  id?: string;
  name?: string;
  avatar_url?: string | null;
  grade?: string | null;
  major?: string | null;
  tags?: string[];
  bio?: string | null;
  github_url?: string | null;
  sort_order?: number;
};

type Props = {
  initial?: Initial;
  mode: "create" | "edit";
};

export function MemberEditor({ initial = {}, mode }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial.name ?? "");
  const [grade, setGrade] = useState(initial.grade ?? "");
  const [major, setMajor] = useState(initial.major ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [githubUrl, setGithubUrl] = useState(initial.github_url ?? "");
  const [tags, setTags] = useState<string[]>(initial.tags ?? []);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl] = useState<string | null>(initial.avatar_url ?? null);
  const [sortOrder, setSortOrder] = useState<number>(initial.sort_order ?? 0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleTag(t: string) {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("姓名不能为空");
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    let finalAvatar = avatarUrl;
    if (avatar) {
      const url = await uploadFile(supabase, avatar, "avatars");
      if (url) finalAvatar = url;
    }
    const payload = {
      name: name.trim(),
      avatar_url: finalAvatar,
      grade: grade.trim() || null,
      major: major.trim() || null,
      bio: bio.trim() || null,
      github_url: githubUrl.trim() || null,
      tags,
      sort_order: sortOrder,
    };
    let err;
    if (mode === "create") {
      const { error: e2 } = await supabase.from("members").insert(payload);
      err = e2;
    } else if (initial.id) {
      const { error: e2 } = await supabase
        .from("members")
        .update(payload)
        .eq("id", initial.id);
      err = e2;
    }
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/members");
  }

  async function handleDelete() {
    if (!initial.id) return;
    if (!confirm("确认删除这个成员？")) return;
    const supabase = createClient();
    await supabase.from("members").delete().eq("id", initial.id);
    router.push("/members");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {mode === "create" ? "添加成员" : "编辑成员"}
        </h1>
        <LinkButton href="/members/manage" variant="ghost" size="sm">
          ← 返回成员管理
        </LinkButton>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">姓名</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="grade">年级</Label>
                <Input
                  id="grade"
                  value={grade ?? ""}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="如：高一"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="major">班级（选填）</Label>
                <Input
                  id="major"
                  value={major ?? ""}
                  onChange={(e) => setMajor(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">简介</Label>
              <Textarea
                id="bio"
                value={bio ?? ""}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="github">GitHub 链接</Label>
              <Input
                id="github"
                value={githubUrl ?? ""}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sort">排序（数字小的排在前面）</Label>
              <Input
                id="sort"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">头像</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {avatarUrl && (
              <div className="h-20 w-20 overflow-hidden rounded-full border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarUrl} alt="头像" className="h-full w-full object-cover" />
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">方向标签</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {MEMBER_TAGS.map((t) => {
                const active = tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className="focus:outline-none"
                  >
                    <Badge variant={active ? "default" : "outline"} className="cursor-pointer">
                      {t}
                    </Badge>
                  </button>
                );
              })}
            </div>
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
