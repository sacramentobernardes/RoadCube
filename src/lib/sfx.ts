"use client";

import { useRoadCube } from "./store";

// Efeitos sonoros sintetizados com Web Audio (sem arquivos de áudio).

let ctx: AudioContext | null = null;

function tone(freqs: number[], duration = 0.12, type: OscillatorType = "sine") {
  if (typeof window === "undefined" || !useRoadCube.getState().settings.sound) return;
  ctx ??= new AudioContext();
  const start = ctx.currentTime;
  freqs.forEach((freq, i) => {
    const osc = ctx!.createOscillator();
    const gain = ctx!.createGain();
    const t = start + i * duration;
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.15, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(ctx!.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  });
}

export const sfx = {
  correct: () => tone([660, 880], 0.1),
  wrong: () => tone([220, 180], 0.14, "triangle"),
  complete: () => tone([523, 659, 784, 1047], 0.11),
  tap: () => tone([440], 0.04),
};
