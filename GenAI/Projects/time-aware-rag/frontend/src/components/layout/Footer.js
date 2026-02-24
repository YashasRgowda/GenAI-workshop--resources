"use client";
import Link from "next/link";

const SOCIAL = [
  {
    label: "GitHub",
    url: "https://github.com/YashasRgowda",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/yashas-r-gowda/",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Medium",
    url: "https://medium.com/@engg.yashasr",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    url: "https://www.instagram.com/its_yash_himself/",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "Gmail",
    url: "mailto:yashas.r2002@gmail.com",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--border)",
      padding: "32px 24px",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap", gap: 20,
      }}>

        {/* Left — brand + social */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700, fontSize: "0.95rem", color: "var(--text)",
          }}>
            Time<span style={{ color: "var(--accent)" }}>RAG</span>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.68rem", color: "var(--text-muted)",
              fontWeight: 400, marginLeft: 10,
            }}>
              by Yashas R Gowda
            </span>
          </span>

          {/* Social icons */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target={s.url.startsWith("mailto") ? undefined : "_blank"}
                rel="noreferrer"
                title={s.label}
                style={{
                  width: 30, height: 30,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: "var(--radius)",
                  color: "var(--text-muted)",
                  background: "transparent",
                  border: "1px solid transparent",
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = "var(--text)";
                  e.currentTarget.style.borderColor = "var(--border-bright)";
                  e.currentTarget.style.background = "var(--surface)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = "var(--text-muted)";
                  e.currentTarget.style.borderColor = "transparent";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Right — minimal nav */}
        <div style={{ display: "flex", gap: 32 }}>
          <div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.62rem", color: "var(--text-muted)",
              letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10,
            }}>
              Pages
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { href: "/playground", label: "Playground" },
                { href: "/documents", label: "Documents" },
                { href: "/analytics", label: "Analytics" },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{
                  fontSize: "0.82rem", color: "var(--text-muted)",
                  textDecoration: "none", transition: "color 0.15s",
                }}
                onMouseEnter={e => e.target.style.color = "var(--text)"}
                onMouseLeave={e => e.target.style.color = "var(--text-muted)"}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.62rem", color: "var(--text-muted)",
              letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10,
            }}>
              API
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { href: "https://rag-backend-f85u.onrender.com/docs", label: "Swagger ↗" },
                { href: "https://rag-backend-f85u.onrender.com/health", label: "Health ↗" },
              ].map(l => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" style={{
                  fontSize: "0.82rem", color: "var(--text-muted)",
                  textDecoration: "none", transition: "color 0.15s",
                }}
                onMouseEnter={e => e.target.style.color = "var(--text)"}
                onMouseLeave={e => e.target.style.color = "var(--text-muted)"}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div style={{
        maxWidth: 1200, margin: "20px auto 0",
        paddingTop: 16, borderTop: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between",
        flexWrap: "wrap", gap: 8,
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.68rem", color: "var(--text-muted)",
        }}>
          FastAPI · PostgreSQL · FAISS · Redis · Gemini · Docker · GitHub Actions
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.68rem", color: "var(--text-muted)",
        }}>
          © 2025 TimeRAG
        </span>
      </div>
    </footer>
  );
}