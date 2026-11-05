"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, Search, Star, X } from "lucide-react";
import { ALG_CASES, ALG_SET_LABELS, type AlgCase, type AlgSet } from "@/data/algorithms";
import { caseCube } from "@/lib/exercises";
import { moveCount } from "@/lib/alg";
import { useRoadCube } from "@/lib/store";
import { cn } from "@/lib/cn";
import { LazyCube } from "@/components/cube/LazyCube";
import { TwistyCube } from "@/components/cube/TwistyCube";
import { CubeFrame } from "@/components/cube/CubeFrame";
import { AlgDisplay } from "@/components/cube/AlgDisplay";
import { Kicker } from "@/components/ui/Kicker";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { Tag } from "@/components/ui/Tag";

const SETS: AlgSet[] = ["beginner", "f2l", "oll", "pll"];
const SET_COLORS: Record<AlgSet, string> = {
  beginner: "var(--cube-blue)",
  f2l: "var(--cube-orange)",
  oll: "var(--cube-yellow)",
  pll: "var(--cube-red)",
};

export function Library() {
  const [set, setSet] = useState<AlgSet>("pll");
  const [query, setQuery] = useState("");
  const [viewing, setViewing] = useState<{ c: AlgCase; alg: string } | null>(null);

  const q = query.trim().toLowerCase();
  const cases = ALG_CASES.filter(
    (c) => c.set === set && (!q || c.name.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)),
  );
  const groups = [...new Set(cases.map((c) => c.group))];

  return (
    <div>
      <PageHeader
        kicker={`Biblioteca · ${ALG_CASES.length} casos`}
        title="Todos os algoritmos"
        description="Referência rápida com animação. Marque com a estrela o algoritmo que você prefere: ele passa a ser usado no treino e na revisão."
      />

      <div className="mb-2 flex flex-col-reverse gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Tabs
          value={set}
          onChange={setSet}
          items={SETS.map((s) => ({ value: s, label: ALG_SET_LABELS[s] }))}
          className="flex-1"
        />
        <label className="flex h-10 items-center gap-2 border-b border-border sm:w-56">
          <Search className="size-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar caso"
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none"
          />
        </label>
      </div>

      {groups.map((group) => (
        <section key={group} className="grid grid-cols-[minmax(0,1fr)] gap-4 border-b border-border py-10 md:grid-cols-[220px_minmax(0,1fr)] md:gap-12">
          <div className="md:sticky md:top-24 md:self-start">
            <Kicker color={SET_COLORS[set]}>{ALG_SET_LABELS[set]}</Kicker>
            <h2 className="mt-3 text-xl font-bold tracking-tight">{group}</h2>
            <p className="mt-1 font-mono text-xs text-muted">{cases.filter((c) => c.group === group).length} casos</p>
          </div>
          <ul className="border-t border-border 2xl:grid 2xl:grid-cols-2 2xl:gap-x-12">
            {cases
              .filter((c) => c.group === group)
              .map((c) => (
                <CaseRow key={c.id} c={c} onPlay={(alg) => setViewing({ c, alg })} />
              ))}
          </ul>
        </section>
      ))}
      {cases.length === 0 && <p className="py-10 text-muted">Nenhum caso encontrado.</p>}

      <AnimatePresence>
        {viewing && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewing(null)}
          >
            <motion.div
              initial={{ y: 12 }}
              animate={{ y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex w-full max-w-md flex-col gap-5 rounded-lg border border-border bg-surface p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Kicker color={SET_COLORS[viewing.c.set]}>{viewing.c.group}</Kicker>
                  <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em]">{viewing.c.name}</h2>
                </div>
                <button type="button" aria-label="Fechar" onClick={() => setViewing(null)} className="text-muted hover:text-text">
                  <X className="size-5" />
                </button>
              </div>
              <CubeFrame
                title={`${viewing.c.id}.alg`}
                accent={SET_COLORS[viewing.c.set]}
                footerRight={<Tag tone="dark">{moveCount(viewing.alg)} movimentos</Tag>}
              >
                <TwistyCube {...caseCube(viewing.c.id, { alg: viewing.alg, controls: true, autoplay: true })} />
              </CubeFrame>
              <AlgDisplay alg={viewing.alg} />
              <p className="text-sm text-muted">{viewing.c.recognition}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CaseRow({ c, onPlay }: { c: AlgCase; onPlay: (alg: string) => void }) {
  const preferred = useRoadCube((s) => s.preferredAlg[c.id] ?? 0);
  const setPreferred = useRoadCube((s) => s.setPreferredAlg);

  return (
    <li className="flex gap-5 border-b border-border py-5">
      <button
        type="button"
        aria-label={`Ver ${c.name}`}
        onClick={() => onPlay(c.algs[preferred])}
        className="w-24 shrink-0 self-start rounded-md bg-frame p-1.5 transition hover:ring-2 hover:ring-border sm:w-28"
      >
        <LazyCube {...caseCube(c.id)} />
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h3 className="text-lg font-bold tracking-tight">{c.name}</h3>
        <p className="text-sm text-muted">{c.recognition}</p>
        <ul className="mt-1 flex flex-col">
          {c.algs.map((alg, i) => (
            <li key={alg} className="group flex items-center gap-3 py-1">
              <button
                type="button"
                aria-label="Definir como preferido"
                title="Algoritmo preferido"
                onClick={() => setPreferred(c.id, i)}
                className={cn("-m-2 shrink-0 p-2 transition", i === preferred ? "text-cube-yellow" : "text-border hover:text-muted")}
              >
                <Star className="size-4" fill={i === preferred ? "currentColor" : "none"} />
              </button>
              <code className={cn("min-w-0 flex-1 font-mono text-sm break-words", i === preferred ? "text-text" : "text-muted")}>
                {alg}
              </code>
              <span className="shrink-0 font-mono text-[11px] text-muted">{moveCount(alg)}m</span>
              <button
                type="button"
                aria-label="Ver animação"
                onClick={() => onPlay(alg)}
                className="-m-1 shrink-0 rounded p-2 text-muted transition hover:bg-surface-2 hover:text-text"
              >
                <Play className="size-3.5" fill="currentColor" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
