import type { KPuzzle } from "cubing/kpuzzle";
import { invertAlg } from "./alg";
import { AUFS } from "./scramble";

let kpuzzlePromise: Promise<KPuzzle> | null = null;

function loadKPuzzle() {
  kpuzzlePromise ??= import("cubing/puzzles").then(({ cube3x3x3 }) => cube3x3x3.kpuzzle());
  return kpuzzlePromise;
}

/**
 * Verifica se `moves`, aplicados ao caso resolvido por `caseAlg`, deixam o cubo
 * resolvido (aceitando um ajuste final da camada de cima e rotações do cubo).
 */
export async function solvesCase(caseAlg: string, moves: string): Promise<boolean> {
  const kpuzzle = await loadKPuzzle();
  const state = kpuzzle.defaultPattern().applyAlg(invertAlg(caseAlg)).applyAlg(moves);
  return AUFS.some((auf) =>
    state.applyAlg(auf).experimentalIsSolved({ ignorePuzzleOrientation: true, ignoreCenterOrientation: true }),
  );
}
