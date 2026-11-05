const BASE = "http://roadcube.invalid";

/**
 * Aceita só caminhos internos, para o `next` não virar um redirecionamento aberto.
 * Interpreta o valor como o navegador faz, que ignora tabs e quebras de linha.
 */
export function safeNext(next: unknown): string {
  if (typeof next !== "string" || !next.startsWith("/")) return "/";
  try {
    const url = new URL(next, BASE);
    const path = `${url.pathname}${url.search}${url.hash}`;
    return url.origin === BASE && !path.startsWith("//") ? path : "/";
  } catch {
    return "/";
  }
}
