import type { Metadata } from "next";
import { DemoLaunchClient } from "./DemoLaunchClient";

export const metadata: Metadata = {
  title: "Try the demo — Vortex Optimizer",
  description:
    "One-click access to the Contoso Ltd demo workspace with seeded Microsoft licensing data.",
};

export default function DemoLaunchPage() {
  return <DemoLaunchClient />;
}
