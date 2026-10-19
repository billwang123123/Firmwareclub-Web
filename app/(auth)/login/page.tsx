"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const next = searchParams.get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <Card className="w-full max-w-sm auth-card">
      <CardHeader>
        <CardTitle>{t("auth.login.title")}</CardTitle>
        <CardDescription>{t("auth.login.desc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailLogin} className="stack-y-3">
          <div className="field">
            <Label htmlFor="email">{t("auth.login.email")}</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.login.emailPlaceholder")}
            />
          </div>
          <div className="field">
            <Label htmlFor="password">{t("auth.login.password")}</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("auth.login.submitting") : t("auth.login.submit")}
          </Button>
        </form>
        <p className="text-sm muted text-center" style={{ marginTop: "1rem" }}>
          {t("auth.login.noAccount")}{" "}
          <Link href="/register" style={{ color: "hsl(var(--accent))" }}>
            {t("auth.login.register")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="auth-wrap">
      <Suspense
        fallback={
          <Card className="w-full max-w-sm">
            <CardContent className="p-6 text-sm muted">
              Loading…
            </CardContent>
          </Card>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
