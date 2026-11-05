"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Lock } from "lucide-react";
import { CURRICULUM, type Lesson, type Module } from "@/data/curriculum";
import { layoutModule, type MapNode } from "@/lib/trail-layout";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { MODULE_COLORS } from "./colors";

export type NodeState = "completed" | "current" | "unlocked" | "locked" | "soon";

const POPOVER_WIDTH = 280;
/** Estimativa de ritmo: exercícios curtos, de teoria ou prática. */
const MINUTES_PER_EXERCISE = 0.4;
const pad = (n: number) => String(n).padStart(2, "0");

const STATE_LABELS: Record<NodeState, string> = {
  completed: "concluída",
  current: "próxima lição",
  unlocked: "disponível",
  locked: "bloqueada",
  soon: "em breve",
};

/** Módulos recolhidos em uma linha do tempo; cada um abre seu trecho de estrada. */
export function ModuleList({
  stateOf,
  completed,
  currentModuleId,
}: {
  stateOf: (lesson: Lesson) => NodeState;
  completed: Record<string, unknown>;
  currentModuleId?: string;
}) {
  const [open, setOpen] = useState<Set<string>>(() => new Set([currentModuleId ?? CURRICULUM[0].id]));

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  return (
    <ol className="mt-6 border-t border-border">
      {CURRICULUM.map((module, index) => (
        <ModuleRow
          key={module.id}
          module={module}
          index={index}
          stateOf={stateOf}
          completed={completed}
          isCurrent={module.id === currentModuleId}
          isLast={index === CURRICULUM.length - 1}
          open={open.has(module.id)}
          onToggle={() => toggle(module.id)}
        />
      ))}
    </ol>
  );
}

function ModuleRow({
  module,
  index,
  stateOf,
  completed,
  isCurrent,
  isLast,
  open,
  onToggle,
}: {
  module: Module;
  index: number;
  stateOf: (lesson: Lesson) => NodeState;
  completed: Record<string, unknown>;
  isCurrent: boolean;
  isLast: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const color = MODULE_COLORS[module.color];
  const available = module.lessons.filter((l) => !l.comingSoon);
  const done = available.filter((l) => completed[l.id]).length;
  const finished = available.length > 0 && done === available.length;
  const started = done > 0 || isCurrent;
  const exercises = available.reduce((sum, l) => sum + l.exercises.length, 0);
  const minutes = Math.max(5, Math.round((exercises * MINUTES_PER_EXERCISE) / 5) * 5);

  return (
    <li className="relative border-b border-border">
      {/* Trilho que liga os módulos, aceso até onde o usuário chegou. */}
      <span
        className="absolute left-6 w-[3px] -translate-x-1/2"
        style={{ top: index === 0 ? 40 : 0, bottom: isLast ? "auto" : 0, height: isLast ? 40 : undefined, background: finished ? color : "var(--border)" }}
        aria-hidden
      />
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="relative flex w-full items-center gap-5 py-6 text-left transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-cube-blue"
      >
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-xl border-2 font-mono text-sm font-semibold",
            !finished && !started && "border-border bg-surface-2 text-muted",
          )}
          style={finished ? { background: color, borderColor: color } : started ? { borderColor: color, background: "var(--bg)" } : undefined}
        >
          {finished ? <Check className="size-5" style={{ color: module.color === "yellow" ? "#111" : "#fff" }} strokeWidth={3} /> : pad(index + 1)}
        </span>

        <span className="min-w-0 flex-1">
          <Kicker color={color}>
            Módulo {pad(index + 1)} · {available.length} lições · cerca de {minutes} min
          </Kicker>
          <span className="mt-1.5 block text-xl font-bold tracking-tight">{module.title}</span>
          <span className="mt-1 block max-w-2xl text-sm leading-relaxed text-muted">{module.about}</span>
        </span>

        <span className="hidden w-44 shrink-0 items-center gap-3 sm:flex">
          <ProgressBar value={available.length ? done / available.length : 0} color={color} />
          <span className="shrink-0 font-mono text-xs text-muted">
            {done}/{available.length}
          </span>
        </span>
        <ChevronDown className={cn("mr-2 size-5 shrink-0 text-muted transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="relative z-10 bg-bg pb-4 sm:ml-16 sm:bg-transparent"
          >
            <ModuleTrail module={module} stateOf={stateOf} />
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function ModuleTrail({ module, stateOf }: { module: Module; stateOf: (lesson: Lesson) => NodeState }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const color = MODULE_COLORS[module.color];

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!openId) return;
    const close = (e: PointerEvent) => {
      if (!(e.target as Element).closest("[data-trail-node]")) setOpenId(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [openId]);

  const layout = useMemo(() => (width ? layoutModule(module, width) : null), [module, width]);
  const reached = (id: string) => {
    const state = stateOf(module.lessons.find((l) => l.id === id)!);
    return state === "completed" || state === "current";
  };

  return (
    <div ref={ref} className="relative" style={{ height: layout?.height }}>
      {layout && (
        <>
          <svg className="absolute inset-0 size-full overflow-visible" aria-hidden>
            {layout.segments.map((s) => {
              const lit = reached(s.to);
              return <path key={s.to} d={s.d} fill="none" strokeLinecap="round" strokeWidth={lit ? 6 : 4} stroke={lit ? color : "var(--border)"} />;
            })}
          </svg>
          <ol>
            {layout.nodes.map((node) => (
              <TrailNode
                key={node.lesson.id}
                node={node}
                module={module}
                state={stateOf(node.lesson)}
                width={width}
                open={openId === node.lesson.id}
                onToggle={() => setOpenId(openId === node.lesson.id ? null : node.lesson.id)}
              />
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

function TrailNode({
  node,
  module,
  state,
  width,
  open,
  onToggle,
}: {
  node: MapNode;
  module: Module;
  state: NodeState;
  width: number;
  open: boolean;
  onToggle: () => void;
}) {
  const { lesson, x, y, labelWidth } = node;
  const color = MODULE_COLORS[module.color];
  const available = state === "completed" || state === "current" || state === "unlocked";
  const left = Math.max(0, Math.min(width - POPOVER_WIDTH, x - POPOVER_WIDTH / 2));

  return (
    <li data-trail-node className={cn(open && "relative z-20")}>
      <div className="absolute flex -translate-x-1/2 -translate-y-7 flex-col items-center" style={{ left: x, top: y, width: labelWidth }}>
        <button
          type="button"
          aria-expanded={open}
          aria-label={`${lesson.title}: ${STATE_LABELS[state]}`}
          onClick={onToggle}
          className={cn(
            "grid size-14 place-items-center rounded-xl border-2 transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cube-blue",
            state === "locked" && "border-border bg-surface-2 text-muted",
            state === "soon" && "border-dashed border-border bg-bg text-muted",
          )}
          style={
            state === "completed"
              ? { background: color, borderColor: color }
              : state === "current" || state === "unlocked"
                ? { borderColor: color, background: "var(--bg)" }
                : undefined
          }
        >
          {state === "completed" && <Check className="size-6" style={{ color: module.color === "yellow" ? "#111" : "#fff" }} strokeWidth={3} />}
          {state === "current" && <span className="size-5 rounded motion-safe:animate-pulse" style={{ background: color }} />}
          {state === "locked" && <Lock className="size-4" />}
        </button>
        <span className={cn("mt-2 text-center text-xs leading-tight font-medium", !available && "text-muted")}>{lesson.title}</span>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.14 }}
            className="absolute rounded-lg border border-border bg-surface p-4 shadow-[0_12px_32px_-16px_rgb(0_0_0/0.45)]"
            style={{ left, top: y + 74, width: POPOVER_WIDTH }}
          >
            <div className="text-lg font-bold tracking-tight">{lesson.title}</div>
            <p className="mt-1 text-sm text-muted">
              {state === "locked"
                ? "Conclua a lição anterior para desbloquear."
                : state === "soon"
                  ? "Conteúdo em preparação."
                  : `${lesson.description}. ${lesson.exercises.length} exercícios.`}
            </p>
            {available && (
              <Link href={`/lesson/${lesson.id}`} className="mt-3 block">
                <Button block size="sm">
                  {state === "completed" ? "Praticar de novo" : "Começar lição"}
                </Button>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
