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
import { useI18n } from "@/lib/i18n";

export default function NewPostPage() {
  const router = useRouter();
  const { t } = useI18n();
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
      setError(t("forum.form.titleBodyRequired"));
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
      <h1 className="h1">{t("forum.newPostTitle")}</h1>
      <form onSubmit={handleSubmit} className="stack-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic info</CardTitle>
          </CardHeader>
          <CardContent className="stack-y-4">
            <div className="field">
              <Label htmlFor="title">{t("forum.form.title")}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                placeholder={t("forum.form.titlePlaceholder")}
                required
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="field">
                <Label htmlFor="tag">{t("forum.form.tag")}</Label>
                <select
                  id="tag"
                  className="select"
                  value={tag}
                  onChange={(e) => setTag(e.target.value as ForumTag)}
                >
                  {FORUM_TAGS.map((tg) => (
                    <option key={tg} value={tg}>
                      {t(`tagsPill.${tg}` as any)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <Label htmlFor="cover">{t("forum.form.cover")}</Label>
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
            <CardTitle className="text-base">{t("forum.form.body")}</CardTitle>
          </CardHeader>
          <CardContent>
            <MdEditor
              value={body}
              onChange={setBody}
              height={400}
              placeholder={t("forum.form.bodyPlaceholder")}
            />
          </CardContent>
        </Card>
        {error && <p className="error-text">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? t("forum.form.publishing") : t("forum.form.publish")}
          </Button>
        </div>
      </form>
    </div>
  );
}
