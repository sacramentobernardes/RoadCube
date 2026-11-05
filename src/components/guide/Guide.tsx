import { LazyCube } from "@/components/cube/LazyCube";
import { Kicker } from "@/components/ui/Kicker";
import { GUIDE_SECTIONS, type GuideEntry } from "@/data/guide";
import { cn } from "@/lib/cn";

/** Sequências aparecem em mono; nomes como "Centros" ficam na fonte normal. */
const isNotation = (term: string) => /^[RLUDFBrufMESxyz]['2]?( [RLUDFBrufMESxyz]['2]?)*$/.test(term);

function Entry({ entry }: { entry: GuideEntry }) {
  return (
    <li className="flex gap-5 border-b border-border py-5">
      {entry.cube && (
        <div className="w-24 shrink-0 self-start rounded-md bg-frame p-1.5 sm:w-28">
          <LazyCube {...entry.cube} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className={cn("text-lg font-bold tracking-tight", isNotation(entry.term) && "font-mono")}>{entry.term}</h3>
        <p className="mt-1 max-w-[60ch] leading-relaxed text-muted">{entry.text}</p>
      </div>
    </li>
  );
}

/** Conteúdo do Guia, usado na Biblioteca e na página pública. */
export function Guide() {
  return (
    <div>
      <nav aria-label="Seções do guia" className="flex flex-wrap gap-x-5 gap-y-1 border-b border-border py-4">
        {GUIDE_SECTIONS.map((section) => (
          <a key={section.id} href={`#${section.id}`} className="py-1.5 text-sm text-muted underline-offset-2 hover:text-text hover:underline">
            {section.title}
          </a>
        ))}
      </nav>

      {GUIDE_SECTIONS.map((section, i) => (
        <section
          key={section.id}
          id={section.id}
          className="grid scroll-mt-20 grid-cols-[minmax(0,1fr)] gap-4 border-b border-border py-10 md:grid-cols-[220px_minmax(0,1fr)] md:gap-12"
        >
          <div className="md:sticky md:top-24 md:self-start">
            <Kicker color="var(--cube-green)">Parte {String(i + 1).padStart(2, "0")}</Kicker>
            <h2 className="mt-3 text-xl font-bold tracking-tight">{section.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{section.intro}</p>
          </div>
          <div className="min-w-0">
            <ul className="border-t border-border">
              {section.entries.map((entry) => (
                <Entry key={entry.term} entry={entry} />
              ))}
            </ul>
            {section.note && <p className="mt-5 max-w-[66ch] border-l-2 border-cube-yellow pl-3 text-sm leading-relaxed text-muted">{section.note}</p>}
          </div>
        </section>
      ))}
    </div>
  );
}
