import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/shell/Logo";
import { Kicker } from "@/components/ui/Kicker";

export const metadata: Metadata = {
  title: "Página não encontrada · RoadCube",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 p-6">
      <Logo />
      <Kicker color="var(--cube-red)">Erro 404</Kicker>
      <h1 className="text-4xl font-bold tracking-[-0.04em]">Página não encontrada.</h1>
      <p className="text-lg text-muted">O endereço pode ter mudado ou estar incorreto.</p>
      <div>
        <Link href="/" className="inline-flex h-11 items-center rounded-md bg-ink px-5 text-[15px] font-semibold text-ink-contrast transition hover:opacity-90">
          Voltar para o início
        </Link>
      </div>
    </div>
  );
}
