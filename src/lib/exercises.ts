import type { CubeSpec } from "@/components/cube/TwistyCube";
import { getCase, casesBySet } from "@/data/algorithms";
import { distractorsFor, tokenize } from "./alg";
import { seededRandom, shuffle } from "./random";

export type Exercise =
  | { kind: "theory"; title: string; body: string[]; cube?: CubeSpec; alg?: string }
  | { kind: "choice"; prompt: string; cube?: CubeSpec; options: string[]; answer: number; explanation?: string }
  | { kind: "case-id"; prompt: string; caseId: string; options: string[] }
  | { kind: "build"; prompt: string; cube?: CubeSpec; given: string[]; solution: string[]; distractors: string[] }
  | { kind: "execute"; prompt: string; caseId: string };

export type ExerciseKind = Exercise["kind"];

/** Exercícios de prática que tiram vida quando errados. */
export function isGraded(ex: Exercise) {
  return ex.kind !== "theory";
}

const MAX_BUILD_TOKENS = 8;

function hash(text: string) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

export function caseCube(caseId: string, extra: Partial<CubeSpec> = {}): CubeSpec {
  const c = getCase(caseId);
  return { alg: c.algs[0], anchor: "end", view: c.view, ...extra };
}

export function theory(title: string, body: string[], cube?: CubeSpec): Exercise {
  return { kind: "theory", title, body, cube };
}

export function choice(
  prompt: string,
  options: string[],
  answer: number,
  extra: { cube?: CubeSpec; explanation?: string } = {},
): Exercise {
  return { kind: "choice", prompt, options, answer, ...extra };
}

/** "Qual movimento é este?" com o cubo animando o movimento em loop. */
export function moveQuiz(move: string, options: string[], explanation?: string): Exercise {
  const shuffled = shuffle([move, ...options], seededRandom(hash(move + options.join())));
  return choice("Qual movimento é este?", shuffled, shuffled.indexOf(move), {
    cube: { alg: move, autoplay: true, loop: true },
    explanation,
  });
}

/** "Monte a sequência que você vê" com a animação em loop. */
export function buildFromAnimation(alg: string, distractors: string[]): Exercise {
  return {
    kind: "build",
    prompt: "Monte a sequência que o cubo está executando",
    cube: { alg, autoplay: true, loop: true },
    given: [],
    solution: tokenize(alg),
    distractors,
  };
}

export function introCase(caseId: string): Exercise {
  const c = getCase(caseId);
  return {
    kind: "theory",
    title: c.name,
    body: [c.recognition],
    alg: c.algs[0],
    cube: caseCube(caseId, { controls: true, autoplay: true, loop: true }),
  };
}

export function caseIdQuiz(caseId: string, pool: string[]): Exercise | null {
  const others = pool.filter((id) => id !== caseId);
  if (others.length === 0) return null;
  const rand = seededRandom(hash(`id:${caseId}`));
  const options = shuffle([caseId, ...shuffle(others, rand).slice(0, 3)], rand);
  return { kind: "case-id", prompt: "Qual é este caso?", caseId, options };
}

/** Montagem do algoritmo; em algoritmos longos, o início é dado e o usuário completa o final. */
export function buildForCase(caseId: string): Exercise {
  const c = getCase(caseId);
  const tokens = tokenize(c.algs[0]);
  const split = Math.max(0, tokens.length - MAX_BUILD_TOKENS);
  const solution = tokens.slice(split);
  return {
    kind: "build",
    prompt: split > 0 ? `Complete o algoritmo do caso ${c.name}` : `Monte o algoritmo do caso ${c.name}`,
    cube: caseCube(caseId),
    given: tokens.slice(0, split),
    solution,
    distractors: distractorsFor(solution, 3, seededRandom(hash(`build:${caseId}`))),
  };
}

export function executeCase(caseId: string): Exercise {
  return {
    kind: "execute",
    prompt: `Desafio: resolva o caso ${getCase(caseId).name}`,
    caseId,
  };
}

/**
 * Lição padrão de algoritmos: apresenta cada caso, pede a montagem, mistura
 * quizzes de identificação e termina com um desafio cronometrado.
 */
export function algorithmLessonExercises(caseIds: string[], intro: Exercise[] = []): Exercise[] {
  const set = getCase(caseIds[0]).set;
  const pool = caseIds.length >= 3 ? caseIds : [...new Set([...caseIds, ...casesBySet(set).map((c) => c.id)])];
  const quizzes = caseIds.map((id) => caseIdQuiz(id, pool)).filter((e): e is Exercise => e !== null);
  const rand = seededRandom(hash(caseIds.join()));
  return [
    ...intro,
    ...caseIds.flatMap((id) => [introCase(id), buildForCase(id)]),
    ...shuffle(quizzes, rand),
    executeCase(caseIds[caseIds.length - 1]),
  ];
}
