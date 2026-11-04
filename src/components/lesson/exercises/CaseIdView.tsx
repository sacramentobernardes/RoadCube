"use client";

import { useCallback, useState } from "react";
import { getCase } from "@/data/algorithms";
import { caseCube } from "@/lib/exercises";
import { ExerciseLayout, LessonCube } from "../ExerciseLayout";
import type { ExerciseProps } from "../types";
import { OptionList } from "./OptionList";

export function CaseIdView({ exercise, status, setChecker }: ExerciseProps<"case-id">) {
  const [selected, setSelected] = useState<number | null>(null);
  const answer = exercise.options.indexOf(exercise.caseId);

  const select = useCallback(
    (i: number) => {
      setSelected(i);
      setChecker(() => i === answer);
    },
    [answer, setChecker],
  );

  return (
    <ExerciseLayout
      kicker="Reconhecimento"
      title={exercise.prompt}
      cube={<LessonCube spec={caseCube(exercise.caseId)} title="caso-desconhecido.alg" label="2 lados visíveis" />}
    >
      <OptionList
        options={exercise.options.map((id) => getCase(id).name)}
        selected={selected}
        onSelect={select}
        status={status}
        answer={answer}
      />
    </ExerciseLayout>
  );
}
