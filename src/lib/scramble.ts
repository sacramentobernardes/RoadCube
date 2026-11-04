import { pick } from "./random";

const AXES: Record<string, number> = { U: 0, D: 0, R: 1, L: 1, F: 2, B: 2 };
const FACES = Object.keys(AXES);
const SUFFIXES = ["", "'", "2"];

/**
 * Scramble de movimentos aleatórios (estilo WCA): nunca repete a mesma face
 * em seguida nem gira três vezes o mesmo eixo, evitando sequências redundantes.
 */
export function randomScramble(length = 20, rand: () => number = Math.random): string {
  const moves: string[] = [];
  const faces: string[] = [];
  while (moves.length < length) {
    const face = pick(FACES, rand);
    const last = faces[faces.length - 1];
    const beforeLast = faces[faces.length - 2];
    if (face === last) continue;
    if (last && beforeLast && AXES[face] === AXES[last] && AXES[last] === AXES[beforeLast]) continue;
    faces.push(face);
    moves.push(face + pick(SUFFIXES, rand));
  }
  return moves.join(" ");
}

export const AUFS = ["", "U", "U'", "U2"] as const;
