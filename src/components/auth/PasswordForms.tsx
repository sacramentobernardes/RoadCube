"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, updatePassword, type AuthState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { Field } from "./AuthForm";

function Heading({ kicker, title, children }: { kicker: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <Kicker color="var(--cube-red)">{kicker}</Kicker>
      <h1 className="mt-4 text-5xl leading-[0.95] font-bold tracking-[-0.045em]">
        {title}
        <span className="text-cube-red">.</span>
      </h1>
      <p className="mt-4 text-lg text-muted">{children}</p>
    </div>
  );
}

function ErrorText({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p role="alert" className="border-l-2 border-cube-red pl-3 text-sm text-cube-red">
      {children}
    </p>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(requestPasswordReset, {});

  if (state.confirmEmail) {
    return (
      <Heading kicker="Verifique seu e-mail" title="Link enviado">
        Se <span className="text-text">{state.confirmEmail}</span> tiver uma conta, você vai receber um link para criar uma
        nova senha.
      </Heading>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Heading kicker="Recuperar senha" title="Esqueceu a senha">
        Informe seu e-mail e enviaremos um link para criar uma nova.
      </Heading>
      <form action={action} className="flex flex-col gap-4">
        <Field label="E-mail" name="email" type="email" defaultValue={state.email} autoComplete="email" placeholder="voce@email.com" />
        <ErrorText>{state.error}</ErrorText>
        <Button size="lg" type="submit" disabled={pending}>
          {pending ? "Aguarde..." : "Enviar link"}
        </Button>
      </form>
      <p className="text-sm text-muted">
        <Link href="/login" className="text-text underline underline-offset-2">
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePassword, {});

  return (
    <div className="flex flex-col gap-6">
      <Heading kicker="Nova senha" title="Crie uma nova senha">
        Use pelo menos 8 caracteres.
      </Heading>
      <form action={action} className="flex flex-col gap-4">
        <Field label="Nova senha" name="password" type="password" autoComplete="new-password" minLength={8} />
        <ErrorText>{state.error}</ErrorText>
        <Button size="lg" type="submit" disabled={pending}>
          {pending ? "Aguarde..." : "Salvar senha"}
        </Button>
      </form>
    </div>
  );
}
