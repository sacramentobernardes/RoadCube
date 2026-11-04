import { cn } from "@/lib/cn";

/**
 * "Janela" que emoldura o cubo 3D: barra de título clara com nome em mono,
 * área escura com borda de destaque e etiquetas no rodapé.
 */
export function CubeFrame({
  title,
  accent = "var(--cube-green)",
  footerLeft,
  footerRight,
  children,
  className,
}: {
  title: string;
  accent?: string;
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-surface shadow-[0_12px_32px_-16px_rgb(0_0_0/0.35)]", className)}>
      <div className="flex items-center gap-3 px-3 py-2">
        <span className="flex gap-1.5" aria-hidden>
          <i className="size-2 rounded-full bg-border" />
          <i className="size-2 rounded-full bg-border" />
          <i className="size-2 rounded-full bg-border" />
        </span>
        <span className="truncate font-mono text-xs text-muted">{title}</span>
      </div>
      <div className="relative border-2 bg-frame" style={{ borderColor: accent }}>
        <div className="px-6 pt-4 pb-12">{children}</div>
        {(footerLeft || footerRight) && (
          <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
            <div>{footerLeft}</div>
            <div>{footerRight}</div>
          </div>
        )}
      </div>
    </div>
  );
}
