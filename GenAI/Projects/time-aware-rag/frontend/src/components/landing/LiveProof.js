"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function LiveProof() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetch("https://rag-backend-f85u.onrender.com/health")
      .then(r => r.json())
      .then(setHealth)
      .catch(() => setHealth({ status: "unreachable" }));
  }, []);

  const isLive = health?.status === "healthy";

  return (
    <section style={{ padding: "80px 24px", background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>

        <div className="section-label" style={{ marginBottom: 16, justifyContent: "center", display: "flex" }}>Deployed & Live</div>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", color: "var(--text)", marginBottom: 12 }}>
          Fully deployed on Render Cloud
        </h2>
        <p style={{ color: "var(--text-sub)", fontSize: "0.9rem", marginBottom: 40, maxWidth: 500, margin: "0 auto 40px" }}>
          PostgreSQL database, Redis cache, and FastAPI backend — all live and queryable right now.
        </p>

        {/* Status panel */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 20px",
          background: isLive ? "rgba(77,240,192,0.07)" : "rgba(255,71,87,0.07)",
          border: `1px solid ${isLive ? "rgba(77,240,192,0.25)" : "rgba(255,71,87,0.25)"}`,
          borderRadius: "var(--radius)",
          marginBottom: 36,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: isLive ? "var(--accent)" : "var(--red)", display: "inline-block", boxShadow: isLive ? "0 0 10px var(--accent)" : "0 0 10px var(--red)" }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", color: isLive ? "var(--accent)" : "var(--red)" }}>
            {health === null ? "checking status..." : isLive ? "API ONLINE — rag-backend-f85u.onrender.com" : "API UNREACHABLE (cold start may take ~30s)"}
          </span>
        </div>

        {/* Links grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 40 }}>
          {[
            { label: "Swagger API Docs", url: "https://rag-backend-f85u.onrender.com/docs", tag: "interactive", color: "var(--primary)" },
            { label: "Health Check", url: "https://rag-backend-f85u.onrender.com/health", tag: "live endpoint", color: "var(--accent)" },
            { label: "Detailed Health", url: "https://rag-backend-f85u.onrender.com/health/detailed", tag: "postgres + redis", color: "var(--blue)" },
          ].map((link, i) => (
            <a key={i} href={link.url} target="_blank" rel="noreferrer" style={{
              padding: "16px 18px",
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              textDecoration: "none",
              display: "block",
              textAlign: "left",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = link.color + "44"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: link.color, marginBottom: 6 }}>↗ LIVE</div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)", marginBottom: 4 }}>{link.label}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "var(--text-muted)" }}>{link.tag}</div>
            </a>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/playground" className="btn-primary">Start Querying Now →</Link>
          <Link href="/documents" className="btn-ghost">Upload Documents</Link>
        </div>

      </div>
    </section>
  );
}