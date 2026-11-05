import { cn } from "@/lib/cn";

const PIECES = [0, 1, 2];
const TOP = "#f2c230";
const LEFT = "#0f4a2b";
const RIGHT = "#6e3812";

/** Ponto de cada face em projeção isométrica: `u` e `v` vão de 0 a 3. */
const top = (u: number, v: number) => [100 + (u - v) * 26, 40 + (u + v) * 15];
const left = (u: number, v: number) => [22 + u * 26, 85 + u * 15 + v * 30];
const right = (u: number, v: number) => [178 - u * 26, 85 + u * 15 + v * 30];

function sticker(face: typeof top, u: number, v: number) {
  const gap = 0.07;
  const corners = [
    face(u + gap, v + gap),
    face(u + 1 - gap, v + gap),
    face(u + 1 - gap, v + 1 - gap),
    face(u + gap, v + 1 - gap),
  ];
  return corners.map((point) => point.join(",")).join(" ");
}

const FACES = [
  { face: top, color: TOP },
  { face: left, color: LEFT },
  { face: right, color: RIGHT },
];

/** Imagem estática mostrada até o cubo 3D carregar. */
export function CubePoster({ hidden }: { hidden: boolean }) {
  return (
    <svg
      data-cube-poster
      viewBox="-40 -10 280 280"
      aria-hidden
      className={cn("absolute inset-0 size-full transition-opacity duration-300", hidden && "opacity-0")}
    >
      {FACES.map(({ face, color }) =>
        PIECES.flatMap((u) => PIECES.map((v) => <polygon key={`${color}${u}${v}`} points={sticker(face, u, v)} fill={color} />)),
      )}
    </svg>
  );
}
