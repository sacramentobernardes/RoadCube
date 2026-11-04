# RoadCube

Plataforma gamificada para aprender a resolver o Cubo Mágico, do método básico ao CFOP completo, em uma trilha no estilo dos apps de idiomas: lições curtas, XP, vidas, ofensiva diária e repetição espaçada.

## Rodando

O app exige um projeto Supabase: siga [docs/SUPABASE.md](docs/SUPABASE.md) antes de iniciar.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # build de produção
npm run lint
npm run typecheck
npm run verify:algs  # valida todos os algoritmos simulando-os no cubo
npm run verify:lessons  # confere a ordem da trilha com a tabela do banco
```

## Funcionalidades

- **Trilha** (`/`): 5 módulos e 25 lições em sequência. Cada lição desbloqueia a próxima.
- **Lições** (`/lesson/[id]`): teoria com cubo 3D animado, quiz de notação, identificação de caso, montagem de algoritmo e desafio de resolução (cubo virtual validado automaticamente ou cubo real com timer). Exercícios errados voltam para o fim da fila e custam 1 vida.
- **Treino** (`/train`): timer de speedcubing (segure espaço e solte), scrambles aleatórios, treino de casos selecionados e estatísticas (melhor tempo, ao5 e ao12 no padrão WCA).
- **Revisão** (`/review`): repetição espaçada (SM-2) dos algoritmos aprendidos. Concluir uma prática devolve 1 vida.
- **Biblioteca** (`/library`): todos os casos com animação e algoritmos alternativos. O algoritmo marcado como preferido é o usado no treino e na revisão.
- **Perfil** (`/profile`): nível, XP semanal, ofensiva, histórico e configurações.

## Estrutura

```
src/
  app/                 rotas: (auth) é pública; (app) exige login, e (main) tem a navegação
  proxy.ts             sessão e proteção de rotas
  components/          UI por área: cube, lesson, trail, train, review, library, profile, shell, ui
  data/
    algorithms.ts      biblioteca de casos e algoritmos (validada por scripts/verify-algs.mts)
    curriculum.ts      módulos, lições e exercícios
  lib/                 lógica pura: gamificação, SRS, scramble, estado (zustand), validação do cubo
scripts/verify-algs.mts
supabase/migrations/   esquema do banco e políticas RLS
docs/ARQUITETURA.md    decisões técnicas e próximos passos
docs/SUPABASE.md       configuração do Supabase e do login com Google
```

## Stack

Next.js 16 (App Router, Turbopack), React 19, Supabase (Auth + Postgres com RLS), Tailwind CSS 4, Framer Motion, Lucide, zustand e [cubing.js](https://js.cubing.net/cubing/) (TwistyPlayer para o 3D e kpuzzle para simular o cubo).
