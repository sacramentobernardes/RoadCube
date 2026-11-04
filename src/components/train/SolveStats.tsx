"use client";

import { Trash2 } from "lucide-react";
import { getCase } from "@/data/algorithms";
import { formatTime } from "@/lib/dates";
import { averageOf, bestTime } from "@/lib/stats";
import { useRoadCube, type Solve } from "@/lib/store";
import { cn } from "@/lib/cn";
import { StatColumns } from "@/components/ui/StatColumns";

function show(ms: number | null) {
  if (ms === null) return "—";
  return ms === Infinity ? "DNF" : formatTime(ms);
}

function when(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  return d.toDateString() === today.toDateString()
    ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("pt-BR");
}

export function SolveStats({ solves }: { solves: Solve[] }) {
  const removeSolve = useRoadCube((s) => s.removeSolve);
  const toggleDnf = useRoadCube((s) => s.toggleDnf);

  return (
    <section className="flex flex-col gap-8">
      <StatColumns
        className="border-b border-border pb-8"
        stats={[
          { kicker: "Melhor", value: <span className="font-mono">{show(bestTime(solves))}</span> },
          { kicker: "Média de 5", value: <span className="font-mono">{show(averageOf(solves, 5))}</span> },
          { kicker: "Média de 12", value: <span className="font-mono">{show(averageOf(solves, 12))}</span> },
          { kicker: "Resoluções", value: <span className="font-mono">{solves.length}</span> },
        ]}
      />
      <div>
        <h2 className="text-xl font-bold tracking-tight">Tempos recentes</h2>
        {solves.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nenhum tempo ainda. Faça sua primeira resolução.</p>
        ) : (
          <ul className="mt-4 border-t border-border">
            {solves.slice(0, 12).map((s, i) => (
              <li key={s.id} className="group flex items-center gap-4 border-b border-border py-3">
                <span className="w-6 font-mono text-xs text-muted">{String(solves.length - i).padStart(2, "0")}</span>
                <span className={cn("w-20 font-mono font-medium tabular-nums", s.dnf && "text-muted line-through")}>
                  {formatTime(s.ms)}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted">
                  {s.caseId ? getCase(s.caseId).name : s.scramble}
                </span>
                <span className="hidden font-mono text-xs text-muted sm:block">{when(s.date)}</span>
                <button
                  type="button"
                  onClick={() => toggleDnf(s.id)}
                  className={cn(
                    "rounded px-1.5 py-0.5 font-mono text-[11px] transition",
                    s.dnf ? "bg-cube-red text-white" : "text-muted hover:bg-surface-2 hover:text-text",
                  )}
                >
                  DNF
                </button>
                <button
                  type="button"
                  aria-label="Excluir tempo"
                  onClick={() => removeSolve(s.id)}
                  className="rounded p-1 text-muted transition hover:text-cube-red"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
