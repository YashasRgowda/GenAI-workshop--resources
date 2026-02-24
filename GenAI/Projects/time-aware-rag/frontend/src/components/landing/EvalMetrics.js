"use client";
import { useEffect, useRef, useState } from "react";

const METRICS = [
  { label: "Pass Rate", value: 80, suffix: "%", color: "var(--accent)", desc: "Overall test suite pass rate" },
  { label: "Time Relevance", value: 100, suffix: "%", color: "#a5b4fc", desc: "Documents returned are always date-valid" },
  { label: "Automated Tests", value: 44, suffix: "", color: "var(--text)", desc: "pytest test cases across all modules" },
  { label: "Source Accuracy", value: 90, suffix: "%", color: "var(--accent)", desc: "Correct source document retrieved" },
];

function AnimatedBar({ value, color, visible }) {
  return (
    <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden", marginTop: 10 }}>
      <div style={{
        height: "100%", borderRadius: 2,
        background: color,
        width: visible ? `${value}%` : "0%",
        transition: "width 1.4s cubic-bezier(0.16, 1, 0.3, 1)",
        boxShadow: `0 0 12px ${color}`,
      }} />
    </div>
  );
}

export default function EvalMetrics() {
  const [visible, setVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} style={{ padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div style={{ marginBottom: 56, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 12 }}>Evaluation Results</div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "clamp(1.9rem, 4vw, 3rem)", letterSpacing: "-0.02em", color: "var(--text)", lineHeight: 1.1 }}>
              Measured, not assumed.<br />
              <span style={{ color: "var(--primary)" }}>100% time accuracy.</span>
            </h2>
          </div>
          <a href="https://rag-backend-f85u.onrender.com/docs#/RAG/run_evaluation_api_evaluate_post" target="_blank" rel="noreferrer" className="btn-ghost">
            Run live eval ↗
          </a>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {METRICS.map((m, i) => (
            <div key={i} style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "24px",
            }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "2.8rem", fontWeight: 900, color: m.color, lineHeight: 1 }}>
                {visible ? m.value : 0}{m.suffix}
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)", marginTop: 8 }}>{m.label}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "var(--text-muted)", marginTop: 4 }}>{m.desc}</div>
              <AnimatedBar value={m.suffix === "%" ? m.value : Math.min(m.value / 44 * 100, 100)} color={m.color} visible={visible} />
            </div>
          ))}
        </div>

        {/* Test categories */}
        <div style={{ marginTop: 32, padding: "20px 24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", display: "flex", flexWrap: "wrap", gap: "10px 24px" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "var(--text-muted)" }}>Tests cover:</span>
          {["auth", "cache", "documents", "queries", "versioning", "rate-limiting", "evaluation", "health"].map(t => (
            <span key={t} className="tag tag-amber">{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}