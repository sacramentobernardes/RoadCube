import Link from "next/link";
import { casesBySet } from "@/data/algorithms";
import { ALL_LESSONS, CURRICULUM } from "@/data/curriculum";
import { MODULE_COLORS } from "@/components/trail/colors";
import { HowItWorks } from "@/components/trail/HowItWorks";
import { CubeFrame } from "@/components/cube/CubeFrame";
import { DeferredCube } from "@/components/cube/DeferredCube";
import { Logo } from "@/components/shell/Logo";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { Kicker } from "@/components/ui/Kicker";
import { StatColumns } from "@/components/ui/StatColumns";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/cn";

const ACTION = "inline-flex items-center justify-center rounded-md font-semibold transition";
const PRIMARY = cn(ACTION, "h-13 bg-ink px-6 text-ink-contrast hover:opacity-90");
const SECONDARY = cn(ACTION, "h-13 border border-border bg-surface px-6 hover:border-text/40");

const FEATURES = [
  { title: "Cubo 3D em cada lição", text: "Veja cada movimento animado e repita quantas vezes precisar." },
  { title: "Treino com timer", text: "Cronometre suas resoluções e acompanhe a evolução dos seus tempos." },
  { title: "Revisão no momento certo", text: "Os algoritmos que você aprendeu voltam antes de serem esquecidos." },
  { title: "Biblioteca completa", text: "F2L, OLL e PLL com animação e reconhecimento de cada caso." },
];

const QUESTIONS = [
  { question: "Preciso saber alguma coisa antes de começar?", answer: "Não. A trilha começa pelas peças do cubo e pela notação dos movimentos." },
  { question: "Preciso ter um cubo mágico?", answer: "Não para começar: os desafios funcionam no cubo virtual. Com um cubo real, você também pratica nele e usa o timer." },
  { question: "Já sei resolver. O RoadCube serve para mim?", answer: "Sim. A trilha chega ao CFOP completo, e a biblioteca e o treino ajudam a aprender novos casos e baixar seus tempos." },
];

export function Landing() {
  const lessons = ALL_LESSONS.filter((l) => !l.comingSoon).length;

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border">
        <div className="page-width flex h-14 items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="py-2 text-sm font-semibold hover:underline">
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <main className="page-width pb-16">
        <section className="grid grid-cols-[minmax(0,1fr)] items-center gap-10 py-12 md:grid-cols-[minmax(0,1fr)_minmax(0,400px)] md:gap-x-16 md:py-20 xl:grid-cols-[fit-content(640px)_minmax(0,min(440px,54vh))] xl:justify-center">
          <div>
            <Kicker color="var(--cube-red)">Cubo mágico · do zero ao CFOP</Kicker>
            <h1 className="mt-5 text-5xl leading-[0.95] font-bold tracking-[-0.045em] sm:text-6xl 2xl:text-7xl">
              Aprenda a resolver o cubo mágico<span className="text-cube-red">.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              Lições curtas com cubo 3D, exercícios práticos e revisão espaçada. Você avança um passo por vez, do primeiro movimento ao método dos speedcubers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className={PRIMARY}>
                Começar agora
              </Link>
              <a href="#trilha" className={SECONDARY}>
                Ver a trilha
              </a>
            </div>
          </div>
          <CubeFrame title="sune.alg" footerLeft={<Tag tone="dark">em loop</Tag>}>
            <DeferredCube alg="R U R' U R U2 R'" anchor="end" view="oll" autoplay loop />
          </CubeFrame>
        </section>

        <StatColumns
          className="border-y border-border py-6"
          stats={[
            { kicker: "Módulos", value: CURRICULUM.length },
            { kicker: "Lições", value: lessons },
            { kicker: "F2L", value: 41, detail: "casos" },
            { kicker: "OLL", value: 57, detail: "casos" },
            { kicker: "PLL", value: casesBySet("pll").length, detail: "casos" },
          ]}
        />

        <section id="trilha" className="mt-16 scroll-mt-6">
          <h2 className="text-2xl font-bold tracking-tight">O que você vai aprender</h2>
          <ol className="mt-6 border-t border-border">
            {CURRICULUM.map((module, i) => (
              <li key={module.id} className="grid grid-cols-[minmax(0,1fr)] gap-2 border-b border-border py-6 md:grid-cols-[220px_minmax(0,1fr)] md:gap-12">
                <Kicker color={MODULE_COLORS[module.color]}>
                  Módulo {String(i + 1).padStart(2, "0")} · {module.lessons.filter((l) => !l.comingSoon).length} lições
                </Kicker>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">{module.title}</h3>
                  <p className="mt-1 max-w-[70ch] leading-relaxed text-muted">{module.about}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <HowItWorks />

        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">Tudo para praticar</h2>
          <ul className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 md:grid-cols-2 xl:grid-cols-4">
            {FEATURES.map((feature) => (
              <li key={feature.title}>
                <h3 className="text-xl font-bold tracking-tight">{feature.title}</h3>
                <p className="mt-1 max-w-[46ch] leading-relaxed text-muted">{feature.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">Perguntas frequentes</h2>
          <dl className="mt-6 border-t border-border">
            {QUESTIONS.map((item) => (
              <div key={item.question} className="grid grid-cols-[minmax(0,1fr)] gap-2 border-b border-border py-6 md:grid-cols-2 md:gap-12">
                <dt className="text-lg font-bold tracking-tight">{item.question}</dt>
                <dd className="max-w-[60ch] leading-relaxed text-muted">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-16 text-center">
          <h2 className="text-4xl font-bold tracking-[-0.04em]">
            Comece pela primeira lição<span className="text-cube-red">.</span>
          </h2>
          <Link href="/signup" className={cn(PRIMARY, "mt-6")}>
            Criar minha conta
          </Link>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="page-width flex h-14 items-center justify-between gap-4 text-sm text-muted">
          <span>RoadCube</span>
          <nav aria-label="Documentos" className="flex gap-5">
            <Link href="/privacidade" className="py-2 hover:text-text">
              Privacidade
            </Link>
            <Link href="/termos" className="py-2 hover:text-text">
              Termos
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
