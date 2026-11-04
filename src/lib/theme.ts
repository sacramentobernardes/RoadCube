"use client";

import { useSyncExternalStore } from "react";

// A escolha fica neste aparelho. O script em app/layout.tsx aplica o tema antes
// da primeira pintura, para a tela não piscar na cor errada.

export type Theme = "system" | "light" | "dark";

const KEY = "roadcube-theme";
const listeners = new Set<() => void>();

function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
}

const systemDark = () => window.matchMedia("(prefers-color-scheme: dark)");

function readIsDark() {
  const theme = readTheme();
  return theme === "dark" || (theme === "system" && systemDark().matches);
}

function subscribe(listener: () => void) {
  const media = systemDark();
  listeners.add(listener);
  media.addEventListener("change", listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", listener);
    window.removeEventListener("storage", listener);
  };
}

export function setTheme(theme: Theme) {
  try {
    if (theme === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, theme);
  } catch {
    // Sem armazenamento, o tema vale só até recarregar a página.
  }
  if (theme === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
  listeners.forEach((listener) => listener());
}

export const useTheme = () => useSyncExternalStore(subscribe, readTheme, () => "system" as Theme);
export const useIsDark = () => useSyncExternalStore(subscribe, readIsDark, () => false);
