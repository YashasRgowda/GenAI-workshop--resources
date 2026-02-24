"use client";
import Link from "next/link";

const STEPS = [
  {
    num: "01",
    title: "Upload Policy Documents",
    desc: "Drag & drop PDFs. Our AI auto-extracts 'Effective Date' and 'Valid Through' fields — no manual entry. Documents are chunked, embedded via sentence-transformers, and stored in FAISS + PostgreSQL.",
    code: `POST /api/smart-upload-pdf\n→ AI extracts dates\n→ FAISS vector added\n→ PG row + GIN index`,
    color: "var(--primary)",
  },
  {
    num: "02",
    title: "Set Your Query Date",
    desc: "Every query is time-anchored. You specify a date like 2022-06-15, and the system filters the PostgreSQL metadata store to only return documents where valid_from ≤ date ≤ valid_to.",
    code: `WHERE valid_from <= '2022-06-15'\n  AND valid_to >= '2022-06-15'`,
    color: "var(--accent)",
  },
  {
    num: "03",
    title: "Hybrid Retrieval Runs",
    desc: "Two search engines fire in parallel: FAISS semantic search (understands meaning) + PostgreSQL full-text GIN index (exact keyword match). Results are ranked by a 0.6/0.4 weighted blend.",
    code: `semantic_score × 0.6\n+ fulltext_score × 0.4\n= combined_score`,
    color: "var(--blue)",
  },
  {
    num: "04",
    title: "Gemini Generates Answer",
    desc: "Top-k temporally-valid documents are passed as context to Gemini 2.5 Flash. The LLM generates a grounded answer using only retrieved context — no hallucination from outside knowledge.",
    code: `model: gemini-2.5-flash\ncontext: top-k valid docs\nno outside knowledge`,
    color: "var(--primary)",
  },
];

export default function HowItWorks() {
  return (
    <section style={{ padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div style={{ marginBottom: 64, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 12 }}>Architecture</div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "clamp(1.9rem, 4vw, 3rem)", letterSpacing: "-0.02em", color: "var(--text)", lineHeight: 1.1 }}>
              How it works —<br />
              <span style={{ color: "var(--primary)" }}>step by step</span>
            </h2>
          </div>
          <Link href="/playground" className="btn-ghost" style={{ whiteSpace: "nowrap" }}>
            Try it live →
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr 1fr",
              gap: 32,
              padding: "32px 0",
              borderBottom: i < STEPS.length - 1 ? "1px solid var(--border)" : "none",
              alignItems: "start",
            }}
            className="step-row">
              {/* Step number */}
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "2.5rem",
                fontWeight: 700,
                color: step.color,
                opacity: 0.25,
                lineHeight: 1,
                paddingTop: 4,
              }}>
                {step.num}
              </div>

              {/* Content */}
              <div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "1.15rem", color: "var(--text)", marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: "0.88rem", color: "var(--text-sub)", lineHeight: 1.7 }}>{step.desc}</p>
              </div>

              {/* Code block */}
              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "14px 18px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: step.color, opacity: 0.7 }} />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.06em" }}>SYSTEM</span>
                </div>
                <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", color: step.color, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
                  {step.code}
                </pre>
              </div>
            </div>
          ))}
        </div>

      </div>
      <style>{`
        @media (max-width: 768px) {
          .step-row { grid-template-columns: 50px 1fr !important; }
          .step-row > :last-child { grid-column: 1 / -1; }
        }
      `}</style>
    </section>
  );
}