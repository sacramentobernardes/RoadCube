import type { CubeView } from "@/data/algorithms";

// Máscaras de stickering por identidade de peça (formato do cubing.js).
// Ordem das peças no kpuzzle 3x3x3:
//   EDGES:   UF UR UB UL DF DR DB DL FR FL BR BL
//   CORNERS: UFR URB UBL ULF DRF DFL DLB DBR
//   CENTERS: U L F R B D
// Peças "U" são as brancas e "D" as amarelas. Nas vistas de CFOP o cubo é
// girado com z2 (amarelo em cima, verde na frente), mas a máscara segue a peça.
// Legenda: "-" normal, "D" esmaecida, "I" cinza, "O" só a face amarela.

interface ViewConfig {
  setup: string;
  mask: string | null;
}

export const CUBE_VIEWS: Record<CubeView, ViewConfig> = {
  full: { setup: "", mask: null },
  cross: {
    setup: "",
    mask: "EDGES:----IIIIIIII,CORNERS:IIIIIIII,CENTERS:------",
  },
  f2l: {
    setup: "z2",
    mask: "EDGES:----IIII----,CORNERS:----IIII,CENTERS:------",
  },
  oll: {
    setup: "z2",
    mask: "EDGES:DDDDOOOODDDD,CORNERS:DDDDOOOO,CENTERS:DDDDD-",
  },
  pll: {
    setup: "z2",
    mask: "EDGES:DDDD----DDDD,CORNERS:DDDD----,CENTERS:D-----",
  },
  ll: {
    setup: "z2",
    mask: "EDGES:DDDD----DDDD,CORNERS:DDDD----,CENTERS:DDDDD-",
  },
  centers: { setup: "", mask: "EDGES:IIIIIIIIIIII,CORNERS:IIIIIIII,CENTERS:------" },
  edges: { setup: "", mask: "EDGES:------------,CORNERS:IIIIIIII,CENTERS:IIIIII" },
  corners: { setup: "", mask: "EDGES:IIIIIIIIIIII,CORNERS:--------,CENTERS:IIIIII" },
};
