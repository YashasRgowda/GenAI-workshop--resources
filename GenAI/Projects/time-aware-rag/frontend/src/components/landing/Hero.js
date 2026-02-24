"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const PHRASES = [
  "What was the VPN policy in Q3 2022?",
  "Compare password rules: 2020 vs 2024",
  "Show leave policy valid on March 15, 2023",
  "Find all docs changed after January 2024",
];

export default function Hero() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const phrase = PHRASES[phraseIdx];
    let t;
    if (typing) {
      if (displayed.length < phrase.length) {
        t = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), 40);
      } else {
        t = setTimeout(() => setTyping(false), 2200);
      }
    } else {
      if (displayed.length > 0) {
        t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 18);
      } else {
        setPhraseIdx(p => (p + 1) % PHRASES.length);
        setTyping(true);
      }
    }
    return () => clearTimeout(t);
  }, [displayed, typing, phraseIdx]);

  return (
    <section style={{
      minHeight: "92vh",
      display: "flex", alignItems: "center",
      position: "relative", overflow: "hidden",
      padding: "80px 24px 60px",
    }} className="grid-bg">

      {/* Radial glow */}
      <div style={{
        position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: 700, height: 400,
        background: "radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", right: "8%",
        width: 300, height: 300,
        background: "radial-gradient(ellipse, rgba(99,102,241,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Scan line */}
      <div style={{
        position: "absolute", left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.12), transparent)",
        animation: "scan 8s linear infinite",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 900, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>

        {/* Status badge */}
        <div className="animate-fade-up animate-fade-up-1" style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px",
            background: "rgba(59,130,246,0.07)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: 4,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--accent)",
              display: "inline-block",
              boxShadow: "0 0 8px var(--accent)",
            }} />
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.7rem", color: "var(--accent)",
              letterSpacing: "0.08em",
            }}>
              LIVE — rag-backend-f85u.onrender.com
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="animate-fade-up animate-fade-up-2" style={{ marginBottom: 24 }}>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(2.8rem, 6.5vw, 5.2rem)",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: "var(--text)",
          }}>
            Query Documents<br />
            <span style={{ color: "var(--accent)" }}>Across Any Point in Time</span>
          </h1>
        </div>

        {/* Subheadline */}
        <div className="animate-fade-up animate-fade-up-3" style={{ marginBottom: 44, maxWidth: 560 }}>
          <p style={{ fontSize: "1.05rem", color: "var(--text-sub)", lineHeight: 1.7, fontWeight: 400 }}>
            The only RAG system with{" "}
            <span style={{ color: "var(--text)", fontWeight: 600 }}>native temporal awareness</span>.
            Every query is anchored to a date — retrieving only documents valid at that exact moment.
          </p>
        </div>

        {/* Terminal demo */}
        <div className="animate-fade-up animate-fade-up-4" style={{ marginBottom: 44, maxWidth: 560 }}>
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border-bright)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
          }}>
            {/* Terminal header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 14px",
              borderBottom: "1px solid var(--border)",
              background: "rgba(255,255,255,0.02)",
            }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
              <span style={{
                marginLeft: 8,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.72rem", color: "var(--text-muted)",
              }}>
                timerag — query
              </span>
            </div>
            {/* Terminal body */}
            <div style={{ padding: "16px 20px" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.82rem", marginBottom: 8 }}>
                <span style={{ color: "var(--accent)" }}>❯ </span>
                <span style={{ color: "var(--text-muted)" }}>timerag query </span>
                <span style={{ color: "var(--text)" }}>--date 2024-06-15</span>
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.85rem", color: "var(--text)",
                minHeight: "1.3em", display: "flex", alignItems: "center", gap: 4,
              }}>
                <span style={{ color: "#6366f1" }}>"</span>
                <span>{displayed}</span>
                <span style={{
                  width: 2, height: "1em",
                  background: "var(--accent)",
                  display: "inline-block",
                  animation: "blink 1s step-end infinite",
                }} />
                <span style={{ color: "#6366f1" }}>"</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="animate-fade-up animate-fade-up-5" style={{
          display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 60,
        }}>
          <Link href="/playground" className="btn-primary">
            Open Playground
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M7 3l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link href="/documents" className="btn-ghost">Upload Documents</Link>
          <a href="https://rag-backend-f85u.onrender.com/docs" target="_blank" rel="noreferrer" className="btn-ghost">
            API Reference ↗
          </a>
        </div>

        {/* Proof stats */}
        <div className="animate-fade-up animate-fade-up-6" style={{
          display: "flex", gap: 32, flexWrap: "wrap",
          paddingTop: 24, borderTop: "1px solid var(--border)",
        }}>
          {[
            { val: "44", label: "automated tests", color: "var(--accent)" },
            { val: "100%", label: "time relevance accuracy", color: "#a5b4fc" },
            { val: "80%", label: "eval pass rate", color: "var(--text-sub)" },
            { val: "<60ms", label: "cached queries", color: "var(--accent)" },
          ].map((stat, i) => (
            <div key={i}>
              <div style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "1.3rem", fontWeight: 800,
                color: stat.color,
              }}>
                {stat.val}
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.68rem", color: "var(--text-muted)",
                letterSpacing: "0.04em", marginTop: 2,
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}