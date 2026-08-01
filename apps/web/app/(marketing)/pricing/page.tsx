import type { Metadata } from "next";
import PricingPageClient from "./PricingPageClient";

export const metadata: Metadata = {
  title: "Pricing — Vortex Optimizer",
  description:
    "USD pricing for Starter, Professional, and Enterprise SaaS plans plus one-time audit engagements. Independent Microsoft licensing advisory.",
};

export default function PricingPage() {
  return <PricingPageClient />;
}
