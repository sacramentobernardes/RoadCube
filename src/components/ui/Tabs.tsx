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
    // Com muitas abas, a linha rola sozinha em vez de alargar a página no celular.
    <div className={cn("overflow-x-auto [scrollbar-width:none]", className)}>
      <div
        role="tablist"
        className="flex w-max min-w-full gap-6 border-b border-border"
      >
        {items.map((item) => (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={value === item.value}
            onClick={() => onChange(item.value)}
            className={cn(
              "-mb-px shrink-0 border-b-2 pb-2.5 text-[15px] font-semibold whitespace-nowrap transition",
              value === item.value
                ? "border-ink text-text"
                : "border-transparent text-muted hover:text-text",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
