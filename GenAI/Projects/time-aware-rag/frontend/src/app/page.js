import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import LiveStats from "@/components/landing/LiveStats";

export default function HomePage() {
  return (
    <div style={{ paddingTop: "64px" }}>
      <Hero />
      <LiveStats />
      <Features />
      <HowItWorks />
    </div>
  );
}