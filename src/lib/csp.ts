export const CSP_HEADER = "Content-Security-Policy";

export function contentSecurityPolicy(nonce: string, supabaseUrl: string) {
  const dev = process.env.NODE_ENV === "development";
  const supabaseSocket = supabaseUrl.replace(/^http/, "ws");
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval'${dev ? " 'unsafe-eval'" : ""}`,
    // O React e o framer-motion aplicam estilos direto nos elementos.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self' ${supabaseUrl} ${supabaseSocket}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    `form-action 'self' ${supabaseUrl}`,
    "frame-ancestors 'none'",
  ].join("; ");
}
