import "server-only";
import { cache } from "react";
import { isAuthRetryableFetchError } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Exige um usuário autenticado. `getUser` valida a sessão no servidor de
 * autenticação (não confia só no cookie) e `cache` evita repetir a chamada
 * dentro da mesma requisição.
 */
export const requireUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  // Serviço fora do ar não é sessão inválida: quem cuida disso é app/error.tsx.
  if (isAuthRetryableFetchError(error)) throw error;
  if (error || !data.user) redirect("/login");
  return data.user;
});
