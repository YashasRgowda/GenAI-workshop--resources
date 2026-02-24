import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "TimeRAG — Time-Aware Retrieval System",
  description: "Query documents across time with temporal intelligence. PostgreSQL + FAISS + Redis + Gemini.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#111118",
              border: "1px solid #2a2a3a",
              color: "#eeeef5",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.875rem",
            },
          }}
        />
      </body>
    </html>
  );
}