"use client";
import { useState } from "react";

export default function SourceTimeline({ sources, queryDate }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "var(--text-muted)" }}>
          retrieved sources ({sources.length})
        </span>
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {sources.map((s, i) => {
          const isValid = queryDate >= s.valid_from && queryDate <= s.valid_to;
          return (
            <div key={i} style={{ background: "var(--surface)", border: `1px solid ${isValid ? "rgba(77,240,192,0.2)" : "rgba(255,71,87,0.2)"}`, borderRadius: "var(--radius)", overflow: "hidden" }}>
              <button onClick={() => setExpanded(expanded === i ? null : i)} style={{ width: "100%", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: isValid ? "var(--accent)" : "var(--red)", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.82rem", color: "var(--text)", fontWeight: 500 }}>{s.source || `Doc ${i + 1}`}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "var(--text-muted)" }}>{s.valid_from} → {s.valid_to}</span>
                  <span style={{ fontSize: "0.7rem", padding: "2px 7px", borderRadius: 3, background: isValid ? "rgba(77,240,192,0.1)" : "rgba(255,71,87,0.1)", color: isValid ? "var(--accent)" : "var(--red)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {isValid ? "valid" : "expired"}
                  </span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{expanded === i ? "▲" : "▼"}</span>
                </div>
              </button>
              {expanded === i && (
                <div style={{ padding: "10px 14px 14px", borderTop: "1px solid var(--border)" }}>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-sub)", lineHeight: 1.65 }}>{s.content}</p>
                  {s.score !== undefined && (
                    <div style={{ marginTop: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "var(--text-muted)" }}>
                      score: <span style={{ color: "var(--primary)" }}>{typeof s.score === "number" ? s.score.toFixed(4) : s.score}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}