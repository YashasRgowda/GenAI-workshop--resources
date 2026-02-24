import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://rag-backend-f85u.onrender.com";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

export const checkHealth = () => api.get("/health").then(r => r.data);
export const checkDetailedHealth = (key) => api.get("/api/health/detailed", { headers: { "X-API-Key": key } }).then(r => r.data);

export const listDocuments = (key) => api.get("/api/documents", { headers: { "X-API-Key": key } }).then(r => r.data);
export const deleteDocument = (key, docId) => api.delete(`/api/documents/${docId}`, { headers: { "X-API-Key": key } }).then(r => r.data);
export const smartUploadPdf = (key, file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/api/smart-upload-pdf", form, { headers: { "X-API-Key": key, "Content-Type": "multipart/form-data" } }).then(r => r.data);
};

export const getDocumentVersions = (key, docId) => api.get(`/api/documents/${docId}/versions`, { headers: { "X-API-Key": key } }).then(r => r.data);
export const getLatestVersion = (key, docId) => api.get(`/api/documents/${docId}/latest`, { headers: { "X-API-Key": key } }).then(r => r.data);

export const queryDocuments = (key, query, queryDate, k = 5) =>
  api.post("/api/query", { query, query_date: queryDate, k }, { headers: { "X-API-Key": key } }).then(r => r.data);

export const combinedSearch = (key, query, queryDate, useSemantic = true, useFulltext = true, k = 5) =>
  api.post("/api/search/combined", { query, query_date: queryDate, use_semantic: useSemantic, use_fulltext: useFulltext, k }, { headers: { "X-API-Key": key } }).then(r => r.data);

export const getCacheStats = (key) => api.get("/api/cache/stats", { headers: { "X-API-Key": key } }).then(r => r.data);
export const clearCache = (key) => api.delete("/api/cache", { headers: { "X-API-Key": key } }).then(r => r.data);
export const getStats = (key) => api.get("/api/stats", { headers: { "X-API-Key": key } }).then(r => r.data);
export const getRateLimitStatus = (key) => api.get("/api/rate-limit/status", { headers: { "X-API-Key": key } }).then(r => r.data);