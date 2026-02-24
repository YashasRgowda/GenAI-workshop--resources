import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return "N/A";
  return dateStr.slice(0, 10);
}

export function isDateInRange(queryDate, validFrom, validTo) {
  return queryDate >= validFrom && queryDate <= validTo;
}

export function truncate(str, length = 100) {
  if (!str) return "";
  return str.length > length ? str.slice(0, length) + "..." : str;
}

export function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}