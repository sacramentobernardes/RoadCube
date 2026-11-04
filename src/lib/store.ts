"use client";

import { create } from "zustand";
import { addDays, dayKey } from "./dates";
import { DAILY_GOAL_XP, MAX_HEARTS, XP, cappedXp, lessonXp, regenerateHearts } from "./gamification";
import { newCard, reviewCard, type Grade } from "./srs";
import { HISTORY_LIMIT, SOLVES_LIMIT, type Solve, type GameEvent, type Settings, type Streak, type UserData } from "./user-data";

export type { LessonHistoryEntry, LessonRecord, Profile, Solve } from "./user-data";

// O banco (Supabase) é a fonte da verdade: este store é a cópia em memória que
// a interface lê. Ele é preenchido por UserDataProvider e gravado por lib/sync.ts.
// Pontuação é otimista: as ações atualizam a tela na hora e entram em `pending`;
// quem decide o valor final são as funções do banco.
// Só o preencha no navegador: no servidor o módulo é compartilhado entre
// requisições, e os dados de um usuário vazariam para outro.

interface RoadCubeState extends UserData {
  /** Dados do usuário já carregados. */
  ready: boolean;
  email: string | null;
  syncStatus: "idle" | "saving" | "error";
  pending: GameEvent[];

  setProfile(name: string): void;
  syncHearts(): void;
  loseHeart(): void;
  completeLesson(input: { lessonId: string; caseIds: string[]; accuracy: number; durationMs: number }): {
    xp: number;
    streak: number;
    streakExtended: boolean;
  };
  gradeCard(caseId: string, grade: Grade): void;
  finishReview(cards: number): { xp: number; streak: number };
  addSolve(solve: Omit<Solve, "id" | "date">): void;
  removeSolve(id: string): void;
  toggleDnf(id: string): void;
  setPreferredAlg(caseId: string, index: number): void;
  updateSettings(patch: Partial<Settings>): void;
  resetProgress(): void;
}

const emptyUserData: UserData = {
  profile: null,
  xp: 0,
  dailyGoal: DAILY_GOAL_XP,
  dailyXp: {},
  hearts: MAX_HEARTS,
  heartsUpdatedAt: 0,
  streak: { count: 0, best: 0, lastDay: null },
  lessons: {},
  history: [],
  srs: {},
  solves: [],
  preferredAlg: {},
  settings: { sound: true, animationSpeed: 1 },
};

export const DATA_KEYS = Object.keys(emptyUserData) as (keyof UserData)[];

export function pickUserData(state: UserData): UserData {
  return Object.fromEntries(DATA_KEYS.map((key) => [key, state[key]])) as unknown as UserData;
}

export const initialState = {
  ...emptyUserData,
  ready: false,
  email: null,
  syncStatus: "idle" as const,
  pending: [] as GameEvent[],
};

function bumpStreak(streak: Streak, today: string) {
  if (streak.lastDay === today) return { streak, extended: false };
  const count = streak.lastDay === addDays(today, -1) ? streak.count + 1 : 1;
  return { streak: { count, best: Math.max(streak.best, count), lastDay: today }, extended: true };
}

export const useRoadCube = create<RoadCubeState>()((set, get) => ({
  ...initialState,

  setProfile: (name) =>
    set((s) => ({ profile: { name, createdAt: s.profile?.createdAt ?? new Date().toISOString() } })),

  syncHearts: () => {
    const { hearts, heartsUpdatedAt } = get();
    const next = regenerateHearts(hearts, heartsUpdatedAt, Date.now());
    if (next.hearts !== hearts || next.updatedAt !== heartsUpdatedAt) {
      set({ hearts: next.hearts, heartsUpdatedAt: next.updatedAt });
    }
  },

  loseHeart: () => {
    get().syncHearts();
    set((s) => ({
      hearts: Math.max(0, s.hearts - 1),
      heartsUpdatedAt: s.hearts >= MAX_HEARTS ? Date.now() : s.heartsUpdatedAt,
      pending: [...s.pending, { fn: "lose_heart", args: { p_event: crypto.randomUUID(), p_day: dayKey() } }],
    }));
  },

  completeLesson: ({ lessonId, caseIds, accuracy, durationMs }) => {
    const today = dayKey();
    const gained = cappedXp(lessonXp(accuracy), get().dailyXp[today] ?? 0);
    const { streak, extended } = bumpStreak(get().streak, today);
    const event = crypto.randomUUID();
    set((s) => {
      const prev = s.lessons[lessonId];
      const srs = { ...s.srs };
      for (const id of caseIds) srs[id] ??= newCard(id, addDays(today, 1));
      return {
        xp: s.xp + gained,
        dailyXp: { ...s.dailyXp, [today]: (s.dailyXp[today] ?? 0) + gained },
        streak,
        srs,
        lessons: {
          ...s.lessons,
          [lessonId]: {
            completedAt: prev?.completedAt ?? new Date().toISOString(),
            times: (prev?.times ?? 0) + 1,
            bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, accuracy),
          },
        },
        history: [
          { id: event, lessonId, date: new Date().toISOString(), accuracy, xp: gained, durationMs },
          ...s.history,
        ].slice(0, HISTORY_LIMIT),
        pending: [
          ...s.pending,
          {
            fn: "complete_lesson",
            args: { p_event: event, p_lesson: lessonId, p_accuracy: accuracy, p_duration_ms: Math.round(durationMs), p_day: today },
          },
        ],
      };
    });
    return { xp: gained, streak: streak.count, streakExtended: extended };
  },

  gradeCard: (caseId, grade) =>
    set((s) => {
      const card = s.srs[caseId] ?? newCard(caseId, dayKey());
      return { srs: { ...s.srs, [caseId]: reviewCard(card, grade, dayKey()) } };
    }),

  finishReview: (cards) => {
    const today = dayKey();
    const gained = cappedXp(cards * XP.reviewCard, get().dailyXp[today] ?? 0);
    const { streak } = bumpStreak(get().streak, today);
    set((s) => ({
      xp: s.xp + gained,
      dailyXp: { ...s.dailyXp, [today]: (s.dailyXp[today] ?? 0) + gained },
      streak,
      hearts: Math.min(MAX_HEARTS, s.hearts + 1),
      pending: [...s.pending, { fn: "finish_review", args: { p_event: crypto.randomUUID(), p_cards: cards, p_day: today } }],
    }));
    return { xp: gained, streak: streak.count };
  },

  addSolve: (solve) => {
    const today = dayKey();
    const id = crypto.randomUUID();
    const gained = cappedXp(XP.solve, get().dailyXp[today] ?? 0);
    set((s) => ({
      solves: [{ ...solve, id, date: new Date().toISOString() }, ...s.solves].slice(0, SOLVES_LIMIT),
      xp: s.xp + gained,
      dailyXp: { ...s.dailyXp, [today]: (s.dailyXp[today] ?? 0) + gained },
      pending: [...s.pending, { fn: "award_solve", args: { p_event: id, p_day: today } }],
    }));
  },

  removeSolve: (id) => set((s) => ({ solves: s.solves.filter((x) => x.id !== id) })),

  toggleDnf: (id) => set((s) => ({ solves: s.solves.map((x) => (x.id === id ? { ...x, dnf: !x.dnf } : x)) })),

  setPreferredAlg: (caseId, index) => set((s) => ({ preferredAlg: { ...s.preferredAlg, [caseId]: index } })),

  updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

  resetProgress: () =>
    set((s) => ({
      ...emptyUserData,
      profile: s.profile,
      dailyGoal: s.dailyGoal,
      settings: s.settings,
      preferredAlg: s.preferredAlg,
      heartsUpdatedAt: Date.now(),
      pending: [...s.pending, { fn: "reset_progress", args: { p_day: dayKey() } }],
    })),
}));

/** A ofensiva só conta se o usuário praticou hoje ou ontem. */
export function liveStreak(streak: Streak, today = dayKey()) {
  if (!streak.lastDay) return 0;
  return streak.lastDay === today || streak.lastDay === addDays(today, -1) ? streak.count : 0;
}
