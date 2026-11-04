"use client";

import { cn } from "@/lib/cn";

/** Abas sublinhadas, estilo editorial. */
export function Tabs<T extends string>({
  value,
  onChange,
  items,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { value: T; label: string }[];
  className?: string;
}) {
  return (
    <div role="tablist" className={cn("flex gap-6 border-b border-border", className)}>
      {items.map((item) => (
        <button
          key={item.value}
          role="tab"
          type="button"
          aria-selected={value === item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            "-mb-px border-b-2 pb-2.5 text-[15px] font-semibold transition",
            value === item.value ? "border-ink text-text" : "border-transparent text-muted hover:text-text",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
