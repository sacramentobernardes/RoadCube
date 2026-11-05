import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { TERMS_SECTIONS } from "@/data/legal";

export const metadata: Metadata = {
  title: "Termos de Uso · RoadCube",
  description: "As regras para usar o RoadCube.",
  alternates: { canonical: "/termos" },
};

export default function TermsPage() {
  return <LegalPage kicker="Termos" title="Termos de Uso" sections={TERMS_SECTIONS} />;
}
