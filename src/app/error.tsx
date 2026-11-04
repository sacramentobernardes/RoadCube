"use client";

import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";

export default function AppError({ retry }: { error: Error; retry: () => void }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 p-6">
      <Kicker color="var(--cube-red)">Erro</Kicker>
      <h1 className="text-4xl font-bold tracking-[-0.04em]">Não foi possível carregar seu progresso.</h1>
      <p className="text-lg text-muted">Seus dados estão seguros. Verifique a conexão e tente de novo.</p>
      <div>
        <Button onClick={() => retry()}>Tentar de novo</Button>
      </div>
    </div>
  );
}
