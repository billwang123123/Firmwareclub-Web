import { NextResponse } from "next/server";

/**
 * Supabase 保活端点（由 Vercel Cron 每天调用一次）
 *
 * 背景：Supabase 免费版项目闲置 7 天会自动暂停，
 * DNS 记录下线 → 网站报 "Load failed" / 504。
 * 定时访问一次即可避免被暂停。
 *
 * Vercel Cron 配置见 vercel.json
 */
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { ok: false, error: "Missing Supabase env vars" },
      { status: 500 },
    );
  }

  const startedAt = Date.now();
  const results: Record<string, unknown> = {};

  // 1. 探测 Auth 服务
  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: key },
      signal: AbortSignal.timeout(15000),
    });
    results.auth = res.status;
  } catch (e) {
    results.auth = `error: ${(e as Error).message}`;
  }

  // 2. 探测数据库（REST API）
  try {
    const res = await fetch(
      `${url}/rest/v1/profiles?select=id&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        signal: AbortSignal.timeout(15000),
      },
    );
    results.db = res.status;
  } catch (e) {
    results.db = `error: ${(e as Error).message}`;
  }

  // 3. 探测 Realtime / Storage
  try {
    const res = await fetch(`${url}/storage/v1/bucket/public-assets`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(15000),
    });
    results.storage = res.status;
  } catch (e) {
    results.storage = `error: ${(e as Error).message}`;
  }

  const elapsed = Date.now() - startedAt;
  const alive =
    typeof results.auth === "number" && results.auth < 500 &&
    typeof results.db === "number" && results.db < 500;

  const body = {
    ok: alive,
    elapsedMs: elapsed,
    ...results,
    hint: alive
      ? "Supabase 存活正常"
      : "Supabase 可能已被暂停，请到 Dashboard 点 Resume project",
  };

  console.log(
    `[keepalive] ${alive ? "OK" : "FAIL"} ${JSON.stringify(body)}`,
  );

  return NextResponse.json(body, { status: alive ? 200 : 503 });
}
