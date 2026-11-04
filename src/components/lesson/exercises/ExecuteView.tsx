"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Eye, RotateCcw } from "lucide-react";
import { TwistyCube, type TwistyCubeHandle } from "@/components/cube/TwistyCube";
import { CubeFrame } from "@/components/cube/CubeFrame";
import { AlgDisplay } from "@/components/cube/AlgDisplay";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Tag } from "@/components/ui/Tag";
import { getCase } from "@/data/algorithms";
import { invertAlg, tokenize } from "@/lib/alg";
import { solvesCase } from "@/lib/cube-state";
import { formatTime } from "@/lib/dates";
import { useRoadCube } from "@/lib/store";
import { useStopwatch } from "@/lib/use-stopwatch";
import { ExerciseLayout, LessonAccent } from "../ExerciseLayout";
import type { ExerciseProps } from "../types";

type Mode = "virtual" | "real";

/** Desafio de resolução: no cubo virtual (validado automaticamente) ou no cubo real (com timer). */
export function ExecuteView({ exercise, status, resolve }: ExerciseProps<"execute">) {
  const [mode, setMode] = useState<Mode>("virtual");
  const props = { caseId: exercise.caseId, status, resolve };
  return mode === "virtual" ? (
    <VirtualChallenge {...props} prompt={exercise.prompt} tabs={<ModeTabs mode={mode} setMode={setMode} />} />
  ) : (
    <RealChallenge {...props} prompt={exercise.prompt} tabs={<ModeTabs mode={mode} setMode={setMode} />} />
  );
}

function ModeTabs({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  return (
    <Tabs
      value={mode}
      onChange={setMode}
      items={[
        { value: "virtual", label: "Cubo virtual" },
        { value: "real", label: "Cubo real" },
      ]}
    />
  );
}

interface ChallengeProps {
  caseId: string;
  prompt: string;
  tabs: React.ReactNode;
  status: ExerciseProps<"execute">["status"];
  resolve: (correct: boolean) => void;
}

function VirtualChallenge({ caseId, prompt, tabs, status, resolve }: ChallengeProps) {
  const c = getCase(caseId);
  const alg = c.algs[0];
  const accent = useContext(LessonAccent);
  const cube = useRef<TwistyCubeHandle>(null);
  const [moves, setMoves] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const { elapsed, running, start, stop, reset } = useStopwatch();
  const addSolve = useRoadCube((s) => s.addSolve);

  // Botões só com as faces usadas no algoritmo (e sempre U para ajustes).
  const faces = useMemo(() => {
    const set = new Set(tokenize(alg).map((m) => m.replace(/['2]/g, "")));
    set.add("U");
    return [...set];
  }, [alg]);

  useEffect(() => {
    if (moves.length === 0 || status !== "answering") return;
    let cancelled = false;
    solvesCase(alg, moves.join(" ")).then((ok) => {
      if (!ok || cancelled) return;
      const ms = stop();
      addSolve({ ms, scramble: invertAlg(alg), caseId });
      window.setTimeout(() => resolve(true), 600);
    });
    return () => {
      cancelled = true;
    };
  }, [moves, alg, caseId, status, resolve, stop, addSolve]);

  function play(move: string) {
    if (status !== "answering") return;
    if (moves.length === 0) start();
    cube.current?.addMove(move);
    setMoves((m) => [...m, move]);
  }

  function restart() {
    reset();
    setMoves([]);
    setAttempt((a) => a + 1);
  }

  const frame = (
    <CubeFrame
      title={`${c.id}.alg`}
      accent={accent}
      footerLeft={
        <Tag tone={status === "correct" ? "green" : running ? "red" : "dark"}>
          {status === "correct" ? "resolvido" : running ? "● gravando" : "aguardando"}
        </Tag>
      }
      footerRight={<Tag tone="dark">{formatTime(elapsed)}</Tag>}
    >
      <TwistyCube key={attempt} ref={cube} view={c.view} setup={invertAlg(alg)} />
    </CubeFrame>
  );

  return (
    <ExerciseLayout kicker="Desafio" title={prompt} cube={frame}>
      {tabs}
      <div className="min-h-6 font-mono text-sm text-muted">{moves.join(" ") || "O timer começa no primeiro movimento."}</div>
      <div className="grid grid-cols-3 gap-2">
        {faces.flatMap((f) =>
          ["", "'", "2"].map((suffix) => (
            <button
              key={f + suffix}
              type="button"
              onClick={() => play(f + suffix)}
              disabled={status !== "answering"}
              className="h-11 rounded-md border border-border bg-surface font-mono text-lg font-medium transition hover:border-text/40 active:translate-y-px disabled:opacity-40"
            >
              {f + suffix}
            </button>
          )),
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={restart} disabled={status !== "answering"}>
          <RotateCcw className="size-4" /> Recomeçar
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setShowHint((h) => !h)}>
          <Eye className="size-4" /> {showHint ? "Esconder dica" : "Dica"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => resolve(false)} disabled={status !== "answering"}>
          Desistir
        </Button>
      </div>
      {showHint && <AlgDisplay alg={alg} size="sm" />}
    </ExerciseLayout>
  );
}

function RealChallenge({ caseId, prompt, tabs, status, resolve }: ChallengeProps) {
  const c = getCase(caseId);
  const alg = c.algs[0];
  const accent = useContext(LessonAccent);
  const { elapsed, start, stop } = useStopwatch();
  const [phase, setPhase] = useState<"setup" | "timing" | "confirm">("setup");
  const addSolve = useRoadCube((s) => s.addSolve);
  const timeRef = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      if (phase === "setup") {
        start();
        setPhase("timing");
      } else if (phase === "timing") {
        timeRef.current = stop();
        setPhase("confirm");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, start, stop]);

  const frame = (
    <CubeFrame title={`${c.id}.alg`} accent={accent} footerLeft={<Tag tone="dark">o caso fica assim</Tag>}>
      <TwistyCube view={c.view} alg={alg} anchor="end" />
    </CubeFrame>
  );

  return (
    <ExerciseLayout kicker="Desafio" title={prompt} cube={frame}>
      {tabs}
      <ol className="flex flex-col gap-3 text-sm">
        <li className="flex gap-3">
          <span className="font-mono text-muted">01</span>
          <div className="flex flex-col gap-2">
            <span>
              Segure o cubo resolvido com {c.view === "full" || c.view === "cross" ? "o branco" : "o amarelo"} em cima e o
              verde na frente, e aplique:
            </span>
            <AlgDisplay alg={invertAlg(alg)} size="sm" />
          </div>
        </li>
        <li className="flex gap-3">
          <span className="font-mono text-muted">02</span>
          <span>Inicie o timer (espaço) e resolva o caso.</span>
        </li>
      </ol>
      <div className="border-y border-border py-6 text-center font-mono text-6xl font-medium tabular-nums">
        {formatTime(elapsed)}
      </div>
      {phase === "setup" && (
        <Button
          size="lg"
          onClick={() => {
            start();
            setPhase("timing");
          }}
        >
          Iniciar
        </Button>
      )}
      {phase === "timing" && (
        <Button
          size="lg"
          variant="danger"
          onClick={() => {
            timeRef.current = stop();
            setPhase("confirm");
          }}
        >
          Parar
        </Button>
      )}
      {phase === "confirm" && status === "answering" && (
        <div className="flex flex-col gap-3">
          <p className="font-semibold">O cubo ficou resolvido?</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => resolve(false)}>
              Não
            </Button>
            <Button
              onClick={() => {
                addSolve({ ms: timeRef.current, scramble: invertAlg(alg), caseId });
                resolve(true);
              }}
            >
              Sim, resolvi
            </Button>
          </div>
        </div>
      )}
    </ExerciseLayout>
  );
}
