"use client";
import { formatDate } from "@/lib/utils";
import { FileText, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function SourceTimeline({ sources, queryDate }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ background: "#16181D", border: "1px solid #1E2028", borderRadius: "14px", padding: "24px" }}>
      <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "#F0F0FF", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
        <Calendar size={16} style={{ color: "#06B6D4" }} />
        Sources & Timeline
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {sources.map((source, i) => {
          const isValid = queryDate >= source.valid_from && queryDate <= source.valid_to;
          const isOpen = expanded === i;

          return (
            <div
              key={i}
              style={{ borderRadius: "10px", border: `1px solid ${isValid ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`, background: isValid ? "rgba(16, 185, 129, 0.05)" : "rgba(239, 68, 68, 0.05)", overflow: "hidden" }}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                style={{ width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: isValid ? "#10B981" : "#EF4444", flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#F0F0FF" }}>
                      {source.source || `Document ${i + 1}`}
                    </p>
                    <p style={{ fontSize: "0.7rem", color: "#6B7280", fontFamily: "DM Mono, monospace" }}>
                      {source.valid_from} → {source.valid_to}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: "100px", background: isValid ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)", color: isValid ? "#10B981" : "#EF4444" }}>
                    {isValid ? "Valid" : "Expired"}
                  </span>
                  {isOpen ? <ChevronUp size={14} color="#6B7280" /> : <ChevronDown size={14} color="#6B7280" />}
                </div>
              </button>

              {isOpen && (
                <div style={{ padding: "0 16px 14px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <p style={{ fontSize: "0.8rem", color: "#6B7280", lineHeight: 1.6, marginTop: "12px" }}>
                    {source.content}
                  </p>
                  {source.score !== undefined && (
                    <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "0.7rem", color: "#6B7280" }}>Relevance score:</span>
                      <span style={{ fontSize: "0.7rem", fontFamily: "DM Mono, monospace", color: "#A855F7" }}>
                        {typeof source.score === "number" ? source.score.toFixed(4) : source.score}
                      </span>
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