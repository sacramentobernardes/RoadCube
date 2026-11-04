"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getCase } from "@/data/algorithms";
import { caseCube, moveQuiz } from "@/lib/exercises";
import { dayKey } from "@/lib/dates";
import { DAILY_REVIEW_HEARTS, DAILY_XP_CAP, MAX_HEARTS } from "@/lib/gamification";
import { GRADE_LABELS, isDue, reviewCard, type Grade } from "@/lib/srs";
import { pick, shuffle } from "@/lib/random";
import { useRoadCube } from "@/lib/store";
import { sfx } from "@/lib/sfx";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatColumns } from "@/components/ui/StatColumns";
import { Tag } from "@/components/ui/Tag";
import { CubeFrame } from "@/components/cube/CubeFrame";
import { TwistyCube } from "@/components/cube/TwistyCube";
import { AlgDisplay } from "@/components/cube/AlgDisplay";
import { ChoiceView } from "@/components/lesson/exercises/ChoiceView";
import { LessonAccent } from "@/components/lesson/ExerciseLayout";
import type { Status } from "@/components/lesson/types";

type Session = { kind: "cards"; ids: string[] } | { kind: "notation" };

const ACCENT = "var(--cube-blue)";
const formatDay = (day: string) => new Date(`${day}T12:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

export function Review() {
  const srs = useRoadCube((s) => s.srs);
  const [session, setSession] = useState<Session | null>(null);
  const [done, setDone] = useState<{ xp: number } | null>(null);
  const today = dayKey();
  const cards = Object.values(srs).sort((a, b) => a.due.localeCompare(b.due));
  const due = cards.filter((c) => isDue(c, today));
  const finish = (xp: number) => {
    setSession(null);
    setDone({ xp });
  };

  if (done) return <ReviewDone xp={done.xp} onBack={() => setDone(null)} />;
  if (session?.kind === "cards") return <CardSession ids={session.ids} onFinish={finish} />;
  if (session?.kind === "notation") return <NotationDrill onFinish={finish} />;

  return (
    <div>
      <PageHeader
        kicker="Prática de reforço"
        title={due.length ? `${due.length} para revisar hoje` : cards.length ? "Tudo em dia" : "Nada para revisar ainda"}
        description={`Repetição espaçada: cada algoritmo volta no momento certo para você não esquecer. Concluir uma prática devolve 1 vida, até ${DAILY_REVIEW_HEARTS} por dia.`}
        color={ACCENT}
      />

      <div className="flex flex-wrap items-center gap-3">
        {due.length > 0 && (
          <Button size="lg" onClick={() => setSession({ kind: "cards", ids: shuffle(due.map((c) => c.caseId)) })}>
            Começar revisão
          </Button>
        )}
        {due.length === 0 && cards.length > 0 && (
          <Button size="lg" variant="secondary" onClick={() => setSession({ kind: "cards", ids: shuffle(cards.map((c) => c.caseId)).slice(0, 8) })}>
            Praticar mesmo assim
          </Button>
        )}
        {cards.length === 0 && (
          <>
            <Button size="lg" onClick={() => setSession({ kind: "notation" })}>
              Treino de notação
            </Button>
            <span className="text-sm text-muted">Os algoritmos entram aqui ao concluir lições do Método Básico em diante.</span>
          </>
        )}
      </div>

      {cards.length > 0 && (
        <section className="mt-14 grid gap-6 border-t border-border pt-10 md:grid-cols-[220px_minmax(0,1fr)] md:gap-12">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Seus algoritmos</h2>
            <p className="mt-1 font-mono text-xs text-muted">{cards.length} na revisão espaçada</p>
          </div>
          <ul className="border-t border-border 2xl:grid 2xl:grid-cols-2 2xl:gap-x-12">
            {cards.map((card) => (
              <li key={card.caseId} className="flex items-center gap-4 border-b border-border py-3">
                <span className="min-w-0 flex-1 truncate font-medium">{getCase(card.caseId).name}</span>
                <span className="hidden font-mono text-xs text-muted sm:block">
                  {card.reps > 0 ? `${card.reps}× seguidas` : "novo"}
                </span>
                {isDue(card, today) ? <Tag tone="blue">hoje</Tag> : <span className="font-mono text-xs text-muted">{formatDay(card.due)}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function CardSession({ ids, onFinish }: { ids: string[]; onFinish: (xp: number) => void }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const srs = useRoadCube((s) => s.srs);
  const preferred = useRoadCube((s) => s.preferredAlg);
  const gradeCard = useRoadCube((s) => s.gradeCard);
  const finishReview = useRoadCube((s) => s.finishReview);
  const c = getCase(ids[index]);
  const alg = c.algs[preferred[c.id] ?? 0];

  function grade(g: Grade) {
    gradeCard(c.id, g);
    if (g === "again") sfx.wrong();
    else sfx.correct();
    if (index + 1 >= ids.length) {
      onFinish(finishReview(ids.length).xp);
      return;
    }
    setIndex(index + 1);
    setRevealed(false);
  }

  const card = srs[c.id];
  const preview = (g: Grade) => {
    if (!card) return "";
    const days = reviewCard(card, g, dayKey()).interval;
    return days === 0 ? "hoje" : days === 1 ? "1 dia" : `${days} dias`;
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,380px)] md:gap-14 2xl:grid-cols-[minmax(0,820px)_minmax(0,min(460px,54vh))] 2xl:justify-center 2xl:gap-16">
      <div className="flex min-w-0 flex-col gap-8">
        <div>
          <Kicker color={ACCENT}>
            Revisão · {String(index + 1).padStart(2, "0")} / {String(ids.length).padStart(2, "0")}
          </Kicker>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em]">{c.name}</h1>
          <p className="mt-2 text-lg text-muted">Qual é o algoritmo deste caso? Lembre antes de revelar.</p>
        </div>
        {!revealed ? (
          <div>
            <Button size="lg" onClick={() => setRevealed(true)}>
              Mostrar resposta
            </Button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
            <AlgDisplay alg={alg} />
            <div>
              <Kicker>Com que facilidade você lembrou?</Kicker>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(Object.keys(GRADE_LABELS) as Grade[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => grade(g)}
                    className={cn(
                      "flex flex-col items-start rounded-md border px-3 py-2.5 text-left transition hover:border-text/40",
                      g === "again" ? "border-cube-red/50" : "border-border",
                    )}
                  >
                    <span className={cn("font-semibold", g === "again" && "text-cube-red")}>{GRADE_LABELS[g]}</span>
                    <span className="font-mono text-[11px] text-muted">{preview(g)}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
      <CubeFrame title={`${c.id}.alg`} accent={ACCENT} footerLeft={<Tag tone="dark">{revealed ? "resolvendo" : "caso"}</Tag>}>
        <TwistyCube {...caseCube(c.id, { alg, autoplay: revealed, controls: revealed })} />
      </CubeFrame>
    </div>
  );
}

const DRILL_MOVES = ["R", "R'", "L", "L'", "U", "U'", "D", "D'", "F", "F'", "B", "B'", "R2", "U2", "F2"];

function NotationDrill({ onFinish }: { onFinish: (xp: number) => void }) {
  const finishReview = useRoadCube((s) => s.finishReview);
  const quizzes = useMemo(
    () =>
      Array.from({ length: 5 }, () => {
        const move = pick(DRILL_MOVES);
        return moveQuiz(move, shuffle(DRILL_MOVES.filter((m) => m !== move)).slice(0, 3));
      }),
    [],
  );
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<Status>("answering");
  const [checker, setCheckerState] = useState<(() => boolean) | null>(null);
  const setChecker = useCallback((fn: (() => boolean) | null) => setCheckerState(() => fn), []);
  const quiz = quizzes[index] as Extract<(typeof quizzes)[number], { kind: "choice" }>;

  function onButton() {
    if (status === "answering") {
      if (!checker) return;
      const ok = checker();
      if (ok) sfx.correct();
      else sfx.wrong();
      setStatus(ok ? "correct" : "wrong");
      return;
    }
    if (index + 1 >= quizzes.length) return onFinish(finishReview(quizzes.length).xp);
    setIndex(index + 1);
    setStatus("answering");
    setCheckerState(null);
  }

  return (
    <LessonAccent.Provider value={ACCENT}>
      <div className="flex flex-col gap-8">
        <ChoiceView key={index} exercise={quiz} status={status} setChecker={setChecker} resolve={() => {}} />
        <div className="flex items-center gap-4">
          <Button size="lg" variant={status === "correct" ? "success" : "primary"} disabled={status === "answering" && !checker} onClick={onButton}>
            {status === "answering" ? "Verificar" : "Continuar"}
          </Button>
          <span className="font-mono text-xs text-muted">
            {index + 1} / {quizzes.length}
            {status === "wrong" && ` · resposta: ${quiz.options[quiz.answer]}`}
          </span>
        </div>
      </div>
    </LessonAccent.Provider>
  );
}

function ReviewDone({ xp, onBack }: { xp: number; onBack: () => void }) {
  // Lê do store: o servidor confirma a vida de recompensa logo depois.
  const hearts = useRoadCube((s) => s.hearts);
  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <div>
        <Kicker color="var(--cube-green)">Prática concluída</Kicker>
        <h1 className="mt-4 text-5xl leading-[0.95] font-bold tracking-[-0.045em]">
          Memória reforçada<span className="text-cube-green">.</span>
        </h1>
      </div>
      <StatColumns
        className="border-y border-border py-8"
        stats={[
          { kicker: "XP ganho", value: `+${xp}`, detail: xp === 0 ? `limite de ${DAILY_XP_CAP} xp por dia` : undefined },
          { kicker: "Vidas", value: `${hearts}/${MAX_HEARTS}`, detail: `até ${DAILY_REVIEW_HEARTS} de recompensa por dia` },
        ]}
      />
      <div className="flex flex-wrap gap-2">
        <Link href="/">
          <Button size="lg">Voltar à trilha</Button>
        </Link>
        <Button size="lg" variant="ghost" onClick={onBack}>
          Ver revisões
        </Button>
      </div>
    </div>
  );
}
