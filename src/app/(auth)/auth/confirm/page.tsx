import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { confirmLink } from "../../actions";

export const metadata: Metadata = { title: "Confirmar · RoadCube", robots: { index: false } };

/**
 * Destino dos links de e-mail. O token só é usado ao clicar no botão, porque
 * filtros de e-mail abrem os links sozinhos e gastariam o token de uso único.
 */
export default async function ConfirmPage({ searchParams }: PageProps<"/auth/confirm">) {
  const { token_hash: tokenHash, type } = await searchParams;
  if (typeof tokenHash !== "string" || (type !== "recovery" && type !== "email")) redirect("/login?error=link");
  const recovery = type === "recovery";

  return (
    <form action={confirmLink} className="flex flex-col gap-5">
      <input type="hidden" name="token_hash" value={tokenHash} />
      <input type="hidden" name="type" value={type} />
      <div>
        <Kicker color="var(--cube-red)">{recovery ? "Recuperar senha" : "Confirmar e-mail"}</Kicker>
        <h1 className="mt-4 text-5xl leading-[0.95] font-bold tracking-[-0.045em]">
          {recovery ? "Quase lá" : "Falta um passo"}
          <span className="text-cube-red">.</span>
        </h1>
        <p className="mt-4 text-lg text-muted">
          {recovery ? "Continue para escolher uma nova senha." : "Continue para confirmar seu e-mail e entrar."}
        </p>
      </div>
      <Button type="submit" block>
        Continuar
      </Button>
    </form>
  );
}
