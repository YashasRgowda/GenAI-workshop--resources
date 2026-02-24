"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApiKey } from "@/hooks/useApiKey";
import { toast } from "sonner";

export default function Navbar() {
  const pathname = usePathname();
  const { apiKey, isKeySet, setApiKey, clearApiKey } = useApiKey();
  const [modal, setModal] = useState(false);
  const [inputKey, setInputKey] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { href: "/", label: "Overview" },
    { href: "/playground", label: "Playground" },
    { href: "/documents", label: "Documents" },
    { href: "/analytics", label: "Analytics" },
  ];

  const handleSave = () => {
    if (!inputKey.trim()) { toast.error("Enter an API key"); return; }
    setApiKey(inputKey.trim());
    setModal(false);
    setInputKey("");
    toast.success("API key saved");
  };

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: "60px",
        background: scrolled ? "rgba(5,5,8,0.95)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "all 0.3s",
        display: "flex", alignItems: "center",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: 28, height: 28,
              background: "var(--primary)",
              borderRadius: 4,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2h4v4H2zM8 2h4v4H8zM2 8h4v4H2zM8 8l3 3M8 11l3-3" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "1rem", color: "var(--text)", letterSpacing: "-0.01em" }}>
              Time<span style={{ color: "var(--primary)" }}>RAG</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 2 }} className="desktop-nav">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} style={{
                padding: "6px 14px",
                borderRadius: "var(--radius)",
                fontSize: "0.85rem",
                fontWeight: 500,
                color: pathname === link.href ? "var(--text)" : "var(--text-muted)",
                background: pathname === link.href ? "rgba(255,255,255,0.06)" : "transparent",
                textDecoration: "none",
                transition: "all 0.15s",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={e => { if (pathname !== link.href) e.target.style.color = "var(--text-sub)"; }}
              onMouseLeave={e => { if (pathname !== link.href) e.target.style.color = "var(--text-muted)"; }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="https://rag-backend-f85u.onrender.com/docs" target="_blank" rel="noreferrer" style={{
              padding: "5px 12px", borderRadius: "var(--radius)",
              border: "1px solid var(--border)", color: "var(--text-muted)",
              fontSize: "0.78rem", textDecoration: "none", fontFamily: "'JetBrains Mono', monospace",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              API docs ↗
            </a>
            <button onClick={() => setModal(true)} style={{
              padding: "6px 14px", borderRadius: "var(--radius)",
              background: isKeySet ? "var(--accent-dim)" : "var(--primary-dim)",
              border: isKeySet ? "1px solid rgba(77,240,192,0.25)" : "1px solid rgba(245,166,35,0.25)",
              color: isKeySet ? "var(--accent)" : "var(--primary)",
              fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
              transition: "all 0.15s",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: isKeySet ? "var(--accent)" : "var(--primary)", display: "inline-block" }} />
              {isKeySet ? "authenticated" : "set api key"}
            </button>
          </div>
        </div>
      </nav>

      {/* Modal */}
      {modal && (
        <div onClick={e => e.target === e.currentTarget && setModal(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
          backdropFilter: "blur(4px)",
        }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border-bright)", borderRadius: "var(--radius-lg)", padding: 28, width: "100%", maxWidth: 420 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div className="section-label" style={{ marginBottom: 4 }}>Authentication</div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>Set API Key</h3>
              </div>
              <button onClick={() => setModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem" }}>×</button>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.6 }}>
              Key is stored locally in your browser. Never sent anywhere except your RAG backend.
            </p>
            <input
              className="input"
              type="password"
              value={inputKey}
              onChange={e => setInputKey(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSave()}
              placeholder="rag-sk-..."
              style={{ marginBottom: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem" }}
            />
            {isKeySet && (
              <div style={{ padding: "8px 12px", borderRadius: "var(--radius)", background: "var(--accent-dim)", border: "1px solid rgba(77,240,192,0.2)", fontSize: "0.75rem", color: "var(--accent)", marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                ✓ active: {apiKey.slice(0, 10)}...
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleSave} className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>Save Key</button>
              {isKeySet && (
                <button onClick={() => { clearApiKey(); setModal(false); toast.info("Key cleared"); }} style={{ padding: "10px 16px", borderRadius: "var(--radius)", background: "transparent", border: "1px solid rgba(255,71,87,0.3)", color: "var(--red)", fontSize: "0.85rem", cursor: "pointer" }}>
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </>
  );
}