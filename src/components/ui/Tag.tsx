import { cn } from "@/lib/cn";

type Tone = "green" | "red" | "blue" | "yellow" | "dark" | "outline";

const TONES: Record<Tone, string> = {
  green: "bg-cube-green text-white",
  red: "bg-cube-red text-white",
  blue: "bg-cube-blue text-white",
  yellow: "bg-cube-yellow text-black",
  dark: "bg-white/10 text-white border border-white/15",
  outline: "border border-border text-muted",
};

/** Etiqueta em mono, como "gatilho ligado" / "02 / 12". */
export function Tag({ tone = "outline", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-mono text-[11px] font-semibold whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
