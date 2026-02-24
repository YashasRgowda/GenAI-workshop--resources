"use client";
import { useEffect, useState } from "react";
import { getDocumentVersions } from "@/lib/api";
import { useApiKey } from "@/hooks/useApiKey";
import { ArrowLeft, GitBranch, Clock, CheckCircle, Loader } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function VersionHistory({ doc, onBack }) {
  const { apiKey } = useApiKey();
  const [versions, setVersions] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!doc) return;
    setLoading(true);
    getDocumentVersions(apiKey, doc.doc_id)
      .then(setVersions)
      .catch(() => toast.error("Failed to load versions"))
      .finally(() => setLoading(false));
  }, [doc]);

  if (!doc) {
    return (
      <div style={{ background: "#16181D", border: "1px solid #1E2028", borderRadius: "14px", padding: "60px", textAlign: "center" }}>
        <p style={{ color: "#6B7280" }}>Select a document from the list to view versions.</p>
        <button onClick={onBack} style={{ marginTop: "16px", padding: "8px 16px", borderRadius: "8px", background: "transparent", border: "1px solid #1E2028", color: "#6B7280", cursor: "pointer" }}>← Back to list</button>
      </div>
    );
  }

  return (
    <div style={{ background: "#16181D", border: "1px solid #1E2028", borderRadius: "14px", padding: "28px" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", background: "transparent", border: "1px solid #1E2028", color: "#6B7280", fontSize: "0.8rem", cursor: "pointer" }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div>
          <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1rem", fontWeight: 700, color: "#F0F0FF" }}>Version History</h3>
          <p style={{ fontSize: "0.75rem", color: "#6B7280" }}>{doc.source}</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Loader size={24} style={{ color: "#7C3AED", animation: "spin 1s linear infinite", margin: "0 auto" }} />
        </div>
      ) : versions ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
            <div style={{ padding: "8px 16px", borderRadius: "8px", background: "rgba(6, 182, 212, 0.1)", border: "1px solid rgba(6, 182, 212, 0.2)", fontSize: "0.8rem", color: "#06B6D4" }}>
              <GitBranch size={12} style={{ display: "inline", marginRight: "6px" }} />
              {versions.total_versions} version{versions.total_versions !== 1 ? "s" : ""}
            </div>
          </div>
          {versions.versions?.map((v) => (
            <div key={v.doc_id} style={{ padding: "16px 20px", borderRadius: "10px", background: v.is_latest ? "rgba(16, 185, 129, 0.05)" : "#0F1117", border: `1px solid ${v.is_latest ? "rgba(16, 185, 129, 0.2)" : "#1E2028"}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontFamily: "DM Mono, monospace", fontSize: "0.8rem", color: "#A855F7" }}>v{v.version}</span>
                  {v.is_latest && (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "100px", background: "rgba(16, 185, 129, 0.15)", fontSize: "0.7rem", color: "#10B981" }}>
                      <CheckCircle size={10} /> Latest
                    </span>
                  )}
                </div>
                <span style={{ fontSize: "0.7rem", color: "#6B7280", fontFamily: "DM Mono, monospace" }}>{v.valid_from} → {v.valid_to}</span>
              </div>
              {v.change_summary && <p style={{ fontSize: "0.8rem", color: "#6B7280", marginBottom: "8px" }}>{v.change_summary}</p>}
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.7rem", color: "#374151" }}>
                <Clock size={10} /> {formatDate(v.updated_at)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "#6B7280", textAlign: "center" }}>No version data found.</p>
      )}
    </div>
  );
}
// ```

// Replace all 5 files. For the resume PDF — your backend will reject it because resumes don't have "Effective Date" / "Valid Through" fields. Use this quick test — open TextEdit, paste this, export as PDF:
// ```
// IT Security Policy
// Effective Date: January 1, 2024
// Valid Through: December 31, 2024

// All employees must use VPN when working remotely.
// Password must be 12 characters minimum.