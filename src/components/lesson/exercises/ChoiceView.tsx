"use client";

import { useCallback, useState } from "react";
import { ExerciseLayout, LessonCube } from "../ExerciseLayout";
import type { ExerciseProps } from "../types";
import { OptionList } from "./OptionList";

const NOTATION = /^[RLUDFBrludfbMESxyz]['2]?$/;

export function ChoiceView({ exercise, status, setChecker }: ExerciseProps<"choice">) {
  const [selected, setSelected] = useState<number | null>(null);
  const isMoveQuiz = exercise.options.every((o) => NOTATION.test(o));

  const select = useCallback(
    (i: number) => {
      setSelected(i);
      setChecker(() => i === exercise.answer);
    },
    [exercise.answer, setChecker],
  );

  return (
    <ExerciseLayout
      kicker={isMoveQuiz ? "Notação" : "Pergunta"}
      title={exercise.prompt}
      cube={exercise.cube && <LessonCube spec={exercise.cube} title={isMoveQuiz ? "movimento-misterioso.alg" : "observe.alg"} label={exercise.cube.loop ? "em loop" : undefined} />}
    >
      <OptionList
        options={exercise.options}
        selected={selected}
        onSelect={select}
        status={status}
        answer={exercise.answer}
        mono={isMoveQuiz}
      />
    </ExerciseLayout>
  );
}
