/**
 * 给 Supabase 的 fetch 加超时保护。
 * 国内访问 supabase.co 偶尔会被卡住，没有超时会一直挂到 Vercel 超限（504）。
 */
export const SUPABASE_FETCH_TIMEOUT_MS = 10000;

export function createTimeoutFetch(timeoutMs: number = SUPABASE_FETCH_TIMEOUT_MS) {
  return async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(input, {
        ...init,
        signal: init?.signal ?? controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  };
}
