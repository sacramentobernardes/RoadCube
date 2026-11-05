"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { BookOpen, Repeat, Route, Timer, User } from "lucide-react";
import { useRoadCube } from "@/lib/store";
import { useDueCount } from "@/lib/use-due-count";
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";
import { Avatar } from "./Avatar";
import { StatsPills } from "./StatsPills";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/", label: "Aprender", icon: Route },
  { href: "/train", label: "Treinar", icon: Timer },
  { href: "/review", label: "Revisão", icon: Repeat },
  { href: "/library", label: "Biblioteca", icon: BookOpen },
  { href: "/profile", label: "Perfil", icon: User },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hydrated = useRoadCube((s) => s.ready);
  const syncFailed = useRoadCube((s) => s.syncStatus === "error");
  const syncHearts = useRoadCube((s) => s.syncHearts);
  const name = useRoadCube((s) => s.profile?.name);
  const avatar = useRoadCube((s) => s.settings.avatar);
  const due = useDueCount();

  useEffect(() => {
    if (!hydrated) return;
    syncHearts();
    const id = window.setInterval(syncHearts, 30_000);
    return () => window.clearInterval(id);
  }, [hydrated, syncHearts]);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur">
        <div className="page-width flex h-14 items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.slice(0, 4).map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative text-sm font-medium transition",
                  isActive(pathname, href) ? "text-text" : "text-muted hover:text-text",
                )}
              >
                {label}
                {href === "/review" && hydrated && due > 0 && (
                  <span className="absolute -top-1.5 -right-3 size-1.5 rounded-full bg-cube-red" aria-label="Revisão pendente" />
                )}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-5">
            {syncFailed && (
              <span className="hidden font-mono text-xs text-cube-red sm:block" role="status">
                não salvo · tentando de novo
              </span>
            )}
            {hydrated && <StatsPills />}
            <ThemeToggle />
            <Link href="/profile" aria-label="Perfil" className="hidden md:block">
              <Avatar
                value={hydrated ? avatar : null}
                name={hydrated ? name : undefined}
                className={cn("size-8 text-sm", isActive(pathname, "/profile") && "border-ink")}
              />
            </Link>
          </div>
        </div>
      </header>

      <main className="page-width pt-10 pb-28 md:pb-16">
        {hydrated ? children : <div className="h-96 animate-pulse rounded-lg bg-surface-2" />}
      </main>

      {/* Navegação inferior (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 font-mono text-[10px] tracking-wide uppercase",
              isActive(pathname, href) ? "text-text" : "text-muted",
            )}
          >
            <Icon className="size-5" strokeWidth={isActive(pathname, href) ? 2.4 : 1.8} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
