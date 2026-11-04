"use client";

import { useEffect, useRef, useState } from "react";
import { TwistyCube, type CubeSpec } from "./TwistyCube";

/**
 * Só cria o cubo 3D quando ele está visível. O navegador limita o número de
 * contextos WebGL simultâneos, então listas longas precisam disso.
 */
export function LazyCube(props: CubeSpec & { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "100px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="aspect-square w-full">
      {visible && <TwistyCube {...props} />}
    </div>
  );
}
