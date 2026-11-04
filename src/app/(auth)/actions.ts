"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/dal";
import { safeNext } from "@/lib/auth/safe-next";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  error?: string;
  /** Cadastro feito; falta confirmar o e-mail informado. */
  confirmEmail?: string;
}

const MIN_PASSWORD = 8;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MESSAGES: Record<string, string> = {
  invalid_credentials: "E-mail ou senha incorretos.",
  email_not_confirmed: "Confirme seu e-mail antes de entrar. Procure a mensagem na sua caixa de entrada.",
  weak_password: "Essa senha é muito fraca. Tente uma mais longa, com letras e números.",
  over_email_send_rate_limit: "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
  over_request_rate_limit: "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
  signup_disabled: "Novos cadastros estão desativados no momento.",
  same_password: "A nova senha precisa ser diferente da atual.",
};

const messageFor = (code?: string) => MESSAGES[code ?? ""] ?? "Algo deu errado. Tente de novo em instantes.";

const field = (form: FormData, name: string) => String(form.get(name) ?? "").trim();

async function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? (await headers()).get("origin") ?? "http://localhost:3000";
}

export async function login(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = field(form, "email");
  const password = String(form.get("password") ?? "");
  if (!EMAIL.test(email) || !password) return { error: "Informe seu e-mail e sua senha." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: messageFor(error.code) };
  redirect(safeNext(form.get("next")));
}

export async function signup(_prev: AuthState, form: FormData): Promise<AuthState> {
  const name = field(form, "name").slice(0, 30);
  const email = field(form, "email");
  const password = String(form.get("password") ?? "");
  if (!name) return { error: "Como podemos te chamar?" };
  if (!EMAIL.test(email)) return { error: "Informe um e-mail válido." };
  if (password.length < MIN_PASSWORD) return { error: `A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.` };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name }, emailRedirectTo: `${await siteUrl()}/auth/callback` },
  });
  if (error) return { error: messageFor(error.code) };

  // Sem sessão, o projeto exige confirmação. A resposta é a mesma para e-mails
  // já cadastrados, para não revelar quem tem conta.
  if (!data.session) return { confirmEmail: email };
  redirect("/");
}

export async function loginWithGoogle(form: FormData) {
  const supabase = await createClient();
  const next = encodeURIComponent(safeNext(form.get("next")));
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await siteUrl()}/auth/callback?next=${next}` },
  });
  if (error || !data.url) redirect("/login?error=google");
  redirect(data.url);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = field(form, "email");
  if (!EMAIL.test(email)) return { error: "Informe um e-mail válido." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteUrl()}/auth/callback?next=/reset-password`,
  });
  if (error?.code?.includes("rate_limit")) return { error: messageFor(error.code) };
  // A resposta é a mesma com ou sem conta, para não revelar quem está cadastrado.
  return { confirmEmail: email };
}

export async function updatePassword(_prev: AuthState, form: FormData): Promise<AuthState> {
  await requireUser();
  const password = String(form.get("password") ?? "");
  if (password.length < MIN_PASSWORD) return { error: `A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.` };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: messageFor(error.code) };
  redirect("/");
}

export async function deleteAccount(): Promise<{ error: string }> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_my_account");
  if (error) return { error: "Não foi possível excluir a conta. Tente de novo." };
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}
