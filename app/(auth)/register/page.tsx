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

export default function RegisterPage() {
  const router = useRouter();
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
          <CardTitle>注册</CardTitle>
          <CardDescription>创建账号加入社团</CardDescription>
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
            {githubLoading ? "跳转中..." : "使用 GitHub 注册"}
          </Button>
          <div className="divider-text"><span>或</span></div>
          <form onSubmit={handleEmailRegister} className="stack-y-3">
            <div className="field">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                required
                minLength={2}
                maxLength={32}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="用于显示在帖子和回复中"
              />
            </div>
            <div className="field">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <Label htmlFor="password">密码</Label>
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
              {loading ? "注册中..." : "注册"}
            </Button>
          </form>
          <p className="text-sm muted text-center">
            已有账号？{" "}
            <Link href="/login" style={{ color: "hsl(var(--primary))" }}>
              登录
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
