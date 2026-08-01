import type { Metadata } from "next";
import { DashboardPreview, HeroSection } from "@vorzop/ui";

export const metadata: Metadata = {
  title: "Welcome — Vortex Optimizer",
  description:
    "Independent Microsoft licensing advisory. Optimize M365, Azure, and EA spend — recover 10–40% without reselling licenses.",
};

export default function WelcomePage() {
  return (
    <>
      <HeroSection />
      <DashboardPreview />
    </>
  );
}
