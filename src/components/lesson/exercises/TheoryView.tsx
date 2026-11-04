"use client";

import { AlgDisplay } from "@/components/cube/AlgDisplay";
import { ExerciseLayout, LessonCube } from "../ExerciseLayout";
import type { ExerciseProps } from "../types";

export function TheoryView({ exercise }: ExerciseProps<"theory">) {
  return (
    <ExerciseLayout
      kicker="Novo conceito"
      title={exercise.title}
      cube={exercise.cube && <LessonCube spec={exercise.cube} title={exercise.alg ? "algoritmo.alg" : "exemplo.alg"} label="em loop" />}
    >
      {exercise.alg && <AlgDisplay alg={exercise.alg} />}
      <div className="flex max-w-[65ch] flex-col gap-4 text-lg leading-relaxed text-muted">
        {exercise.body.map((p, i) => (
          <p key={i} className={i === 0 ? "text-text" : undefined}>
            {p}
          </p>
        ))}
      </div>
    </ExerciseLayout>
  );
}
