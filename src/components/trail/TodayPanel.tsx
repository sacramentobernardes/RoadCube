"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ALG_CASES } from "@/data/algorithms";
import { DAILY_TIPS } from "@/data/tips";
import { addDays, dayKey, daysBetween } from "@/lib/dates";
import { useRoadCube } from "@/lib/store";
import { cn } from "@/lib/cn";
import { AlgDisplay } from "@/components/cube/AlgDisplay";
import { Kicker } from "@/components/ui/Kicker";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

function weekdayOf(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

/** Resumo do dia: atividade da semana, algoritmo do dia e dica. */
export function TodayPanel() {
  const dailyXp = useRoadCube((s) => s.dailyXp);
  const today = dayKey();
  const dayIndex = daysBetween("2026-01-01", today);
  const featured = ALG_CASES[dayIndex % ALG_CASES.length];
  const tip = DAILY_TIPS[dayIndex % DAILY_TIPS.length];

  // Semana do calendário, de domingo a sábado.
  const sunday = addDays(today, -weekdayOf(today));
  const week = Array.from({ length: 7 }, (_, i) => addDays(sunday, i));
  const active = week.filter((d) => (dailyXp[d] ?? 0) > 0).length;

  return (
    <section className="grid grid-cols-[minmax(0,1fr)] gap-8 border-b border-border py-8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-border">
      <div className="md:pr-8">
        <Kicker>Sua semana</Kicker>
        <div className="mt-4 flex gap-2">
          {week.map((day, i) => (
            <div key={day} className="flex flex-col items-center gap-1.5">
              <span
                className={cn("size-7 rounded-md", (dailyXp[day] ?? 0) > 0 ? "bg-cube-green" : "bg-surface-2", day === today && "ring-2 ring-text/40", day > today && "opacity-50")}
                title={`${day.slice(8)}/${day.slice(5, 7)}: ${dailyXp[day] ?? 0} xp`}
              />
              <span className="font-mono text-[11px] text-muted">{WEEKDAYS[i]}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">
          {active === 0 ? "Comece hoje a sua sequência." : `Você praticou em ${active} ${active === 1 ? "dia" : "dias"} desta semana.`}
        </p>
      </div>

      <div className="min-w-0 md:px-8">
        <Kicker>Algoritmo do dia</Kicker>
        <div className="mt-3 text-xl font-bold tracking-tight">{featured.name}</div>
        <p className="mt-1 text-sm text-muted">{featured.group}</p>
        <AlgDisplay alg={featured.algs[0]} size="sm" className="mt-3" />
        <Link href="/library" className="group mt-1 inline-flex items-center gap-1 py-2 text-sm underline underline-offset-2">
          Ver na biblioteca <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="md:pl-8">
        <Kicker>Dica do dia</Kicker>
        <p className="mt-3 max-w-[50ch] text-lg leading-relaxed">{tip}</p>
      </div>
    </section>
  );
}
