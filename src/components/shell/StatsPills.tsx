"use client";

import { Flame, Heart, Zap } from "lucide-react";
import { useRoadCube, liveStreak } from "@/lib/store";
import { HEART_REGEN_MS, MAX_HEARTS } from "@/lib/gamification";
import { cn } from "@/lib/cn";

export function heartsTooltip(hearts: number, updatedAt: number) {
  if (hearts >= MAX_HEARTS) return "Vidas cheias";
  const mins = Math.max(1, Math.ceil((updatedAt + HEART_REGEN_MS - Date.now()) / 60000));
  return `+1 vida em ${mins} min`;
}

/** Ofensiva, XP e vidas em linha, com números em mono. */
export function StatsPills({ className }: { className?: string }) {
  const streak = useRoadCube((s) => liveStreak(s.streak));
  const xp = useRoadCube((s) => s.xp);
  const hearts = useRoadCube((s) => s.hearts);
  const heartsUpdatedAt = useRoadCube((s) => s.heartsUpdatedAt);

  return (
    <div className={cn("flex items-center gap-4 font-mono text-[13px] font-medium", className)}>
      <span className="flex items-center gap-1.5" title="Ofensiva (dias seguidos)">
        <Flame className={cn("size-4", streak ? "text-cube-orange" : "text-muted")} fill={streak ? "currentColor" : "none"} />
        {streak}
      </span>
      <span className="flex items-center gap-1.5" title="XP total">
        <Zap className="size-4 text-cube-yellow" fill="currentColor" />
        {xp}
      </span>
      <span className="flex items-center gap-1.5" title={heartsTooltip(hearts, heartsUpdatedAt)}>
        <Heart className="size-4 text-cube-red" fill="currentColor" />
        {hearts}
      </span>
    </div>
  );
}
