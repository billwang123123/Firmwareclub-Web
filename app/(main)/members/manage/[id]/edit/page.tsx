import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { MemberEditor } from "@/components/members/member-editor";
import { createClient } from "@/lib/supabase/server";

type Params = { id: string };

export const metadata = { title: "编辑成员" };

export default async function EditMemberPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("members").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return <MemberEditor mode="edit" initial={data} />;
}
