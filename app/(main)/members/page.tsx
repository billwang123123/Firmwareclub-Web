import { Link as LinkIcon, Pencil } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "成员 · Firmware 嵌入式开发社" };

export default async function MembersPage() {
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("members")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = data?.is_admin ?? false;
  }

  return (
    <div className="stack-y-6">
      <div className="flex items-center justify-between">
        <h1 className="h1">社团成员</h1>
        {isAdmin && (
          <LinkButton href="/members/manage">
            <Pencil size={16} /> 管理成员
          </LinkButton>
        )}
      </div>
      {!members?.length ? (
        <p className="text-sm muted">还没有成员。</p>
      ) : (
        <div className="card-grid cols-3">
          {members.map((m) => (
            <div key={m.id} className="card">
              <div className="card-content stack-y-3" style={{ paddingTop: "1.25rem" }}>
                <div className="flex items-start gap-3">
                  {m.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.avatar_url} alt={m.name} className="avatar avatar-md" />
                  ) : (
                    <div className="avatar avatar-md">{m.name[0]}</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div style={{ fontWeight: 500 }}>{m.name}</div>
                    <div className="text-xs muted">
                      {[m.grade, m.major].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  {m.github_url && (
                    <a
                      href={m.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="muted"
                      style={{ color: "hsl(var(--muted-foreground))" }}
                    >
                      <LinkIcon size={16} />
                    </a>
                  )}
                </div>
                {m.bio && <p className="text-sm muted">{m.bio}</p>}
                {m.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {m.tags.map((t) => (
                      <span key={t} className="badge badge-secondary">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
