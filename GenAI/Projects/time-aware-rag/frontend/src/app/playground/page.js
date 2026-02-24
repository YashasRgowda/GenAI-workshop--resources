"use client";
import QueryForm from "@/components/playground/QueryForm";
import ResultCard from "@/components/playground/ResultCard";
import SourceTimeline from "@/components/playground/SourceTimeline";
import { useState } from "react";
import { useApiKey } from "@/hooks/useApiKey";
import { Key } from "lucide-react";
import Link from "next/link";

export default function PlaygroundPage() {
  const { isKeySet } = useApiKey();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ paddingTop: "88px", minHeight: "100vh", padding: "88px 24px 60px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "4px 14px", borderRadius: "100px", background: "rgba(124, 58, 237, 0.1)", border: "1px solid rgba(124, 58, 237, 0.2)", fontSize: "0.75rem", color: "#A855F7", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
            Playground
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, color: "#F0F0FF", marginBottom: "8px" }}>
            Query Documents Across Time
          </h1>
          <p style={{ color: "#6B7280", fontSize: "1rem" }}>
            Ask questions and specify a date — get answers from only the documents valid on that date.
          </p>
        </div>

        {/* No API key warning */}
        {!isKeySet && (
          <div style={{ padding: "16px 20px", borderRadius: "12px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)", marginBottom: "32px", display: "flex", alignItems: "center", gap: "12px" }}>
            <Key size={16} style={{ color: "#F59E0B", flexShrink: 0 }} />
            <p style={{ fontSize: "0.875rem", color: "#F59E0B" }}>
              You need to set your API key first. Click <strong>"Set API Key"</strong> in the navbar.
            </p>
          </div>
        )}

        {/* Main layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
          <QueryForm onResult={setResult} onLoading={setLoading} loading={loading} />
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {loading && (
              <div style={{ background: "#16181D", border: "1px solid #1E2028", borderRadius: "14px", padding: "40px", textAlign: "center" }}>
                <div style={{ width: "40px", height: "40px", border: "3px solid #1E2028", borderTop: "3px solid #7C3AED", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
                <p style={{ color: "#6B7280", fontSize: "0.875rem" }}>Querying across time...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}
            {result && !loading && (
              <>
                <ResultCard result={result} />
                {result.sources?.length > 0 && <SourceTimeline sources={result.sources} queryDate={result.query_date} />}
              </>
            )}
            {!result && !loading && (
              <div style={{ background: "#16181D", border: "1px solid #1E2028", borderRadius: "14px", padding: "60px 40px", textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>⏱️</div>
                <p style={{ color: "#6B7280", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  Your answer will appear here.<br />Try asking about a policy on a specific date.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}