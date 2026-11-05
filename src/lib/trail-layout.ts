import type { Lesson, Module } from "@/data/curriculum";

// Geometria do trecho de estrada de um módulo. A estrada vai e volta pela
// largura disponível, e a direção alterna a cada linha.

/** Distância dos nós à borda; deixa espaço para a curva de retorno. */
const EDGE = 84;
const MIN_SPACING = 90;
const MAX_PER_ROW = 7;
const ROW_HEIGHT = 150;
const TOP = 52;
const BOTTOM = 96;
/** Quanto os nós sobem e descem, para a estrada ondular. */
const WAVE = 12;
const TURN = 100;

export interface MapNode {
  lesson: Lesson;
  x: number;
  y: number;
  labelWidth: number;
}

export interface MapSegment {
  /** Lição a que este trecho leva: ele acende quando ela é alcançada. */
  to: string;
  d: string;
}

export interface ModuleLayout {
  nodes: MapNode[];
  segments: MapSegment[];
  height: number;
}

/** Divide em linhas de tamanho parecido, para não sobrar um nó sozinho. */
function splitRows<T>(items: T[], perRow: number): T[][] {
  const count = Math.ceil(items.length / perRow);
  const rows: T[][] = [];
  let start = 0;
  for (let i = 0; i < count; i++) {
    const size = Math.ceil((items.length - start) / (count - i));
    rows.push(items.slice(start, start + size));
    start += size;
  }
  return rows;
}

const round = (n: number) => Math.round(n * 10) / 10;

export function layoutModule(module: Module, width: number): ModuleLayout {
  const span = Math.max(0, width - EDGE * 2);
  const perRow = Math.max(2, Math.min(MAX_PER_ROW, Math.floor(span / MIN_SPACING) + 1));
  const rows = splitRows(module.lessons, perRow);

  const nodes: MapNode[] = [];
  rows.forEach((lessons, row) => {
    const y = TOP + row * ROW_HEIGHT;
    const spacing = lessons.length > 1 ? span / (lessons.length - 1) : 0;
    lessons.forEach((lesson, i) => {
      const offset = i * spacing;
      nodes.push({
        lesson,
        x: round(row % 2 === 0 ? EDGE + offset : EDGE + span - offset),
        y: round(y + (i % 2 === 0 ? -WAVE : WAVE)),
        labelWidth: Math.min(124, Math.max(84, spacing - 8)),
      });
    });
  });

  const segments = nodes.slice(1).map((to, i) => {
    const from = nodes[i];
    const isTurn = Math.abs(from.x - to.x) < 1;
    // Na borda, a estrada faz um retorno para fora; nas retas, ondula entre os nós.
    const bend = from.x < width / 2 ? -TURN : TURN;
    const half = (to.x - from.x) / 2;
    const d = isTurn
      ? `M${from.x} ${from.y}C${from.x + bend} ${from.y} ${to.x + bend} ${to.y} ${to.x} ${to.y}`
      : `M${from.x} ${from.y}C${round(from.x + half)} ${from.y} ${round(to.x - half)} ${to.y} ${to.x} ${to.y}`;
    return { to: to.lesson.id, d };
  });

  return { nodes, segments, height: TOP + (rows.length - 1) * ROW_HEIGHT + BOTTOM };
}
