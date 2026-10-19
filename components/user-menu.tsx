"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LinkButton } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type Props = {
  user: { email: string } | null;
  profile: { username: string; avatar_url: string | null; is_admin: boolean } | null;
};

export function UserMenu({ user, profile }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <LinkButton href="/login" variant="ghost" size="sm">{t("nav.login")}</LinkButton>
        <LinkButton href="/register" size="sm">{t("nav.register")}</LinkButton>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn btn-outline btn-sm"
        style={{ gap: "0.5rem" }}
      >
        {profile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt={profile.username} className="avatar avatar-sm" style={{ width: 20, height: 20 }} />
        ) : (
          <span className="avatar avatar-sm" style={{ width: 20, height: 20 }}>
            {profile?.username?.[0]?.toUpperCase() ?? <UserIcon size={12} />}
          </span>
        )}
        <span className="hide-sm">{profile?.username ?? user.email}</span>
      </button>
      {open && (
        <div
          className="card"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 0.5rem)",
            width: 200,
            padding: "0.25rem",
            zIndex: 60,
          }}
          onMouseLeave={() => setOpen(false)}
        >
          <div className="text-xs muted" style={{ padding: "0.5rem 0.75rem" }}>{user.email}</div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="btn btn-ghost btn-sm w-full"
            style={{ justifyContent: "flex-start" }}
          >
            <LogOut size={14} />
            {signingOut ? t("nav.signingOut") : t("nav.logout")}
          </button>
        </div>
      )}
    </div>
  );
}
