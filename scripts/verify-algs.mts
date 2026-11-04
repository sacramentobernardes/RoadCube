// Valida cada algoritmo da biblioteca simulando-o no cubo do cubing.js.
// Uso: npm run verify:algs
import { cube3x3x3 } from "cubing/puzzles";
import { Alg } from "cubing/alg";
import type { KPattern } from "cubing/kpuzzle";
import { ALG_CASES, type PreserveRule } from "../src/data/algorithms.ts";

// Índices das peças no kpuzzle 3x3x3 do cubing.js.
// EDGES:   UF UR UB UL DF DR DB DL FR FL BR BL
// CORNERS: UFR URB UBL ULF DRF DFL DLB DBR
const D_EDGES = [4, 5, 6, 7];
const D_CORNERS = [4, 5, 6, 7];
const SLOTS = {
  fr: { corner: 4, edge: 8 },
  fl: { corner: 5, edge: 9 },
  bl: { corner: 6, edge: 11 },
  br: { corner: 7, edge: 10 },
} as const;

type Required = { edges: number[]; corners: number[]; llOriented: boolean };

function requiredPieces(rule: PreserveRule): Required {
  const allSlots = Object.values(SLOTS);
  const slotsExcept = (skip: keyof typeof SLOTS) =>
    Object.entries(SLOTS).filter(([k]) => k !== skip).map(([, v]) => v);
  const cross = (skip: keyof typeof SLOTS): Required => {
    const slots = slotsExcept(skip);
    return {
      edges: [...D_EDGES, ...slots.map((s) => s.edge)],
      corners: slots.map((s) => s.corner),
      llOriented: false,
    };
  };
  switch (rule) {
    case "f2l":
      return {
        edges: [...D_EDGES, ...allSlots.map((s) => s.edge)],
        corners: D_CORNERS,
        llOriented: false,
      };
    case "d-layer":
      return { edges: D_EDGES, corners: D_CORNERS, llOriented: false };
    case "d-layer-but-dfr":
      return { edges: D_EDGES, corners: [5, 6, 7], llOriented: false };
    case "cross-but-fr":
      return cross("fr");
    case "cross-but-br":
      return cross("br");
    case "cross-but-bl":
      return cross("bl");
  }
}

function isFixed(p: KPattern, orbit: "EDGES" | "CORNERS", i: number) {
  const o = p.patternData[orbit];
  return o.pieces[i] === i && o.orientation[i] === 0;
}

function centersSolved(p: KPattern) {
  return p.patternData.CENTERS.pieces.every((v, i) => v === i);
}

function isIdentityUpToAUF(p: KPattern) {
  for (const auf of ["", "U", "U2", "U'"]) {
    if (p.applyAlg(auf).experimentalIsSolved({ ignorePuzzleOrientation: false, ignoreCenterOrientation: true })) {
      return true;
    }
  }
  return false;
}

const kpuzzle = await cube3x3x3.kpuzzle();
const solved = kpuzzle.defaultPattern();

// Confere a convenção de índices assumida acima.
const r = solved.applyAlg("R").patternData.EDGES.pieces;
const moved = r.map((v, i) => (v !== i ? i : -1)).filter((i) => i >= 0);
if (moved.join(",") !== "1,5,8,10") {
  throw new Error(`Convenção de índices inesperada: R move as arestas ${moved}`);
}

const AUFS = ["", "U", "U2", "U'"];
const ROTATIONS = ["", "x", "x2", "x'", "z", "z'"].flatMap((a) =>
  ["", "y", "y2", "y'"].map((b) => `${a} ${b}`.trim()),
);

/** Desfaz uma rotação final do cubo (ex.: algoritmos que usam y ou d). */
function normalize(p: KPattern): KPattern {
  for (const rot of ROTATIONS) {
    const q = p.applyAlg(rot);
    if (centersSolved(q)) return q;
  }
  return p;
}

/** Rotação a anexar ao algoritmo para que o cubo termine na orientação padrão. */
function closingRotation(alg: string): string {
  return ROTATIONS.find((rot) => centersSolved(solved.applyAlg(alg).applyAlg(rot))) ?? "";
}

/** Algoritmo que monta o caso resolvido por `alg`, já descontando rotações. */
const setupFor = (alg: string) => new Alg(`${alg} ${closingRotation(alg)}`).invert().toString();

/** OLL: só importa a orientação da última camada; PLL/F2L: o estado inteiro. */
function sameCase(a: KPattern, b: KPattern, orientationOnly: boolean) {
  if (!orientationOnly) return a.isIdentical(b);
  return (["EDGES", "CORNERS"] as const).every((orbit) =>
    [0, 1, 2, 3].every((i) => a.patternData[orbit].orientation[i] === b.patternData[orbit].orientation[i]),
  );
}

let failures = 0;
for (const c of ALG_CASES) {
  c.algs.forEach((alg, idx) => {
    const label = `${c.id} [${idx}] ${alg}`;
    const p = normalize(solved.applyAlg(alg));
    const req = requiredPieces(c.preserve);
    const problems: string[] = [];
    if (!centersSolved(p)) problems.push("rotação final inválida");
    for (const e of req.edges) if (!isFixed(p, "EDGES", e)) problems.push(`aresta ${e} alterada`);
    for (const k of req.corners) if (!isFixed(p, "CORNERS", k)) problems.push(`quina ${k} alterada`);
    if (isIdentityUpToAUF(p)) problems.push("algoritmo não faz nada (identidade)");
    if (problems.length) {
      failures++;
      console.log(`✗ ${label}
    ${problems.slice(0, 4).join("; ")}`);
    }
  });
}

// Alternativas do mesmo caso devem resolver o mesmo caso (a menos de AUF antes/depois).
for (const c of ALG_CASES) {
  if (c.algs.length < 2) continue;
  const orientationOnly = c.view === "oll";
  const baseCase = solved.applyAlg(setupFor(c.algs[0]));
  for (const alg of c.algs.slice(1)) {
    const setup = setupFor(alg);
    const same = AUFS.some((pre) =>
      AUFS.some((post) => sameCase(solved.applyAlg(`${pre} ${setup} ${post}`), baseCase, orientationOnly)),
    );
    if (!same) {
      failures++;
      console.log(`✗ ${c.id}: alternativa "${alg}" resolve um caso diferente de "${c.algs[0]}"`);
    }
  }
}

const total = ALG_CASES.reduce((n, c) => n + c.algs.length, 0);
console.log(`\n${total - failures}/${total} verificações OK`);
process.exit(failures ? 1 : 0);
