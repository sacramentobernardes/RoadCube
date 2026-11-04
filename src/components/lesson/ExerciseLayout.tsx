"use client";

import { createContext, useContext } from "react";
import { Kicker } from "@/components/ui/Kicker";
import { CubeFrame } from "@/components/cube/CubeFrame";
import { TwistyCube, type CubeSpec } from "@/components/cube/TwistyCube";
import { Tag } from "@/components/ui/Tag";
import { moveCount } from "@/lib/alg";

/** Cor de destaque do módulo da lição atual. */
export const LessonAccent = createContext("var(--cube-green)");

/** Cubo da lição emoldurado pela "janela" escura. */
export function LessonCube({ spec, title, label }: { spec: CubeSpec; title: string; label?: string }) {
  const accent = useContext(LessonAccent);
  const moves = spec.alg ? moveCount(spec.alg) : 0;
  return (
    <CubeFrame
      title={title}
      accent={accent}
      footerLeft={label ? <Tag tone="dark">{label}</Tag> : undefined}
      footerRight={moves > 0 && spec.anchor === "end" ? <Tag tone="dark">{moves} movimentos</Tag> : undefined}
    >
      <TwistyCube {...spec} />
    </CubeFrame>
  );
}

/** Estrutura comum dos exercícios: texto à esquerda, cubo à direita (empilha no celular). */
export function ExerciseLayout({
  kicker,
  title,
  cube,
  children,
}: {
  kicker: string;
  title: React.ReactNode;
  cube?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const accent = useContext(LessonAccent);
  return (
    <div className={cube ? "grid grid-cols-[minmax(0,1fr)] gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,380px)] md:gap-14 2xl:grid-cols-[minmax(0,820px)_minmax(0,min(460px,54vh))] 2xl:justify-center 2xl:gap-16" : "mx-auto max-w-2xl"}>
      <div className="flex min-w-0 flex-col gap-6">
        <div>
          <Kicker color={accent}>{kicker}</Kicker>
          <h1 className="mt-4 text-3xl leading-tight font-bold tracking-[-0.035em] sm:text-4xl">{title}</h1>
        </div>
        {cube && <div className="md:hidden">{cube}</div>}
        {children}
      </div>
      {cube && <div className="hidden md:block">{cube}</div>}
    </div>
  );
}
