"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startRef = useRef(0);
  const frame = useRef<number | null>(null);

  const start = useCallback(() => {
    const tick = () => {
      setElapsed(performance.now() - startRef.current);
      frame.current = requestAnimationFrame(tick);
    };
    startRef.current = performance.now();
    setElapsed(0);
    setRunning(true);
    frame.current = requestAnimationFrame(tick);
  }, []);

  const stop = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    const ms = performance.now() - startRef.current;
    setElapsed(ms);
    setRunning(false);
    return ms;
  }, []);

  const reset = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    setElapsed(0);
    setRunning(false);
  }, []);

  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
  }, []);

  return { elapsed, running, start, stop, reset };
}
