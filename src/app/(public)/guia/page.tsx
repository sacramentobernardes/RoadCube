import type { Metadata } from "next";
import Link from "next/link";
import { Guide } from "@/components/guide/Guide";
import { Logo } from "@/components/shell/Logo";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { Kicker } from "@/components/ui/Kicker";

const TITLE = "Guia do cubo mágico: notação, movimentos e scramble · RoadCube";
const DESCRIPTION =
  "Aprenda as peças do cubo mágico, a notação dos movimentos, rotações, como ler algoritmos, aplicar um scramble e o que significam CFOP, F2L, OLL e PLL.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/guia" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/guia" },
  twitter: { title: TITLE, description: DESCRIPTION },
};

export default function GuidePage() {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-border">
        <div className="page-width flex h-14 items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="py-2 text-sm font-semibold hover:underline">
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <main className="page-width pb-16">
        <div className="py-12 md:py-16">
          <Kicker color="var(--cube-red)">Guia para iniciantes</Kicker>
          <h1 className="mt-5 text-5xl leading-[0.95] font-bold tracking-[-0.045em] sm:text-6xl">
            Guia do cubo mágico<span className="text-cube-red">.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            As peças, a notação dos movimentos, como ler um algoritmo e aplicar um scramble, com cubo 3D animado.
          </p>
        </div>

        <Guide />

        <section className="mt-16 text-center">
          <h2 className="text-4xl font-bold tracking-[-0.04em]">
            Pronto para praticar<span className="text-cube-red">?</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-lg text-muted">A trilha ensina tudo isso em lições curtas, até o CFOP completo.</p>
          <Link href="/signup" className="mt-6 inline-flex h-13 items-center rounded-md bg-ink px-6 font-semibold text-ink-contrast transition hover:opacity-90">
            Começar agora
          </Link>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="page-width flex h-14 items-center justify-between gap-4 text-sm text-muted">
          <span>RoadCube</span>
          <nav aria-label="Documentos" className="flex gap-5">
            <Link href="/privacidade" className="py-2 hover:text-text">
              Privacidade
            </Link>
            <Link href="/termos" className="py-2 hover:text-text">
              Termos
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
