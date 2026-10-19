import { BlogEditor } from "@/components/blog/blog-editor";

export const metadata = { title: "写新日志" };

export default function NewBlogPage() {
  return (
    <BlogEditor mode="create" backHref="/blog/manage" backLabel="返回日志管理" />
  );
}
