/** Aceita só caminhos internos, para o `next` não virar um redirecionamento aberto. */
export function safeNext(next: unknown): string {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return "/";
  return next;
}
