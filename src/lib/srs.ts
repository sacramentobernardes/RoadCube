import { addDays } from "./dates";

// Repetição espaçada baseada no SM-2 (simplificado para 4 botões).

export interface SrsCard {
  caseId: string;
  ease: number;
  /** Intervalo atual em dias. */
  interval: number;
  reps: number;
  lapses: number;
  due: string;
  lastReviewed?: string;
}

export type Grade = "again" | "hard" | "good" | "easy";

export const GRADE_LABELS: Record<Grade, string> = {
  again: "Errei",
  hard: "Difícil",
  good: "Bom",
  easy: "Fácil",
};

export function newCard(caseId: string, today: string): SrsCard {
  return { caseId, ease: 2.5, interval: 0, reps: 0, lapses: 0, due: today };
}

export function reviewCard(card: SrsCard, grade: Grade, today: string): SrsCard {
  let { ease, interval, reps, lapses } = card;
  if (grade === "again") {
    lapses++;
    reps = 0;
    interval = 0;
    ease = Math.max(1.3, ease - 0.2);
  } else {
    reps++;
    const q = grade === "hard" ? 3 : grade === "good" ? 4 : 5;
    ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    if (reps === 1) interval = grade === "easy" ? 3 : 1;
    else if (reps === 2) interval = grade === "hard" ? 3 : 6;
    else interval = Math.round(interval * ease * (grade === "hard" ? 0.6 : grade === "easy" ? 1.3 : 1));
  }
  return { ...card, ease, interval, reps, lapses, due: addDays(today, interval), lastReviewed: today };
}

export function isDue(card: SrsCard, today: string) {
  return card.due <= today;
}
