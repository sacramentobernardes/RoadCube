"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  COLLECTIONS,
  collectionRows,
  gameStateFrom,
  loadUserData,
  profileRow,
  type CollectionName,
  type GameSnapshot,
  type UserData,
} from "./user-data";
import { DATA_KEYS, pickUserData, useRoadCube } from "./store";

// Duas vias de gravação:
// - Eventos de jogo (XP, vidas, ofensiva, lições): fila de chamadas às funções
//   do banco, que decidem o resultado. Cada evento tem id próprio, então
//   reenviar depois de uma falha de rede não premia duas vezes.
// - Dados livres (nome, ajustes, revisão, tempos): envia só a diferença entre o
//   store e o último estado salvo. Upsert e delete podem ser repetidos à vontade.

const DEBOUNCE_MS = 800;
const RETRY_MS = 5000;
const REFRESH_AFTER_MS = 15_000;
/** Código das recusas de regra de negócio (`raise exception` no Postgres). */
const REJECTED = "P0001";

const NAMES = Object.keys(COLLECTIONS) as CollectionName[];

interface Snapshot {
  profile: string;
  tables: Record<CollectionName, Map<string, string>>;
}

function snapshotOf(data: UserData, userId: string): Snapshot {
  const rows = collectionRows(data, userId);
  const tables = {} as Snapshot["tables"];
  for (const name of NAMES) {
    const { key } = COLLECTIONS[name];
    tables[name] = new Map(rows[name].map((row) => [String(row[key]), JSON.stringify(row)]));
  }
  return { profile: JSON.stringify(profileRow(data)), tables };
}

async function pushDiff(supabase: SupabaseClient, userId: string, from: Snapshot, to: Snapshot) {
  const jobs: PromiseLike<{ error: { message: string } | null }>[] = [];

  if (from.profile !== to.profile) {
    jobs.push(supabase.from("profiles").update(JSON.parse(to.profile)).eq("id", userId));
  }
  for (const name of NAMES) {
    const { key, conflict } = COLLECTIONS[name];
    const changed = [...to.tables[name]].filter(([id, json]) => from.tables[name].get(id) !== json);
    const removed = [...from.tables[name].keys()].filter((id) => !to.tables[name].has(id));
    if (changed.length) {
      jobs.push(supabase.from(name).upsert(changed.map(([, json]) => JSON.parse(json)), { onConflict: conflict }));
    }
    if (removed.length) {
      jobs.push(supabase.from(name).delete().eq("user_id", userId).in(key, removed));
    }
  }

  const results = await Promise.all(jobs);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);
}

/** Envia a fila em ordem. Devolve se o servidor recusou algum evento. */
async function drainEvents(supabase: SupabaseClient) {
  let rejected = false;
  let latest: GameSnapshot | null = null;

  for (;;) {
    const [event] = useRoadCube.getState().pending;
    if (!event) break;
    const { data, error } = await supabase.rpc(event.fn, event.args);
    if (error && error.code !== REJECTED) throw new Error(error.message);
    if (error) {
      console.warn(`Evento recusado pelo servidor (${event.fn}):`, error.message);
      rejected = true;
    } else {
      latest = data as GameSnapshot;
    }
    useRoadCube.setState((s) => ({ pending: s.pending.slice(1) }));
  }

  // O valor do servidor prevalece sobre o cálculo otimista do navegador.
  if (latest && !rejected) {
    const snapshot = latest;
    useRoadCube.setState((s) => gameStateFrom(snapshot, s.dailyXp));
  }
  return rejected;
}

let activeFlush: (() => Promise<void>) | null = null;

/** Grava o que estiver pendente. Chame antes de encerrar a sessão. */
export function flushUserData() {
  return activeFlush?.() ?? Promise.resolve();
}

/** Liga a sincronização do store com o banco; devolve a função que desliga. */
export function startSync(supabase: SupabaseClient, userId: string) {
  let saved = snapshotOf(pickUserData(useRoadCube.getState()), userId);
  let timer: number | undefined;
  let running: Promise<void> | null = null;
  let dirty = false;
  let stopped = false;
  let loadedAt = Date.now();

  const setStatus = (syncStatus: "idle" | "saving" | "error") => {
    if (useRoadCube.getState().syncStatus !== syncStatus) useRoadCube.setState({ syncStatus });
  };

  function schedule(delay: number) {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => void flush(), delay);
  }

  async function reload() {
    loadedAt = Date.now();
    const data = await loadUserData(supabase, userId);
    if (stopped || dirty || useRoadCube.getState().pending.length > 0) return;
    saved = snapshotOf(data, userId);
    useRoadCube.setState(data);
  }

  async function run() {
    dirty = false;
    setStatus("saving");
    try {
      const rejected = await drainEvents(supabase);
      const target = snapshotOf(pickUserData(useRoadCube.getState()), userId);
      await pushDiff(supabase, userId, saved, target);
      saved = target;
      if (rejected) await reload();
      setStatus("idle");
    } catch (error) {
      console.error("Falha ao salvar o progresso:", error);
      dirty = true;
      setStatus("error");
      if (!stopped) schedule(RETRY_MS);
    }
  }

  async function flush() {
    window.clearTimeout(timer);
    if (running) await running;
    running = run().finally(() => {
      running = null;
    });
    await running;
    if (dirty && useRoadCube.getState().syncStatus !== "error" && !stopped) schedule(DEBOUNCE_MS);
  }

  const unsubscribe = useRoadCube.subscribe((state, previous) => {
    const dataChanged = DATA_KEYS.some((key) => state[key] !== previous[key]);
    if (dataChanged || state.pending.length > previous.pending.length) {
      dirty = true;
      if (useRoadCube.getState().syncStatus !== "error") schedule(DEBOUNCE_MS);
    }
  });

  // Ao voltar para a aba, busca o que foi feito em outras abas e dispositivos.
  async function refresh() {
    const busy = dirty || running || useRoadCube.getState().pending.length > 0;
    if (busy || Date.now() - loadedAt < REFRESH_AFTER_MS) return;
    try {
      await reload();
    } catch (error) {
      console.error("Falha ao atualizar o progresso:", error);
    }
  }

  const onVisibility = () => {
    if (document.visibilityState === "hidden") {
      if (dirty) void flush();
    } else {
      void refresh();
    }
  };
  document.addEventListener("visibilitychange", onVisibility);
  activeFlush = flush;

  return () => {
    stopped = true;
    window.clearTimeout(timer);
    unsubscribe();
    document.removeEventListener("visibilitychange", onVisibility);
    if (activeFlush === flush) activeFlush = null;
  };
}
