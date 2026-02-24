"use client";
import { useEffect } from "react";
import useApiKeyStore from "@/stores/apiKeyStore";

export function useApiKey() {
  const { apiKey, isKeySet, setApiKey, loadApiKey, clearApiKey } = useApiKeyStore();

  useEffect(() => {
    loadApiKey();
  }, []);

  return { apiKey, isKeySet, setApiKey, clearApiKey };
}