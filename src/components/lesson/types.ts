import type { Exercise } from "@/lib/exercises";

export type Status = "answering" | "correct" | "wrong";

export interface ExerciseProps<K extends Exercise["kind"]> {
  exercise: Extract<Exercise, { kind: K }>;
  status: Status;
  /** Registra a função que confere a resposta atual (null = ainda sem resposta). */
  setChecker: (check: (() => boolean) | null) => void;
  /** Para exercícios que decidem o resultado sozinhos (ex.: desafio cronometrado). */
  resolve: (correct: boolean) => void;
}
