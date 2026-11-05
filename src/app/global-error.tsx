"use client";

// Substitui o layout raiz quando ele falha, por isso não usa os estilos globais.
export default function GlobalError({ retry }: { error: Error; retry: () => void }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, background: "#f4f4f5", color: "#111214", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: 36, lineHeight: 1.1, margin: 0 }}>Algo deu errado.</h1>
          <p style={{ fontSize: 18, color: "#5b5e66" }}>Seus dados estão seguros. Tente de novo em instantes.</p>
          <button type="button" onClick={() => retry()} style={{ height: 44, padding: "0 20px", border: 0, borderRadius: 6, background: "#111214", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            Tentar de novo
          </button>
        </main>
      </body>
    </html>
  );
}
