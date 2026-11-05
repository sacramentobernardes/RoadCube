"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import type { TwistyPlayer } from "cubing/twisty";
import type { CubeView } from "@/data/algorithms";
import { CUBE_VIEWS } from "@/lib/cube-views";
import { applyCubeTheme } from "@/lib/cube-theme";
import { useRoadCube } from "@/lib/store";
import { cn } from "@/lib/cn";

const FULL_MASK = "EDGES:------------,CORNERS:--------,CENTERS:------";

export interface CubeSpec {
  alg?: string;
  /** Movimentos extras aplicados antes do `alg` (após a orientação da vista). */
  setup?: string;
  /** "end": o `alg` resolve o estado mostrado (ideal para exibir casos). */
  anchor?: "start" | "end";
  view?: CubeView;
  autoplay?: boolean;
  loop?: boolean;
  controls?: boolean;
  tempo?: number;
}

export interface TwistyCubeHandle {
  play(): void;
  pause(): void;
  jumpToStart(): void;
  jumpToEnd(): void;
  addMove(move: string): void;
}

interface Props extends CubeSpec {
  className?: string;
}

export const TwistyCube = forwardRef<TwistyCubeHandle, Props>(function TwistyCube(
  { alg = "", setup = "", anchor = "start", view = "full", autoplay, loop, controls, tempo = 1, className },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<TwistyPlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [themed, setThemed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const speed = useRoadCube((s) => s.settings.animationSpeed);

  useImperativeHandle(ref, () => ({
    play: () => playerRef.current?.play(),
    pause: () => playerRef.current?.pause(),
    jumpToStart: () => playerRef.current?.jumpToStart(),
    jumpToEnd: () => playerRef.current?.jumpToEnd(),
    addMove: (move) => playerRef.current?.experimentalAddMove(move),
  }));

  // O TwistyPlayer é um Web Component: só pode ser criado no navegador.
  useEffect(() => {
    let cancelled = false;
    let player: TwistyPlayer | null = null;
    import("cubing/twisty").then(({ TwistyPlayer }) => {
      if (cancelled || !containerRef.current) return;
      player = new TwistyPlayer({
        puzzle: "3x3x3",
        background: "none",
        hintFacelets: "none",
        visualization: "3D",
        controlPanel: "none",
      });
      player.style.width = "100%";
      player.style.height = "100%";
      containerRef.current.appendChild(player);
      playerRef.current = player;
      player.experimentalModel.coarseTimelineInfo.addFreshListener((info) => setPlaying(info.playing));
      setReady(true);
      applyCubeTheme(player).then(() => !cancelled && setThemed(true));
    });
    return () => {
      cancelled = true;
      player?.remove();
      playerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const config = CUBE_VIEWS[view];
    player.experimentalSetupAlg = `${config.setup} ${setup}`.trim();
    player.experimentalSetupAnchor = anchor;
    player.experimentalStickeringMaskOrbits = config.mask ?? FULL_MASK;
    player.alg = alg;
    player.tempoScale = tempo * speed;
    player.jumpToStart();
    if (!autoplay) return;

    const timer = window.setTimeout(() => player.play(), 400);
    if (!loop) return () => window.clearTimeout(timer);

    let restart: number | undefined;
    const onTimeline = (info: { playing: boolean; atEnd: boolean }) => {
      if (!info.playing && info.atEnd) {
        restart = window.setTimeout(() => {
          player.jumpToStart();
          player.play();
        }, 1200);
      }
    };
    player.experimentalModel.coarseTimelineInfo.addFreshListener(onTimeline);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(restart);
      player.experimentalModel.coarseTimelineInfo.removeFreshListener(onTimeline);
    };
  }, [ready, alg, setup, anchor, view, autoplay, loop, tempo, speed]);

  const cube = (
    <div
      ref={containerRef}
      className={cn("relative aspect-square w-full transition-opacity duration-300", themed ? "opacity-100" : "opacity-0", className)}
    />
  );
  if (!controls) return cube;

  const player = playerRef.current;
  const btn = "grid size-8 place-items-center rounded text-white/70 transition hover:bg-white/10 hover:text-white";
  return (
    <div>
      {cube}
      <div className="mt-2 flex items-center justify-center gap-1">
        <button type="button" aria-label="Início" className={btn} onClick={() => player?.jumpToStart()}>
          <SkipBack className="size-4" />
        </button>
        <button
          type="button"
          aria-label={playing ? "Pausar" : "Reproduzir"}
          className={cn(btn, "size-9 bg-white/10")}
          onClick={() => {
            if (!player) return;
            if (playing) player.pause();
            else {
              player.jumpToStart();
              player.play();
            }
          }}
        >
          {playing ? <Pause className="size-4" fill="currentColor" /> : <Play className="size-4" fill="currentColor" />}
        </button>
        <button type="button" aria-label="Fim" className={btn} onClick={() => player?.jumpToEnd()}>
          <SkipForward className="size-4" />
        </button>
      </div>
    </div>
  );
});
