"use client";
import { useState } from "react";
import { deleteDocument } from "@/lib/api";
import { useApiKey } from "@/hooks/useApiKey";
import { formatDate } from "@/lib/utils";
import { Trash2, GitBranch, FileText, Calendar, Loader } from "lucide-react";
import { toast } from "sonner";

export default function DocumentTable({ documents, loading, onDeleted, onViewVersions }) {
  const { apiKey } = useApiKey();
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (docId, source) => {
    if (!confirm(`Delete "${source}"?`)) return;
    setDeleting(docId);
    try {
      await deleteDocument(apiKey, docId);
      toast.success("Document deleted");
      onDeleted();
    } catch (err) {
      const errMsg = typeof err.response?.data?.detail === "string"
        ? err.response.data.detail
        : "Delete failed";
      toast.error(errMsg);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div style={{ background: "#16181D", border: "1px solid #1E2028", borderRadius: "14px", padding: "60px", textAlign: "center" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <Loader size={32} style={{ color: "#7C3AED", animation: "spin 1s linear infinite", margin: "0 auto" }} />
        <p style={{ color: "#6B7280", marginTop: "16px", fontSize: "0.875rem" }}>Loading documents...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div style={{ background: "#16181D", border: "1px solid #1E2028", borderRadius: "14px", padding: "60px", textAlign: "center" }}>
        <FileText size={40} style={{ color: "#374151", margin: "0 auto 16px" }} />
        <p style={{ color: "#6B7280", fontSize: "0.9rem" }}>No documents yet. Upload some PDFs to get started.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {documents.map((doc) => (
        <div key={doc.doc_id} style={{ background: "#16181D", border: "1px solid #1E2028", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1, minWidth: "200px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(168, 85, 247, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FileText size={16} style={{ color: "#A855F7" }} />
            </div>
            <div>
              <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#F0F0FF", marginBottom: "4px" }}>{doc.source || "Unknown source"}</p>
              <p style={{ fontSize: "0.75rem", color: "#6B7280", fontFamily: "DM Mono, monospace" }}>{doc.doc_id.slice(0, 8)}...</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6B7280", fontSize: "0.75rem", fontFamily: "DM Mono, monospace" }}>
            <Calendar size={12} />
            {doc.valid_from} → {doc.valid_to}
          </div>
          <div style={{ fontSize: "0.7rem", color: "#6B7280" }}>Added {formatDate(doc.created_at)}</div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => onViewVersions(doc)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", background: "rgba(6, 182, 212, 0.1)", border: "1px solid rgba(6, 182, 212, 0.2)", color: "#06B6D4", fontSize: "0.75rem", cursor: "pointer" }}>
              <GitBranch size={12} /> Versions
            </button>
            <button onClick={() => handleDelete(doc.doc_id, doc.source)} disabled={deleting === doc.doc_id} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#EF4444", fontSize: "0.75rem", cursor: "pointer" }}>
              {deleting === doc.doc_id ? <Loader size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={12} />}
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}