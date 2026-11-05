import { createServerClient } from "@supabase/ssr";
import { isAuthRetryableFetchError } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth/safe-next";
import { CSP_HEADER, contentSecurityPolicy } from "@/lib/csp";
import { supabaseEnv } from "./env";

const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];
const LANDING = "/inicio";
const PUBLIC_PAGES = ["/guia", "/privacidade", "/termos"];

const matches = (pathname: string, base: string) => pathname === base || pathname.startsWith(`${base}/`);

/**
 * Renova a sessão e faz a checagem rápida de rotas. É só a primeira barreira:
 * as páginas repetem a checagem (lib/auth/dal.ts) e o RLS protege os dados.
 */
export async function updateSession(request: NextRequest) {
  const { url, key, cookieOptions } = supabaseEnv();
  const nonce = btoa(crypto.randomUUID());
  const csp = contentSecurityPolicy(nonce, url);

  // O Next lê o nonce destes cabeçalhos para marcar os próprios scripts.
  const forwarded = () => {
    const headers = new Headers(request.headers);
    headers.set("x-nonce", nonce);
    headers.set(CSP_HEADER, csp);
    return { request: { headers } };
  };

  let response = NextResponse.next(forwarded());

  const supabase = createServerClient(url, key, {
    cookieOptions,
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next(forwarded());
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        // Impede que uma CDN guarde a resposta com o token de outra pessoa.
        Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  // Com o Supabase fora do ar não dá para saber: a tela de erro assume, sem parecer logout.
  const anonymous = !signedIn && !isAuthRetryableFetchError(error);
  const { pathname, search } = request.nextUrl;

  const keepSession = (next: NextResponse) => {
    response.cookies.getAll().forEach((cookie) => next.cookies.set(cookie));
    response.headers.forEach((value, name) => {
      if (name.toLowerCase() === "cache-control") next.headers.set(name, value);
    });
    return next;
  };
  const redirectTo = (target: URL) => keepSession(NextResponse.redirect(target));

  const isAuthPage = AUTH_PAGES.some((page) => matches(pathname, page));
  const isPublic = isAuthPage || matches(pathname, "/auth") || PUBLIC_PAGES.includes(pathname);

  if (pathname === LANDING) return redirectTo(new URL("/", request.url));

  if (anonymous && pathname === "/") {
    const landing = keepSession(NextResponse.rewrite(new URL(LANDING, request.url), forwarded()));
    landing.headers.set(CSP_HEADER, csp);
    return landing;
  }

  if (anonymous && !isPublic) {
    const target = new URL("/login", request.url);
    target.searchParams.set("next", `${pathname}${search}`);
    return redirectTo(target);
  }
  if (signedIn && isAuthPage) {
    return redirectTo(new URL(safeNext(request.nextUrl.searchParams.get("next")), request.url));
  }
  response.headers.set(CSP_HEADER, csp);
  return response;
}
