import { cn } from "@/lib/cn";

/** Rótulo em mono maiúsculo, ex.: "MÓDULO 02 · MÉTODO BÁSICO". */
export function Kicker({ children, color, className }: { children: React.ReactNode; color?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 font-mono text-xs tracking-wider text-muted uppercase", className)}>
      {color && <span className="size-2.5 rounded-[2px]" style={{ background: color }} aria-hidden />}
      {children}
    </div>
  );
}
