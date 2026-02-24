import { create } from "zustand";

const useApiKeyStore = create((set) => ({
  apiKey: "",
  isKeySet: false,

  setApiKey: (key) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("rag_api_key", key);
    }
    set({ apiKey: key, isKeySet: !!key });
  },

  loadApiKey: () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rag_api_key");
      if (saved) {
        set({ apiKey: saved, isKeySet: true });
      }
    }
  },

  clearApiKey: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("rag_api_key");
    }
    set({ apiKey: "", isKeySet: false });
  },
}));

export default useApiKeyStore;