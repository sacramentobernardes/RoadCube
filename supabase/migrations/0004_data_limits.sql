-- Limites para os dados que o navegador grava direto. Os valores ficam bem acima
-- do uso normal: um avatar tem menos de 150 KB, e o app tem menos de 150 casos.

alter table public.profiles
  add constraint profiles_settings_is_object check (jsonb_typeof(settings) = 'object'),
  add constraint profiles_settings_size check (octet_length(settings::text) <= 262144),
  add constraint profiles_daily_goal_max check (daily_goal_xp <= 1000);

alter table public.solves
  add constraint solves_scramble_size check (char_length(scramble) <= 400),
  add constraint solves_case_size check (char_length(case_id) <= 64);

alter table public.srs_cards add constraint srs_cards_case_size check (char_length(case_id) <= 64);
alter table public.preferred_algs add constraint preferred_algs_case_size check (char_length(case_id) <= 64);

-- Mantém só os 1000 tempos mais recentes, o mesmo limite do app.
create function private.trim_solves()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  delete from public.solves
  where id in (
    select id from public.solves
    where user_id = new.user_id
    order by created_at desc
    offset 1000
  );
  return null;
end;
$$;

create trigger solves_keep_recent
after insert on public.solves
for each row execute function private.trim_solves();

create function private.limit_case_rows()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare total integer;
begin
  execute format('select count(*) from public.%I where user_id = $1', tg_table_name) into total using new.user_id;
  if total >= 300 then
    raise exception 'row_limit' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger srs_cards_limit
before insert on public.srs_cards
for each row execute function private.limit_case_rows();

create trigger preferred_algs_limit
before insert on public.preferred_algs
for each row execute function private.limit_case_rows();

revoke execute on function private.trim_solves(), private.limit_case_rows() from public, anon, authenticated;
