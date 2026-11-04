"use client";

import { useState } from "react";
import { Monitor, Moon, Pencil, Sun } from "lucide-react";
import { ALL_LESSONS, findLesson } from "@/data/curriculum";
import { addDays, dayKey, formatTime } from "@/lib/dates";
import { levelFromXp } from "@/lib/gamification";
import { averageOf, bestTime } from "@/lib/stats";
import { liveStreak, useRoadCube } from "@/lib/store";
import { flushUserData } from "@/lib/sync";
import { setTheme, useTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/cn";
import { deleteAccount, logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatColumns } from "@/components/ui/StatColumns";

const THEMES: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export function Profile() {
  const s = useRoadCube();
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(s.profile?.name ?? "");
  const level = levelFromXp(s.xp);
  const today = dayKey();
  const fullSolves = s.solves.filter((x) => !x.caseId);
  const lessonsDone = ALL_LESSONS.filter((l) => s.lessons[l.id]).length;
  const totalLessons = ALL_LESSONS.filter((l) => !l.comingSoon).length;
  const best = bestTime(fullSolves);
  const ao5 = averageOf(fullSolves, 5);

  const week = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(today, i - 6);
    const [y, m, d] = day.split("-").map(Number);
    return { day, label: WEEKDAYS[new Date(y, m - 1, d).getDay()], xp: s.dailyXp[day] ?? 0 };
  });
  const maxXp = Math.max(30, ...week.map((w) => w.xp));
  const weekTotal = week.reduce((a, w) => a + w.xp, 0);

  return (
    <div className="flex flex-col gap-14">
      <header>
        <Kicker color="var(--cube-yellow)">
          Perfil · {s.profile ? `desde ${new Date(s.profile.createdAt).toLocaleDateString("pt-BR")}` : "local"}
        </Kicker>
        {editing ? (
          <form
            className="mt-4 flex max-w-md items-center gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) s.setProfile(name.trim());
              setEditing(false);
            }}
          >
            <input
              autoFocus
              value={name}
              maxLength={30}
              onChange={(e) => setName(e.target.value)}
              className="min-w-0 flex-1 border-b-2 border-ink bg-transparent text-4xl font-bold tracking-[-0.04em] outline-none"
            />
            <Button size="sm" type="submit">
              Salvar
            </Button>
          </form>
        ) : (
          <h1 className="mt-4 flex items-center gap-3 text-5xl leading-[0.95] font-bold tracking-[-0.045em]">
            <span>
              {s.profile?.name ?? "Cubista anônimo"}
              <span className="text-cube-red">.</span>
            </span>
            <button type="button" aria-label="Editar nome" onClick={() => setEditing(true)} className="text-muted hover:text-text">
              <Pencil className="size-4" />
            </button>
          </h1>
        )}
        <div className="mt-8 flex max-w-md items-center gap-4">
          <span className="shrink-0 font-mono text-sm">nível {level.level}</span>
          <ProgressBar value={level.progress} color="var(--cube-yellow)" />
          <span className="shrink-0 font-mono text-xs text-muted">
            {level.current}/{level.needed} xp
          </span>
        </div>
      </header>

      <StatColumns
        className="border-y border-border py-8"
        stats={[
          { kicker: "Ofensiva", value: `${liveStreak(s.streak)} dias`, detail: `recorde: ${s.streak.best}` },
          { kicker: "XP total", value: s.xp, detail: `nível ${level.level}` },
          { kicker: "Lições", value: `${lessonsDone}/${totalLessons}`, detail: "concluídas" },
          {
            kicker: "Melhor tempo",
            value: <span className="font-mono">{best !== null ? formatTime(best) : "—"}</span>,
            detail: ao5 === null ? `${fullSolves.length} resoluções` : `média de 5: ${ao5 === Infinity ? "DNF" : formatTime(ao5)}`,
          },
        ]}
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-14 2xl:grid-cols-2 2xl:gap-20">
        <div className="flex min-w-0 flex-col gap-14">
          <section className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:gap-12">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Últimos 7 dias</h2>
              <p className="mt-1 font-mono text-xs text-muted">{weekTotal} xp na semana</p>
            </div>
            <div className="flex h-44 items-end gap-3 border-b border-border">
              {week.map((w) => (
                <div key={w.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="font-mono text-[11px] text-muted">{w.xp || ""}</span>
                  <div
                    className="w-full max-w-12 rounded-t-[3px]"
                    style={{
                      height: `${(w.xp / maxXp) * 100}%`,
                      minHeight: 2,
                      background: w.day === today ? "var(--cube-red)" : "var(--ink)",
                      opacity: w.xp ? 1 : 0.15,
                    }}
                  />
                  <span className="pb-2 font-mono text-[11px] text-muted">{w.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:gap-12">
            <h2 className="text-xl font-bold tracking-tight">Histórico</h2>
            {s.history.length === 0 ? (
              <p className="text-muted">Nenhuma lição concluída ainda.</p>
            ) : (
              <ul className="border-t border-border">
                {s.history.slice(0, 10).map((h, i) => (
                  <li key={i} className="flex items-center gap-4 border-b border-border py-3 text-sm">
                    <span className="min-w-0 flex-1 truncate font-medium">{findLesson(h.lessonId)?.lesson.title ?? h.lessonId}</span>
                    <span className="font-mono text-xs text-muted">{Math.round(h.accuracy * 100)}%</span>
                    <span className="font-mono text-xs text-muted">+{h.xp} xp</span>
                    <span className="hidden font-mono text-xs text-muted sm:block">{new Date(h.date).toLocaleDateString("pt-BR")}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:gap-12">
          <h2 className="text-xl font-bold tracking-tight">Configurações</h2>
          <div className="border-t border-border">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-4">
              <div>
                <div className="font-medium">Aparência</div>
                <div className="text-sm text-muted">Vale para este aparelho.</div>
              </div>
              <div role="radiogroup" aria-label="Tema" className="flex gap-1 rounded-lg bg-surface-2 p-1">
                {THEMES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={theme === value}
                    onClick={() => setTheme(value)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition",
                      theme === value ? "bg-surface text-text shadow-sm" : "text-muted hover:text-text",
                    )}
                  >
                    <Icon className="size-4" /> {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-border py-4">
              <div>
                <div className="font-medium">Efeitos sonoros</div>
                <div className="text-sm text-muted">Sons de acerto, erro e conclusão.</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={s.settings.sound}
                onClick={() => s.updateSettings({ sound: !s.settings.sound })}
                className={`relative h-6 w-10 rounded-full transition ${s.settings.sound ? "bg-ink" : "bg-border"}`}
              >
                <span
                  className={`absolute top-1 size-4 rounded-full bg-surface transition-all ${s.settings.sound ? "left-5" : "left-1"}`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-border py-4">
              <div className="min-w-0">
                <div className="font-medium">Conta</div>
                <div className="truncate text-sm text-muted">{s.email}</div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="shrink-0"
                onClick={async () => {
                  await flushUserData();
                  await logout();
                }}
              >
                Sair
              </Button>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-border py-4">
              <div>
                <div className="font-medium">Apagar progresso</div>
                <div className="text-sm text-muted">XP, lições, revisões e tempos da sua conta.</div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="shrink-0 text-cube-red"
                onClick={() => {
                  if (window.confirm("Apagar todo o progresso (XP, lições, revisões e tempos)? Isso não pode ser desfeito.")) {
                    s.resetProgress();
                  }
                }}
              >
                Apagar
              </Button>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-border py-4">
              <div>
                <div className="font-medium">Excluir conta</div>
                <div className="text-sm text-muted">Remove sua conta e todos os dados, para sempre.</div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="shrink-0 text-cube-red"
                onClick={async () => {
                  if (window.prompt('Isso não pode ser desfeito. Para confirmar, digite EXCLUIR:')?.trim() !== "EXCLUIR") return;
                  const result = await deleteAccount();
                  if (result?.error) window.alert(result.error);
                }}
              >
                Excluir
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
