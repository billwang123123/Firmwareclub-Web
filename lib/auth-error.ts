/**
 * 把 Supabase 的原始错误翻译成用户能看懂的中文提示。
 */
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();

  if (m.includes("failed to fetch") || m.includes("abort") || m.includes("timeout")) {
    return "网络连接超时，请检查网络后重试（国内访问可能较慢，建议稍后再试）";
  }
  if (m.includes("invalid login credentials")) {
    return "邮箱或密码不正确";
  }
  if (m.includes("email not confirmed")) {
    return "邮箱尚未验证，请先查收验证邮件";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "操作过于频繁，请稍后再试";
  }
  if (m.includes("user already registered")) {
    return "该邮箱已注册，请直接登录";
  }
  if (m.includes("password should be")) {
    return "密码强度不够，至少需要 6 位";
  }
  return message;
}
