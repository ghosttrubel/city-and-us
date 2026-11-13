-- Inspect live definitions with supabase/inspect-live.sql BEFORE applying. No row reset.
begin;
create function public.game_connection() returns jsonb language sql stable set search_path='' as $$ select jsonb_build_object('version',1,'server_time',now()); $$;
revoke all on function public.game_connection() from public;
grant execute on function public.game_connection() to anon,authenticated;
-- Deletion depends on audited cascading Auth foreign keys; fail rather than rewrite them.
do $$ declare t text; begin
 foreach t in array array['player_profiles','player_save_backups'] loop
  if not exists(select 1 from pg_constraint where conrelid=('public.'||t)::regclass and contype='f' and confrelid='auth.users'::regclass and confdeltype='c') then
   raise exception '% needs an audited ON DELETE CASCADE Auth foreign key before account deletion can be enabled',t;
  end if;
 end loop;
end $$;
create table public.account_deletion_requests (
 user_id uuid primary key references auth.users(id) on delete cascade,
 requested_at timestamptz not null default now(),
 status text not null default 'pending' check(status in ('pending','processing','completed'))
);
alter table public.account_deletion_requests enable row level security;
revoke all on public.account_deletion_requests from public,anon,authenticated;
grant select,insert on public.account_deletion_requests to authenticated;
create policy own_deletion_request on public.account_deletion_requests for select to authenticated using(user_id=(select auth.uid()));
create policy request_own_deletion on public.account_deletion_requests for insert to authenticated with check(user_id=(select auth.uid()) and status='pending');
-- Restricted operational destination: project owners via SQL Editor / server service role.
grant all on public.account_deletion_requests to service_role;
commit;
