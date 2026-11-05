"use client";

import { useMemo, useState } from "react";
import { Eye, RefreshCw } from "lucide-react";
import { ALG_CASES, ALG_SET_LABELS, getCase, type AlgSet } from "@/data/algorithms";
import { invertAlg } from "@/lib/alg";
import { randomScramble, AUFS } from "@/lib/scramble";
import { pick } from "@/lib/random";
import { useRoadCube } from "@/lib/store";
import { cn } from "@/lib/cn";
import { TwistyCube } from "@/components/cube/TwistyCube";
import { CubeFrame } from "@/components/cube/CubeFrame";
import { AlgDisplay } from "@/components/cube/AlgDisplay";
import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { Tag } from "@/components/ui/Tag";
import { SpeedTimer } from "./SpeedTimer";
import { SolveStats } from "./SolveStats";

type Mode = "scramble" | "cases";

export function Trainer() {
  const [mode, setMode] = useState<Mode>("scramble");
  return (
    <div>
      <PageHeader
        kicker="Modo treino"
        title="Cronometre cada resolução"
        description="Embaralhe com o scramble oficial e resolva, ou treine só os casos que você escolher."
        color="var(--cube-blue)"
      />
      <Tabs
        value={mode}
        onChange={setMode}
        items={[
          { value: "scramble", label: "Resolução completa" },
          { value: "cases", label: "Treino de casos" },
        ]}
        className="mb-10"
      />
      {mode === "scramble" ? <ScrambleTrainer /> : <CaseTrainer />}
    </div>
  );
}

function ScrambleTrainer() {
  const length = useRoadCube((s) => s.settings.scrambleLength);
  const [scramble, setScramble] = useState(() => randomScramble(length));
  const allSolves = useRoadCube((s) => s.solves);
  const addSolve = useRoadCube((s) => s.addSolve);
  const solves = useMemo(() => allSolves.filter((s) => !s.caseId), [allSolves]);

  return (
    <div className="flex flex-col gap-12">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,360px)] 2xl:grid-cols-[minmax(0,1fr)_minmax(0,min(460px,54vh))] 2xl:gap-16 md:gap-14">
        <div className="flex min-w-0 flex-col gap-8">
          <div>
            <div className="flex items-center justify-between">
              <Kicker>Scramble · {length} movimentos</Kicker>
              <button
                type="button"
                onClick={() => setScramble(randomScramble(length))}
                className="flex items-center gap-1.5 font-mono text-xs text-muted transition hover:text-text"
              >
                <RefreshCw className="size-3.5" /> novo
              </button>
            </div>
            <p className="mt-4 font-mono text-2xl leading-relaxed font-medium tracking-tight sm:text-3xl">{scramble}</p>
          </div>
          <SpeedTimer
            onSolve={(ms) => {
              addSolve({ ms, scramble });
              setScramble(randomScramble(length));
            }}
          />
        </div>
        <CubeFrame
          title="scramble.alg"
          accent="var(--cube-blue)"
          footerLeft={<Tag tone="dark">branco em cima · verde na frente</Tag>}
        >
          <TwistyCube setup={scramble} />
        </CubeFrame>
      </div>
      <SolveStats solves={solves} />
    </div>
  );
}

const SETS: AlgSet[] = ["pll", "oll", "f2l", "beginner"];

function CaseTrainer() {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(ALG_CASES.filter((c) => c.set === "pll").map((c) => c.id)));
  const [current, setCurrent] = useState<{ caseId: string; setup: string } | null>(null);
  const [reveal, setReveal] = useState(false);
  const preferred = useRoadCube((s) => s.preferredAlg);
  const allSolves = useRoadCube((s) => s.solves);
  const addSolve = useRoadCube((s) => s.addSolve);
  const solves = useMemo(() => allSolves.filter((s) => s.caseId && selected.has(s.caseId)), [allSolves, selected]);

  function next() {
    const ids = [...selected];
    if (!ids.length) return setCurrent(null);
    const caseId = pick(ids);
    const c = getCase(caseId);
    // AUF aleatório antes do caso, para treinar o reconhecimento em qualquer ângulo.
    const auf = c.view === "pll" || c.view === "oll" ? pick(AUFS) : "";
    const setup = `${invertAlg(c.algs[preferred[caseId] ?? 0])} ${auf}`.trim();
    setCurrent({ caseId, setup });
    setReveal(false);
  }

  function toggle(ids: string[], on: boolean) {
    setSelected((prev) => {
      const nextSet = new Set(prev);
      for (const id of ids) {
        if (on) nextSet.add(id);
        else nextSet.delete(id);
      }
      return nextSet;
    });
  }

  const c = current && getCase(current.caseId);

  return (
    <div className="flex flex-col gap-12">
      <details className="group border-y border-border py-5" open={!current}>
        <summary className="flex cursor-pointer list-none items-center justify-between">
          <span className="font-semibold">Casos selecionados</span>
          <span className="font-mono text-xs text-muted">
            {selected.size} · <span className="group-open:hidden">editar</span>
            <span className="hidden group-open:inline">fechar</span>
          </span>
        </summary>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {SETS.map((set) => {
            const cases = ALG_CASES.filter((x) => x.set === set);
            const allOn = cases.every((x) => selected.has(x.id));
            return (
              <div key={set}>
                <button
                  type="button"
                  onClick={() => toggle(cases.map((x) => x.id), !allOn)}
                  className="mb-3 flex items-center gap-2 font-mono text-xs tracking-wider text-muted uppercase hover:text-text"
                >
                  <span className={cn("size-3 rounded-[2px] border", allOn ? "border-ink bg-ink" : "border-border")} />
                  {ALG_SET_LABELS[set]}
                </button>
                <div className="flex flex-wrap gap-1.5">
                  {cases.map((x) => (
                    <button
                      key={x.id}
                      type="button"
                      onClick={() => toggle([x.id], !selected.has(x.id))}
                      className={cn(
                        "rounded border px-2 py-1 font-mono text-xs transition",
                        selected.has(x.id) ? "border-ink bg-ink text-ink-contrast" : "border-border text-muted hover:text-text",
                      )}
                    >
                      {x.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </details>

      {!current || !c ? (
        <div>
          <Button size="lg" onClick={next} disabled={selected.size === 0}>
            Começar treino
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,360px)] 2xl:grid-cols-[minmax(0,1fr)_minmax(0,min(460px,54vh))] 2xl:gap-16 md:gap-14">
          <div className="flex min-w-0 flex-col gap-8">
            <div>
              <Kicker>Monte o caso · amarelo em cima, verde na frente</Kicker>
              <AlgDisplay alg={current.setup} className="mt-4" />
            </div>
            <SpeedTimer
              onSolve={(ms) => {
                addSolve({ ms, scramble: current.setup, caseId: current.caseId });
                next();
              }}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setReveal((r) => !r)}>
                <Eye className="size-4" /> {reveal ? "Esconder resposta" : "Revelar caso"}
              </Button>
              <Button variant="ghost" size="sm" onClick={next}>
                Pular caso
              </Button>
            </div>
            {reveal && (
              <div className="flex flex-col gap-2">
                <div className="text-2xl font-bold tracking-tight">{c.name}</div>
                <AlgDisplay alg={c.algs[preferred[c.id] ?? 0]} size="sm" />
              </div>
            )}
          </div>
          <CubeFrame
            title={reveal ? `${c.id}.alg` : "caso-surpresa.alg"}
            accent="var(--cube-blue)"
            footerLeft={<Tag tone="dark">{ALG_SET_LABELS[c.set]}</Tag>}
          >
            <TwistyCube view={c.view} setup={current.setup} />
          </CubeFrame>
        </div>
      )}
      <SolveStats solves={solves} />
    </div>
  );
}
