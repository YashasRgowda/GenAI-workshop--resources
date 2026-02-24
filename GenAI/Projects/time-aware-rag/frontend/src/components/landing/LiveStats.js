"use client";
import { useEffect, useState } from "react";
import { checkHealth, getStats } from "@/lib/api";
import { useApiKey } from "@/hooks/useApiKey";
import { Activity, FileText, Layers, Wifi } from "lucide-react";

export default function LiveStats() {
  const { apiKey } = useApiKey();
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    checkHealth().then(setHealth).catch(() => setHealth({ status: "unreachable" }));
    if (apiKey) {
      getStats(apiKey).then(setStats).catch(() => {});
    }
  }, [apiKey]);

  const items = [
    {
      icon: <Wifi size={20} />,
      label: "API Status",
      value: health?.status === "healthy" ? "Live" : "Checking...",
      color: health?.status === "healthy" ? "#10B981" : "#F59E0B",
      bg: health?.status === "healthy" ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
      border: health?.status === "healthy" ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)",
    },
    {
      icon: <FileText size={20} />,
      label: "Documents",
      value: stats?.metadata_store?.total_documents ?? "—",
      color: "#A855F7",
      bg: "rgba(168, 85, 247, 0.1)",
      border: "rgba(168, 85, 247, 0.2)",
    },
    {
      icon: <Layers size={20} />,
      label: "Vectors",
      value: stats?.vector_store?.total_vectors ?? "—",
      color: "#06B6D4",
      bg: "rgba(6, 182, 212, 0.1)",
      border: "rgba(6, 182, 212, 0.2)",
    },
    {
      icon: <Activity size={20} />,
      label: "Rate Limit",
      value: "20 / min",
      color: "#F59E0B",
      bg: "rgba(245, 158, 11, 0.1)",
      border: "rgba(245, 158, 11, 0.2)",
    },
  ];

  return (
    <section style={{ padding: "0 24px 80px" }}>
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              background: item.bg,
              border: `1px solid ${item.border}`,
              borderRadius: "12px",
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div style={{ color: item.color }}>{item.icon}</div>
            <div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#F0F0FF",
                  fontFamily: "Syne, sans-serif",
                }}
              >
                {item.value}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}