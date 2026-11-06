"use client";

import { useState, type ReactNode, type RefObject } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { TwistyCube, type TwistyCubeHandle } from "@/components/cube/TwistyCube";
import { useRoadCube } from "@/lib/store";
import { cn } from "@/lib/cn";

/** Velocidade 1× do scramble: 20 movimentos em cerca de 14 segundos. */
const BASE_TEMPO = 1.6;

const BUTTON = "grid size-9 place-items-center rounded text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-30";

/** Scramble em texto. Com `step`, marca o movimento atual e apaga os já feitos. */
export function ScrambleText({ moves, step }: { moves: string[]; step: number | null }) {
  return (
    <p className="mt-4 flex flex-wrap gap-x-2.5 gap-y-1 font-mono text-2xl leading-relaxed font-medium tracking-tight sm:text-3xl">
      {moves.map((move, i) => (
        <span
          key={i}
          aria-current={i === step ? "step" : undefined}
          className={cn(
            "rounded px-1 transition-colors",
            step !== null && i < step && "text-muted",
            i === step && "bg-ink text-ink-contrast",
          )}
        >
          {move}{" "}
        </span>
      ))}
    </p>
  );
}

function Control({ label, onPress, disabled, className, children }: { label: string; onPress: () => void; disabled?: boolean; className?: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className={cn(BUTTON, className)}
      onClick={(e) => {
        // Sem o foco no botão, o espaço continua sendo só do timer.
        e.currentTarget.blur();
        onPress();
      }}
    >
      {children}
    </button>
  );
}

/** Cubo que embaralha a partir do resolvido, com controles movimento a movimento. */
export function ScrambleCube({
  cube,
  scramble,
  total,
  step,
  onStep,
}: {
  cube: RefObject<TwistyCubeHandle | null>;
  scramble: string;
  total: number;
  step: number;
  onStep: (step: number) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const scrambleSpeed = useRoadCube((s) => s.settings.scrambleSpeed);
  const animationSpeed = useRoadCube((s) => s.settings.animationSpeed);
  const finished = step >= total;

  function togglePlay() {
    if (playing) return cube.current?.pause();
    if (finished) cube.current?.jumpToStart();
    cube.current?.play();
  }

  return (
    <div>
      {/* O cubo multiplica pela velocidade das animações; aqui vale só a do scramble. */}
      <TwistyCube ref={cube} alg={scramble} autoplay tempo={(BASE_TEMPO * scrambleSpeed) / animationSpeed} onMove={onStep} onPlaying={setPlaying} />
      <div className="mt-2 flex items-center justify-center gap-1">
        {/* Ficam ativos no início porque a pausa pode ter parado no meio do primeiro giro. */}
        <Control label="Voltar ao início" onPress={() => cube.current?.seekMove(0)}>
          <SkipBack className="size-4" />
        </Control>
        <Control label="Movimento anterior" onPress={() => cube.current?.seekMove(Math.max(step - 1, 0))}>
          <ChevronLeft className="size-5" />
        </Control>
        <Control label={playing ? "Pausar" : "Reproduzir"} className="bg-white/10" onPress={togglePlay}>
          {playing ? <Pause className="size-4" fill="currentColor" /> : <Play className="size-4" fill="currentColor" />}
        </Control>
        <Control label="Próximo movimento" disabled={finished} onPress={() => cube.current?.seekMove(step + 1)}>
          <ChevronRight className="size-5" />
        </Control>
        <Control label="Ir para o fim" disabled={finished} onPress={() => cube.current?.seekMove(total)}>
          <SkipForward className="size-4" />
        </Control>
      </div>
    </div>
  );
}
