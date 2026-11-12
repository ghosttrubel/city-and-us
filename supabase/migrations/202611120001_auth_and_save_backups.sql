-- City & Us: adopt the existing snapshot tables, or provision an empty project.
-- No DROP, TRUNCATE, data rewrite, or replacement of existing policies/triggers.
-- This file has NOT been applied to the supplied live project.
begin;

do $migration$
declare
  table_name text;
  column_spec record;
  table_oid regclass;
  user_column smallint;
begin
  if to_regclass('public.player_profiles') is null then
    create table public.player_profiles (
      user_id uuid primary key references auth.users(id) on delete cascade,
      display_name text,
      created_at timestamptz not null default now()
    );
    alter table public.player_profiles enable row level security;
    create policy player_profiles_owner on public.player_profiles
      for all to authenticated using ((select auth.uid()) = user_id)
      with check ((select auth.uid()) = user_id);
    revoke all on public.player_profiles from anon, authenticated;
    grant select, insert, update on public.player_profiles to authenticated;
  end if;

  if to_regclass('public.player_save_backups') is null then
    create table public.player_save_backups (
      user_id uuid primary key references auth.users(id) on delete cascade,
      save_format integer not null,
      payload jsonb not null,
      updated_at timestamptz not null default clock_timestamp(),
      constraint player_save_backups_one_mib
        check (octet_length(payload::text) <= 1048576)
    );
    alter table public.player_save_backups enable row level security;
    create policy player_save_backups_owner on public.player_save_backups
      for all to authenticated using ((select auth.uid()) = user_id)
      with check ((select auth.uid()) = user_id);
    revoke all on public.player_save_backups from anon, authenticated;
    grant select, insert, update on public.player_save_backups to authenticated;
    -- Only installed for a table created by this migration. Existing trigger is preserved.
    execute $function$
      create function public.city_and_us_backup_timestamp_20261112()
      returns trigger language plpgsql set search_path = '' as $body$
      begin
        new.updated_at := greatest(clock_timestamp(), old.updated_at + interval '1 microsecond');
        return new;
      end;
      $body$
    $function$;
    create trigger city_and_us_backup_timestamp
      before update on public.player_save_backups
      for each row execute function public.city_and_us_backup_timestamp_20261112();
  end if;

  -- Refuse incompatible existing objects instead of silently recreating them.
  for column_spec in
    select * from (values
      ('player_profiles','user_id','uuid'),
      ('player_profiles','display_name','text'),
      ('player_profiles','created_at','timestamp with time zone'),
      ('player_save_backups','user_id','uuid'),
      ('player_save_backups','save_format','integer'),
      ('player_save_backups','payload','jsonb'),
      ('player_save_backups','updated_at','timestamp with time zone')
    ) as expected(tbl,col,typ)
  loop
    if not exists (
      select 1 from information_schema.columns c where c.table_schema='public'
        and c.table_name=column_spec.tbl and c.column_name=column_spec.col
        and c.data_type=column_spec.typ
    ) then
      raise exception 'Schema mismatch: %.% must be %. No existing objects were replaced.',
        column_spec.tbl,column_spec.col,column_spec.typ;
    end if;
  end loop;

  foreach table_name in array array['player_profiles','player_save_backups'] loop
    table_oid := ('public.' || table_name)::regclass;
    if not exists (select 1 from pg_class where oid=table_oid and relkind='r' and relrowsecurity) then
      raise exception '% must be an ordinary table with RLS enabled. Review existing schema manually.', table_name;
    end if;
    select attnum into user_column from pg_attribute where attrelid=table_oid and attname='user_id';
    if not exists (select 1 from pg_constraint where conrelid=table_oid and contype='p' and conkey=array[user_column]) then
      raise exception '% must have user_id as its sole primary key.', table_name;
    end if;
    if not exists (select 1 from pg_constraint where conrelid=table_oid and contype='f'
      and conkey=array[user_column] and confrelid='auth.users'::regclass) then
      raise exception '%.user_id must reference auth.users.', table_name;
    end if;
    if not exists (select 1 from pg_policy where polrelid=table_oid) then
      raise exception '% needs owner-only RLS policies. None were replaced or added to an existing table.', table_name;
    end if;
  end loop;

  if not exists (
    select 1 from pg_constraint where conrelid='public.player_save_backups'::regclass
      and contype='c' and pg_get_constraintdef(oid) ~* '(octet_length|pg_column_size)'
  ) then
    raise exception 'Existing backups table lacks a recognized byte-size constraint. Verify the 1 MiB bound before adoption.';
  end if;
  if not exists (
    select 1 from pg_trigger where tgrelid='public.player_save_backups'::regclass
      and not tgisinternal and tgenabled <> 'D' and (tgtype & 16) = 16
  ) then
    raise exception 'Existing backups table needs its updated_at update trigger. No trigger was replaced.';
  end if;
end;
$migration$;

-- Adoption audit: review these results against the owner-only / 1 MiB / timestamp contract.
-- Existing policy expressions and trigger implementation are deliberately not guessed.
select tablename, policyname, roles, cmd, qual, with_check
from pg_policies where schemaname='public'
  and tablename in ('player_profiles','player_save_backups');
select conrelid::regclass as table_name, pg_get_constraintdef(oid) as definition
from pg_constraint where conrelid in ('public.player_profiles'::regclass,'public.player_save_backups'::regclass);
select pg_get_triggerdef(oid) as definition
from pg_trigger where tgrelid='public.player_save_backups'::regclass and not tgisinternal;
commit;
