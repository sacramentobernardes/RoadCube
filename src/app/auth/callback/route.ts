import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth/safe-next";
import { createClient } from "@/lib/supabase/server";

/** Retorno do Google e dos links de confirmação de e-mail: troca o código pela sessão. */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safeNext(searchParams.get("next")), request.url));
  }
  return NextResponse.redirect(new URL("/login?error=callback", request.url));
}
