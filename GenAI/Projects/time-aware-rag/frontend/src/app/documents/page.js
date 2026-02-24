"use client";
import { useState, useEffect } from "react";
import UploadZone from "@/components/documents/UploadZone";
import DocumentTable from "@/components/documents/DocumentTable";
import VersionHistory from "@/components/documents/VersionHistory";
import { listDocuments } from "@/lib/api";
import { useApiKey } from "@/hooks/useApiKey";
import { Key, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function DocumentsPage() {
  const { apiKey, isKeySet } = useApiKey();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [activeTab, setActiveTab] = useState("list");

  const fetchDocuments = async () => {
    if (!isKeySet) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const docs = await listDocuments(apiKey);
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (err) {
      const errMsg = typeof err.response?.data?.detail === "string"
        ? err.response.data.detail
        : "Failed to fetch documents";
      toast.error(errMsg);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [isKeySet, apiKey]);

  const totalDocs = documents.length;
  const uniqueSources = new Set(documents.map(d => d.source)).size;
  const dateRange = documents.length > 0
    ? `${documents[documents.length - 1]?.valid_from?.slice(0, 4) ?? "?"} — ${documents[0]?.valid_to?.slice(0, 4) ?? "?"}`
    : "—";

  return (
    <div style={{ paddingTop: "88px", minHeight: "100vh", padding: "88px 24px 60px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        <div style={{ marginBottom: "32px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "4px 14px", borderRadius: "100px", background: "rgba(6, 182, 212, 0.1)", border: "1px solid rgba(6, 182, 212, 0.2)", fontSize: "0.75rem", color: "#06B6D4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
              Documents
            </div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, color: "#F0F0FF", marginBottom: "8px" }}>
              Document Manager
            </h1>
            <p style={{ color: "#6B7280", fontSize: "1rem" }}>
              Upload, manage, and version your temporal documents.
            </p>
          </div>
          <button
            onClick={fetchDocuments}
            disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "10px", background: "#16181D", border: "1px solid #1E2028", color: "#6B7280", fontSize: "0.875rem", cursor: "pointer" }}
          >
            <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            Refresh
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>

        {!isKeySet && (
          <div style={{ padding: "16px 20px", borderRadius: "12px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)", marginBottom: "32px", display: "flex", alignItems: "center", gap: "12px" }}>
            <Key size={16} style={{ color: "#F59E0B", flexShrink: 0 }} />
            <p style={{ fontSize: "0.875rem", color: "#F59E0B" }}>
              Set your API key in the navbar to manage documents.
            </p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
          <div style={{ background: "#16181D", border: "1px solid #1E2028", borderRadius: "12px", padding: "16px 20px" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#A855F7", fontFamily: "Syne, sans-serif" }}>{totalDocs}</div>
            <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>Total Documents</div>
          </div>
          <div style={{ background: "#16181D", border: "1px solid #1E2028", borderRadius: "12px", padding: "16px 20px" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#06B6D4", fontFamily: "Syne, sans-serif" }}>{uniqueSources}</div>
            <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>Unique Sources</div>
          </div>
          <div style={{ background: "#16181D", border: "1px solid #1E2028", borderRadius: "12px", padding: "16px 20px" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#10B981", fontFamily: "Syne, sans-serif" }}>{dateRange}</div>
            <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>Date Range</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "#0F1117", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
          {["list", "upload", "versions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ padding: "8px 20px", borderRadius: "8px", fontSize: "0.875rem", fontWeight: 500, background: activeTab === tab ? "#16181D" : "transparent", border: activeTab === tab ? "1px solid #1E2028" : "1px solid transparent", color: activeTab === tab ? "#F0F0FF" : "#6B7280", cursor: "pointer" }}
            >
              {tab === "list" ? "📄 Documents" : tab === "upload" ? "⬆️ Upload" : "🔄 Versions"}
            </button>
          ))}
        </div>

        {activeTab === "list" && (
          <DocumentTable
            documents={documents}
            loading={loading}
            onDeleted={fetchDocuments}
            onViewVersions={(doc) => { setSelectedDoc(doc); setActiveTab("versions"); }}
          />
        )}
        {activeTab === "upload" && (
          <UploadZone onUploaded={() => { fetchDocuments(); setActiveTab("list"); }} />
        )}
        {activeTab === "versions" && (
          <VersionHistory doc={selectedDoc} onBack={() => setActiveTab("list")} />
        )}

      </div>
    </div>
  );
}