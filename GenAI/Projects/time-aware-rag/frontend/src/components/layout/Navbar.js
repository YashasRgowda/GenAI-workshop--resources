"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Key, X, CheckCircle, Menu, XCircle } from "lucide-react";
import { useApiKey } from "@/hooks/useApiKey";
import { toast } from "sonner";

export default function Navbar() {
  const pathname = usePathname();
  const { apiKey, isKeySet, setApiKey, clearApiKey } = useApiKey();
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/playground", label: "Playground" },
    { href: "/documents", label: "Documents" },
    { href: "/analytics", label: "Analytics" },
  ];

  const handleSaveKey = () => {
    if (!inputKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }
    setApiKey(inputKey.trim());
    setShowKeyModal(false);
    setInputKey("");
    toast.success("API key saved!");
  };

  const handleClear = () => {
    clearApiKey();
    toast.info("API key cleared");
  };

  return (
    <>
      <nav className="glass fixed top-0 left-0 right-0 z-50" style={{ borderBottom: "1px solid #1E2028" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}
            >
              <Brain size={16} color="white" />
            </div>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#F0F0FF" }}>
              Time<span className="text-gradient">RAG</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: pathname === link.href ? "#F0F0FF" : "#6B7280",
                  background: pathname === link.href ? "rgba(124, 58, 237, 0.15)" : "transparent",
                  border: pathname === link.href ? "1px solid rgba(124, 58, 237, 0.3)" : "1px solid transparent",
                  transition: "all 0.2s",
                  textDecoration: "none",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowKeyModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "0.8rem",
                fontWeight: 500,
                background: isKeySet ? "rgba(16, 185, 129, 0.1)" : "rgba(124, 58, 237, 0.15)",
                border: isKeySet ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(124, 58, 237, 0.3)",
                color: isKeySet ? "#10B981" : "#A855F7",
                cursor: "pointer",
              }}
            >
              {isKeySet ? <CheckCircle size={14} /> : <Key size={14} />}
              {isKeySet ? "Key Set" : "Set API Key"}
            </button>

            <button
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ color: "#6B7280", background: "none", border: "none", cursor: "pointer" }}
            >
              {mobileOpen ? <XCircle size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div style={{ borderTop: "1px solid #1E2028", padding: "12px 24px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  color: pathname === link.href ? "#F0F0FF" : "#6B7280",
                  background: pathname === link.href ? "rgba(124, 58, 237, 0.15)" : "transparent",
                  textDecoration: "none",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* API Key Modal */}
      {showKeyModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
          onClick={(e) => e.target === e.currentTarget && setShowKeyModal(false)}
        >
          <div style={{ background: "#16181D", border: "1px solid #1E2028", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "440px" }}>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.25rem", fontWeight: 700, color: "#F0F0FF" }}>
                Set API Key
              </h2>
              <button onClick={() => setShowKeyModal(false)} style={{ color: "#6B7280", background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: "0.875rem", color: "#6B7280", marginBottom: "20px" }}>
              Your API key is stored locally in your browser and never sent to any server other than your RAG backend.
            </p>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#6B7280", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                API Key
              </label>
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveKey()}
                placeholder="rag-sk-..."
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "#0F1117",
                  border: "1px solid #1E2028",
                  color: "#F0F0FF",
                  fontSize: "0.875rem",
                  outline: "none",
                  fontFamily: "DM Mono, monospace",
                }}
              />
            </div>

            {isKeySet && (
              <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", fontSize: "0.8rem", color: "#10B981", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle size={14} />
                Key currently set: {apiKey.slice(0, 8)}...
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleSaveKey}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "linear-gradient(135deg, #7C3AED, #06B6D4)", border: "none", color: "white", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}
              >
                Save Key
              </button>
              {isKeySet && (
                <button
                  onClick={handleClear}
                  style={{ padding: "10px 16px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#EF4444", fontSize: "0.875rem", cursor: "pointer" }}
                >
                  Clear
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}