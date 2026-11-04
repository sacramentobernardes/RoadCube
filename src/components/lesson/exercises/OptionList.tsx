"use client";

import { useEffect } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Status } from "../types";

/** Alternativas em linhas com atalho de teclado (1–9). */
export function OptionList({
  options,
  selected,
  onSelect,
  status,
  answer,
  mono,
}: {
  options: string[];
  selected: number | null;
  onSelect: (i: number) => void;
  status: Status;
  answer: number;
  mono?: boolean;
}) {
  const locked = status !== "answering";

  useEffect(() => {
    if (locked) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= options.length) onSelect(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [locked, options.length, onSelect]);

  const compact = mono && options.length > 2;

  return (
    <div className={cn("grid max-w-3xl gap-2", compact && "grid-cols-2")}>
      {options.map((option, i) => {
        const isSelected = selected === i;
        const showCorrect = locked && i === answer;
        const showWrong = locked && isSelected && i !== answer;
        return (
          <button
            key={i}
            type="button"
            disabled={locked}
            onClick={() => onSelect(i)}
            className={cn(
              "flex items-center gap-4 rounded-md border bg-surface px-4 py-3.5 text-left transition",
              !locked && "hover:border-text/40",
              isSelected && !locked && "border-ink ring-1 ring-ink",
              !isSelected && !showCorrect && !showWrong && "border-border",
              showCorrect && "border-cube-green bg-cube-green/8 ring-1 ring-cube-green",
              showWrong && "border-cube-red bg-cube-red/8 ring-1 ring-cube-red",
            )}
          >
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded border font-mono text-[11px] text-muted",
                isSelected && !locked ? "border-ink bg-ink text-ink-contrast" : "border-border",
                showCorrect && "border-cube-green bg-cube-green text-white",
                showWrong && "border-cube-red bg-cube-red text-white",
              )}
            >
              {showCorrect ? <Check className="size-3.5" strokeWidth={3} /> : showWrong ? <X className="size-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn("font-medium", mono && "font-mono text-lg")}>{option}</span>
          </button>
        );
      })}
    </div>
  );
}
