import type { SupabaseClient } from "@supabase/supabase-js";
import type { SrsCard } from "./srs";

// Dados de cada usuário e o mapeamento entre eles e as tabelas do Supabase
// (supabase/migrations). Usado tanto no servidor quanto no navegador.

export interface LessonRecord {
  completedAt: string;
  times: number;
  bestAccuracy: number;
}

export interface LessonHistoryEntry {
  id: string;
  lessonId: string;
  date: string;
  accuracy: number;
  xp: number;
  durationMs: number;
}

export interface Solve {
  id: string;
  ms: number;
  date: string;
  scramble: string;
  caseId?: string;
  dnf?: boolean;
}

export interface Profile {
  name: string;
  createdAt: string;
}

export interface Settings {
  sound: boolean;
  animationSpeed: number;
}

export interface Streak {
  count: number;
  best: number;
  lastDay: string | null;
}

export interface UserData {
  profile: Profile | null;
  xp: number;
  dailyGoal: number;
  dailyXp: Record<string, number>;
  hearts: number;
  heartsUpdatedAt: number;
  streak: Streak;
  lessons: Record<string, LessonRecord>;
  history: LessonHistoryEntry[];
  srs: Record<string, SrsCard>;
  solves: Solve[];
  preferredAlg: Record<string, number>;
  settings: Settings;
}

export const HISTORY_LIMIT = 200;
export const SOLVES_LIMIT = 1000;
const DAILY_XP_DAYS = 400;

type Row = Record<string, unknown>;

/** Chamada a uma função do banco que decide pontuação (supabase/migrations). */
export interface GameEvent {
  fn: string;
  args: Record<string, unknown>;
}

/** Resposta das funções de jogo: o estado oficial da pontuação. */
export interface GameSnapshot {
  xp: number;
  hearts: number;
  hearts_updated_at: string;
  streak_count: number;
  streak_best: number;
  streak_last_day: string | null;
  day: string;
  day_xp: number;
}

export function gameStateFrom(snapshot: GameSnapshot, dailyXp: Record<string, number>) {
  return {
    xp: snapshot.xp,
    hearts: snapshot.hearts,
    heartsUpdatedAt: new Date(snapshot.hearts_updated_at).getTime(),
    streak: { count: snapshot.streak_count, best: snapshot.streak_best, lastDay: snapshot.streak_last_day },
    dailyXp: { ...dailyXp, [snapshot.day]: snapshot.day_xp },
  };
}

/**
 * Tabelas que o navegador grava direto; `key` identifica a linha dentro do
 * usuário. Pontuação e progresso ficam de fora: só as funções do banco os alteram.
 */
export const COLLECTIONS = {
  srs_cards: { key: "case_id", conflict: "user_id,case_id" },
  solves: { key: "id", conflict: "id" },
  preferred_algs: { key: "case_id", conflict: "user_id,case_id" },
} as const;

export type CollectionName = keyof typeof COLLECTIONS;

export function profileRow(data: UserData): Row {
  return { name: data.profile?.name ?? "", daily_goal_xp: data.dailyGoal, settings: data.settings };
}

export function collectionRows(data: UserData, userId: string): Record<CollectionName, Row[]> {
  return {
    srs_cards: Object.values(data.srs).map((c) => ({
      user_id: userId,
      case_id: c.caseId,
      ease: c.ease,
      interval_days: c.interval,
      reps: c.reps,
      lapses: c.lapses,
      due: c.due,
      last_reviewed: c.lastReviewed ?? null,
    })),
    solves: data.solves.map((s) => ({
      id: s.id,
      user_id: userId,
      ms: Math.round(s.ms),
      dnf: Boolean(s.dnf),
      scramble: s.scramble,
      case_id: s.caseId ?? null,
      created_at: s.date,
    })),
    preferred_algs: Object.entries(data.preferredAlg).map(([case_id, alg_index]) => ({ user_id: userId, case_id, alg_index })),
  };
}

/**
 * Lê tudo do banco. Qualquer falha lança erro de propósito: seguir com um
 * estado vazio faria a sincronização sobrescrever o progresso real com zeros.
 */
export async function loadUserData(supabase: SupabaseClient, userId: string): Promise<UserData> {
  const [profile, lessons, history, srs, solves, preferred, daily] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("lesson_progress").select("*").eq("user_id", userId),
    supabase.from("lesson_history").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(HISTORY_LIMIT),
    supabase.from("srs_cards").select("*").eq("user_id", userId),
    supabase.from("solves").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(SOLVES_LIMIT),
    supabase.from("preferred_algs").select("*").eq("user_id", userId),
    supabase.from("daily_xp").select("*").eq("user_id", userId).order("day", { ascending: false }).limit(DAILY_XP_DAYS),
  ]);

  const failed = [profile, lessons, history, srs, solves, preferred, daily].find((r) => r.error);
  if (failed?.error) throw new Error(`Falha ao carregar dados do usuário: ${failed.error.message}`);
  const p = profile.data;
  if (!p) throw new Error("Perfil não encontrado. A migration do Supabase foi aplicada?");

  return {
    profile: { name: p.name, createdAt: p.created_at },
    xp: p.xp,
    dailyGoal: p.daily_goal_xp,
    hearts: p.hearts,
    heartsUpdatedAt: new Date(p.hearts_updated_at).getTime(),
    streak: { count: p.streak_count, best: p.streak_best, lastDay: p.streak_last_day },
    settings: p.settings,
    lessons: Object.fromEntries(
      (lessons.data ?? []).map((l) => [l.lesson_id, { completedAt: l.completed_at, times: l.times, bestAccuracy: l.best_accuracy }]),
    ),
    history: (history.data ?? []).map((h) => ({
      id: h.id,
      lessonId: h.lesson_id,
      date: h.created_at,
      accuracy: h.accuracy,
      xp: h.xp,
      durationMs: h.duration_ms,
    })),
    srs: Object.fromEntries(
      (srs.data ?? []).map((c) => [
        c.case_id,
        {
          caseId: c.case_id,
          ease: c.ease,
          interval: c.interval_days,
          reps: c.reps,
          lapses: c.lapses,
          due: c.due,
          lastReviewed: c.last_reviewed ?? undefined,
        },
      ]),
    ),
    solves: (solves.data ?? []).map((s) => ({
      id: s.id,
      ms: s.ms,
      date: s.created_at,
      scramble: s.scramble,
      caseId: s.case_id ?? undefined,
      dnf: s.dnf,
    })),
    preferredAlg: Object.fromEntries((preferred.data ?? []).map((a) => [a.case_id, a.alg_index])),
    dailyXp: Object.fromEntries((daily.data ?? []).map((d) => [d.day, d.xp])),
  };
}
