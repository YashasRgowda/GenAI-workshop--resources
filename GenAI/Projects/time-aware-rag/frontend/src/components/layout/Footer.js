import Link from "next/link";
import { Brain, Github, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #1E2028", marginTop: "80px" }}>
      <div
        className="max-w-7xl mx-auto px-6 py-12"
        style={{ display: "flex", flexDirection: "column", gap: "32px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "32px",
          }}
        >
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}
              >
                <Brain size={16} color="white" />
              </div>
              <span
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  color: "#F0F0FF",
                }}
              >
                TimeRAG
              </span>
            </div>
            <p style={{ fontSize: "0.875rem", color: "#6B7280", lineHeight: 1.6 }}>
              Retrieval Augmented Generation with Temporal Intelligence. Query documents across time.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#F0F0FF",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "16px",
              }}
            >
              Navigate
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { href: "/", label: "Home" },
                { href: "/playground", label: "Playground" },
                { href: "/documents", label: "Documents" },
                { href: "/analytics", label: "Analytics" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: "0.875rem",
                    color: "#6B7280",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* API */}
          <div>
            <h4
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#F0F0FF",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "16px",
              }}
            >
              API
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <a
                href="https://rag-backend-f85u.onrender.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "0.875rem",
                  color: "#6B7280",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                Swagger Docs <ExternalLink size={12} />
              </a>

              <a
                href="https://rag-backend-f85u.onrender.com/health"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "0.875rem",
                  color: "#6B7280",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                Health Check <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            borderTop: "1px solid #1E2028",
            paddingTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <p style={{ fontSize: "0.8rem", color: "#6B7280" }}>
            Built with passion by{" "}
            <span className="text-gradient" style={{ fontWeight: 600 }}>
              Satyam
            </span>
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span
              style={{
                fontSize: "0.75rem",
                color: "#6B7280",
                fontFamily: "DM Mono, monospace",
              }}
            >
              FastAPI · PostgreSQL · Redis · FAISS · Gemini
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}