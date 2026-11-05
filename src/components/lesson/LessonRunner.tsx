"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Heart, Lock, X } from "lucide-react";
import { findLesson, isLessonUnlocked, ALL_LESSONS } from "@/data/curriculum";
import { getCase } from "@/data/algorithms";
import { isGraded, type Exercise } from "@/lib/exercises";
import { DAILY_XP_CAP, lessonXp } from "@/lib/gamification";
import { useRoadCube } from "@/lib/store";
import { sfx } from "@/lib/sfx";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { StatColumns } from "@/components/ui/StatColumns";
import { AlgDisplay } from "@/components/cube/AlgDisplay";
import { MODULE_COLORS } from "@/components/trail/colors";
import type { Status } from "./types";
import { LessonAccent } from "./ExerciseLayout";
import { TheoryView } from "./exercises/TheoryView";
import { ChoiceView } from "./exercises/ChoiceView";
import { CaseIdView } from "./exercises/CaseIdView";
import { BuildView } from "./exercises/BuildView";
import { ExecuteView } from "./exercises/ExecuteView";

interface Result {
  xp: number;
  accuracy: number;
  durationMs: number;
  streak: number;
  streakExtended: boolean;
}

export function LessonRunner({ lessonId }: { lessonId: string }) {
  const ready = useRoadCube((s) => s.ready);
  const completed = useRoadCube((s) => s.lessons);
  const found = findLesson(lessonId)!;

  if (!ready) return <div className="m-6 h-96 animate-pulse rounded-lg bg-surface-2" />;

  if (found.lesson.comingSoon || !isLessonUnlocked(lessonId, completed)) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 p-6">
        <Kicker>
          <Lock className="size-3.5" /> {found.lesson.comingSoon ? "Em breve" : "Bloqueada"}
        </Kicker>
        <h1 className="text-4xl font-bold tracking-[-0.04em]">{found.lesson.title}.</h1>
        <p className="text-lg text-muted">
          {found.lesson.comingSoon
            ? "Este conteúdo ainda está sendo preparado."
            : "Conclua as lições anteriores da trilha para desbloquear esta."}
        </p>
        <Link href="/">
          <Button>Voltar à trilha</Button>
        </Link>
      </div>
    );
  }

  return (
    <LessonAccent.Provider value={MODULE_COLORS[found.module.color]}>
      <LessonSession lessonId={lessonId} />
    </LessonAccent.Provider>
  );
}

function LessonSession({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const { lesson, module } = findLesson(lessonId)!;
  const hearts = useRoadCube((s) => s.hearts);
  const loseHeart = useRoadCube((s) => s.loseHeart);
  const completeLesson = useRoadCube((s) => s.completeLesson);

  // Fila de exercícios: os errados voltam para o final.
  const [queue, setQueue] = useState<number[]>(() => lesson.exercises.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [status, setStatus] = useState<Status>("answering");
  const [checker, setCheckerState] = useState<(() => boolean) | null>(null);
  const [missed, setMissed] = useState<Set<number>>(() => new Set());
  const [result, setResult] = useState<Result | null>(null);
  const startedAt = useRef(Date.now());

  const exerciseIndex = queue[pos];
  const exercise = lesson.exercises[exerciseIndex];
  const outOfHearts = hearts <= 0 && !result;

  const setChecker = useCallback((fn: (() => boolean) | null) => setCheckerState(() => fn), []);

  const applyResult = useCallback(
    (correct: boolean) => {
      setStatus(correct ? "correct" : "wrong");
      if (correct) {
        sfx.correct();
        return;
      }
      sfx.wrong();
      loseHeart();
      setMissed((m) => new Set(m).add(exerciseIndex));
      setQueue((q) => [...q, exerciseIndex]);
    },
    [exerciseIndex, loseHeart],
  );

  function check() {
    if (!isGraded(exercise)) return advance();
    if (checker) applyResult(checker());
  }

  function advance() {
    if (pos + 1 >= queue.length) {
      const graded = lesson.exercises.filter(isGraded).length;
      const accuracy = graded ? (graded - missed.size) / graded : 1;
      const durationMs = Date.now() - startedAt.current;
      const outcome = completeLesson({ lessonId, caseIds: lesson.caseIds, accuracy, durationMs });
      sfx.complete();
      setResult({ ...outcome, accuracy, durationMs });
      return;
    }
    setPos(pos + 1);
    setStatus("answering");
    setCheckerState(null);
  }

  // Enter confere / continua.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || result || outOfHearts) return;
      if (status === "answering") check();
      else advance();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (result) return <LessonComplete title={lesson.title} result={result} onContinue={() => router.push("/")} />;

  const number = ALL_LESSONS.filter((l) => !l.comingSoon).findIndex((l) => l.id === lesson.id) + 1;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border">
        <div className="page-width flex h-14 items-center gap-5">
          <Link href="/" aria-label="Sair da lição" className="-m-2 p-2 text-muted transition hover:text-text">
            <X className="size-5" />
          </Link>
          <span className="hidden truncate font-mono text-xs text-muted sm:block">
            {String(number).padStart(2, "0")} · {lesson.title.toLowerCase()}
          </span>
          <Segments total={queue.length} done={pos + (status === "answering" ? 0 : 1)} color={MODULE_COLORS[module.color]} />
          <span className="flex items-center gap-1.5 font-mono text-sm">
            <Heart className="size-4 text-cube-red" fill="currentColor" /> {hearts}
          </span>
        </div>
      </header>

      <main className="page-width flex-1 pt-10 pb-48">
        <AnimatePresence mode="wait">
          <motion.div
            key={pos}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <ExerciseSwitch exercise={exercise} status={status} setChecker={setChecker} resolve={applyResult} />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer
        exercise={exercise}
        status={status}
        canCheck={!isGraded(exercise) || checker !== null}
        onCheck={check}
        onContinue={advance}
      />

      {/* Ao zerar as vidas, primeiro mostramos o feedback do erro. */}
      {outOfHearts && status !== "wrong" && <OutOfHearts />}
    </div>
  );
}

/** Barra de progresso segmentada: um traço por exercício. */
function Segments({ total, done, color }: { total: number; done: number; color: string }) {
  return (
    <div className="flex flex-1 gap-1" role="progressbar" aria-valuenow={done} aria-valuemax={total}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="h-1 flex-1 rounded-full transition-colors duration-300"
          style={{ background: i < done ? color : "var(--border)" }}
        />
      ))}
    </div>
  );
}

function ExerciseSwitch(props: {
  exercise: Exercise;
  status: Status;
  setChecker: (fn: (() => boolean) | null) => void;
  resolve: (correct: boolean) => void;
}) {
  const { exercise, ...rest } = props;
  switch (exercise.kind) {
    case "theory":
      return <TheoryView exercise={exercise} {...rest} />;
    case "choice":
      return <ChoiceView exercise={exercise} {...rest} />;
    case "case-id":
      return <CaseIdView exercise={exercise} {...rest} />;
    case "build":
      return <BuildView exercise={exercise} {...rest} />;
    case "execute":
      return <ExecuteView exercise={exercise} {...rest} />;
  }
}

function correctAnswer(ex: Exercise) {
  switch (ex.kind) {
    case "choice":
      return <span className="font-semibold">{ex.options[ex.answer]}</span>;
    case "case-id":
      return <span className="font-semibold">{getCase(ex.caseId).name}</span>;
    case "build":
      return <AlgDisplay alg={[...ex.given, ...ex.solution].join(" ")} size="sm" />;
    case "execute":
      return <AlgDisplay alg={getCase(ex.caseId).algs[0]} size="sm" />;
    default:
      return null;
  }
}

function Footer({
  exercise,
  status,
  canCheck,
  onCheck,
  onContinue,
}: {
  exercise: Exercise;
  status: Status;
  canCheck: boolean;
  onCheck: () => void;
  onContinue: () => void;
}) {
  const isExecute = exercise.kind === "execute";
  const explanation = exercise.kind === "choice" ? exercise.explanation : undefined;
  const tone = status === "correct" ? "var(--cube-green)" : status === "wrong" ? "var(--cube-red)" : undefined;

  if (status === "answering" && isExecute) return null;

  return (
    <footer className="fixed inset-x-0 bottom-0 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]">
      {tone && <div className="h-1" style={{ background: tone }} />}
      <div className="page-width flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        {status === "answering" ? (
          <>
            <span className="hidden font-mono text-xs text-muted sm:block">
              {exercise.kind === "theory" ? "enter ↵ para continuar" : "enter ↵ para verificar"}
            </span>
            <Button size="lg" className="sm:min-w-44" disabled={!canCheck} onClick={onCheck}>
              {exercise.kind === "theory" ? "Continuar" : "Verificar"}
            </Button>
          </>
        ) : (
          <>
            <div className="flex min-w-0 flex-col gap-1.5">
              <Kicker color={tone}>{status === "correct" ? "Correto" : "Não foi dessa vez"}</Kicker>
              {status === "wrong" ? (
                <div className="flex flex-wrap items-center gap-2 text-text">
                  <span className="text-muted">Resposta:</span> {correctAnswer(exercise)}
                </div>
              ) : (
                <span className="text-lg font-semibold">{explanation ?? "Muito bem."}</span>
              )}
              {status === "wrong" && explanation && <span className="text-sm text-muted">{explanation}</span>}
            </div>
            <Button size="lg" variant={status === "correct" ? "success" : "primary"} className="sm:min-w-44" onClick={onContinue}>
              Continuar
            </Button>
          </>
        )}
      </div>
    </footer>
  );
}

function OutOfHearts() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-border bg-surface p-6"
      >
        <Kicker color="var(--cube-red)">0 vidas</Kicker>
        <h2 className="text-3xl font-bold tracking-[-0.04em]">Sem vidas por agora.</h2>
        <p className="text-muted">As vidas voltam com o tempo (1 a cada 30 min), ou você ganha uma agora na Prática de reforço.</p>
        <Link href="/review" className="w-full">
          <Button block>Praticar e ganhar 1 vida</Button>
        </Link>
        <Link href="/" className="w-full">
          <Button block variant="ghost">
            Sair da lição
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

function LessonComplete({ title, result, onContinue }: { title: string; result: Result; onContinue: () => void }) {
  const mins = Math.floor(result.durationMs / 60000);
  const secs = String(Math.floor(result.durationMs / 1000) % 60).padStart(2, "0");
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-10 px-5 py-12 sm:px-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Kicker color="var(--cube-green)">
          <Check className="size-3.5" /> Lição concluída
        </Kicker>
        <h1 className="mt-5 text-5xl leading-[0.95] font-bold tracking-[-0.045em] sm:text-6xl">
          {title}
          <span className="text-cube-green">.</span>
        </h1>
        {result.streakExtended && (
          <p className="mt-5 text-lg text-muted">
            Ofensiva de <span className="font-semibold text-cube-orange">{result.streak} {result.streak === 1 ? "dia" : "dias"}</span>.
            Volte amanhã para manter.
          </p>
        )}
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <StatColumns
          className="border-y border-border py-8"
          stats={[
            {
              kicker: "XP ganho",
              value: `+${result.xp}`,
              detail: result.xp < lessonXp(result.accuracy)
                ? `limite de ${DAILY_XP_CAP} xp por dia`
                : result.accuracy >= 1
                  ? "bônus de lição perfeita"
                  : "",
            },
            { kicker: "Precisão", value: `${Math.round(result.accuracy * 100)}%`, detail: "na primeira tentativa" },
            { kicker: "Tempo", value: `${mins}:${secs}`, detail: "minutos" },
          ]}
        />
      </motion.div>
      <div>
        <Button size="lg" onClick={onContinue} className={cn("min-w-52")}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
