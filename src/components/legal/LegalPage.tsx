import Link from "next/link";
import { LEGAL_EMAIL, LEGAL_UPDATED, type LegalSection } from "@/data/legal";
import { Logo } from "@/components/shell/Logo";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { Kicker } from "@/components/ui/Kicker";

export function LegalPage({ kicker, title, sections }: { kicker: string; title: string; sections: LegalSection[] }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-border">
        <div className="page-width flex h-14 items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
      </header>

      <main className="page-width py-12 md:py-20">
        <div className="mx-auto max-w-[70ch]">
          <Kicker color="var(--cube-red)">{kicker}</Kicker>
          <h1 className="mt-5 text-5xl leading-[0.95] font-bold tracking-[-0.045em]">
            {title}
            <span className="text-cube-red">.</span>
          </h1>
          <p className="mt-4 font-mono text-xs text-muted">Atualizado em {LEGAL_UPDATED}</p>

          {sections.map((section, i) => (
            <section key={section.title} className="mt-10 border-t border-border pt-8">
              <h2 className="text-2xl font-bold tracking-tight">
                {i + 1}. {section.title}
              </h2>
              {section.body.map((block, j) =>
                typeof block === "string" ? (
                  <p key={j} className="mt-3 leading-relaxed text-muted">
                    {block}
                  </p>
                ) : (
                  <ul key={j} className="mt-3 flex list-disc flex-col gap-2 pl-5 leading-relaxed text-muted">
                    {block.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ),
              )}
            </section>
          ))}

          <p className="mt-10 border-t border-border pt-8 leading-relaxed text-muted">
            Dúvidas? Escreva para{" "}
            <a href={`mailto:${LEGAL_EMAIL}`} className="text-text underline underline-offset-2">
              {LEGAL_EMAIL}
            </a>
            .
          </p>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="page-width flex h-14 items-center justify-between gap-4 text-sm text-muted">
          <Link href="/privacidade" className="py-2 hover:text-text">
            Privacidade
          </Link>
          <Link href="/termos" className="py-2 hover:text-text">
            Termos
          </Link>
        </div>
      </footer>
    </div>
  );
}
