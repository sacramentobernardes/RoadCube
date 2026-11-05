"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { CubePoster } from "./CubePoster";
import type { CubeSpec } from "./TwistyCube";

const TwistyCube = dynamic(() => import("./TwistyCube").then((m) => m.TwistyCube), { ssr: false });

const START_DELAY_MS = 2500;

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
