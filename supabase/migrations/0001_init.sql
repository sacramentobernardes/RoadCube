-- RoadCube: esquema inicial.
-- Cada usuário só enxerga e altera as próprias linhas (Row Level Security).

-- ───────────── Tabelas ─────────────

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '' check (char_length(name) <= 30),
  xp integer not null default 0 check (xp >= 0),
  hearts smallint not null default 5 check (hearts between 0 and 5),
  hearts_updated_at timestamptz not null default now(),
  streak_count integer not null default 0 check (streak_count >= 0),
  streak_best integer not null default 0 check (streak_best >= 0),
  streak_last_day date,
  daily_goal_xp integer not null default 30 check (daily_goal_xp > 0),
  settings jsonb not null default '{"sound": true, "animationSpeed": 1}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  completed_at timestamptz not null default now(),
  times integer not null default 1 check (times > 0),
  best_accuracy real not null default 0 check (best_accuracy between 0 and 1),
  primary key (user_id, lesson_id)
);

create table public.lesson_history (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  accuracy real not null check (accuracy between 0 and 1),
  xp integer not null check (xp >= 0),
  duration_ms integer not null check (duration_ms >= 0),
  created_at timestamptz not null default now()
);
create index lesson_history_user_date on public.lesson_history (user_id, created_at desc);

create table public.srs_cards (
  user_id uuid not null references auth.users (id) on delete cascade,
  case_id text not null,
  ease real not null default 2.5,
  interval_days integer not null default 0 check (interval_days >= 0),
  reps integer not null default 0 check (reps >= 0),
  lapses integer not null default 0 check (lapses >= 0),
  due date not null,
  last_reviewed date,
  primary key (user_id, case_id)
);

create table public.solves (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  ms integer not null check (ms >= 0),
  dnf boolean not null default false,
  scramble text not null,
  case_id text,
  created_at timestamptz not null default now()
);
create index solves_user_date on public.solves (user_id, created_at desc);

create table public.preferred_algs (
  user_id uuid not null references auth.users (id) on delete cascade,
  case_id text not null,
  alg_index smallint not null check (alg_index >= 0),
  primary key (user_id, case_id)
);

create table public.daily_xp (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  xp integer not null default 0 check (xp >= 0),
  primary key (user_id, day)
);

-- ───────────── Gatilhos ─────────────

-- Cria o perfil no cadastro (e-mail ou Google). `search_path` vazio evita
-- sequestro de função, já que ela roda com privilégios elevados.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    left(
      coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
        nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
        split_part(new.email, '@', 1),
        ''
      ),
      30
    )
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ───────────── Permissões e RLS ─────────────

alter table public.profiles enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.lesson_history enable row level security;
alter table public.srs_cards enable row level security;
alter table public.solves enable row level security;
alter table public.preferred_algs enable row level security;
alter table public.daily_xp enable row level security;

revoke all on
  public.profiles, public.lesson_progress, public.lesson_history, public.srs_cards,
  public.solves, public.preferred_algs, public.daily_xp
from anon, authenticated;

-- O perfil é criado pelo gatilho e nunca apagado pelo cliente; `id` e
-- `created_at` não podem ser alterados.
grant select on public.profiles to authenticated;
grant update (
  name, xp, hearts, hearts_updated_at, streak_count, streak_best,
  streak_last_day, daily_goal_xp, settings
) on public.profiles to authenticated;

grant select, insert, update, delete on
  public.lesson_progress, public.lesson_history, public.srs_cards,
  public.solves, public.preferred_algs, public.daily_xp
to authenticated;

create policy "perfil: ler o próprio" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "perfil: alterar o próprio" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "progresso: dono" on public.lesson_progress
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "histórico: dono" on public.lesson_history
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "revisão: dono" on public.srs_cards
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "tempos: dono" on public.solves
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "preferidos: dono" on public.preferred_algs
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "xp diário: dono" on public.daily_xp
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
