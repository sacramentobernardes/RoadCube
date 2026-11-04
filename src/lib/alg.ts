import { Alg } from "cubing/alg";

export function tokenize(alg: string): string[] {
  return alg.trim().split(/\s+/).filter(Boolean);
}

export function invertAlg(alg: string): string {
  return new Alg(alg).invert().toString();
}

export function moveCount(alg: string): number {
  return tokenize(alg).filter((m) => !/^[xyz]/.test(m)).length;
}

/** Inverte um único movimento: R → R', R' → R, R2 → R2. */
export function invertMove(move: string): string {
  if (move.endsWith("2")) return move;
  return move.endsWith("'") ? move.slice(0, -1) : `${move}'`;
}

/** Movimentos parecidos que servem de "pegadinha" nos exercícios de montagem. */
export function distractorsFor(tokens: string[], count: number, rand: () => number): string[] {
  const present = new Set(tokens);
  const pool = new Set<string>();
  for (const t of tokens) {
    const base = t.replace(/['2]/g, "");
    for (const variant of [base, `${base}'`, `${base}2`]) {
      if (!present.has(variant)) pool.add(variant);
    }
  }
  for (const extra of ["R", "U", "F", "L", "R'", "U'", "F'", "L'"]) {
    if (!present.has(extra)) pool.add(extra);
  }
  const list = [...pool];
  const picked: string[] = [];
  while (picked.length < count && list.length) {
    picked.push(list.splice(Math.floor(rand() * list.length), 1)[0]);
  }
  return picked;
}
