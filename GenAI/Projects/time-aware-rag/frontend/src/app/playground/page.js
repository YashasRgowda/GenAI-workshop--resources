"use client";
import QueryForm from "@/components/playground/QueryForm";
import ResultCard from "@/components/playground/ResultCard";
import SourceTimeline from "@/components/playground/SourceTimeline";
import { useState } from "react";
import { useApiKey } from "@/hooks/useApiKey";
import Link from "next/link";

export default function PlaygroundPage() {
  const { isKeySet } = useApiKey();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ paddingTop: 60, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 80px" }}>

        <div style={{ marginBottom: 36 }}>
          <div className="section-label" style={{ marginBottom: 10 }}>Playground</div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", letterSpacing: "-0.02em", color: "var(--text)", lineHeight: 1.1, marginBottom: 10 }}>
            Query Across Time
          </h1>
          <p style={{ color: "var(--text-sub)", fontSize: "0.9rem", maxWidth: 480 }}>
            Ask anything. Set a date. Get answers from only the documents valid at that exact point in history.
          </p>
        </div>

        {!isKeySet && (
          <div style={{ padding: "12px 16px", borderRadius: "var(--radius)", background: "rgba(245,166,35,0.07)", border: "1px solid rgba(245,166,35,0.2)", marginBottom: 28, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", color: "var(--primary)" }}>
              ⚠ Set your API key in the navbar to run queries
            </span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24, alignItems: "start" }}>
          <QueryForm onResult={setResult} onLoading={setLoading} loading={loading} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {loading && (
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 48, textAlign: "center" }}>
                <div style={{ width: 32, height: 32, border: "2px solid var(--border)", borderTop: "2px solid var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", color: "var(--text-muted)" }}>retrieving temporal context...</p>
              </div>
            )}
            {result && !loading && (
              <>
                <ResultCard result={result} />
                {result.sources?.length > 0 && <SourceTimeline sources={result.sources} queryDate={result.query_date} />}
              </>
            )}
            {!result && !loading && (
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "60px 40px", textAlign: "center" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "2rem", marginBottom: 16, color: "var(--border-bright)" }}>⏱</div>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.8 }}>
                  Run a query to see time-aware results<br />
                  <span style={{ color: "var(--border-bright)" }}>Documents are filtered by validity date</span>
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
      <style>{`@media(max-width:900px){ .pg-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}