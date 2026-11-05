import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnv } from "./env";

/** Crie um cliente por requisição: ele carrega os cookies do usuário atual. */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, key, cookieOptions } = supabaseEnv();
  return createServerClient(url, key, {
    cookieOptions,
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components não gravam cookies; o proxy renova a sessão.
        }
      },
    },
  });
}
