import type { Solve } from "./store";

const value = (s: Solve) => (s.dnf ? Infinity : s.ms);

/** Média de N no padrão WCA: descarta o melhor e o pior; mais de um DNF = DNF. */
export function averageOf(solves: Solve[], n: number): number | null {
  if (solves.length < n) return null;
  const times = solves.slice(0, n).map(value).sort((a, b) => a - b);
  const trimmed = times.slice(1, -1);
  if (trimmed.some((t) => t === Infinity)) return Infinity;
  return trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
}

export function bestTime(solves: Solve[]): number | null {
  const valid = solves.filter((s) => !s.dnf);
  return valid.length ? Math.min(...valid.map((s) => s.ms)) : null;
}

export function meanTime(solves: Solve[]): number | null {
  const valid = solves.filter((s) => !s.dnf);
  return valid.length ? valid.reduce((a, s) => a + s.ms, 0) / valid.length : null;
}
