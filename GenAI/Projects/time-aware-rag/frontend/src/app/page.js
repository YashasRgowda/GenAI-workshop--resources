import Hero from "@/components/landing/Hero";
import TechStack from "@/components/landing/TechStack";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import EvalMetrics from "@/components/landing/EvalMetrics";
import LiveProof from "@/components/landing/LiveProof";

export default function HomePage() {
  return (
    <div style={{ paddingTop: "60px" }}>
      <Hero />
      <TechStack />
      <HowItWorks />
      <Features />
      <EvalMetrics />
      <LiveProof />
    </div>
  );
}