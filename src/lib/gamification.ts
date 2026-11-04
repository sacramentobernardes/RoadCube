export const MAX_HEARTS = 5;
export const HEART_REGEN_MS = 30 * 60 * 1000;
export const DAILY_GOAL_XP = 30;
/** Limites impostos pelo banco (supabase/migrations/0002_server_game_logic.sql). */
export const DAILY_XP_CAP = 300;
export const DAILY_REVIEW_HEARTS = 10;

// Valores usados para atualizar a tela na hora. Quem decide de verdade são as
// funções do banco (supabase/migrations/0002_server_game_logic.sql).
export const XP = {
  lessonBase: 10,
  perfectBonus: 5,
  reviewCard: 2,
  solve: 1,
} as const;

/** XP total para atingir o nível `level` (nível 1 = 0 XP; 2 = 100; 3 = 300; 4 = 600...). */
export function xpForLevel(level: number): number {
  return 50 * (level - 1) * level;
}

export function levelFromXp(xp: number) {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  const floor = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, current: xp - floor, needed: next - floor, progress: (xp - floor) / (next - floor) };
}

/** Recalcula as vidas considerando a regeneração passiva desde a última atualização. */
export function regenerateHearts(hearts: number, updatedAt: number, now: number) {
  if (hearts >= MAX_HEARTS) return { hearts: MAX_HEARTS, updatedAt };
  const gained = Math.floor((now - updatedAt) / HEART_REGEN_MS);
  if (gained <= 0) return { hearts, updatedAt };
  const total = Math.min(MAX_HEARTS, hearts + gained);
  return { hearts: total, updatedAt: total >= MAX_HEARTS ? now : updatedAt + gained * HEART_REGEN_MS };
}

/** Quanto de `amount` ainda cabe no limite diário. */
export function cappedXp(amount: number, earnedToday: number) {
  return Math.max(0, Math.min(amount, DAILY_XP_CAP - earnedToday));
}

export function lessonXp(accuracy: number) {
  return XP.lessonBase + (accuracy >= 1 ? XP.perfectBonus : 0);
}
