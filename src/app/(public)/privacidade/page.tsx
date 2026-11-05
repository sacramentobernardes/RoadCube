import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { PRIVACY_SECTIONS } from "@/data/legal";

export const metadata: Metadata = {
  title: "Política de Privacidade · RoadCube",
  description: "Como o RoadCube coleta, usa e protege seus dados pessoais.",
  alternates: { canonical: "/privacidade" },
};

export default function PrivacyPage() {
  return <LegalPage kicker="Privacidade" title="Política de Privacidade" sections={PRIVACY_SECTIONS} />;
}
