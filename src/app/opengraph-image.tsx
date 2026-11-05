import { ImageResponse } from "next/og";

export const alt = "RoadCube: aprenda a resolver o Cubo Mágico";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FACE = ["#f2c230", "#f2c230", "#d2392b", "#1f9d5c", "#f2c230", "#2563c9", "#f2c230", "#f07a26", "#f2c230"];

/** Imagem mostrada quando o link do site é compartilhado. */
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "space-between", padding: 80, background: "#f4f4f5", color: "#111214" }}>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 680 }}>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700 }}>
            RoadCube<span style={{ color: "#d2392b" }}>.</span>
          </div>
          <div style={{ display: "flex", marginTop: 44, fontSize: 84, lineHeight: 1, fontWeight: 700, letterSpacing: -3 }}>Resolva o cubo. Um passo por vez.</div>
          <div style={{ display: "flex", marginTop: 32, fontSize: 32, color: "#5b5e66" }}>Do básico ao CFOP completo.</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", width: 336, height: 336, padding: 12, gap: 12, background: "#111214", borderRadius: 24 }}>
          {FACE.map((color, i) => (
            <div key={i} style={{ width: 96, height: 96, borderRadius: 10, background: color }} />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
