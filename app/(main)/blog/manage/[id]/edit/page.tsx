import { notFound } from "next/navigation";
import { BlogEditor } from "@/components/blog/blog-editor";
import { requireAdmin } from "@/lib/auth";

type Params = { id: string };

export const metadata = { title: "编辑日志" };

export default async function EditBlogPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_url, body_md")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  return (
    <BlogEditor
      mode="edit"
      initial={data}
      backHref="/blog/manage"
      backLabel="返回日志管理"
    />
  );
}
