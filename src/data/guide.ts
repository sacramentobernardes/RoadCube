import type { CubeSpec } from "@/components/cube/TwistyCube";

// Conteúdo do Guia, usado na aba da Biblioteca e na página pública /guia.
// `npm run verify:algs` confere se cada sequência é válida.

export interface GuideEntry {
  term: string;
  text: string;
  cube?: CubeSpec;
}

export interface GuideSection {
  id: string;
  title: string;
  intro: string;
  entries: GuideEntry[];
  /** Destaque ao final da seção. */
  note?: string;
}

const spin: CubeSpec = { alg: "y y y y", autoplay: true, loop: true, tempo: 0.5 };
const move = (alg: string): CubeSpec => ({ alg, autoplay: true, loop: true });

export const EXAMPLE_SCRAMBLE = "R U2 F' L D2 B R' U F2 L'";

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "pecas",
    title: "Conhecendo o cubo",
    intro: "O cubo 3x3 tem 26 peças visíveis, de três tipos. Entender cada uma é o primeiro passo.",
    entries: [
      { term: "Centros", text: "São 6 peças de uma cor só. Eles nunca mudam de posição entre si, então o centro define a cor de cada face.", cube: { ...spin, view: "centers" } },
      { term: "Meios", text: "São 12 peças de duas cores, entre duas quinas. Também são chamados de arestas.", cube: { ...spin, view: "edges" } },
      { term: "Quinas", text: "São 8 peças de três cores, nos cantos do cubo.", cube: { ...spin, view: "corners" } },
      { term: "Cores opostas", text: "No esquema padrão, branco fica oposto ao amarelo, verde ao azul e vermelho ao laranja." },
    ],
  },
  {
    id: "movimentos",
    title: "Movimentos básicos",
    intro: "Cada face tem uma letra, do inglês. A letra sozinha gira a face 90° no sentido horário, olhando de frente para ela.",
    entries: [
      { term: "R", text: "Right: gira a face da direita.", cube: move("R") },
      { term: "L", text: "Left: gira a face da esquerda.", cube: move("L") },
      { term: "U", text: "Up: gira a face de cima.", cube: move("U") },
      { term: "D", text: "Down: gira a face de baixo.", cube: move("D") },
      { term: "F", text: "Front: gira a face da frente.", cube: move("F") },
      { term: "B", text: "Back: gira a face de trás.", cube: move("B") },
      { term: "R'", text: "O apóstrofo, lido como \"linha\", gira no sentido anti-horário. R' desfaz o R.", cube: move("R'") },
      { term: "R2", text: "O número 2 gira a face 180°. Tanto faz o sentido, porque o resultado é o mesmo.", cube: move("R2") },
    ],
    note: "L, D e B também giram no horário olhando para a própria face. Vistos da frente, parecem girar ao contrário de R, U e F.",
  },
  {
    id: "camadas",
    title: "Camadas duplas e fatias",
    intro: "Aparecem nos algoritmos mais avançados, principalmente em OLL e PLL.",
    entries: [
      { term: "r", text: "Letra minúscula gira duas camadas juntas: a face e a camada do meio vizinha. Também aparece como Rw.", cube: move("r") },
      { term: "u", text: "Gira a camada de cima junto com a do meio.", cube: move("u") },
      { term: "f", text: "Gira a camada da frente junto com a do meio.", cube: move("f") },
      { term: "M", text: "Fatia entre L e R. Gira na mesma direção de L.", cube: move("M") },
      { term: "E", text: "Fatia entre U e D. Gira na mesma direção de D.", cube: move("E") },
      { term: "S", text: "Fatia entre F e B. Gira na mesma direção de F.", cube: move("S") },
    ],
  },
  {
    id: "rotacoes",
    title: "Rotações",
    intro: "Rotações giram o cubo inteiro na sua mão, sem mudar a posição das peças entre si.",
    entries: [
      { term: "x", text: "Gira o cubo inteiro na direção de R.", cube: move("x") },
      { term: "y", text: "Gira o cubo inteiro na direção de U.", cube: move("y") },
      { term: "z", text: "Gira o cubo inteiro na direção de F.", cube: move("z") },
      { term: "z2", text: "Meia volta na direção de F: troca o branco e o amarelo de lugar, e o verde continua na frente.", cube: move("z2") },
    ],
    note: "Girar uma face muda o cubo. Girar o cubo inteiro só muda como você está olhando para ele.",
  },
  {
    id: "algoritmos",
    title: "Como ler um algoritmo",
    intro: "Um algoritmo é uma sequência de movimentos que você executa em ordem.",
    entries: [
      { term: "R U R' U'", text: "Leia da esquerda para a direita e faça um movimento de cada vez. Essa sequência aparece em muitos casos.", cube: move("R U R' U'") },
      { term: "Mantenha a posição", text: "Só mude a forma de segurar o cubo se aparecer uma rotação, como x, y ou z. Fora isso, a frente continua sendo a frente." },
      { term: "Desfazer", text: "Para desfazer, faça o caminho inverso: inverta a ordem e troque o sentido. R U vira U' R'." },
    ],
  },
  {
    id: "scramble",
    title: "Como aplicar um scramble",
    intro: "Scramble é a sequência que embaralha o cubo. Com o mesmo scramble, todo mundo começa do mesmo estado.",
    entries: [
      { term: "1. Posição inicial", text: "Comece com o cubo resolvido, branco em cima e verde na frente. Assim, o vermelho fica à direita." },
      { term: "2. Aplique em ordem", text: `Faça os movimentos da esquerda para a direita, sem girar o cubo na mão. Exemplo: ${EXAMPLE_SCRAMBLE}`, cube: move(EXAMPLE_SCRAMBLE) },
      { term: "3. Confira", text: "Na aba Treinar, o cubo mostra como o scramble deve ficar. Compare as faces antes de começar." },
      { term: "4. Resolva", text: "Depois do scramble, você pode virar o cubo como quiser. No CFOP, a cruz costuma ser feita embaixo." },
    ],
    note: "O scramble usa branco em cima. Já nas telas de F2L, OLL e PLL do RoadCube, o amarelo fica em cima e o verde na frente, porque é assim que você vê o cubo durante a resolução com a cruz branca embaixo.",
  },
  {
    id: "siglas",
    title: "Nomes e siglas",
    intro: "Os termos mais usados pela comunidade e neste site.",
    entries: [
      { term: "CFOP", text: "Método usado pela maioria dos speedcubers: Cross, F2L, OLL e PLL." },
      { term: "Cruz (Cross)", text: "As quatro peças de meio de uma cor, formando uma cruz no lugar certo." },
      { term: "F2L", text: "First Two Layers: resolve as duas primeiras camadas, inserindo pares de quina e meio." },
      { term: "Par e slot", text: "Par é a quina junto do seu meio. Slot é o espaço onde esse par entra." },
      { term: "OLL", text: "Orientation of the Last Layer: deixa a face de cima de uma cor só." },
      { term: "PLL", text: "Permutation of the Last Layer: coloca as peças da última camada no lugar final." },
      { term: "2-Look", text: "Versão de OLL ou PLL feita em duas etapas, com menos algoritmos para decorar." },
      { term: "AUF", text: "Adjust U Face: ajuste final da camada de cima para alinhar o cubo." },
      { term: "Inspeção", text: "Em competições, são 15 segundos para observar o cubo antes de começar." },
      { term: "Ao5", text: "Average of 5: média de 5 tempos, sem contar o melhor e o pior." },
      { term: "DNF", text: "Did Not Finish: resolução que não vale, por não ter terminado ou por infração." },
      { term: "TPS", text: "Turns Per Second: quantos movimentos você faz por segundo." },
      { term: "WCA", text: "World Cube Association: organização que cuida das competições oficiais e da notação usada aqui." },
    ],
  },
];
