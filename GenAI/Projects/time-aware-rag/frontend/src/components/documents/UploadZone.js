"use client";
import { useState, useCallback } from "react";
import { useApiKey } from "@/hooks/useApiKey";
import { smartUploadPdf } from "@/lib/api";
import { Upload, FileText, CheckCircle, XCircle, Loader } from "lucide-react";
import { toast } from "sonner";

export default function UploadZone({ onUploaded }) {
  const { apiKey, isKeySet } = useApiKey();
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
    if (dropped.length === 0) { toast.error("Only PDF files allowed"); return; }
    setFiles(prev => [...prev, ...dropped]);
  }, []);

  const handleFileInput = (e) => {
    const selected = Array.from(e.target.files).filter(f => f.type === "application/pdf");
    setFiles(prev => [...prev, ...selected]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!isKeySet) { toast.error("Set API key first"); return; }
    if (files.length === 0) { toast.error("Add files first"); return; }

    setUploading(true);
    const newResults = [];

    for (const file of files) {
      try {
        const result = await smartUploadPdf(apiKey, file);
        newResults.push({ file: file.name, status: "success", data: result });
        toast.success(`Uploaded ${file.name}`);
      } catch (err) {
        const errMsg = typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : err.message || "Upload failed";
        newResults.push({ file: file.name, status: "error", error: errMsg });
        toast.error(`${file.name} failed: ${errMsg}`);
      }
    }

    setResults(newResults);
    setUploading(false);

    const successes = newResults.filter(r => r.status === "success").length;
    if (successes > 0) {
      setFiles([]);
      setTimeout(onUploaded, 1500);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("pdf-input").click()}
        style={{ border: `2px dashed ${dragging ? "#7C3AED" : "#1E2028"}`, borderRadius: "16px", padding: "60px 40px", textAlign: "center", cursor: "pointer", background: dragging ? "rgba(124, 58, 237, 0.05)" : "#16181D", transition: "all 0.2s" }}
      >
        <input id="pdf-input" type="file" accept=".pdf" multiple onChange={handleFileInput} style={{ display: "none" }} />
        <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: "rgba(124, 58, 237, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Upload size={24} style={{ color: "#7C3AED" }} />
        </div>
        <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#F0F0FF", marginBottom: "8px" }}>Drop PDFs here</h3>
        <p style={{ fontSize: "0.875rem", color: "#6B7280", marginBottom: "4px" }}>AI will automatically extract dates from your documents</p>
        <p style={{ fontSize: "0.75rem", color: "#374151" }}>Supports .pdf files only</p>
      </div>

      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{files.length} file{files.length > 1 ? "s" : ""} ready</p>
          {files.map((file, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "10px", background: "#16181D", border: "1px solid #1E2028" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FileText size={16} style={{ color: "#A855F7" }} />
                <div>
                  <p style={{ fontSize: "0.875rem", color: "#F0F0FF" }}>{file.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "#6B7280" }}>{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button onClick={() => removeFile(i)} style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer" }}>
                <XCircle size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{ padding: "12px", borderRadius: "10px", background: uploading ? "#1E2028" : "linear-gradient(135deg, #7C3AED, #06B6D4)", border: "none", color: uploading ? "#6B7280" : "white", fontWeight: 600, fontSize: "0.95rem", cursor: uploading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "8px" }}
          >
            {uploading
              ? <><Loader size={16} style={{ animation: "spin 1s linear infinite" }} /> Uploading... (backend may take 30s to wake up)</>
              : <><Upload size={16} /> Upload {files.length} PDF{files.length > 1 ? "s" : ""}</>}
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Upload Results</p>
          {results.map((r, i) => (
            <div key={i} style={{ padding: "14px 16px", borderRadius: "10px", background: r.status === "success" ? "rgba(16, 185, 129, 0.05)" : "rgba(239, 68, 68, 0.05)", border: `1px solid ${r.status === "success" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                {r.status === "success" ? <CheckCircle size={14} style={{ color: "#10B981" }} /> : <XCircle size={14} style={{ color: "#EF4444" }} />}
                <span style={{ fontSize: "0.875rem", color: "#F0F0FF" }}>{r.file}</span>
              </div>
              {r.status === "success" && r.data?.extracted_dates && (
                <div style={{ fontSize: "0.75rem", color: "#6B7280", fontFamily: "DM Mono, monospace", paddingLeft: "22px" }}>
                  {r.data.extracted_dates.valid_from} → {r.data.extracted_dates.valid_to}
                </div>
              )}
              {r.status === "error" && (
                <p style={{ fontSize: "0.75rem", color: "#EF4444", paddingLeft: "22px" }}>{r.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}