-- RoadCube: pontuação calculada no servidor.
-- O navegador deixa de gravar XP, vidas, ofensiva, progresso e histórico; ele
-- só pede ações às funções abaixo, que decidem o resultado. As somas são
-- atômicas, então duas abas ou dois dispositivos não sobrescrevem um ao outro.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ───────────── Tabelas de apoio ─────────────

-- Ordem da trilha. Mantida igual a src/data/curriculum.ts por `npm run verify:lessons`.
create table public.lessons (
  id text primary key,
  position integer not null unique
);

insert into public.lessons (id, position) values
  ('m1-anatomy', 1), ('m1-faces', 2), ('m1-prime', 3), ('m1-wide', 4), ('m1-rotations', 5),
  ('m2-cross', 6), ('m2-corners', 7), ('m2-middle', 8), ('m2-yellow-cross', 9),
  ('m2-yellow-face', 10), ('m2-corners-perm', 11), ('m2-edges-perm', 12),
  ('m3-cross', 13), ('m3-pairs', 14), ('m3-f2l-basic', 15), ('m3-f2l-adv', 16),
  ('m4-eo', 17), ('m4-ocll-1', 18), ('m4-ocll-2', 19),
  ('m5-cp', 20), ('m5-ep', 21), ('m5-full-1', 22), ('m5-full-2', 23), ('m5-full-3', 24);

-- Eventos já processados: reenviar o mesmo id não premia duas vezes.
create table public.game_events (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now()
);
create index game_events_user_kind on public.game_events (user_id, kind, created_at desc);

alter table public.lessons enable row level security;
alter table public.game_events enable row level security;
revoke all on public.lessons, public.game_events from anon, authenticated;

-- ───────────── Permissões do navegador ─────────────

revoke update on public.profiles from authenticated;
grant update (name, daily_goal_xp, settings) on public.profiles to authenticated;

revoke insert, update, delete on public.lesson_progress, public.lesson_history, public.daily_xp from authenticated;

-- Tempos e cartões de revisão seguem graváveis: não valem pontos sozinhos (o XP vem
-- de award_solve e finish_review), e o upsert exige UPDATE em todas as colunas.

-- ───────────── Funções internas (fora do alcance da API) ─────────────

create function private.current_user_id()
returns uuid language plpgsql stable set search_path = ''
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  return uid;
end;
$$;

-- O "dia" é o do usuário (fuso dele), mas não pode fugir do dia real.
create function private.check_day(p_day date)
returns void language plpgsql stable set search_path = ''
as $$
begin
  if p_day is null or abs(p_day - (now() at time zone 'utc')::date) > 1 then
    raise exception 'invalid_day';
  end if;
end;
$$;

create function private.claim(p_event uuid, p_user uuid, p_kind text)
returns boolean language plpgsql set search_path = ''
as $$
begin
  insert into public.game_events (id, user_id, kind) values (p_event, p_user, p_kind)
  on conflict (id) do nothing;
  return found;
end;
$$;

create function private.recent_event(p_user uuid, p_kind text, p_window interval)
returns boolean language sql stable set search_path = ''
as $$
  select exists (
    select 1 from public.game_events
    where user_id = p_user and kind = p_kind and created_at > now() - p_window
  );
$$;

-- +1 vida a cada 30 minutos, até 5. Igual a regenerateHearts em lib/gamification.ts.
create function private.regen_hearts(p_user uuid)
returns void language plpgsql set search_path = ''
as $$
declare
  p public.profiles;
  gained integer;
begin
  select * into p from public.profiles where id = p_user for update;
  if p.hearts >= 5 then return; end if;
  gained := floor(extract(epoch from now() - p.hearts_updated_at) / 1800);
  if gained <= 0 then return; end if;
  update public.profiles
  set hearts = least(5, hearts + gained),
      hearts_updated_at = case
        when hearts + gained >= 5 then now()
        else hearts_updated_at + gained * interval '30 minutes'
      end
  where id = p_user;
end;
$$;

create function private.touch_streak(p_user uuid, p_day date)
returns void language plpgsql set search_path = ''
as $$
begin
  update public.profiles
  set streak_count = case when streak_last_day = p_day - 1 then streak_count + 1 else 1 end,
      streak_best = greatest(streak_best, case when streak_last_day = p_day - 1 then streak_count + 1 else 1 end),
      streak_last_day = p_day
  where id = p_user and (streak_last_day is null or streak_last_day < p_day);
end;
$$;

-- Soma XP respeitando o teto diário e devolve quanto foi concedido de fato.
create function private.award(p_user uuid, p_day date, p_amount integer)
returns integer language plpgsql set search_path = ''
as $$
declare
  daily_cap constant integer := 300;
  so_far integer;
  granted integer;
begin
  select coalesce(xp, 0) into so_far from public.daily_xp where user_id = p_user and day = p_day;
  granted := greatest(0, least(p_amount, daily_cap - coalesce(so_far, 0)));
  if granted = 0 then return 0; end if;
  update public.profiles set xp = xp + granted where id = p_user;
  insert into public.daily_xp (user_id, day, xp) values (p_user, p_day, granted)
  on conflict (user_id, day) do update set xp = public.daily_xp.xp + excluded.xp;
  return granted;
end;
$$;

create function private.snapshot(p_user uuid, p_day date)
returns jsonb language sql stable set search_path = ''
as $$
  select jsonb_build_object(
    'xp', p.xp,
    'hearts', p.hearts,
    'hearts_updated_at', p.hearts_updated_at,
    'streak_count', p.streak_count,
    'streak_best', p.streak_best,
    'streak_last_day', p.streak_last_day,
    'day', p_day,
    'day_xp', coalesce((select d.xp from public.daily_xp d where d.user_id = p_user and d.day = p_day), 0)
  )
  from public.profiles p where p.id = p_user;
$$;

-- ───────────── API do jogo ─────────────

create function public.complete_lesson(
  p_event uuid, p_lesson text, p_accuracy real, p_duration_ms integer, p_day date
)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := private.current_user_id();
  lesson_position integer;
  granted integer;
  accuracy real := greatest(0, least(1, coalesce(p_accuracy, 0)));
begin
  perform private.check_day(p_day);
  if private.recent_event(uid, 'lesson', interval '10 seconds') then
    if exists (select 1 from public.game_events where id = p_event) then
      return private.snapshot(uid, p_day);
    end if;
    raise exception 'too_fast';
  end if;
  if not private.claim(p_event, uid, 'lesson') then return private.snapshot(uid, p_day); end if;

  select position into lesson_position from public.lessons where id = p_lesson;
  if lesson_position is null then raise exception 'unknown_lesson'; end if;
  if lesson_position > 1 and not exists (
    select 1 from public.lesson_progress lp
    join public.lessons l on l.id = lp.lesson_id
    where lp.user_id = uid and l.position = lesson_position - 1
  ) then
    raise exception 'lesson_locked';
  end if;

  granted := private.award(uid, p_day, case when accuracy >= 1 then 15 else 10 end);
  perform private.touch_streak(uid, p_day);

  insert into public.lesson_progress (user_id, lesson_id, best_accuracy)
  values (uid, p_lesson, accuracy)
  on conflict (user_id, lesson_id) do update
  set times = public.lesson_progress.times + 1,
      best_accuracy = greatest(public.lesson_progress.best_accuracy, excluded.best_accuracy);

  insert into public.lesson_history (id, user_id, lesson_id, accuracy, xp, duration_ms)
  values (p_event, uid, p_lesson, accuracy, granted, greatest(0, coalesce(p_duration_ms, 0)));

  return private.snapshot(uid, p_day);
end;
$$;

create function public.lose_heart(p_event uuid, p_day date)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare uid uuid := private.current_user_id();
begin
  perform private.check_day(p_day);
  if private.claim(p_event, uid, 'heart') then
    perform private.regen_hearts(uid);
    update public.profiles
    set hearts_updated_at = case when hearts >= 5 then now() else hearts_updated_at end,
        hearts = greatest(0, hearts - 1)
    where id = uid;
  end if;
  return private.snapshot(uid, p_day);
end;
$$;

create function public.finish_review(p_event uuid, p_cards integer, p_day date)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := private.current_user_id();
  reviews_today integer;
begin
  perform private.check_day(p_day);
  select count(*) into reviews_today from public.game_events
  where user_id = uid and kind = 'review' and created_at > now() - interval '1 day';

  if not private.claim(p_event, uid, 'review') then return private.snapshot(uid, p_day); end if;

  perform private.regen_hearts(uid);
  perform private.award(uid, p_day, 2 * greatest(0, least(coalesce(p_cards, 0), 50)));
  perform private.touch_streak(uid, p_day);
  -- A vida de recompensa tem limite diário para não anular o sistema de vidas.
  if reviews_today < 10 then
    update public.profiles set hearts = least(5, hearts + 1) where id = uid;
  end if;
  return private.snapshot(uid, p_day);
end;
$$;

create function public.award_solve(p_event uuid, p_day date)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := private.current_user_id();
  too_soon boolean;
begin
  perform private.check_day(p_day);
  too_soon := private.recent_event(uid, 'solve', interval '2 seconds');
  if private.claim(p_event, uid, 'solve') and not too_soon then
    perform private.award(uid, p_day, 1);
  end if;
  return private.snapshot(uid, p_day);
end;
$$;

create function public.reset_progress(p_day date)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare uid uuid := private.current_user_id();
begin
  delete from public.lesson_progress where user_id = uid;
  delete from public.lesson_history where user_id = uid;
  delete from public.srs_cards where user_id = uid;
  delete from public.solves where user_id = uid;
  delete from public.daily_xp where user_id = uid;
  update public.profiles
  set xp = 0, hearts = 5, hearts_updated_at = now(),
      streak_count = 0, streak_best = 0, streak_last_day = null
  where id = uid;
  return private.snapshot(uid, p_day);
end;
$$;

create function public.delete_my_account()
returns void language plpgsql security definer set search_path = ''
as $$
begin
  delete from auth.users where id = private.current_user_id();
end;
$$;

-- ───────────── Quem pode chamar o quê ─────────────

revoke execute on all functions in schema private from public, anon, authenticated;
revoke execute on function
  public.complete_lesson(uuid, text, real, integer, date),
  public.lose_heart(uuid, date),
  public.finish_review(uuid, integer, date),
  public.award_solve(uuid, date),
  public.reset_progress(date),
  public.delete_my_account()
from public, anon;
grant execute on function
  public.complete_lesson(uuid, text, real, integer, date),
  public.lose_heart(uuid, date),
  public.finish_review(uuid, integer, date),
  public.award_solve(uuid, date),
  public.reset_progress(date),
  public.delete_my_account()
to authenticated;
