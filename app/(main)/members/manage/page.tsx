import { LinkButton } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { Plus, Pencil, Trash2, Shield } from "lucide-react";
import { revalidatePath } from "next/cache";

export const metadata = { title: "成员管理" };

export const dynamic = "force-dynamic";

export default async function MembersManagePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="empty-state">
        请先 <a href="/login" style={{ color: "hsl(var(--accent))" }}>登录</a> 后再管理成员。
      </div>
    );
  }

  // Check if current user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  const isAdmin = profile?.is_admin ?? false;

  const { data: members } = await supabase
    .from("members")
    .select("id, name, grade, major, sort_order, created_by")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  async function deleteMember(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const server = await createClient();
    const { data: { user: u } } = await server.auth.getUser();
    if (!u) return;
    // RLS will enforce; just attempt
    await server.from("members").delete().eq("id", id);
    revalidatePath("/members");
    revalidatePath("/members/manage");
  }

  return (
    <div className="stack-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="h1">成员管理</h1>
          <p className="text-sm muted" style={{ marginTop: "0.25rem" }}>
            {isAdmin
              ? "你是管理员，可以编辑/删除任何成员"
              : "你可以添加新成员，只能编辑/删除自己添加的"}
          </p>
        </div>
        <LinkButton href="/members/manage/new">
          <Plus size={16} /> 新增成员
        </LinkButton>
      </div>
      {!members?.length ? (
        <p className="text-sm muted">还没有成员。</p>
      ) : (
        <div className="card card-content-p0">
          <div className="divide-y">
            {members.map((m) => {
              const canEdit = isAdmin || m.created_by === user.id;
              return (
                <div key={m.id} className="card-row">
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 500 }}>{m.name}</span>
                      {isAdmin && (
                        <span className="badge badge-secondary" style={{ fontSize: "0.625rem" }}>
                          <Shield size={10} /> 全部可管
                        </span>
                      )}
                      {!isAdmin && m.created_by === user.id && (
                        <span className="badge badge-secondary" style={{ fontSize: "0.625rem" }}>
                          我添加的
                        </span>
                      )}
                    </div>
                    <div className="text-xs muted">
                      {[m.grade, m.major].filter(Boolean).join(" · ")} · 排序 {m.sort_order}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canEdit ? (
                      <>
                        <LinkButton
                          href={`/members/manage/${m.id}/edit`}
                          variant="outline"
                          size="sm"
                        >
                          <Pencil size={14} /> 编辑
                        </LinkButton>
                        <form action={deleteMember}>
                          <input type="hidden" name="id" value={m.id} />
                          <button
                            type="submit"
                            className="btn btn-ghost btn-sm"
                            aria-label="删除成员"
                          >
                            <Trash2 size={14} />
                          </button>
                        </form>
                      </>
                    ) : (
                      <span className="text-xs muted">仅创建者可编辑</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
