// O acesso precisa ser literal para o Next embutir as variáveis no navegador.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secure = process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://") ?? false;

export function supabaseEnv() {
  if (!url || !key) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY no .env.local (veja .env.example).",
    );
  }
  return { url, key, cookieOptions: { secure } };
}
