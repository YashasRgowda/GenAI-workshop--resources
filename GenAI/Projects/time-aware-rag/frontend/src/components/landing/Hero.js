"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Clock, Database, Zap } from "lucide-react";

const typingPhrases = [
  "What was the VPN policy in 2022?",
  "Compare password rules from 2020 to 2024",
  "Show leave policy changes over 3 years",
  "Find documents valid on March 15, 2023",
];

export default function Hero() {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const phrase = typingPhrases[currentPhrase];
    let timeout;

    if (typing) {
      if (displayed.length < phrase.length) {
        timeout = setTimeout(() => {
          setDisplayed(phrase.slice(0, displayed.length + 1));
        }, 45);
      } else {
        timeout = setTimeout(() => setTyping(false), 2000);
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1));
        }, 20);
      } else {
        setCurrentPhrase((p) => (p + 1) % typingPhrases.length);
        setTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayed, typing, currentPhrase]);

  return (
    <section
      style={{
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "80px 24px",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "500px",
          background: "radial-gradient(ellipse, rgba(124, 58, 237, 0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: "300px",
          height: "300px",
          background: "radial-gradient(ellipse, rgba(6, 182, 212, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(124, 58, 237, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124, 58, 237, 0.03) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "860px",
          width: "100%",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "100px",
            background: "rgba(124, 58, 237, 0.1)",
            border: "1px solid rgba(124, 58, 237, 0.25)",
            fontSize: "0.8rem",
            color: "#A855F7",
            fontWeight: 500,
            marginBottom: "32px",
          }}
        >
          <Sparkles size={12} />
          Powered by Gemini 2.5 Flash · FAISS · PostgreSQL
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            color: "#F0F0FF",
            marginBottom: "24px",
          }}
        >
          Query Documents
          <br />
          <span className="text-gradient">Across Time</span>
        </h1>

        {/* Subheadline */}
        <p
          style={{
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            color: "#6B7280",
            lineHeight: 1.7,
            marginBottom: "48px",
            maxWidth: "600px",
            margin: "0 auto 48px",
          }}
        >
          The only RAG system that understands <em style={{ color: "#A855F7", fontStyle: "normal" }}>when</em> a document was valid.
          Ask questions about policies, contracts, and documents from any point in time.
        </p>

        {/* Typing demo */}
        <div
          style={{
            background: "#0F1117",
            border: "1px solid #1E2028",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "48px",
            textAlign: "left",
            maxWidth: "560px",
            margin: "0 auto 48px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#10B981",
              flexShrink: 0,
              animation: "pulse-glow 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: "0.9rem",
              color: "#F0F0FF",
              minHeight: "1.4em",
            }}
          >
            {displayed}
            <span
              style={{
                display: "inline-block",
                width: "2px",
                height: "1em",
                background: "#7C3AED",
                marginLeft: "2px",
                animation: "pulse-glow 1s ease-in-out infinite",
                verticalAlign: "middle",
              }}
            />
          </span>
        </div>

        {/* CTAs */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/playground"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "14px 28px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
              color: "white",
              fontWeight: 600,
              fontSize: "0.95rem",
              textDecoration: "none",
              transition: "opacity 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Try Playground <ArrowRight size={16} />
          </Link>

          <Link
            href="/documents"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "14px 28px",
              borderRadius: "10px",
              background: "transparent",
              border: "1px solid #1E2028",
              color: "#F0F0FF",
              fontWeight: 500,
              fontSize: "0.95rem",
              textDecoration: "none",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#7C3AED")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1E2028")}
          >
            Upload Documents
          </Link>
        </div>

        {/* Mini stats row */}
        <div
          style={{
            display: "flex",
            gap: "32px",
            justifyContent: "center",
            marginTop: "64px",
            flexWrap: "wrap",
          }}
        >
          {[
            { icon: <Clock size={16} />, label: "Time-Aware Retrieval" },
            { icon: <Database size={16} />, label: "PostgreSQL + FAISS" },
            { icon: <Zap size={16} />, label: "Redis Caching" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#6B7280",
                fontSize: "0.85rem",
              }}
            >
              <span style={{ color: "#7C3AED" }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}