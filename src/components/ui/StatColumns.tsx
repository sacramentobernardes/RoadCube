import { cn } from "@/lib/cn";

export interface Stat {
  kicker: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
}

/** Colunas separadas por linhas finas verticais; vira grade 2×2 no celular. */
export function StatColumns({ stats, className }: { stats: Stat[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-y-6 sm:flex sm:gap-y-0 sm:divide-x sm:divide-border", className)}>
      {stats.map((s, i) => (
        <div key={s.kicker} className={cn("min-w-0 sm:flex-1 sm:px-6", i === 0 && "sm:pl-0", i % 2 === 1 && "pl-4 sm:pl-6")}>
          <div className="truncate font-mono text-[11px] tracking-wider text-muted uppercase">{s.kicker}</div>
          <div className="mt-2 truncate text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">{s.value}</div>
          {s.detail && <div className="mt-1 truncate text-sm text-muted">{s.detail}</div>}
        </div>
      ))}
    </div>
  );
}
