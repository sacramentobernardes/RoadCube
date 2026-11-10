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
  /** O que a pessoa aprende neste módulo. */
  about: string;
  color: ModuleColor;
  lessons: Lesson[];
}

const f2lCases = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => `f2l-case-${from + i}`);
const ollCases = (...numbers: number[]) => numbers.map((n) => `oll-${n}`);

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
    about: "As peças do cubo e a notação WCA, a linguagem usada em todos os algoritmos deste curso.",
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
    about: "O método em camadas com poucas fórmulas, da margarida à última camada. Ao final, você resolve o cubo sozinho.",
    color: "blue",
    lessons: [
      {
        id: "m2-cross",
        title: "Cruz Branca",
        description: "Margarida e cruz na base",
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
          theory(
            "1. A margarida",
            [
              "Segure o cubo com o amarelo em cima e leve os 4 meios brancos para a camada de cima, em volta do centro amarelo.",
              "O desenho lembra uma flor de pétalas brancas: por isso o nome margarida.",
            ],
            { view: "cross", setup: "z2", alg: "F2 R2 B2 L2", autoplay: true, loop: true },
          ),
          theory(
            "Subindo um meio branco",
            [
              "Se o meio branco está na camada do meio, um giro da face o leva para cima. Aqui, R.",
              "Em outras posições, use dois ou três movimentos, como F' R, F U' R ou U' R.",
              "Antes de subir uma peça, gire U para deixar livre o lugar onde ela vai chegar.",
            ],
            { view: "cross", setup: "z2 F2 R2 B2 L2", alg: "R", anchor: "end", autoplay: true, loop: true },
          ),
          choice("Na margarida, qual centro fica no meio da flor?", ["Branco", "Amarelo", "Verde"], 1),
          theory(
            "2. Descendo para a base",
            [
              "Gire U até a outra cor de um meio branco combinar com o centro lateral logo abaixo dele.",
              "Com essa face na frente, faça F2: o meio desce para a base, no lugar certo. Repita com os quatro.",
            ],
            { view: "cross", setup: "z2 F2 R2 B2 L2", alg: "F2 R2 B2 L2", autoplay: true, loop: true },
          ),
          choice(
            "O meio branco de cima já combina com o centro da frente. Qual movimento o leva para a base?",
            ["U", "F2", "R", "D"],
            1,
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
          choice("Depois de pronta, onde fica a cruz branca?", ["Em cima", "Na base", "Na frente"], 1),
        ],
      },
      algLesson(
        "m2-corners",
        "Primeira Camada",
        "Quinas brancas",
        ["basic-corner-right", "basic-corner-left", "basic-corner-up"],
        [
          theory("Inserindo quinas", [
            "Com a cruz branca na base, procure uma quina branca na camada de cima.",
            "Gire U até ela ficar acima do lugar dela e veja para onde o branco aponta: direita, esquerda ou para cima.",
            "Se uma quina branca estiver na base no lugar errado, use uma das fórmulas para tirá-la e depois insira de novo.",
          ]),
        ],
      ),
      algLesson("m2-middle", "Segunda Camada", "Meios: esquerda e direita", ["basic-edge-right", "basic-edge-left"], [
        theory("Meios da segunda camada", [
          "Procure um meio na camada de cima que não tenha amarelo.",
          "Gire U até a cor da frente dele combinar com o centro da frente.",
          "Se a cor de cima combina com o centro da direita, use a fórmula da direita; se combina com a esquerda, a da esquerda.",
          "Meio errado na segunda camada? Faça uma das duas fórmulas para tirá-lo e depois insira no lugar certo.",
        ]),
      ]),
      {
        id: "m2-yellow-cross",
        title: "Cruz Amarela",
        description: "Ponto, L, Linha e Cruz",
        caseIds: ["basic-yellow-cross"],
        exercises: [
          theory(
            "Os 4 estados",
            [
              "Olhando a face de cima, os meios amarelos podem formar: um Ponto, um L, uma Linha ou a Cruz pronta.",
              "Uma única fórmula (F R U R' U' F') leva de um estado ao próximo.",
            ],
            caseCube("oll-edge-dot", { autoplay: false }),
          ),
          theory(
            "Linha",
            ["Segure a linha na horizontal e faça a fórmula: a cruz fica pronta."],
            caseCube("oll-edge-line", { autoplay: true, loop: true, controls: true }),
          ),
          theory(
            "L",
            ["Segure o L apontando para trás e para a esquerda (como 9 horas). Faça a fórmula duas vezes."],
            caseCube("oll-edge-l", { alg: "F R U R' U' F' F R U R' U' F'", autoplay: true, loop: true, controls: true }),
          ),
          choice("Que formato é este?", ["Ponto", "L", "Linha", "Cruz"], 2, {
            cube: caseCube("oll-edge-line"),
          }),
          choice("Que formato é este?", ["Ponto", "L", "Linha", "Cruz"], 1, { cube: caseCube("oll-edge-l") }),
          choice("Que formato é este?", ["Ponto", "L", "Linha", "Cruz"], 0, { cube: caseCube("oll-edge-dot") }),
          choice("Partindo do Ponto, quantas vezes (no mínimo) você aplica a fórmula?", ["1", "2", "3", "4"], 2, {
            explanation: "Ponto → L → Linha → Cruz: três aplicações, ajustando a posição entre elas.",
          }),
          {
            kind: "build",
            prompt: "Monte a fórmula da cruz amarela",
            cube: caseCube("oll-edge-line"),
            given: [],
            solution: ["F", "R", "U", "R'", "U'", "F'"],
            distractors: ["F2", "R2", "U2"],
          },
          { kind: "execute", prompt: "Desafio: forme a cruz amarela a partir da Linha", caseId: "oll-edge-line" },
        ],
      },
      algLesson("m2-yellow-face", "Face Amarela", "Uma fórmula, repetida", ["basic-sune"], [
        theory("Orientando as quinas", [
          "Com a cruz amarela pronta, falta deixar as quinas com o amarelo para cima. Uma fórmula só resolve: a Sune (R U R' U R U2 R').",
          "Uma quina amarela em cima: coloque-a na frente-esquerda (formato de peixinho) e faça a fórmula.",
          "Nenhuma quina amarela em cima: deixe na frente-esquerda uma quina com o amarelo virado para a esquerda.",
          "Duas quinas amarelas em cima: deixe na frente-esquerda uma quina com o amarelo virado para a frente.",
          "Repita até a face ficar toda amarela: de 1 a 3 vezes.",
        ]),
        choice("Quantas quinas amarelas para cima aparecem no caso do \"peixinho\"?", ["0", "1", "2", "4"], 1, {
          cube: caseCube("oll-sune"),
        }),
      ]),
      algLesson("m2-corners-perm", "Permutar Quinas", "Posicionando os cantos", ["basic-corners"], [
        theory("Faróis", [
          "Olhe as laterais da camada de cima. Duas quinas com a mesma cor no mesmo lado formam \"faróis\".",
          "Coloque os faróis na frente e faça a fórmula. Sem faróis, faça uma vez de qualquer lado e procure de novo.",
          "Antes do próximo passo, gire U para alinhar as quinas com as laterais.",
        ]),
      ]),
      algLesson("m2-edges-perm", "Permutar Meios", "Finalizando o cubo!", ["basic-edges-cw", "basic-edges-ccw"], [
        theory("O último passo", [
          "Agora só faltam os meios. Procure uma face lateral completa e coloque-a atrás.",
          "Veja para que lado os outros três meios precisam girar: use a fórmula do sentido horário ou a do anti-horário.",
          "Se nenhuma face estiver completa, faça qualquer uma das duas e procure de novo.",
        ]),
      ]),
    ],
  },

  // ───────────────────────── Método intermediário ─────────────────────────
  {
    id: "m7",
    title: "Método Intermediário",
    subtitle: "Um algoritmo direto para cada situação",
    about: "Os mesmos passos do Método Básico, com uma fórmula para cada caso: menos repetições e resoluções mais rápidas.",
    color: "green",
    lessons: [
      algLesson(
        "m7-corners",
        "Primeira Camada",
        "Inserções e quinas giradas",
        ["lbl-corner-right", "lbl-corner-front", "lbl-corner-up", "lbl-corner-twist-front", "lbl-corner-twist-right"],
        [
          theory("Quinas brancas, caso a caso", [
            "No básico, a quina pela esquerda usava a mão esquerda. Aqui, a mesma situação vira F' U' F, com a quina pela frente.",
            "Se a quina já estiver no lugar, mas girada, há uma fórmula para cada lado do branco.",
          ]),
        ],
      ),
      algLesson("m7-middle", "Segunda Camada", "Meios e meio invertido", ["lbl-edge-right", "lbl-edge-left", "lbl-edge-flipped"], [
        theory("Meio invertido", [
          "Quando o meio está no lugar, mas com as cores trocadas, R U2 R' U R U2 R' U F' U' F resolve de uma vez.",
          "Repetir a fórmula da direita com U2 no meio também resolve, só que com mais movimentos.",
        ]),
      ]),
      algLesson(
        "m7-yellow-cross",
        "Cruz Amarela",
        "Um algoritmo para cada formato",
        ["lbl-yellow-cross", "lbl-yellow-cross-l", "lbl-yellow-cross-l-front", "lbl-yellow-cross-dot"],
        [
          theory("Atalhos da cruz", [
            "No básico, a mesma fórmula era repetida até formar a cruz. Aqui, cada formato tem a sua.",
            "L com os meios de trás e da esquerda: F U R U' R' F'. L com os meios da frente e da direita: f R U R' U' f'.",
            "Do Ponto, as duas fórmulas seguidas formam a cruz de uma vez.",
          ]),
        ],
      ),
      algLesson(
        "m7-yellow-face",
        "Face Amarela",
        "Os 7 casos e o método clássico",
        ["lbl-sune", "lbl-antisune", "lbl-h", "lbl-pi", "lbl-headlights", "lbl-t", "lbl-bowtie", "lbl-classic-twist"],
        [
          theory("Uma fórmula para cada caso", [
            "No básico, a Sune era repetida até resolver. Aqui, cada um dos 7 casos tem a sua fórmula.",
            "Sune e Antisune resolvem os casos de uma quina amarela; H, Pi, Faróis, T e Gravata-borboleta, os demais.",
          ]),
          theory(
            "Método clássico: R' D' R D",
            [
              "Muitos tutoriais ensinam outro caminho: segure o amarelo em cima, leve uma quina errada para a frente-direita e repita R' D' R D até o amarelo dela subir.",
              "Depois gire só a face de cima (U) para trazer a próxima quina errada e repita. Nunca gire o cubo inteiro no meio.",
              "As camadas de baixo parecem se desmontar no caminho, mas voltam sozinhas quando todas as quinas ficam certas.",
            ],
            caseCube("lbl-classic-twist", { autoplay: true, loop: true, controls: true }),
          ),
        ],
      ),
      algLesson(
        "m7-corners-perm",
        "Permutar Quinas",
        "Faróis, diagonal e método clássico",
        ["lbl-corners", "lbl-corners-front", "lbl-corners-diagonal", "lbl-classic-position", "lbl-classic-position-cw"],
        [
          theory("Faróis e diagonal", [
            "Com os faróis atrás ou na frente, há uma fórmula para cada lado.",
            "Sem faróis, as quinas precisam trocar em diagonal: a fórmula da diagonal resolve de uma vez.",
          ]),
          theory("Método clássico: posicionar antes de girar", [
            "No método clássico, esta etapa vem antes da face amarela, porque a fórmula dela gira as quinas.",
            "Procure uma quina no lugar certo (as cores combinam com as laterais, mesmo que girada) e coloque-a na frente-direita.",
            "Faça U R U' L' U R' U' L até as outras três irem para o lugar. Se nenhuma estiver certa, faça uma vez e procure de novo.",
          ]),
        ],
      ),
      algLesson("m7-edges-perm", "Permutar Meios", "Outras fórmulas para os meios", ["lbl-edges", "lbl-edges-ccw"], [
        theory("Outra forma de girar os meios", [
          "Estas fórmulas fazem o mesmo trabalho do básico, só com R e U: costumam ser mais rápidas de executar.",
          "Com a face completa atrás, a primeira gira os meios no sentido anti-horário e a segunda, no horário.",
        ]),
      ]),
    ],
  },

  // ───────────────────────── Módulo 3 ─────────────────────────
  {
    id: "m3",
    title: "CFOP: Cross & F2L",
    subtitle: "A transição para o método avançado (Fridrich)",
    about: "O início do CFOP: a cruz planejada na inspeção e os pares de quina e meio, que substituem as duas primeiras camadas.",
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
    about: "Deixe a face de cima de uma cor só em duas etapas, com 10 algoritmos.",
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
    ],
  },

  // ───────────────────────── Módulo 5 ─────────────────────────
  {
    id: "m5",
    title: "PLL",
    subtitle: "Permutação da última camada",
    about: "Coloque cada peça no lugar final: do método em duas etapas às 21 PLLs, reconhecendo os casos por dois lados.",
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

  // ───────────────────────── Módulo 6 ─────────────────────────
  {
    id: "m6",
    title: "F2L e OLL Completos",
    subtitle: "Todos os casos, para ganhar velocidade",
    about: "Os 41 casos de F2L e os 57 de OLL. Aqui estão os casos que ainda faltam, agrupados pelo padrão que você vê no cubo.",
    color: "green",
    lessons: [
      algLesson("m6-f2l-up", "F2L: Branco para Cima", "Quina com o branco virado para cima", f2lCases(9, 14), [
        theory("F2L completo", [
          "Você já junta pares de forma intuitiva. Agora vai conhecer um caminho curto para cada um dos 41 casos.",
          "Todos os algoritmos deste módulo usam o slot da frente-direita e não precisam girar o cubo.",
        ]),
      ]),
      algLesson("m6-f2l-top-1", "F2L: Quina e Meio em Cima I", "Quina de lado, meio na camada de cima", f2lCases(15, 19)),
      algLesson("m6-f2l-top-2", "F2L: Quina e Meio em Cima II", "Os outros casos com as duas peças em cima", f2lCases(20, 24)),
      algLesson("m6-f2l-edge-slot", "F2L: Meio no Slot", "Quina em cima, meio já no slot", f2lCases(25, 30)),
      algLesson("m6-f2l-corner-slot", "F2L: Quina no Slot", "Meio em cima, quina já no slot", f2lCases(31, 36)),
      algLesson("m6-f2l-both-slot", "F2L: Quina e Meio no Slot", "As duas peças presas no slot", f2lCases(37, 41)),
      algLesson("m6-oll-dot-1", "Full OLL: Ponto I", "Nenhuma aresta orientada", ollCases(1, 2, 3, 4), [
        theory("Full OLL", [
          "O Full OLL orienta a última camada de uma vez, em vez de duas. São 57 casos, e você já conhece 7 deles do 2-Look.",
          "Reconheça primeiro a forma amarela em cima. Depois, conte os amarelos nas laterais para separar casos parecidos.",
        ]),
      ]),
      algLesson("m6-oll-dot-2", "Full OLL: Ponto II", "Ponto com quinas em cima", ollCases(17, 18, 19, 20)),
      algLesson("m6-oll-square", "Full OLL: Quadrado e Raio", "Blocos e formas em raio", ollCases(5, 6, 7, 8, 11, 12)),
      algLesson("m6-oll-fish", "Full OLL: Peixe", "Quatro formas de peixe", ollCases(9, 10, 35, 37)),
      algLesson("m6-oll-knight", "Full OLL: Cavaleiro", "Formas em L do cavalo do xadrez", ollCases(13, 14, 15, 16)),
      algLesson("m6-oll-line", "Full OLL: Linha e Quinas Prontas", "Linhas e arestas por orientar", ollCases(51, 52, 55, 56, 28, 57)),
      algLesson("m6-oll-p", "Full OLL: P", "Formas de letra P", ollCases(31, 32, 43, 44)),
      algLesson("m6-oll-ctw", "Full OLL: C, T e W", "Três formas de letra", ollCases(34, 46, 33, 45, 36, 38)),
      algLesson("m6-oll-l", "Full OLL: L", "Formas de L", ollCases(47, 48, 49, 50, 53, 54)),
      algLesson("m6-oll-awkward", "Full OLL: Awkward e Raio Grande", "Os últimos casos", ollCases(29, 30, 41, 42, 39, 40)),
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
