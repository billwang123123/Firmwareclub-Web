import { requireAdmin } from "@/lib/auth";
import { LinkButton } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const metadata = { title: "成员管理" };

export default async function MembersManagePage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("members")
    .select("id, name, grade, major, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  async function deleteMember(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const server = await createClient();
    await server.from("members").delete().eq("id", id);
  }

  return (
    <div className="stack-y-4">
      <div className="flex items-center justify-between">
        <h1 className="h1">成员管理</h1>
        <LinkButton href="/members/manage/new">
          <Plus size={16} /> 新增成员
        </LinkButton>
      </div>
      {!members?.length ? (
        <p className="text-sm muted">还没有成员。</p>
      ) : (
        <div className="card card-content-p0">
          <div className="divide-y">
            {members.map((m) => (
              <div key={m.id} className="card-row">
                <div>
                  <div style={{ fontWeight: 500 }}>{m.name}</div>
                  <div className="text-xs muted">
                    {[m.grade, m.major].filter(Boolean).join(" · ")} · 排序 {m.sort_order}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <LinkButton
                    href={`/members/manage/${m.id}/edit`}
                    variant="outline"
                    size="sm"
                  >
                    <Pencil size={14} /> 编辑
                  </LinkButton>
                  <form action={deleteMember}>
                    <input type="hidden" name="id" value={m.id} />
                    <button type="submit" className="btn btn-ghost btn-sm">
                      <Trash2 size={14} /> 删除
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
