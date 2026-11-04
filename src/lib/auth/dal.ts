import "server-only";
import { cache } from "react";
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
  if (error || !data.user) redirect("/login");
  return data.user;
});
