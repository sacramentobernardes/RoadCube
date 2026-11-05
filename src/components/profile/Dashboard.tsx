"use client";

import { useState } from "react";
import { CURRICULUM, findLesson } from "@/data/curriculum";
import { formatTime } from "@/lib/dates";
import { averageOf, bestTime } from "@/lib/stats";
import { liveStreak, useRoadCube } from "@/lib/store";
import { levelFromXp } from "@/lib/gamification";
import { cn } from "@/lib/cn";
import { StatColumns } from "@/components/ui/StatColumns";
import { ActivityHeatmap, MasteryBar, ModuleBars, SolveTrend, XpChart } from "./charts";

function Panel({ title, detail, action, children }: { title: string; detail?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="min-w-0 border-t border-border pt-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          {detail && <p className="mt-0.5 text-sm text-muted">{detail}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function studyTime(ms: number) {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

export function Dashboard() {
  const s = useRoadCube();
  const [range, setRange] = useState(7);
  const level = levelFromXp(s.xp);
  const fullSolves = s.solves.filter((x) => !x.caseId);
  const best = bestTime(fullSolves);
  const ao5 = averageOf(fullSolves, 5);

  const available = CURRICULUM.flatMap((m) => m.lessons).filter((l) => !l.comingSoon);
  const lessonsDone = available.filter((l) => s.lessons[l.id]).length;
  const accuracy = s.history.length ? s.history.reduce((sum, h) => sum + h.accuracy, 0) / s.history.length : null;
  const studied = s.history.reduce((sum, h) => sum + h.durationMs, 0);
  const activeDays = Object.values(s.dailyXp).filter((xp) => xp > 0).length;
  const cards = Object.values(s.srs);

  const modules = CURRICULUM.map((m) => {
    const lessons = m.lessons.filter((l) => !l.comingSoon);
    return { id: m.id, title: m.title, done: lessons.filter((l) => s.lessons[l.id]).length, total: lessons.length };
  });

  const mastery = [
    { label: "Novos", hint: "ainda sem revisão", count: cards.filter((c) => c.reps === 0).length },
    { label: "Aprendendo", hint: "1 ou 2 acertos seguidos", count: cards.filter((c) => c.reps > 0 && c.reps < 3).length },
    { label: "Dominados", hint: "3 ou mais acertos seguidos", count: cards.filter((c) => c.reps >= 3).length },
  ];

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-8 border-y border-border py-8">
        <StatColumns
          stats={[
            { kicker: "Ofensiva", value: `${liveStreak(s.streak)} dias`, detail: `recorde: ${s.streak.best}` },
            { kicker: "XP total", value: s.xp, detail: `nível ${level.level}` },
            { kicker: "Lições", value: `${lessonsDone}/${available.length}`, detail: "concluídas" },
            {
              kicker: "Melhor tempo",
              value: <span className="font-mono">{best !== null ? formatTime(best) : "—"}</span>,
              detail: ao5 === null ? `${fullSolves.length} resoluções` : `média de 5: ${ao5 === Infinity ? "DNF" : formatTime(ao5)}`,
            },
          ]}
        />
        <StatColumns
          stats={[
            { kicker: "Precisão média", value: accuracy === null ? "—" : `${Math.round(accuracy * 100)}%`, detail: "nas lições" },
            { kicker: "Tempo de estudo", value: studied ? studyTime(studied) : "—", detail: "em lições" },
            { kicker: "Dias ativos", value: activeDays, detail: "no total" },
            { kicker: "Algoritmos", value: cards.length, detail: "na revisão espaçada" },
          ]}
        />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-x-16 gap-y-12 lg:grid-cols-2">
        <Panel
          title="XP por dia"
          detail={`Meta atual: ${s.dailyGoal} XP por dia`}
          action={
            <div className="flex gap-1 rounded-md bg-surface-2 p-0.5" role="group" aria-label="Período">
              {[7, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  aria-pressed={range === days}
                  onClick={() => setRange(days)}
                  className={cn("rounded px-2.5 py-1 text-sm font-medium transition", range === days ? "bg-surface text-text" : "text-muted hover:text-text")}
                >
                  {days} dias
                </button>
              ))}
            </div>
          }
        >
          <XpChart dailyXp={s.dailyXp} goal={s.dailyGoal} days={range} />
        </Panel>

        <Panel title="Atividade" detail="Cada quadrado é um dia de prática">
          <ActivityHeatmap dailyXp={s.dailyXp} goal={s.dailyGoal} />
        </Panel>

        <Panel title="Evolução dos tempos" detail="Últimas 30 resoluções completas">
          <SolveTrend solves={fullSolves} />
        </Panel>

        <Panel title="Progresso por módulo" detail="Lições concluídas">
          <ModuleBars rows={modules} />
        </Panel>

        <Panel title="Domínio dos algoritmos" detail="Segundo a revisão espaçada">
          <MasteryBar groups={mastery} />
        </Panel>

        <Panel title="Histórico" detail="Lições mais recentes">
          {s.history.length === 0 ? (
            <p className="text-muted">Nenhuma lição concluída ainda.</p>
          ) : (
            <ul className="border-t border-border">
              {s.history.slice(0, 6).map((h) => (
                <li key={h.id} className="flex items-center gap-4 border-b border-border py-3 text-sm">
                  <span className="min-w-0 flex-1 truncate font-medium">{findLesson(h.lessonId)?.lesson.title ?? h.lessonId}</span>
                  <span className="font-mono text-xs text-muted">{Math.round(h.accuracy * 100)}%</span>
                  <span className="font-mono text-xs text-muted">+{h.xp} xp</span>
                  <span className="hidden font-mono text-xs text-muted sm:block">{new Date(h.date).toLocaleDateString("pt-BR")}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
