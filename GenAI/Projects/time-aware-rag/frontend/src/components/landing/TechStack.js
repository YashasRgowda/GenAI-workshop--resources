"use client";

const STACK = [
  { name: "FastAPI", role: "REST API Framework", color: "#4df0c0", icon: "⚡" },
  { name: "PostgreSQL", role: "Metadata + Full-text GIN", color: "#5b8dee", icon: "🐘" },
  { name: "FAISS", role: "Vector Similarity Search", color: "#f5a623", icon: "🔍" },
  { name: "Redis", role: "Response Caching", color: "#f5a623", icon: "💾" },
  { name: "Gemini 2.5", role: "Answer Generation LLM", color: "#4df0c0", icon: "🤖" },
  { name: "Docker", role: "Containerization", color: "#5b8dee", icon: "🐳" },
  { name: "GitHub Actions", role: "CI/CD Pipeline", color: "#f5a623", icon: "🔄" },
  { name: "Render", role: "Cloud Deployment", color: "#4df0c0", icon: "☁️" },
];

export default function TechStack() {
  return (
    <section style={{ padding: "60px 24px", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <div className="section-label">Built with</div>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
        }}>
          {STACK.map((tech, i) => (
            <div key={i} style={{
              padding: "14px 18px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              display: "flex", alignItems: "center", gap: 12,
              transition: "all 0.2s",
              cursor: "default",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = tech.color + "44";
              e.currentTarget.style.background = tech.color + "08";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "var(--surface)";
            }}>
              <span style={{ fontSize: "1.2rem" }}>{tech.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)" }}>{tech.name}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "var(--text-muted)", marginTop: 1 }}>{tech.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}