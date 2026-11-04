import {
  algorithmLessonExercises,
  buildFromAnimation,
  caseCube,
  choice,
  moveQuiz,
  theory,
  type Exercise,
} from "@/lib/exercises";

export type ModuleColor = "green" | "blue" | "orange" | "yellow" | "red";

export interface Lesson {
  id: string;
  title: string;
  description: string;
  /** Casos que entram na revisão espaçada quando a lição é concluída. */
  caseIds: string[];
  exercises: Exercise[];
  comingSoon?: boolean;
}

export interface Module {
  id: string;
  title: string;
  subtitle: string;
  color: ModuleColor;
  lessons: Lesson[];
}

function algLesson(id: string, title: string, description: string, caseIds: string[], intro: Exercise[] = []): Lesson {
  return { id, title, description, caseIds, exercises: algorithmLessonExercises(caseIds, intro) };
}

// A ordem das lições também vive na tabela `lessons` do banco: ao mudar aqui, crie
// uma migration e rode `npm run verify:lessons`.
export const CURRICULUM: Module[] = [
  // ───────────────────────── Módulo 1 ─────────────────────────
  {
    id: "m1",
    title: "Fundamentos & Notação",
    subtitle: "Conheça as peças e aprenda a ler algoritmos",
    color: "green",
    lessons: [
      {
        id: "m1-anatomy",
        title: "Anatomia do Cubo",
        description: "Centros, meios e quinas",
        caseIds: [],
        exercises: [
          theory(
            "As peças do cubo",
            [
              "O cubo 3x3 tem 26 peças visíveis, de três tipos:",
              "Centros (6): têm uma cor só e nunca mudam de posição entre si. O centro define a cor de cada face.",
              "Meios (12): ficam entre duas quinas e têm duas cores.",
              "Quinas (8): ficam nos cantos e têm três cores.",
            ],
            { autoplay: true, loop: true, alg: "y y y y", tempo: 0.5 },
          ),
          choice("Quantas cores tem uma quina?", ["1", "2", "3", "4"], 2),
          choice("Quantos meios existem no cubo?", ["6", "8", "12", "26"], 2),
          theory("O esquema de cores", [
            "No esquema padrão, as cores opostas são sempre as mesmas:",
            "Branco ↔ Amarelo · Verde ↔ Azul · Vermelho ↔ Laranja.",
            "Como os centros não se movem entre si, essa relação vale para qualquer cubo embaralhado.",
          ]),
          choice("Qual cor fica oposta ao branco?", ["Verde", "Amarelo", "Vermelho", "Azul"], 1),
          choice("Uma peça com exatamente duas cores é um...", ["Centro", "Meio", "Quina"], 1),
          choice(
            "Os centros mudam de posição uns em relação aos outros quando você gira as faces?",
            ["Sim", "Não"],
            1,
            { explanation: "Os centros só giram no lugar; por isso eles definem a cor de cada face." },
          ),
        ],
      },
      {
        id: "m1-faces",
        title: "As 6 Faces",
        description: "R, L, U, D, F e B",
        caseIds: [],
        exercises: [
          theory(
            "Notação WCA",
            [
              "Cada face tem uma letra (do inglês): R (Right, direita), L (Left, esquerda), U (Up, cima), D (Down, baixo), F (Front, frente) e B (Back, trás).",
              "A letra sozinha significa girar a face 90° no sentido horário, olhando de frente para aquela face.",
            ],
            { alg: "R", autoplay: true, loop: true },
          ),
          moveQuiz("R", ["L", "U", "F"]),
          theory("U e F", ["U gira a face de cima; F gira a face da frente. Veja os dois em sequência."], {
            alg: "U F",
            autoplay: true,
            loop: true,
          }),
          moveQuiz("U", ["D", "R", "B"]),
          moveQuiz("F", ["B", "R", "U"]),
          theory(
            "L, D e B",
            [
              "Atenção: L, D e B também giram no horário olhando para a própria face. Por isso, vistos da frente, parecem girar \"ao contrário\" de R, U e F.",
            ],
            { alg: "L D B", autoplay: true, loop: true },
          ),
          moveQuiz("L", ["R", "D", "F"]),
          moveQuiz("D", ["U", "L", "B"]),
          moveQuiz("B", ["F", "L", "D"]),
        ],
      },
      {
        id: "m1-prime",
        title: "Anti-horário e Duplos",
        description: "Os modificadores ' e 2",
        caseIds: [],
        exercises: [
          theory(
            "O apóstrofo (')",
            ["Uma letra com apóstrofo (lê-se \"linha\") gira a face no sentido anti-horário. R' desfaz o R."],
            { alg: "R R'", autoplay: true, loop: true },
          ),
          choice(
            "O que o movimento U' faz?",
            [
              "Gira a face de cima 90° no sentido horário",
              "Gira a face de cima 90° no sentido anti-horário",
              "Gira a face de cima 180°",
              "Gira a face de baixo no sentido anti-horário",
            ],
            1,
          ),
          moveQuiz("R'", ["R", "L", "L'"]),
          theory("Movimentos duplos (2)", ["O número 2 significa girar a face 180°. R2 é o mesmo que R R (ou R' R')."], {
            alg: "R2",
            autoplay: true,
            loop: true,
          }),
          moveQuiz("U2", ["U", "U'", "D2"]),
          moveQuiz("F'", ["F", "B", "F2"]),
          choice("Qual movimento desfaz R2?", ["R", "R'", "R2", "L2"], 2, {
            explanation: "Girar 180° de novo volta ao início, então R2 desfaz a si mesmo.",
          }),
          buildFromAnimation("R U R' U'", ["R2", "U2", "L"]),
          buildFromAnimation("F R U' R'", ["F'", "R2", "U"]),
        ],
      },
      {
        id: "m1-wide",
        title: "Camadas Duplas e Fatias",
        description: "r, u, f, M, E e S",
        caseIds: [],
        exercises: [
          theory(
            "Camadas duplas",
            [
              "Letra minúscula (r, u, f, l, d, b) gira duas camadas juntas: a face e a camada do meio vizinha.",
              "Também aparece como Rw, Uw, Fw. Veja o r:",
            ],
            { alg: "r", autoplay: true, loop: true },
          ),
          moveQuiz("r", ["R", "l", "M"]),
          moveQuiz("u", ["U", "d", "E"]),
          theory(
            "Fatias (camadas do meio)",
            [
              "M: camada entre L e R, gira na mesma direção de L.",
              "E: camada entre U e D, gira na mesma direção de D.",
              "S: camada entre F e B, gira na mesma direção de F.",
            ],
            { alg: "M E S", autoplay: true, loop: true },
          ),
          moveQuiz("M", ["r", "M'", "S"]),
          moveQuiz("E", ["u", "M", "S'"]),
          choice("O movimento r equivale a...", ["R + M", "R + M'", "L + M'", "R + E"], 1, {
            explanation: "r gira R junto com a fatia do meio na direção de R, que é M'.",
          }),
          moveQuiz("f", ["F", "S", "b"]),
        ],
      },
      {
        id: "m1-rotations",
        title: "Rotações x, y, z",
        description: "Girando o cubo inteiro",
        caseIds: [],
        exercises: [
          theory(
            "Rotações",
            [
              "Rotações giram o cubo inteiro, sem mudar nada entre as peças.",
              "x: na direção de R · y: na direção de U · z: na direção de F.",
            ],
            { alg: "x y z", autoplay: true, loop: true },
          ),
          moveQuiz("x", ["y", "z", "R"]),
          moveQuiz("y", ["x", "U", "z"]),
          moveQuiz("z", ["x", "y'", "F"]),
          moveQuiz("y'", ["y", "U'", "x'"]),
          choice("Uma rotação muda a posição das peças entre si?", ["Sim", "Não"], 1),
          choice("Para colocar a face amarela em cima a partir do branco em cima, use...", ["y2", "x2 ou z2", "x", "U2"], 1),
          buildFromAnimation("y R U R'", ["x", "U'", "R2"]),
        ],
      },
    ],
  },

  // ───────────────────────── Módulo 2 ─────────────────────────
  {
    id: "m2",
    title: "Método Básico",
    subtitle: "Resolva o cubo inteiro, camada por camada",
    color: "blue",
    lessons: [
      {
        id: "m2-cross",
        title: "Cruz Branca",
        description: "Orientar e alinhar com os centros",
        caseIds: [],
        exercises: [
          theory(
            "O objetivo",
            [
              "O primeiro passo é formar uma cruz branca: os 4 meios brancos em volta do centro branco.",
              "Não basta formar o \"+\": a segunda cor de cada meio precisa combinar com o centro lateral.",
            ],
            { view: "cross", autoplay: true, loop: true, alg: "y y y y", tempo: 0.5 },
          ),
          choice(
            "Quando a cruz branca está correta?",
            [
              "Quando os 4 meios brancos formam um +",
              "Quando os 4 meios brancos formam um + e combinam com os centros laterais",
              "Quando a face branca inteira está pronta",
            ],
            1,
          ),
          theory(
            "Trazendo um meio para cima",
            [
              "Se um meio branco está embaixo, combinando com o centro da frente, um F2 o leva para cima no lugar certo.",
              "Dica: gire U para posicionar antes de subir a peça, assim você não desmancha os meios já resolvidos.",
            ],
            { view: "cross", alg: "F2", anchor: "end", autoplay: true, loop: true },
          ),
          choice("Quantos meios brancos formam a cruz?", ["2", "4", "6", "8"], 1),
          choice(
            "Um meio branco está embaixo da frente e combina com o centro verde da frente. O que fazer?",
            ["U", "F2", "R2", "D"],
            1,
          ),
          theory(
            "Meio na camada do meio",
            [
              "Se o meio branco está na camada do meio, um único giro de face (F, F', R ou R'...) o leva para cima.",
              "Antes, alinhe com U para que ele chegue já no lugar certo.",
            ],
            { view: "cross", alg: "F", anchor: "end", autoplay: true, loop: true },
          ),
          choice(
            "Depois de formar a cruz em cima, o que fazemos para resolver as quinas brancas?",
            ["Viramos a cruz para baixo (amarelo em cima)", "Mantemos a cruz em cima", "Desfazemos a cruz"],
            0,
          ),
        ],
      },
      algLesson(
        "m2-corners",
        "Primeira Camada",
        "Quinas brancas",
        ["lbl-corner-right", "lbl-corner-front", "lbl-corner-up"],
        [
          theory("Inserindo quinas", [
            "Com a cruz branca embaixo, procure uma quina branca na camada de cima.",
            "Gire U até ela ficar acima do lugar dela (frente-direita) e veja para onde o branco aponta.",
            "Atalho: repetir R U R' U' até a quina resolver também funciona em qualquer caso!",
          ]),
        ],
      ),
      algLesson("m2-middle", "Segunda Camada", "Meios: esquerda e direita", ["lbl-edge-right", "lbl-edge-left"], [
        theory("Meios da segunda camada", [
          "Procure um meio na camada de cima que não tenha amarelo.",
          "Gire U até a cor da frente dele combinar com o centro da frente (formando um T invertido).",
          "Se a cor de cima dele combina com o centro da direita, use o algoritmo da direita; se combina com a esquerda, o da esquerda.",
        ]),
      ]),
      {
        id: "m2-yellow-cross",
        title: "Cruz Amarela",
        description: "Ponto, L, Linha e Cruz",
        caseIds: ["lbl-yellow-cross"],
        exercises: [
          theory(
            "Os 4 estados",
            [
              "Olhando a face de cima, os meios amarelos podem formar: um Ponto, um L, uma Linha ou a Cruz pronta.",
              "Um único algoritmo (F R U R' U' F') leva de um estado ao próximo.",
            ],
            caseCube("oll-edge-dot", { autoplay: false }),
          ),
          theory(
            "Linha",
            ["Segure a linha na horizontal e faça o algoritmo: a cruz fica pronta."],
            caseCube("oll-edge-line", { autoplay: true, loop: true, controls: true }),
          ),
          theory(
            "L",
            ["Segure o L apontando para trás e para a esquerda (como 9 horas). Faça o algoritmo duas vezes."],
            caseCube("oll-edge-l", { alg: "F R U R' U' F' F R U R' U' F'", autoplay: true, loop: true, controls: true }),
          ),
          choice("Que formato é este?", ["Ponto", "L", "Linha", "Cruz"], 2, {
            cube: caseCube("oll-edge-line"),
          }),
          choice("Que formato é este?", ["Ponto", "L", "Linha", "Cruz"], 1, { cube: caseCube("oll-edge-l") }),
          choice("Que formato é este?", ["Ponto", "L", "Linha", "Cruz"], 0, { cube: caseCube("oll-edge-dot") }),
          choice("Partindo do Ponto, quantas vezes (no mínimo) você aplica o algoritmo?", ["1", "2", "3", "4"], 2, {
            explanation: "Ponto → L → Linha → Cruz: três aplicações, ajustando a posição entre elas.",
          }),
          {
            kind: "build",
            prompt: "Monte o algoritmo da cruz amarela",
            cube: caseCube("oll-edge-line"),
            given: [],
            solution: ["F", "R", "U", "R'", "U'", "F'"],
            distractors: ["F2", "R2", "U2"],
          },
          { kind: "execute", prompt: "Desafio: forme a cruz amarela a partir da Linha", caseId: "oll-edge-line" },
        ],
      },
      algLesson("m2-yellow-face", "Face Amarela", "OLL básico com a Sune", ["lbl-sune"], [
        theory("Orientando as quinas", [
          "Com a cruz amarela pronta, falta deixar as quinas com o amarelo para cima.",
          "No método básico usamos só a Sune (R U R' U R U2 R'), repetindo e ajustando U entre as aplicações.",
          "Se houver uma única quina amarela em cima, coloque-a na frente-esquerda (formato de peixinho).",
        ]),
        choice("Quantas quinas amarelas para cima aparecem no caso do \"peixinho\"?", ["0", "1", "2", "4"], 1, {
          cube: caseCube("oll-sune"),
        }),
      ]),
      algLesson("m2-corners-perm", "Permutar Quinas", "Posicionando os cantos", ["lbl-corners"], [
        theory("Faróis", [
          "Olhe as laterais da camada de cima. Duas quinas com a mesma cor no mesmo lado formam \"faróis\".",
          "Coloque os faróis atrás e aplique o algoritmo. Se não houver faróis, aplique uma vez e procure de novo.",
        ]),
      ]),
      algLesson("m2-edges-perm", "Permutar Meios", "Finalizando o cubo!", ["lbl-edges"], [
        theory("O último passo", [
          "Agora só faltam os meios. Procure uma face lateral completa e coloque-a atrás.",
          "O algoritmo gira os três meios restantes. Se ainda não resolver, aplique de novo.",
          "Se nenhuma face estiver completa, aplique uma vez de qualquer posição.",
        ]),
      ]),
    ],
  },

  // ───────────────────────── Módulo 3 ─────────────────────────
  {
    id: "m3",
    title: "CFOP: Cross & F2L",
    subtitle: "A transição para o método avançado (Fridrich)",
    color: "orange",
    lessons: [
      {
        id: "m3-cross",
        title: "Cross Avançada",
        description: "Planejamento na inspeção",
        caseIds: [],
        exercises: [
          theory("O que muda no CFOP", [
            "CFOP = Cross, F2L, OLL e PLL. A cruz agora é feita diretamente embaixo, sem virar o cubo depois.",
            "Assim você enxerga a camada de cima o tempo todo e emenda direto no F2L.",
          ]),
          theory("Inspeção de 15 segundos", [
            "Em competições WCA você tem 15 segundos para inspecionar o cubo antes de começar.",
            "Use esse tempo para planejar a cruz inteira. Toda cruz pode ser resolvida em no máximo 8 movimentos.",
          ]),
          choice("Onde a cruz é montada no CFOP?", ["Em cima", "Embaixo", "Na frente"], 1),
          choice("Quanto tempo de inspeção a WCA permite?", ["5 segundos", "15 segundos", "30 segundos", "1 minuto"], 1),
          choice("Qual é o número máximo de movimentos para resolver qualquer cruz?", ["4", "8", "12", "20"], 1),
          choice(
            "Por que fazer a cruz embaixo?",
            [
              "Porque é obrigatório pela WCA",
              "Para enxergar as peças do F2L sem virar o cubo",
              "Porque é mais fácil de ver a cruz",
            ],
            1,
          ),
        ],
      },
      algLesson(
        "m3-pairs",
        "Conceito de Pares",
        "Quina + meio juntos",
        ["f2l-1", "f2l-4"],
        [
          theory("Pares", [
            "No F2L, a quina branca e o meio correspondente são juntados na camada de cima formando um par.",
            "Depois, o par é inserido de uma vez no seu slot. Isso substitui a primeira e a segunda camada do método básico.",
          ]),
          choice("Quantos pares são inseridos no F2L?", ["2", "3", "4", "8"], 2),
        ],
      ),
      algLesson("m3-f2l-basic", "F2L Intuitivo", "Casos básicos e alinhamentos", ["f2l-2", "f2l-3", "f2l-5", "f2l-6"]),
      algLesson("m3-f2l-adv", "F2L Avançado", "Casos complexos e slots traseiros", ["f2l-7", "f2l-8", "f2l-9", "f2l-10"], [
        theory("Inserções traseiras", [
          "Nem sempre o slot livre está na frente. Inserir nos slots de trás evita rotações do cubo (y) e economiza tempo.",
        ]),
      ]),
    ],
  },

  // ───────────────────────── Módulo 4 ─────────────────────────
  {
    id: "m4",
    title: "OLL",
    subtitle: "Orientação da última camada",
    color: "yellow",
    lessons: [
      algLesson("m4-eo", "2-Look OLL: Arestas", "Linha, L e Ponto", ["oll-edge-line", "oll-edge-l", "oll-edge-dot"], [
        theory("OLL em duas etapas", [
          "O 2-Look OLL divide a orientação em: 1) orientar as arestas (formar a cruz) e 2) orientar as quinas.",
          "São só 10 algoritmos, contra 57 do Full OLL.",
        ]),
      ]),
      algLesson("m4-ocll-1", "2-Look OLL: Quinas I", "Sune, Antisune, H e Pi", [
        "oll-sune",
        "oll-antisune",
        "oll-h",
        "oll-pi",
      ]),
      algLesson("m4-ocll-2", "2-Look OLL: Quinas II", "Faróis, T e Gravata", [
        "oll-headlights",
        "oll-chameleon",
        "oll-bowtie",
      ]),
      {
        id: "m4-full",
        title: "Full OLL",
        description: "Os 57 casos por padrão visual",
        caseIds: [],
        exercises: [],
        comingSoon: true,
      },
    ],
  },

  // ───────────────────────── Módulo 5 ─────────────────────────
  {
    id: "m5",
    title: "PLL",
    subtitle: "Permutação da última camada",
    color: "red",
    lessons: [
      algLesson("m5-cp", "2-Look PLL: Quinas", "T e Y", ["pll-t", "pll-y"], [
        theory("PLL em duas etapas", [
          "Primeiro posicione as quinas, depois os meios.",
          "Faróis em um lado → use a T (com os faróis à esquerda). Nenhum farol → use a Y.",
        ]),
      ]),
      algLesson("m5-ep", "2-Look PLL: Meios", "Ua, Ub, H e Z", ["pll-ua", "pll-ub", "pll-h", "pll-z"]),
      algLesson("m5-full-1", "Full PLL: A, E e F", "Permutações de quinas", ["pll-aa", "pll-ab", "pll-e", "pll-f"], [
        theory("Reconhecimento de 2 lados", [
          "No Full PLL você identifica o caso olhando só dois lados (frente e direita), sem girar o cubo.",
          "Procure faróis, blocos de 2 ou 3 cores iguais e o padrão de cores entre eles.",
        ]),
      ]),
      algLesson("m5-full-2", "Full PLL: J, R e V", "Trocas adjacentes", ["pll-ja", "pll-jb", "pll-ra", "pll-rb", "pll-v"]),
      algLesson("m5-full-3", "Full PLL: N e G", "Os casos mais difíceis", [
        "pll-na",
        "pll-nb",
        "pll-ga",
        "pll-gb",
        "pll-gc",
        "pll-gd",
      ]),
    ],
  },
];

export const ALL_LESSONS: Lesson[] = CURRICULUM.flatMap((m) => m.lessons);

export function findLesson(id: string) {
  for (const mod of CURRICULUM) {
    const index = mod.lessons.findIndex((l) => l.id === id);
    if (index >= 0) return { module: mod, lesson: mod.lessons[index], index };
  }
  return null;
}

/** Ordem linear da trilha: cada lição desbloqueia a seguinte. */
export function isLessonUnlocked(id: string, completed: Record<string, unknown>) {
  const order = ALL_LESSONS.filter((l) => !l.comingSoon);
  const idx = order.findIndex((l) => l.id === id);
  if (idx <= 0) return idx === 0;
  return Boolean(completed[order[idx - 1].id]);
}
