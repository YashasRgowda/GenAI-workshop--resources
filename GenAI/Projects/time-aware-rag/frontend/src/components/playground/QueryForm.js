"use client";
import { useState } from "react";
import { useApiKey } from "@/hooks/useApiKey";
import { queryDocuments, combinedSearch } from "@/lib/api";
import { getTodayString } from "@/lib/utils";
import { Search, Calendar, Sliders, Zap } from "lucide-react";
import { toast } from "sonner";

export default function QueryForm({ onResult, onLoading, loading }) {
  const { apiKey, isKeySet } = useApiKey();
  const [query, setQuery] = useState("");
  const [queryDate, setQueryDate] = useState(getTodayString());
  const [mode, setMode] = useState("standard");
  const [k, setK] = useState(5);
  const [useSemantic, setUseSemantic] = useState(true);
  const [useFulltext, setUseFulltext] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isKeySet) { toast.error("Set your API key first!"); return; }
    if (!query.trim()) { toast.error("Enter a query"); return; }

    onLoading(true);
    try {
      let result;
      if (mode === "combined") {
        result = await combinedSearch(apiKey, query, queryDate, useSemantic, useFulltext, k);
      } else {
        result = await queryDocuments(apiKey, query, queryDate, k);
      }
      onResult(result);
      toast.success("Query complete!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Query failed");
      onResult(null);
    } finally {
      onLoading(false);
    }
  };

  const exampleQueries = [
    "What is the VPN policy?",
    "What are the password requirements?",
    "What is the leave policy?",
  ];

  return (
    <div style={{ background: "#16181D", border: "1px solid #1E2028", borderRadius: "14px", padding: "28px", position: "sticky", top: "88px" }}>
      <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#F0F0FF", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
        <Search size={18} style={{ color: "#7C3AED" }} /> Ask a Question
      </h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Query input */}
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "#6B7280", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Your Question
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What is the VPN policy for remote work?"
            rows={3}
            style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: "#0F1117", border: "1px solid #1E2028", color: "#F0F0FF", fontSize: "0.9rem", outline: "none", resize: "vertical", fontFamily: "DM Sans, sans-serif" }}
          />
        </div>

        {/* Date */}
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "#6B7280", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "6px" }}>
            <Calendar size={12} /> Query Date
          </label>
          <input
            type="date"
            value={queryDate}
            onChange={(e) => setQueryDate(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: "#0F1117", border: "1px solid #1E2028", color: "#F0F0FF", fontSize: "0.9rem", outline: "none", fontFamily: "DM Mono, monospace" }}
          />
        </div>

        {/* Mode toggle */}
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "#6B7280", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Search Mode
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            {["standard", "combined"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{ flex: 1, padding: "8px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 500, background: mode === m ? "rgba(124, 58, 237, 0.2)" : "#0F1117", border: mode === m ? "1px solid rgba(124, 58, 237, 0.4)" : "1px solid #1E2028", color: mode === m ? "#A855F7" : "#6B7280", cursor: "pointer", textTransform: "capitalize" }}
              >
                {m === "combined" ? "⚡ Hybrid" : "🔍 Standard"}
              </button>
            ))}
          </div>
        </div>

        {/* Hybrid options */}
        {mode === "combined" && (
          <div style={{ padding: "12px", borderRadius: "8px", background: "#0F1117", border: "1px solid #1E2028", display: "flex", gap: "16px" }}>
            {[{ label: "Semantic", val: useSemantic, set: setUseSemantic }, { label: "Full-text", val: useFulltext, set: setUseFulltext }].map((opt) => (
              <label key={opt.label} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.8rem", color: "#6B7280" }}>
                <input type="checkbox" checked={opt.val} onChange={(e) => opt.set(e.target.checked)} style={{ accentColor: "#7C3AED" }} />
                {opt.label}
              </label>
            ))}
          </div>
        )}

        {/* K slider */}
        <div>
          <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#6B7280", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <span><Sliders size={12} style={{ display: "inline", marginRight: "4px" }} />Results</span>
            <span style={{ color: "#A855F7" }}>{k}</span>
          </label>
          <input type="range" min={1} max={10} value={k} onChange={(e) => setK(Number(e.target.value))} style={{ width: "100%", accentColor: "#7C3AED" }} />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !isKeySet}
          style={{ padding: "12px", borderRadius: "10px", background: loading || !isKeySet ? "#1E2028" : "linear-gradient(135deg, #7C3AED, #06B6D4)", border: "none", color: loading || !isKeySet ? "#6B7280" : "white", fontWeight: 600, fontSize: "0.95rem", cursor: loading || !isKeySet ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
        >
          <Zap size={16} />
          {loading ? "Querying..." : "Run Query"}
        </button>

        {/* Example queries */}
        <div>
          <p style={{ fontSize: "0.7rem", color: "#6B7280", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Try these</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {exampleQueries.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setQuery(q)}
                style={{ padding: "6px 10px", borderRadius: "6px", background: "transparent", border: "1px solid #1E2028", color: "#6B7280", fontSize: "0.75rem", cursor: "pointer", textAlign: "left" }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}