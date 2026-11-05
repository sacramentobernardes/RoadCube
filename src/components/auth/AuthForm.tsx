"use client";

import Link from "next/link";
import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { login, loginWithGoogle, signup, type AuthState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";

const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

const NOTICES: Record<string, string> = {
  callback: "Não foi possível concluir o acesso. Se você acabou de confirmar o e-mail, tente entrar.",
  google: "Não foi possível entrar com o Google. Tente de novo.",
  link: "Este link expirou ou já foi usado. Peça um novo em Esqueci minha senha.",
};

export function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[11px] tracking-wider text-muted uppercase">{label}</span>
      <input
        required
        className="h-11 rounded-md border border-border bg-surface px-3 text-[15px] transition outline-none focus:border-ink"
        {...props}
      />
    </label>
  );
}

export function AuthForm({ mode, next, notice }: { mode: "login" | "signup"; next?: string; notice?: string }) {
  const isLogin = mode === "login";
  const [state, action, pending] = useActionState<AuthState, FormData>(isLogin ? login : signup, {});

  if (state.confirmEmail) {
    return (
      <div className="flex flex-col gap-4">
        <Kicker color="var(--cube-green)">
          <MailCheck className="size-3.5" /> Quase lá
        </Kicker>
        <h1 className="text-4xl font-bold tracking-[-0.04em]">Confirme seu e-mail.</h1>
        <p className="text-lg text-muted">
          Enviamos um link para <span className="text-text">{state.confirmEmail}</span>. Abra-o para começar.
        </p>
      </div>
    );
  }

  const error = state.error ?? (notice ? NOTICES[notice] : undefined);
  const otherHref = `${isLogin ? "/signup" : "/login"}${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Kicker color="var(--cube-red)">{isLogin ? "Entrar" : "Criar conta"}</Kicker>
        <h1 className="mt-4 text-5xl leading-[0.95] font-bold tracking-[-0.045em]">
          {isLogin ? "Bom te ver de novo" : "Comece sua trilha"}
          <span className="text-cube-red">.</span>
        </h1>
        <p className="mt-4 text-lg text-muted">
          {isLogin ? "Seu progresso continua de onde parou." : "Salve seu progresso e continue em qualquer dispositivo."}
        </p>
      </div>

      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next ?? ""} />
        {!isLogin && <Field label="Nome" name="name" autoComplete="name" maxLength={30} placeholder="Como podemos te chamar?" />}
        <Field label="E-mail" name="email" type="email" autoComplete="email" placeholder="voce@email.com" />
        <Field
          label="Senha"
          name="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          minLength={isLogin ? undefined : 8}
          placeholder={isLogin ? undefined : "Pelo menos 8 caracteres"}
        />
        {isLogin && (
          <Link href="/forgot-password" className="-mt-1 text-sm text-muted underline underline-offset-2 hover:text-text">
            Esqueci minha senha
          </Link>
        )}
        {error && (
          <p role="alert" className="border-l-2 border-cube-red pl-3 text-sm text-cube-red">
            {error}
          </p>
        )}
        <Button size="lg" type="submit" disabled={pending}>
          {pending ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta"}
        </Button>
      </form>

      {GOOGLE_ENABLED && (
        <form action={loginWithGoogle}>
          <input type="hidden" name="next" value={next ?? ""} />
          <Button size="lg" variant="secondary" type="submit" block>
            Continuar com Google
          </Button>
        </form>
      )}

      <p className="text-sm text-muted">
        {isLogin ? "Ainda não tem conta? " : "Já tem conta? "}
        <Link href={otherHref} className="text-text underline underline-offset-2">
          {isLogin ? "Criar conta" : "Entrar"}
        </Link>
      </p>
    </div>
  );
}
