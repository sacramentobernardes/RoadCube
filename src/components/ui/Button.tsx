import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-ink-contrast hover:opacity-90",
  secondary: "border border-border bg-surface text-text hover:border-text/40",
  ghost: "text-muted hover:text-text hover:bg-surface-2",
  danger: "bg-cube-red text-white hover:opacity-90",
  success: "bg-cube-green text-white hover:opacity-90",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", block, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition active:translate-y-px",
        "disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cube-blue",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-11 px-5 text-[15px]",
        size === "lg" && "h-13 px-6 text-base",
        block && "w-full",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
});
