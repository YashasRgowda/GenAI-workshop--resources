"use client";

const FEATURES = [
  {
    title: "Time-Aware Retrieval",
    desc: "PostgreSQL WHERE clause filters valid_from ≤ query_date ≤ valid_to on every query. Never returns stale documents.",
    icon: "⏱",
    tag: "core",
    color: "var(--primary)",
  },
  {
    title: "Hybrid Search Engine",
    desc: "FAISS semantic embeddings (sentence-transformers/all-MiniLM-L6-v2) + PostgreSQL tsvector GIN full-text, combined at 60/40 weight.",
    icon: "🔀",
    tag: "search",
    color: "var(--accent)",
  },
  {
    title: "Document Versioning",
    desc: "Full version history with parent_doc_id chains. Create new versions, mark old ones is_latest=false, always retrieve the historically correct document.",
    icon: "🌿",
    tag: "versioning",
    color: "var(--blue)",
  },
  {
    title: "Redis Query Cache",
    desc: "MD5-keyed cache per (query, date, k) tuple. Cache hits serve in <10ms. Auto-invalidated on document update or delete.",
    icon: "⚡",
    tag: "performance",
    color: "var(--primary)",
  },
  {
    title: "Smart PDF Extraction",
    desc: "Upload a PDF — AI parses Effective Date and Valid Through fields automatically using regex + dateparser. No manual date entry.",
    icon: "🤖",
    tag: "automation",
    color: "var(--accent)",
  },
  {
    title: "API Auth + Rate Limiting",
    desc: "X-API-Key header auth on all endpoints. Redis-backed sliding window rate limiter at 20 req/min per IP. Health endpoints are exempt.",
    icon: "🔒",
    tag: "security",
    color: "var(--blue)",
  },
  {
    title: "RAG Evaluation Suite",
    desc: "44 automated pytest tests across auth, cache, documents, queries, versioning, rate limiting, and evaluation metrics.",
    icon: "✅",
    tag: "testing",
    color: "var(--primary)",
  },
  {
    title: "CI/CD Pipeline",
    desc: "GitHub Actions auto-runs the full test suite on every push. Render auto-deploys on green build. Full production workflow.",
    icon: "🔄",
    tag: "devops",
    color: "var(--accent)",
  },
];

export default function Features() {
  return (
    <section style={{ padding: "100px 24px", background: "var(--surface)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div style={{ marginBottom: 56 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>Capabilities</div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "clamp(1.9rem, 4vw, 3rem)", letterSpacing: "-0.02em", color: "var(--text)", lineHeight: 1.1 }}>
            Production-grade infrastructure<br />
            <span style={{ color: "var(--primary)" }}>not a toy demo</span>
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "24px",
              transition: "all 0.2s",
              cursor: "default",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = f.color + "44";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 12px 40px ${f.color}12`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: "1.5rem" }}>{f.icon}</span>
                <span className={`tag tag-${f.color === "var(--primary)" ? "amber" : f.color === "var(--accent)" ? "green" : "blue"}`}>
                  {f.tag}
                </span>
              </div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "1rem", color: "var(--text)", marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}