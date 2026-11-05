"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { addDays, dayKey, formatTime } from "@/lib/dates";
import type { Solve } from "@/lib/store";
import { cn } from "@/lib/cn";

// Gráficos do Perfil. Cada um tem um único tom de cor, grade fina e texto nas
// cores de texto; os valores aparecem no tooltip e em um resumo para leitores de tela.

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function parseDay(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const shortDate = (day: string) => `${day.slice(8)}/${day.slice(5, 7)}`;

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

function Tooltip({ left, children }: { left: number | string; children: React.ReactNode }) {
  return (
    <div
      className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded bg-ink px-2 py-1 text-xs whitespace-nowrap text-ink-contrast"
      style={{ left }}
    >
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="grid h-44 place-items-center rounded-md border border-dashed border-border px-6 text-center text-sm text-muted">{children}</p>;
}

/** XP por dia, com a meta diária como referência. */
export function XpChart({ dailyXp, goal, days }: { dailyXp: Record<string, number>; goal: number; days: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const today = dayKey();
  const data = useMemo(() => Array.from({ length: days }, (_, i) => {
    const day = addDays(today, i - days + 1);
    return { day, xp: dailyXp[day] ?? 0 };
  }), [dailyXp, days, today]);
  const top = Math.max(goal, ...data.map((d) => d.xp)) * 1.1;
  const total = data.reduce((sum, d) => sum + d.xp, 0);
  const everyLabel = days <= 7 ? 1 : 5;

  return (
    <div role="img" aria-label={`${total} XP nos últimos ${days} dias; meta de ${goal} XP por dia.`}>
      <div className="relative h-44 border-b border-border" onMouseLeave={() => setHover(null)}>
        <div className="absolute inset-x-0 border-t border-border" style={{ bottom: `${(goal / top) * 100}%` }}>
          <span className="absolute right-0 -translate-y-full bg-bg pb-0.5 pl-1 text-xs text-muted">meta {goal}</span>
        </div>
        <div className="absolute inset-0 flex">
          {data.map((d, i) => (
            <div key={d.day} className="flex h-full flex-1 items-end justify-center px-px" onMouseEnter={() => setHover(i)}>
              <div
                className={cn("w-full max-w-6 rounded-t", d.day === today ? "bg-cube-red" : "bg-ink", hover !== null && hover !== i && "opacity-40")}
                style={{ height: `${(d.xp / top) * 100}%`, minHeight: d.xp ? 3 : 0 }}
              />
            </div>
          ))}
        </div>
        {hover !== null && (
          <Tooltip left={`${((hover + 0.5) / days) * 100}%`}>
            {shortDate(data[hover].day)} · {data[hover].xp} xp
          </Tooltip>
        )}
      </div>
      <div className="mt-2 flex">
        {data.map((d, i) => (
          <span key={d.day} className="flex-1 text-center text-xs text-muted">
            {(days - 1 - i) % everyLabel === 0 ? (days <= 7 ? WEEKDAYS[parseDay(d.day).getDay()] : shortDate(d.day)) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

const CELL = 12;
const GAP = 3;

/** Calendário de atividade: um quadrado por dia, mais escuro quanto mais XP. */
export function ActivityHeatmap({ dailyXp, goal }: { dailyXp: Record<string, number>; goal: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<{ day: string; x: number } | null>(null);
  const today = dayKey();
  const weeks = Math.max(10, Math.min(52, Math.floor((width + GAP) / (CELL + GAP))));
  const start = addDays(today, -((weeks - 1) * 7 + parseDay(today).getDay()));
  const days: string[] = [];
  for (let d = start; d <= today; d = addDays(d, 1)) days.push(d);
  const activeDays = days.filter((d) => (dailyXp[d] ?? 0) > 0).length;

  const level = (xp: number) => (xp <= 0 ? 0 : xp < goal / 2 ? 1 : xp < goal ? 2 : xp < goal * 2 ? 3 : 4);
  const fill = (l: number) => (l === 0 ? "var(--surface-2)" : `color-mix(in srgb, var(--cube-green) ${[0, 35, 60, 80, 100][l]}%, var(--surface-2))`);

  return (
    <div ref={ref} role="img" aria-label={`${activeDays} dias com atividade nas últimas ${weeks} semanas.`} className="relative">
      {width > 0 && (
        <div className="grid w-fit grid-flow-col grid-rows-7" style={{ gap: GAP }} onMouseLeave={() => setHover(null)}>
          {days.map((day, i) => (
            <span
              key={day}
              className="rounded-[3px]"
              style={{ width: CELL, height: CELL, background: fill(level(dailyXp[day] ?? 0)) }}
              onMouseEnter={() => setHover({ day, x: Math.floor(i / 7) * (CELL + GAP) + CELL / 2 })}
            />
          ))}
        </div>
      )}
      {hover && (
        <Tooltip left={Math.max(50, Math.min(width - 50, hover.x))}>
          {shortDate(hover.day)} · {dailyXp[hover.day] ?? 0} xp
        </Tooltip>
      )}
      <div className="mt-3 flex items-center justify-between gap-4 text-xs text-muted">
        <span>{activeDays} dias ativos</span>
        <span className="flex items-center gap-1">
          menos
          {[0, 1, 2, 3, 4].map((l) => (
            <i key={l} className="size-3 rounded-[3px]" style={{ background: fill(l) }} />
          ))}
          mais
        </span>
      </div>
    </div>
  );
}

const HEIGHT = 176;
const LEFT = 44;
const PAD_TOP = 10;
const PAD_BOTTOM = 8;
const PAD_RIGHT = 12;

/** Evolução dos tempos: as últimas resoluções válidas, da mais antiga à mais nova. */
export function SolveTrend({ solves }: { solves: Solve[] }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const points = useMemo(() => solves.filter((s) => !s.dnf).slice(0, 30).reverse(), [solves]);

  if (points.length < 2) return <Empty>Faça ao menos duas resoluções completas no Treino para ver sua evolução.</Empty>;

  const seconds = points.map((p) => p.ms / 1000);
  const step = Math.max(1, Math.ceil((Math.max(...seconds) - Math.min(...seconds)) / 2 / 5) * 5);
  const low = Math.max(0, Math.floor(Math.min(...seconds) / step) * step);
  const ticks = [low, low + step, low + step * 2, low + step * 3].filter((t, i, all) => i < 2 || all[i - 1] < Math.max(...seconds));
  const high = ticks[ticks.length - 1];
  const x = (i: number) => LEFT + (i / (points.length - 1)) * Math.max(0, width - LEFT - PAD_RIGHT);
  const y = (s: number) => PAD_TOP + (1 - (s - low) / (high - low)) * (HEIGHT - PAD_TOP - PAD_BOTTOM);
  const line = seconds.map((s, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(s).toFixed(1)}`).join("");
  const last = points.length - 1;
  const shown = hover ?? last;

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - box.left - LEFT) / Math.max(1, width - LEFT - PAD_RIGHT);
    setHover(Math.max(0, Math.min(last, Math.round(ratio * last))));
  }

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`Últimas ${points.length} resoluções, de ${formatTime(points[0].ms)} a ${formatTime(points[last].ms)}.`}
      className="relative"
    >
      {width > 0 && (
        <svg width={width} height={HEIGHT} onMouseMove={onMove} onMouseLeave={() => setHover(null)} className="block">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={LEFT} x2={width - PAD_RIGHT} y1={y(t)} y2={y(t)} stroke="var(--border)" />
              <text x={LEFT - 8} y={y(t) + 4} textAnchor="end" fontSize="12" fill="var(--muted)">
                {t}s
              </text>
            </g>
          ))}
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={PAD_TOP} y2={HEIGHT - PAD_BOTTOM} stroke="var(--border)" />}
          <path d={line} fill="none" stroke="var(--cube-blue)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={x(shown)} cy={y(seconds[shown])} r="5" fill="var(--cube-blue)" stroke="var(--bg)" strokeWidth="2" />
        </svg>
      )}
      {hover !== null && (
        <Tooltip left={Math.max(70, Math.min(width - 70, x(hover)))}>
          {formatTime(points[hover].ms)} · {new Date(points[hover].date).toLocaleDateString("pt-BR")}
        </Tooltip>
      )}
    </div>
  );
}

/** Progresso por módulo em barras horizontais, com o valor na ponta. */
export function ModuleBars({ rows }: { rows: { id: string; title: string; done: number; total: number }[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {rows.map((r) => (
        <li key={r.id}>
          <div className="mb-1.5 flex items-baseline justify-between gap-4 text-sm">
            <span className="min-w-0 truncate font-medium">{r.title}</span>
            <span className="shrink-0 font-mono text-xs text-muted tabular-nums">
              {r.done}/{r.total}
            </span>
          </div>
          <div className="h-2 rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-cube-blue" style={{ width: `${r.total ? (r.done / r.total) * 100 : 0}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

const MASTERY_SHADES = [35, 65, 100];

/** Algoritmos por nível de domínio: uma barra só, do novo ao dominado. */
export function MasteryBar({ groups }: { groups: { label: string; hint: string; count: number }[] }) {
  const total = groups.reduce((sum, g) => sum + g.count, 0);
  if (total === 0) return <Empty>Os algoritmos aparecem aqui quando você conclui lições do Método Básico em diante.</Empty>;
  const shade = (i: number) => `color-mix(in srgb, var(--cube-blue) ${MASTERY_SHADES[i]}%, var(--surface-2))`;

  return (
    <div role="img" aria-label={groups.map((g) => `${g.count} ${g.label.toLowerCase()}`).join(", ")}>
      <div className="flex h-6 gap-0.5">
        {groups.map((g, i) =>
          g.count > 0 ? (
            <div
              key={g.label}
              title={`${g.label}: ${g.count}`}
              className="first:rounded-l last:rounded-r"
              style={{ flexGrow: g.count, background: shade(i) }}
            />
          ) : null,
        )}
      </div>
      <ul className="mt-4 flex flex-col gap-2.5">
        {groups.map((g, i) => (
          <li key={g.label} className="flex items-center gap-3 text-sm">
            <i className="size-3 shrink-0 rounded-[3px]" style={{ background: shade(i) }} />
            <span className="font-medium">{g.label}</span>
            <span className="min-w-0 flex-1 truncate text-muted">{g.hint}</span>
            <span className="font-mono text-xs tabular-nums">{g.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
