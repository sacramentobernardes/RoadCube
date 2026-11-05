import type { Metadata } from "next";
import { Landing } from "@/components/landing/Landing";

// O proxy mostra esta página em "/" para quem não tem sessão.
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function LandingPage() {
  return <Landing />;
}
