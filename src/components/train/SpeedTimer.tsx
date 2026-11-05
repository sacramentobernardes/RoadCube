"use client";

import { useEffect, useRef, useState } from "react";
import { formatTime } from "@/lib/dates";
import { useRoadCube } from "@/lib/store";
import { useStopwatch } from "@/lib/use-stopwatch";
import { cn } from "@/lib/cn";

const HOLD_MS = 300;

type Phase = "idle" | "holding" | "ready" | "running";

/**
 * Timer de speedcubing: segure espaço (ou toque e segure) até ficar verde,
 * solte para iniciar; qualquer tecla/toque para.
 */
export function SpeedTimer({ onSolve, disabled }: { onSolve: (ms: number) => void; disabled?: boolean }) {
  const { elapsed, start, stop } = useStopwatch();
  const hideTimer = useRoadCube((s) => s.settings.hideTimer);
  const [phase, setPhaseState] = useState<Phase>("idle");
  const holdTimer = useRef<number | undefined>(undefined);
  const phaseRef = useRef<Phase>("idle");
  const onSolveRef = useRef(onSolve);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onSolveRef.current = onSolve;
  }, [onSolve]);

  useEffect(() => {
    function setPhase(p: Phase) {
      phaseRef.current = p;
      setPhaseState(p);
    }
    function press() {
      if (disabled) return;
      const p = phaseRef.current;
      if (p === "running") {
        onSolveRef.current(stop());
        setPhase("idle");
      } else if (p === "idle") {
        setPhase("holding");
        holdTimer.current = window.setTimeout(() => setPhase("ready"), HOLD_MS);
      }
    }
    function release() {
      const p = phaseRef.current;
      window.clearTimeout(holdTimer.current);
      if (p === "ready") {
        start();
        setPhase("running");
      } else if (p === "holding") {
        setPhase("idle");
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === "Space" || phaseRef.current === "running") {
        if (e.target instanceof HTMLInputElement) return;
        e.preventDefault();
        press();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") release();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    const el = panelRef.current;
    el?.addEventListener("pointerdown", press);
    el?.addEventListener("pointerup", release);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      el?.removeEventListener("pointerdown", press);
      el?.removeEventListener("pointerup", release);
    };
  }, [disabled, start, stop]);

  return (
    <div
      ref={panelRef}
      className={cn(
        "flex cursor-pointer touch-none flex-col justify-center border-y border-border py-10 select-none",
        phase === "running" && "fixed inset-0 z-50 items-center border-0 bg-bg",
      )}
    >
      <div
        className={cn(
          "font-mono text-7xl font-medium tracking-tight tabular-nums transition-colors sm:text-8xl",
          phase === "holding" && "text-cube-red",
          phase === "ready" && "text-cube-green",
        )}
      >
        {phase === "running" && hideTimer ? "···" : formatTime(elapsed)}
      </div>
      <p className="mt-4 font-mono text-xs tracking-wide text-muted uppercase">
        {phase === "running"
          ? "toque ou aperte qualquer tecla para parar"
          : phase === "ready"
            ? "solte para começar"
            : "segure espaço (ou toque e segure) · solte para iniciar"}
      </p>
    </div>
  );
}
