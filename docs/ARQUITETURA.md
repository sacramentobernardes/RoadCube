# Arquitetura do RoadCube

## Identidade visual

Estilo editorial: fundo cinza suave, divisórias de 1px, títulos em Geist com espaçamento negativo e rótulos em IBM Plex Mono maiúsculo (`Kicker`). As cores do cubo aparecem só como acento (cada módulo tem uma). O cubo 3D sempre aparece dentro da `CubeFrame`, uma janela escura com barra de título mono e etiquetas (`Tag`). Primitivos ficam em `components/ui`.

Largura: toda página usa `.page-width`, que ocupa a janela com margem proporcional, até 2000px. A partir de `2xl`, a trilha vira duas colunas. Na Home, a partir de `xl`, texto e cubo formam um bloco centralizado, com as métricas em faixa horizontal logo abaixo. Os cubos têm tamanho limitado, inclusive pela altura da janela. Texto corrido fica limitado a cerca de 65 caracteres.

Temas: claro, escuro ou sistema (`lib/theme.ts`), escolhidos por aparelho. Os tokens ficam em `globals.css`; os acentos do tema claro têm contraste WCAG AA. Os adesivos do cubo têm paleta própria, em `lib/cube-theme.ts`.

## Visão geral

Aplicação Next.js 16 (App Router). As páginas são leves e delegam a componentes cliente, porque quase tudo depende do progresso do usuário e do cubo 3D, que só existe no navegador.

```
Rotas (src/app)  →  Componentes de tela (src/components/*)  →  Lógica pura (src/lib)  +  Conteúdo (src/data)
                                                    ↘ estado global: useRoadCube (zustand + persist)
```

## Conteúdo

- `src/data/algorithms.ts`: cada caso tem id, conjunto (beginner/f2l/oll/pll), grupo, dica de reconhecimento, algoritmos (o primeiro é o padrão), a vista do cubo e uma regra `preserve`, que diz o que o algoritmo não pode desmontar.
- `scripts/verify-algs.mts` simula cada algoritmo com o kpuzzle do cubing.js e confere três coisas: (1) a regra `preserve`; (2) se o algoritmo não é identidade; (3) se as alternativas resolvem o mesmo caso, a menos de AUF (para OLL, só a orientação). **Rode `npm run verify:algs` sempre que editar algoritmos.**
- `src/data/curriculum.ts`: módulos e lições. As lições de algoritmos são geradas por `algorithmLessonExercises` (`src/lib/exercises.ts`), na sequência apresentação → montagem → identificação → desafio. As lições conceituais são escritas à mão com os helpers `theory`, `choice`, `moveQuiz` e `buildFromAnimation`.

## Cubo 3D

- `components/cube/TwistyCube.tsx` envolve o `TwistyPlayer` (Web Component), que é importado dinamicamente no cliente.
- Para mostrar um caso, use `anchor: "end"` com o algoritmo. O cubing.js monta o estado que esse algoritmo resolve, sem precisar inverter nada à mão.
- Vistas (`lib/cube-views.ts`): no CFOP o cubo é girado com `z2` (amarelo em cima, verde na frente), e a máscara de stickering é aplicada por identidade de peça.
- **Pegadinha:** sem a regra CSS em `globals.css` (`twisty-player { grid-template-rows: minmax(0,1fr) }`), o player fica com altura 0 quando `controlPanel = "none"`.
- Paleta do cubo (`lib/cube-theme.ts`): os materiais dos adesivos do cubing.js são compartilhados, então o app os recolore uma vez. A cor gravada no material é o próprio valor sRGB do hex, sem conversão.
- Os controles de reprodução são próprios (`controls` no `TwistyCube`); a barra nativa do cubing.js nunca é usada.
- `LazyCube` só monta o cubo quando ele está visível, porque o navegador limita o número de contextos WebGL.
- Validação do cubo virtual: `lib/cube-state.ts` aplica os movimentos do usuário ao caso e confere se o cubo ficou resolvido (aceitando AUF e rotações).

## Gamificação

| Mecânica | Regra | Onde |
|---|---|---|
| Vidas | 5 no máximo; −1 por erro em lição; +1 a cada 30 min ou ao concluir uma revisão | `lib/gamification.ts`, `store.loseHeart` |
| XP | Lição: 10 (+5 se perfeita); revisão: 2 por card; resolução no timer: 1 | `XP` em `lib/gamification.ts` |
| Nível | Nível N exige 50·(N−1)·N XP acumulados | `levelFromXp` |
| Ofensiva | Conta dias seguidos com lição ou revisão; zera ao pular um dia | `bumpStreak`, `liveStreak` |
| Meta diária | 30 XP | `DAILY_GOAL_XP` |
| Revisão espaçada | SM-2 simplificado com 4 notas; os casos entram ao concluir a lição | `lib/srs.ts` |

## Autenticação e segurança

Supabase Auth com e-mail/senha e Google (opcional). A sessão fica em cookies gerenciados pelo `@supabase/ssr` e sobrevive ao fechamento do navegador. São três barreiras independentes:

1. **`src/proxy.ts`:** renova a sessão e redireciona visitantes para `/login`, preservando o destino em `?next=` (validado por `safeNext` contra redirecionamento aberto). Só `/login`, `/signup`, `/forgot-password` e `/auth/*` são públicas.
2. **`requireUser()` (`lib/auth/dal.ts`):** toda página protegida chama no servidor, porque layouts não reexecutam na navegação. Página nova dentro de `(app)` também precisa chamar.
3. **RLS no Postgres:** cada tabela só devolve as linhas do próprio usuário. É a barreira que vale mesmo se o código da aplicação falhar.

### Pontuação no servidor

O navegador não grava XP, vidas, ofensiva, progresso nem histórico: essas colunas não têm permissão de escrita. Ele chama as funções de `0002_server_game_logic.sql`, que definem o XP, conferem se a lição está desbloqueada (tabela `lessons`) e aplicam limites: 300 XP por dia, 10 s entre lições e 10 vidas de recompensa por dia.

**Limite que continua existindo:** o servidor não vê as respostas, então precisão e erros são informados pelo navegador. Quem manipular as chamadas consegue no máximo o teto diário em lições que já desbloqueou em ordem. Para um ranking competitivo, seria preciso validar as respostas no servidor.

## Persistência

O Supabase é a fonte da verdade; o store zustand é a cópia em memória que a interface lê.

- **Carga:** `(app)/layout.tsx` lê os dados no servidor (`loadUserData`) e `UserDataProvider` preenche o store em um `useEffect`. **Nunca preencha o store durante a renderização:** no servidor o módulo é compartilhado entre requisições, e os dados de um usuário vazariam para outro.
- **Eventos de jogo:** as ações do store atualizam a tela na hora e entram na fila `pending`. `lib/sync.ts` envia a fila em ordem às funções do banco, e a resposta do servidor substitui o cálculo otimista. Cada evento tem um id, então reenviar não premia duas vezes. Recusas de regra de negócio (`P0001`) descartam o evento e recarregam do banco.
- **Dados livres (nome, ajustes, revisão, tempos):** `lib/sync.ts` compara o estado com a última versão salva e envia só a diferença, com debounce de 800 ms.
- **Falhas de rede:** repete a cada 5 s e mostra "não salvo" no cabeçalho.
- **Falha de leitura:** `loadUserData` lança erro de propósito e `app/error.tsx` assume. Seguir com estado vazio sobrescreveria o progresso real com zeros. O `error.tsx` fica na raiz porque um boundary não captura erros do layout do próprio segmento.
- **Várias abas e dispositivos:** a pontuação é somada de forma atômica no banco, então nada se perde. Ao voltar para uma aba (após 15 s), o app recarrega do banco. Nos dados livres, a última gravação de cada linha vence.

Esquema em `supabase/migrations/`. Passo a passo de configuração em [SUPABASE.md](SUPABASE.md).

## Pendências de conteúdo

- Full OLL (57 casos): a lição `m4-full` está marcada como `comingSoon`.
- Mais casos de F2L (há 10, dos 41).
- Notificações de revisão (Web Push).
