"use client";

import { useEffect, useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { shuffle } from "@/lib/random";
import { sfx } from "@/lib/sfx";
import { cn } from "@/lib/cn";
import { ExerciseLayout, LessonCube } from "../ExerciseLayout";
import type { ExerciseProps } from "../types";

interface Token {
  id: number;
  move: string;
}

const CHIP = "h-11 min-w-12 rounded-md border border-border bg-surface px-3 font-mono text-lg font-medium transition hover:border-text/40";

/** Montagem de algoritmo: toque nos blocos na ordem certa. */
export function BuildView({ exercise, status, setChecker }: ExerciseProps<"build">) {
  const [bank] = useState<Token[]>(() =>
    shuffle([...exercise.solution, ...exercise.distractors]).map((move, id) => ({ id, move })),
  );
  const [picked, setPicked] = useState<number[]>([]);
  const locked = status !== "answering";

  useEffect(() => {
    if (picked.length === 0) {
      setChecker(null);
      return;
    }
    const answer = picked.map((id) => bank[id].move).join(" ");
    setChecker(() => answer === exercise.solution.join(" "));
  }, [picked, bank, exercise.solution, setChecker]);

  function toggle(id: number) {
    if (locked) return;
    sfx.tap();
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  return (
    <ExerciseLayout
      kicker="Monte o algoritmo"
      title={exercise.prompt}
      cube={exercise.cube && <LessonCube spec={exercise.cube} title="resolva-este.alg" label={exercise.cube.loop ? "em loop" : "caso"} />}
    >
      <LayoutGroup>
        <div
          className={cn(
            "flex min-h-[72px] flex-wrap items-center gap-2 rounded-md border border-dashed bg-surface/60 p-3",
            status === "answering" && "border-border",
            status === "correct" && "border-solid border-cube-green",
            status === "wrong" && "border-solid border-cube-red",
          )}
        >
          {exercise.given.map((move, i) => (
            <span key={`g${i}`} className="px-1 font-mono text-lg text-muted">
              {move}
            </span>
          ))}
          {picked.length === 0 && exercise.given.length === 0 && (
            <span className="px-1 font-mono text-sm text-muted">toque nos movimentos abaixo, em ordem</span>
          )}
          {picked.map((id) => (
            <motion.button layoutId={`tok-${id}`} key={id} type="button" onClick={() => toggle(id)} className={CHIP}>
              {bank[id].move}
            </motion.button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {bank.map((token) =>
            picked.includes(token.id) ? (
              <span key={token.id} className="h-11 min-w-12 rounded-md bg-surface-2 px-3 font-mono text-lg text-transparent">
                {token.move}
              </span>
            ) : (
              <motion.button
                layoutId={`tok-${token.id}`}
                key={token.id}
                type="button"
                disabled={locked}
                onClick={() => toggle(token.id)}
                className={CHIP}
              >
                {token.move}
              </motion.button>
            ),
          )}
        </div>
      </LayoutGroup>
    </ExerciseLayout>
  );
}
