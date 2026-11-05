"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { CubeSpec } from "./TwistyCube";

const TwistyCube = dynamic(() => import("./TwistyCube").then((m) => m.TwistyCube), { ssr: false });

const START_DELAY_MS = 2500;
const PIECES = [0, 1, 2];
const TOP = "#f2c230";
const LEFT = "#0f4a2b";
const RIGHT = "#6e3812";

/** Ponto de cada face em projeção isométrica: `u` e `v` vão de 0 a 3. */
const top = (u: number, v: number) => [100 + (u - v) * 26, 40 + (u + v) * 15];
const left = (u: number, v: number) => [22 + u * 26, 85 + u * 15 + v * 30];
const right = (u: number, v: number) => [178 - u * 26, 85 + u * 15 + v * 30];

function sticker(face: typeof top, u: number, v: number) {
  const gap = 0.07;
  const corners = [
    face(u + gap, v + gap),
    face(u + 1 - gap, v + gap),
    face(u + 1 - gap, v + 1 - gap),
    face(u + gap, v + 1 - gap),
  ];
  return corners.map((point) => point.join(",")).join(" ");
}

/** Imagem estática mostrada até o cubo 3D carregar. */
function CubePoster({ hidden }: { hidden: boolean }) {
  const faces = [
    { face: top, color: TOP },
    { face: left, color: LEFT },
    { face: right, color: RIGHT },
  ];
  return (
    <svg viewBox="-40 -10 280 280" aria-hidden className={cn("absolute inset-0 size-full transition-opacity duration-300", hidden && "opacity-0")}>
      {faces.map(({ face, color }) =>
        PIECES.flatMap((u) => PIECES.map((v) => <polygon key={`${color}${u}${v}`} points={sticker(face, u, v)} fill={color} />)),
      )}
    </svg>
  );
}

/**
 * Cubo decorativo: só carrega depois da abertura da página e quando está visível.
 * O cubo 3D é pesado e atrasaria o primeiro toque, principalmente no celular.
 */
export function DeferredCube(props: CubeSpec) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [waited, setWaited] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setWaited(true), START_DELAY_MS);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    });
    if (ref.current) observer.observe(ref.current);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="relative aspect-square w-full">
      <CubePoster hidden={loaded} />
      {visible && waited && <TwistyCube {...props} className="absolute inset-0" onReady={() => setLoaded(true)} />}
    </div>
  );
}
