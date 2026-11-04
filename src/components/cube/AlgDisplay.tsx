import { tokenize } from "@/lib/alg";
import { cn } from "@/lib/cn";

/** Algoritmo exibido como blocos de movimentos em mono. */
export function AlgDisplay({ alg, className, size = "md" }: { alg: string; className?: string; size?: "sm" | "md" }) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {tokenize(alg).map((move, i) => (
        <span
          key={i}
          className={cn(
            "rounded border border-border bg-surface font-mono font-medium",
            size === "md" ? "px-2.5 py-1 text-base" : "px-1.5 py-0.5 text-xs",
          )}
        >
          {move}
        </span>
      ))}
    </div>
  );
}
