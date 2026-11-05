"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ALL_LESSONS, CURRICULUM, isLessonUnlocked, type Lesson, type Module } from "@/data/curriculum";
import { caseCube } from "@/lib/exercises";
import { MAX_HEARTS, levelFromXp } from "@/lib/gamification";
import { dayKey } from "@/lib/dates";
import { liveStreak, useRoadCube } from "@/lib/store";
import { useDueCount } from "@/lib/use-due-count";
import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { Tag } from "@/components/ui/Tag";
import { StatColumns } from "@/components/ui/StatColumns";
import { CubeFrame } from "@/components/cube/CubeFrame";
import { TwistyCube, type CubeSpec } from "@/components/cube/TwistyCube";
import { heartsTooltip } from "@/components/shell/StatsPills";
import { MODULE_COLORS } from "./colors";
import { HowItWorks } from "./HowItWorks";
import { TodayPanel } from "./TodayPanel";
import { ModuleList, type NodeState } from "./TrailMap";

const AVAILABLE = ALL_LESSONS.filter((l) => !l.comingSoon);
const pad = (n: number) => String(n).padStart(2, "0");
const lessonNumber = (id: string) => AVAILABLE.findIndex((l) => l.id === id) + 1;

/** Cubo de destaque da lição: o primeiro caso dela ou o primeiro cubo da teoria. */
function lessonCube(lesson: Lesson): CubeSpec {
  if (lesson.caseIds.length) return caseCube(lesson.caseIds[0], { autoplay: true, loop: true });
  for (const ex of lesson.exercises) {
    if ("cube" in ex && ex.cube?.alg) return { ...ex.cube, autoplay: true, loop: true, controls: false };
  }
  return { alg: "R U R' U'", autoplay: true, loop: true };
}

export function Trail() {
  const completed = useRoadCube((s) => s.lessons);
  const current = AVAILABLE.find((l) => !completed[l.id] && isLessonUnlocked(l.id, completed));
  const currentModule = CURRICULUM.find((m) => m.lessons.some((l) => l.id === current?.id));

  function stateOf(lesson: Lesson): NodeState {
    if (lesson.comingSoon) return "soon";
    if (completed[lesson.id]) return "completed";
    if (lesson.id === current?.id) return "current";
    return isLessonUnlocked(lesson.id, completed) ? "unlocked" : "locked";
  }

  return (
    <div className="flex flex-col">
      <Hero lesson={current} module={currentModule} anyCompleted={Object.keys(completed).length > 0} />
      <Stats />
      <ReviewRow />
      <TodayPanel />

      <section id="trilha" className="mt-16 scroll-mt-20">
        <h2 className="text-2xl font-bold tracking-tight">Trilha</h2>
        <p className="mt-1 text-muted">
          {AVAILABLE.length} lições em 5 módulos. Cada lição desbloqueia a próxima. Clique em um módulo para ver o caminho.
        </p>
        <ModuleList stateOf={stateOf} completed={completed} currentModuleId={currentModule?.id} />
      </section>

      <HowItWorks />
    </div>
  );
}

function Hero({ lesson, module, anyCompleted }: { lesson?: Lesson; module?: Module; anyCompleted: boolean }) {
  if (!lesson || !module) {
    return (
      <section className="py-6">
        <Kicker color="var(--cube-green)">Trilha completa</Kicker>
        <h1 className="mt-4 text-5xl font-bold tracking-[-0.045em] sm:text-6xl">Você chegou ao fim.</h1>
        <p className="mt-4 max-w-md text-lg text-muted">Continue afiado no modo Treino e na Prática de reforço.</p>
      </section>
    );
  }

  const color = MODULE_COLORS[module.color];
  const number = lessonNumber(lesson.id);

  return (
    <section className="grid grid-cols-[minmax(0,1fr)] items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,440px)] md:gap-x-16 xl:grid-cols-[fit-content(640px)_minmax(0,min(440px,54vh))] xl:justify-center">
      <div>
        <Kicker color={color}>
          {anyCompleted ? `Próxima lição · ${pad(number)} / ${pad(AVAILABLE.length)}` : `Módulo 01 · ${module.title}`}
        </Kicker>
        <h1 className="mt-5 text-5xl leading-[0.95] font-bold tracking-[-0.045em] sm:text-6xl 2xl:text-7xl">
          {anyCompleted ? (
            <>
              {lesson.title}
              <span style={{ color }}>.</span>
            </>
          ) : (
            <>
              Resolva o cubo.
              <br />
              Um passo por vez.
            </>
          )}
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
          {anyCompleted
            ? `${lesson.description}. ${lesson.exercises.length} exercícios curtos com cubo 3D, quiz e desafio cronometrado.`
            : "Da notação ao CFOP completo em lições curtas, com cubo 3D, treino de algoritmos e revisão espaçada."}
        </p>
        <Link href={`/lesson/${lesson.id}`} className="mt-8 inline-block">
          <Button size="lg">{anyCompleted ? "Continuar lição" : "Começar a primeira lição"}</Button>
        </Link>
        <p className="mt-4 text-sm text-muted">
          <a href="#trilha" className="-my-2 inline-block py-2 text-text underline underline-offset-2">
            Ver trilha completa
          </a>
        </p>
      </div>

      <CubeFrame
        title={`${lesson.id}.alg`}
        accent={color}
        footerLeft={
          <Tag tone="green">
            <span className="size-1.5 rounded-full bg-white" /> lição {pad(number)}
          </Tag>
        }
        footerRight={<Tag tone="dark">+10 xp</Tag>}
      >
        <TwistyCube {...lessonCube(lesson)} />
      </CubeFrame>
    </section>
  );
}

function Stats() {
  const s = useRoadCube();
  const level = levelFromXp(s.xp);
  const today = s.dailyXp[dayKey()] ?? 0;
  return (
    <StatColumns
      className="mt-16 border-y border-border py-8"
      stats={[
        { kicker: "Ofensiva", value: `${liveStreak(s.streak)} ${liveStreak(s.streak) === 1 ? "dia" : "dias"}`, detail: `recorde: ${s.streak.best}` },
        { kicker: `XP · nível ${level.level}`, value: s.xp, detail: `faltam ${level.needed - level.current} para o nível ${level.level + 1}` },
        { kicker: "Vidas", value: `${s.hearts}/${MAX_HEARTS}`, detail: heartsTooltip(s.hearts, s.heartsUpdatedAt) },
        {
          kicker: "Meta diária",
          value: `${Math.min(today, s.dailyGoal)}/${s.dailyGoal}`,
          detail: today >= s.dailyGoal ? "concluída hoje" : "xp hoje",
        },
      ]}
    />
  );
}

function ReviewRow() {
  const due = useDueCount();
  if (due === 0) return null;
  return (
    <Link
      href="/review"
      className="group flex items-center gap-4 border-b border-border py-5 transition hover:bg-surface sm:px-2"
    >
      <Kicker color="var(--cube-red)" className="shrink-0">
        Reforço
      </Kicker>
      <span className="min-w-0 flex-1 truncate font-medium">
        {due} {due === 1 ? "algoritmo precisa" : "algoritmos precisam"} de revisão hoje
      </span>
      <ArrowRight className="size-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-text" />
    </Link>
  );
}
