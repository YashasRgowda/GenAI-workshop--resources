"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Upload Your Documents",
    desc: "Upload PDFs and our AI automatically extracts effective dates and validity periods. No manual entry required.",
    color: "#A855F7",
  },
  {
    number: "02",
    title: "Set Your Query Date",
    desc: "Specify which point in time you want to query. The system will only retrieve documents valid on that exact date.",
    color: "#06B6D4",
  },
  {
    number: "03",
    title: "Ask Your Question",
    desc: "Ask anything in natural language. Hybrid semantic + full-text search finds the most relevant documents.",
    color: "#10B981",
  },
  {
    number: "04",
    title: "Get Time-Accurate Answers",
    desc: "Gemini generates answers using only temporally valid context. Every source shows its validity period.",
    color: "#F59E0B",
  },
];

export default function HowItWorks() {
  return (
    <section
      style={{
        padding: "80px 24px",
        background: "linear-gradient(180deg, transparent 0%, rgba(124, 58, 237, 0.03) 50%, transparent 100%)",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div
            style={{
              display: "inline-block",
              padding: "4px 14px",
              borderRadius: "100px",
              background: "rgba(6, 182, 212, 0.1)",
              border: "1px solid rgba(6, 182, 212, 0.2)",
              fontSize: "0.75rem",
              color: "#06B6D4",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "16px",
            }}
          >
            How It Works
          </div>
          <h2
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 800,
              color: "#F0F0FF",
            }}
          >
            From upload to{" "}
            <span className="text-gradient">time-accurate answer</span>
          </h2>
        </div>

        {/* Steps */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "24px",
            marginBottom: "64px",
          }}
        >
          {steps.map((step, i) => (
            <div key={i} style={{ position: "relative" }}>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: "28px",
                    right: "-12px",
                    width: "24px",
                    height: "1px",
                    background: "linear-gradient(90deg, #1E2028, transparent)",
                    display: "none",
                  }}
                />
              )}
              <div
                style={{
                  background: "#16181D",
                  border: "1px solid #1E2028",
                  borderRadius: "14px",
                  padding: "28px 24px",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    fontFamily: "DM Mono, monospace",
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: step.color,
                    opacity: 0.4,
                    marginBottom: "16px",
                    lineHeight: 1,
                  }}
                >
                  {step.number}
                </div>
                <h3
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#F0F0FF",
                    marginBottom: "10px",
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#6B7280", lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <Link
            href="/playground"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "14px 32px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
              color: "white",
              fontWeight: 600,
              fontSize: "1rem",
              textDecoration: "none",
            }}
          >
            Start Querying Now <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}