import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "60vh" }}>
      <h1 className="hero-title" style={{ fontSize: "2.5rem" }}>404</h1>
      <p className="muted mt-2">页面不存在</p>
      <LinkButton href="/" className="mt-4">返回首页</LinkButton>
    </div>
  );
}
