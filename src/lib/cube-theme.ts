import type { TwistyPlayer } from "cubing/twisty";

// O cubing.js usa cores saturadas (verde #00ff00 etc.). Os materiais dos
// adesivos são compartilhados entre todos os cubos, então basta recolori-los
// uma vez para trocar a paleta do app inteiro.

type RGB = [number, number, number];

const hexToRgb = (hex: number): RGB => [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];

// Com o gerenciamento de cor do three.js, `new Color(hex).convertLinearToSRGB()`
// guarda o próprio valor sRGB do hex, e é ele que aparece na tela.

// [cor original, cor original esmaecida] → [nova cor, nova esmaecida]
const PALETTE: Array<[number, number, number, number]> = [
  [0xffffff, 0xdddddd, 0xf4f4f2, 0x6b6b68], // U branco
  [0xff9900, 0x885500, 0xf07a2a, 0x6e3812], // L laranja
  [0x00ff00, 0x008800, 0x1f9d5a, 0x0f4a2b], // F verde
  [0xff0000, 0x660000, 0xe03a2f, 0x641a15], // R vermelho
  [0x2266ff, 0x113388, 0x2f55d4, 0x152760], // B azul
  [0xffff00, 0x888800, 0xf2c230, 0x6d5716], // D amarelo
  [0x666666, 0x666666, 0x3c3f45, 0x3c3f45], // peças ignoradas (cinza)
];

const MAP = PALETTE.flatMap(([from, fromDim, to, toDim]) => [
  { from: hexToRgb(from), to: hexToRgb(to) },
  { from: hexToRgb(fromDim), to: hexToRgb(toDim) },
]);

const close = (a: RGB, b: RGB) => a.every((v, i) => Math.abs(v - b[i]) < 0.01);

interface ColorLike {
  r: number;
  g: number;
  b: number;
  setRGB(r: number, g: number, b: number): void;
}
interface MaterialLike {
  color?: ColorLike;
}
interface ObjectLike {
  material?: MaterialLike | MaterialLike[];
  traverse(fn: (o: ObjectLike) => void): void;
}

const themed = new WeakSet<MaterialLike>();

export async function applyCubeTheme(player: TwistyPlayer) {
  const root = (await player.experimentalCurrentThreeJSPuzzleObject()) as unknown as ObjectLike;
  root.traverse((obj) => {
    const materials = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : [];
    for (const m of materials) {
      if (!m.color || themed.has(m)) continue;
      const current: RGB = [m.color.r, m.color.g, m.color.b];
      const match = MAP.find((entry) => close(entry.from, current));
      if (match) m.color.setRGB(...match.to);
      themed.add(m);
    }
  });
}
