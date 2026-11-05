"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { CubePoster } from "./CubePoster";
import type { CubeSpec } from "./TwistyCube";

const TwistyCube = dynamic(() => import("./TwistyCube").then((m) => m.TwistyCube), { ssr: false });

const START_DELAY_MS = 2500;
/** Cobre as linhas visíveis em telas grandes e evita carregar a página inteira de uma vez. */
const MAX_ACTIVE = 12;

let active = 0;
const waiting = new Set<() => void>();

/** Reserva uma vaga, ou entra na fila. A função devolvida libera a vaga. */
function requestSlot(grant: () => void) {
  let holding = false;
  const take = () => {
    waiting.delete(take);
    active++;
    holding = true;
    grant();
  };
  if (active < MAX_ACTIVE) take();
  else waiting.add(take);

  return () => {
    waiting.delete(take);
    if (!holding) return;
    active--;
    waiting.values().next().value?.();
  };
}

/**
 * Cubo para listas longas de animações: espera a abertura da página, só existe
 * enquanto está na tela e respeita um limite de cubos ativos ao mesmo tempo.
 */
export function QueuedCube(props: CubeSpec) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [waited, setWaited] = useState(false);
  const [granted, setGranted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setWaited(true), START_DELAY_MS);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "100px" });
    if (ref.current) observer.observe(ref.current);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!visible || !waited) return;
    const release = requestSlot(() => setGranted(true));
    return () => {
      release();
      setGranted(false);
      setLoaded(false);
    };
  }, [visible, waited]);

  return (
    <div ref={ref} className="relative aspect-square w-full">
      <CubePoster hidden={loaded} />
      {granted && <TwistyCube {...props} className="absolute inset-0" onReady={() => setLoaded(true)} />}
    </div>
  );
}
