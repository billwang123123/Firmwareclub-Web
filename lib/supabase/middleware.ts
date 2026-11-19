import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/types";
import { createTimeoutFetch } from "./fetch";

const AUTH_TIMEOUT_MS = 2500;

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // 没有 Supabase auth cookie 时无需刷新，直接放行（零网络请求）
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.value);
  if (!hasAuthCookie) return response;

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
      global: {
        fetch: createTimeoutFetch(),
      },
    },
  );

  try {
    // getSession() 直接读 cookie 里的 JWT，正常情况不联网。
    // 加超时兜底：Supabase 不可达时不要阻塞页面渲染。
    await Promise.race([
      supabase.auth.getSession(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("auth timeout")), AUTH_TIMEOUT_MS),
      ),
    ]);
  } catch {
    // Supabase 暂时不可达时继续渲染，页面壳子先出来
  }

  return response;
}
