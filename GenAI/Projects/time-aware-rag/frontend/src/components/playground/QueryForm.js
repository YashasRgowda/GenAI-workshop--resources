"use client";
import { useState } from "react";
import { useApiKey } from "@/hooks/useApiKey";
import { queryDocuments, combinedSearch } from "@/lib/api";
import { getTodayString } from "@/lib/utils";
import { toast } from "sonner";

const EXAMPLES = [
  "What is the VPN policy?",
  "What are the password requirements?",
  "What is the leave policy?",
];

export default function QueryForm({ onResult, onLoading, loading }) {
  const { apiKey, isKeySet } = useApiKey();
  const [query, setQuery] = useState("");
  const [queryDate, setQueryDate] = useState(getTodayString());
  const [mode, setMode] = useState("standard");
  const [k, setK] = useState(5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isKeySet) { toast.error("Set API key first"); return; }
    if (!query.trim()) { toast.error("Enter a query"); return; }
    onLoading(true);
    try {
      const result = mode === "combined"
        ? await combinedSearch(apiKey, query, queryDate, true, true, k)
        : await queryDocuments(apiKey, query, queryDate, k);
      onResult(result);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Query failed. Backend may be waking up (~30s).");
      onResult(null);
    } finally {
      onLoading(false);
    }
  };

  const labelStyle = { display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 7 };

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 24, position: "sticky", top: 80 }}>
      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "var(--primary)" }}>◈</span> Query Interface
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        <div>
          <label style={labelStyle}>Query</label>
          <textarea value={query} onChange={e => setQuery(e.target.value)} placeholder="What is the remote work policy?" rows={3}
            className="input" style={{ resize: "vertical", lineHeight: 1.6 }} />
        </div>

        <div>
          <label style={labelStyle}>Date Context</label>
          <input type="date" value={queryDate} onChange={e => setQueryDate(e.target.value)} className="input" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem" }} />
        </div>

        <div>
          <label style={labelStyle}>Mode</label>
          <div style={{ display: "flex", gap: 6 }}>
            {[{ id: "standard", label: "Standard" }, { id: "combined", label: "⚡ Hybrid" }].map(m => (
              <button key={m.id} type="button" onClick={() => setMode(m.id)} style={{
                flex: 1, padding: "7px", borderRadius: "var(--radius)",
                background: mode === m.id ? "var(--primary-dim)" : "var(--surface)",
                border: mode === m.id ? "1px solid rgba(245,166,35,0.35)" : "1px solid var(--border)",
                color: mode === m.id ? "var(--primary)" : "var(--text-muted)",
                fontSize: "0.8rem", fontWeight: 500, cursor: "pointer",
              }}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ ...labelStyle, display: "flex", justifyContent: "space-between" }}>
            <span>Results (k)</span>
            <span style={{ color: "var(--primary)" }}>{k}</span>
          </label>
          <input type="range" min={1} max={10} value={k} onChange={e => setK(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--primary)" }} />
        </div>

        <button type="submit" disabled={loading || !isKeySet} className="btn-primary" style={{
          justifyContent: "center",
          opacity: loading || !isKeySet ? 0.5 : 1,
          cursor: loading || !isKeySet ? "not-allowed" : "pointer",
        }}>
          {loading ? "Querying..." : "Run Query"}
        </button>

        <div>
          <div style={labelStyle}>Examples</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {EXAMPLES.map((q, i) => (
              <button key={i} type="button" onClick={() => setQuery(q)} style={{
                padding: "7px 10px", borderRadius: "var(--radius)",
                background: "transparent", border: "1px solid var(--border)",
                color: "var(--text-muted)", fontSize: "0.78rem", cursor: "pointer",
                textAlign: "left", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-bright)"; e.currentTarget.style.color = "var(--text-sub)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}>
                {q}
              </button>
            ))}
          </div>
        </div>

      </form>
    </div>
  );
}