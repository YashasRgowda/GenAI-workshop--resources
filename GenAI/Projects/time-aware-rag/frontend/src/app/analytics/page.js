"use client";
import { useState, useEffect } from "react";
import { getCacheStats, clearCache, getStats, checkDetailedHealth, getRateLimitStatus } from "@/lib/api";
import { useApiKey } from "@/hooks/useApiKey";
import { Key, RefreshCw, Trash2, Activity, Database, Zap, Clock, CheckCircle, XCircle, Loader } from "lucide-react";
import { toast } from "sonner";

export default function AnalyticsPage() {
  const { apiKey, isKeySet } = useApiKey();
  const [cacheStats, setCacheStats] = useState(null);
  const [appStats, setAppStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [rateLimit, setRateLimit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);

  const fetchAll = async () => {
    if (!isKeySet) return;
    setLoading(true);
    try {
      const [cache, stats, healthData, rate] = await Promise.allSettled([
        getCacheStats(apiKey),
        getStats(apiKey),
        checkDetailedHealth(apiKey),
        getRateLimitStatus(apiKey),
      ]);
      if (cache.status === "fulfilled") setCacheStats(cache.value);
      if (stats.status === "fulfilled") setAppStats(stats.value);
      if (healthData.status === "fulfilled") setHealth(healthData.value);
      if (rate.status === "fulfilled") setRateLimit(rate.value);
    } catch (err) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [isKeySet, apiKey]);

  const handleClearCache = async () => {
    if (!confirm("Clear all cache?")) return;
    setClearingCache(true);
    try {
      await clearCache(apiKey);
      toast.success("Cache cleared!");
      fetchAll();
    } catch {
      toast.error("Failed to clear cache");
    } finally {
      setClearingCache(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, sub }) => (
    <div style={{ background: "#16181D", border: "1px solid #1E2028", borderRadius: "12px", padding: "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <span style={{ fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <div style={{ fontSize: "1.8rem", fontWeight: 700, color, fontFamily: "Syne, sans-serif" }}>{value ?? "—"}</div>
      {sub && <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "4px" }}>{sub}</div>}
    </div>
  );

  const StatusDot = ({ ok }) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "3px 10px", borderRadius: "100px", background: ok ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", fontSize: "0.75rem", color: ok ? "#10B981" : "#EF4444" }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: ok ? "#10B981" : "#EF4444", display: "inline-block" }} />
      {ok ? "Online" : "Offline"}
    </span>
  );

  return (
    <div style={{ paddingTop: "88px", minHeight: "100vh", padding: "88px 24px 60px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        {/* Header */}
        <div style={{ marginBottom: "32px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", padding: "4px 14px", borderRadius: "100px", background: "rgba(124, 58, 237, 0.1)", border: "1px solid rgba(124, 58, 237, 0.2)", fontSize: "0.75rem", color: "#A855F7", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
              Analytics
            </div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, color: "#F0F0FF", marginBottom: "8px" }}>
              System Analytics
            </h1>
            <p style={{ color: "#6B7280", fontSize: "1rem" }}>
              Monitor cache performance, system health, and usage stats.
            </p>
          </div>
          <button onClick={fetchAll} disabled={loading} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "10px", background: "#16181D", border: "1px solid #1E2028", color: "#6B7280", fontSize: "0.875rem", cursor: "pointer" }}>
            <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            Refresh
          </button>
        </div>

        {!isKeySet && (
          <div style={{ padding: "16px 20px", borderRadius: "12px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)", marginBottom: "32px", display: "flex", alignItems: "center", gap: "12px" }}>
            <Key size={16} style={{ color: "#F59E0B" }} />
            <p style={{ fontSize: "0.875rem", color: "#F59E0B" }}>Set your API key to view analytics.</p>
          </div>
        )}

        {/* System Health */}
        <div style={{ background: "#16181D", border: "1px solid #1E2028", borderRadius: "14px", padding: "24px", marginBottom: "24px" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1rem", fontWeight: 700, color: "#F0F0FF", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={16} style={{ color: "#10B981" }} /> System Health
          </h2>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Loader size={24} style={{ color: "#7C3AED", animation: "spin 1s linear infinite", margin: "0 auto" }} />
            </div>
          ) : health ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
              {[
                { label: "API", ok: health.status === "healthy" },
                { label: "Database", ok: health.components?.database === "healthy" },
                { label: "Redis Cache", ok: health.components?.redis === "healthy" },
                { label: "FAISS Index", ok: health.components?.faiss === "healthy" },
                { label: "Gemini LLM", ok: health.components?.gemini === "healthy" },
              ].map((item, i) => (
                <div key={i} style={{ background: "#0F1117", borderRadius: "10px", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.875rem", color: "#9CA3AF" }}>{item.label}</span>
                  <StatusDot ok={item.ok} />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#6B7280", fontSize: "0.875rem" }}>No health data. Set API key and refresh.</p>
          )}
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <StatCard icon={Database} label="Total Documents" value={appStats?.total_documents} color="#A855F7" sub="in database" />
          <StatCard icon={Zap} label="Total Vectors" value={appStats?.total_vectors} color="#06B6D4" sub="in FAISS index" />
          <StatCard icon={Clock} label="Cache TTL" value={cacheStats?.ttl_seconds ? `${cacheStats.ttl_seconds}s` : "—"} color="#10B981" sub="time to live" />
          <StatCard icon={Activity} label="Rate Limit" value={rateLimit?.limit ? `${rateLimit.limit}/min` : "20/min"} color="#F59E0B" sub="requests allowed" />
        </div>

        {/* Cache Stats */}
        <div style={{ background: "#16181D", border: "1px solid #1E2028", borderRadius: "14px", padding: "24px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1rem", fontWeight: 700, color: "#F0F0FF", display: "flex", alignItems: "center", gap: "8px" }}>
              <Zap size={16} style={{ color: "#06B6D4" }} /> Redis Cache
            </h2>
            <button onClick={handleClearCache} disabled={clearingCache || !isKeySet} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#EF4444", fontSize: "0.8rem", cursor: "pointer" }}>
              {clearingCache ? <Loader size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={12} />}
              Clear Cache
            </button>
          </div>

          {cacheStats ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
              {[
                { label: "Total Keys", value: cacheStats.total_keys ?? "—" },
                { label: "Memory Used", value: cacheStats.memory_used ?? "—" },
                { label: "Hit Rate", value: cacheStats.hit_rate ? `${cacheStats.hit_rate}%` : "—" },
                { label: "Status", value: cacheStats.status ?? "active" },
              ].map((item, i) => (
                <div key={i} style={{ background: "#0F1117", borderRadius: "10px", padding: "14px 16px" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#06B6D4", fontFamily: "Syne, sans-serif" }}>{item.value}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "4px" }}>{item.label}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#6B7280", fontSize: "0.875rem" }}>No cache data available.</p>
          )}
        </div>

        {/* Rate Limit */}
        {rateLimit && (
          <div style={{ background: "#16181D", border: "1px solid #1E2028", borderRadius: "14px", padding: "24px" }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1rem", fontWeight: 700, color: "#F0F0FF", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Clock size={16} style={{ color: "#F59E0B" }} /> Rate Limit Status
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
              {[
                { label: "Limit", value: rateLimit.limit ?? "20" },
                { label: "Remaining", value: rateLimit.remaining ?? "—" },
                { label: "Reset In", value: rateLimit.reset_in ? `${rateLimit.reset_in}s` : "—" },
                { label: "Window", value: rateLimit.window ?? "60s" },
              ].map((item, i) => (
                <div key={i} style={{ background: "#0F1117", borderRadius: "10px", padding: "14px 16px" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F59E0B", fontFamily: "Syne, sans-serif" }}>{item.value}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "4px" }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}