"use client";

import { Moon, Sun } from "lucide-react";
import { setTheme, useIsDark } from "@/lib/theme";

export function ThemeToggle() {
  const dark = useIsDark();
  return (
    <button
      type="button"
      aria-label={dark ? "Usar tema claro" : "Usar tema escuro"}
      title={dark ? "Usar tema claro" : "Usar tema escuro"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="grid size-8 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-text"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
