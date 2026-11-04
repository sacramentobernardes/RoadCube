import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth/safe-next";
import { supabaseEnv } from "./env";

const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];

const matches = (pathname: string, base: string) => pathname === base || pathname.startsWith(`${base}/`);

/**
 * Renova a sessão e faz a checagem rápida de rotas. É só a primeira barreira:
 * as páginas repetem a checagem (lib/auth/dal.ts) e o RLS protege os dados.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = supabaseEnv();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        // Impede que uma CDN guarde a resposta com o token de outra pessoa.
        Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  const { pathname, search } = request.nextUrl;

  const redirectTo = (target: URL) => {
    const redirect = NextResponse.redirect(target);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    response.headers.forEach((value, name) => {
      if (name.toLowerCase() === "cache-control") redirect.headers.set(name, value);
    });
    return redirect;
  };

  const isAuthPage = AUTH_PAGES.some((page) => matches(pathname, page));
  const isPublic = isAuthPage || matches(pathname, "/auth");

  if (!signedIn && !isPublic) {
    const target = new URL("/login", request.url);
    if (pathname !== "/") target.searchParams.set("next", `${pathname}${search}`);
    return redirectTo(target);
  }
  if (signedIn && isAuthPage) {
    return redirectTo(new URL(safeNext(request.nextUrl.searchParams.get("next")), request.url));
  }
  return response;
}
