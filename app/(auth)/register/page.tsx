"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GithubIcon } from "@/components/icons/github";
import { useI18n } from "@/lib/i18n";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  async function handleEmailRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function handleGithub() {
    setGithubLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setGithubLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <Card className="w-full max-w-sm auth-card">
        <CardHeader>
          <CardTitle>{t("auth.register.title")}</CardTitle>
          <CardDescription>{t("auth.register.desc")}</CardDescription>
        </CardHeader>
        <CardContent className="stack-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGithub}
            disabled={githubLoading}
          >
            <GithubIcon className="h-4 w-4" />
            {githubLoading ? t("auth.register.githubLoading") : t("auth.register.github")}
          </Button>
          <div className="divider-text"><span>{t("auth.register.or")}</span></div>
          <form onSubmit={handleEmailRegister} className="stack-y-3">
            <div className="field">
              <Label htmlFor="username">{t("auth.register.username")}</Label>
              <Input
                id="username"
                required
                minLength={2}
                maxLength={32}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("auth.register.usernamePlaceholder")}
              />
            </div>
            <div className="field">
              <Label htmlFor="email">{t("auth.register.email")}</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <Label htmlFor="password">{t("auth.register.password")}</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="error-text">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("auth.register.submitting") : t("auth.register.submit")}
            </Button>
          </form>
          <p className="text-sm muted text-center">
            {t("auth.register.hasAccount")}{" "}
            <Link href="/login" style={{ color: "hsl(var(--accent))" }}>
              {t("auth.register.login")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
