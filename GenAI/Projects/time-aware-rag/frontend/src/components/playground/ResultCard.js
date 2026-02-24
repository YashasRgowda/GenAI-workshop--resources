"use client";
import { toast } from "sonner";

export default function ResultCard({ result }) {
  if (!result) return null;

  return (
    <div style={{ background: "var(--card)", border: "1px solid rgba(77,240,192,0.2)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "rgba(77,240,192,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "var(--accent)" }}>answer generated</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "var(--text-muted)" }}>date: {result.query_date}</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "var(--text-muted)" }}>{result.retrieved_count} docs</span>
          <button onClick={() => { navigator.clipboard.writeText(result.answer); toast.success("Copied"); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.8rem" }}>⎘</button>
        </div>
      </div>
      <div style={{ padding: 24, fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
        {result.answer}
      </div>
    </div>
  );
}