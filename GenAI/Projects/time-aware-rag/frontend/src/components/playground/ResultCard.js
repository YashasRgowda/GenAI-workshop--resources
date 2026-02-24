"use client";
import { CheckCircle, Clock, FileText, Copy } from "lucide-react";
import { toast } from "sonner";

export default function ResultCard({ result }) {
  if (!result) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(result.answer);
    toast.success("Copied to clipboard!");
  };

  return (
    <div style={{ background: "#16181D", border: "1px solid rgba(124, 58, 237, 0.2)", borderRadius: "14px", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckCircle size={16} style={{ color: "#10B981" }} />
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#10B981" }}>Answer Generated</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "0.75rem", color: "#6B7280", display: "flex", alignItems: "center", gap: "4px" }}>
            <Clock size={12} />
            {result.query_date}
          </span>
          <span style={{ fontSize: "0.75rem", color: "#6B7280", display: "flex", alignItems: "center", gap: "4px" }}>
            <FileText size={12} />
            {result.retrieved_count} docs
          </span>
          <button
            onClick={handleCopy}
            style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer", padding: "4px" }}
          >
            <Copy size={14} />
          </button>
        </div>
      </div>

      {/* Answer */}
      <div style={{ fontSize: "0.9rem", color: "#F0F0FF", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
        {result.answer}
      </div>
    </div>
  );
}