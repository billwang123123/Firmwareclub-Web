"use client";

import { useState } from "react";
import { DRAW_ITEMS, DIFFICULTY_COLORS, type DrawItem } from "@/lib/draw";
import { Sparkles, RotateCcw, Shuffle } from "lucide-react";

export function DrawClient() {
  const [current, setCurrent] = useState<DrawItem | null>(null);
  const [history, setHistory] = useState<DrawItem[]>([]);
  const [filter, setFilter] = useState<"全部" | "入门" | "进阶" | "高阶">("全部");
  const [animating, setAnimating] = useState(false);

  const pool =
    filter === "全部"
      ? DRAW_ITEMS
      : DRAW_ITEMS.filter((i) => i.difficulty === filter);

  function draw() {
    if (animating || pool.length === 0) return;
    setAnimating(true);
    let count = 0;
    const total = 18;
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * pool.length);
      setCurrent(pool[idx]);
      count += 1;
      if (count >= total) {
        clearInterval(interval);
        const finalIdx = Math.floor(Math.random() * pool.length);
        const picked = pool[finalIdx];
        setCurrent(picked);
        setHistory((h) => [picked, ...h].slice(0, 12));
        setAnimating(false);
      }
    }, 70);
  }

  return (
    <div className="stack-y-6">
      <div className="text-center" style={{ paddingTop: "1rem" }}>
        <div
          className="hero-eyebrow"
          style={{ justifyContent: "center", display: "inline-flex" }}
        >
          <Sparkles size={12} /> 嵌入式抽签
        </div>
        <h1 className="hero-title" style={{ fontSize: "2.25rem" }}>
          今天造点什么？
        </h1>
        <p className="hero-desc">
          从 32 个嵌入式项目里抽一个做做看。挑不出项目的时候，就让签说话。
        </p>
      </div>

      <div
        className="composer"
        style={{ maxWidth: "38rem", marginTop: "1rem" }}
      >
        <div
          style={{
            minHeight: "180px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "1.5rem 1rem",
          }}
        >
          {current ? (
            <>
              <div style={{ fontSize: "3.5rem", lineHeight: 1, marginBottom: "0.75rem" }}>
                {current.icon}
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                {current.title}
              </div>
              <div
                className="text-xs"
                style={{
                  display: "inline-block",
                  padding: "0.125rem 0.5rem",
                  borderRadius: "0.375rem",
                  background: `${DIFFICULTY_COLORS[current.difficulty]}20`,
                  color: DIFFICULTY_COLORS[current.difficulty],
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                }}
              >
                {current.difficulty}
              </div>
              <div
                className="text-sm muted"
                style={{ maxWidth: "32rem", lineHeight: 1.6 }}
              >
                {current.desc}
              </div>
            </>
          ) : (
            <div className="muted" style={{ padding: "2rem 0" }}>
              点下面的按钮抽一个项目
            </div>
          )}
        </div>
        <div
          style={{
            borderTop: "1px solid hsl(var(--border))",
            padding: "0.5rem 0.25rem 0.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <div className="tag-pills" style={{ flex: 1 }}>
            {(["全部", "入门", "进阶", "高阶"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setFilter(d)}
                className={`tag-pill ${filter === d ? "active" : ""}`}
                style={{ border: "none", cursor: "pointer", fontFamily: "inherit" }}
              >
                {d}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={draw}
            disabled={animating}
            className="btn btn-primary btn-sm"
          >
            <Shuffle size={14} />
            {animating ? "抽取中..." : current ? "再抽一签" : "开始抽签"}
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <section className="stack-y-3">
          <div className="flex items-center justify-between">
            <h2 className="h2">最近抽到</h2>
            <button
              type="button"
              onClick={() => setHistory([])}
              className="btn btn-ghost btn-sm"
            >
              <RotateCcw size={12} /> 清空
            </button>
          </div>
          <div className="card-grid">
            {history.map((item, i) => (
              <div key={`${item.title}-${i}`} className="card">
                <div className="card-content" style={{ padding: "1rem" }}>
                  <div className="flex items-center gap-3" style={{ marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "1.5rem" }}>{item.icon}</span>
                    <div style={{ fontWeight: 500 }}>{item.title}</div>
                  </div>
                  <div className="text-xs muted">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
