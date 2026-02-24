import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Time-Aware RAG",
  description: "Retrieval Augmented Generation with Temporal Intelligence",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#0A0A0F", color: "#F0F0FF" }}>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "#16181D",
              border: "1px solid #1E2028",
              color: "#F0F0FF",
            },
          }}
        />
      </body>
    </html>
  );
}