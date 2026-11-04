"use client";

import { dayKey } from "./dates";
import { isDue } from "./srs";
import { useRoadCube } from "./store";

/** Quantos algoritmos estão com revisão pendente hoje. */
export function useDueCount() {
  return useRoadCube((s) => {
    const today = dayKey();
    return Object.values(s.srs).filter((c) => isDue(c, today)).length;
  });
}
