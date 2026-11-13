-- Additive, participant-only direct messaging. Inspect live objects first; names
-- deliberately fail on collision rather than adopting unknown policies.
begin;
create table public.chat_players (
 user_id uuid primary key references auth.users(id) on delete cascade,
 player_id uuid not null unique default gen_random_uuid(),
 display_name text not null check(length(display_name) between 1 and 24)
);
create table public.chat_conversations (
 id uuid primary key default gen_random_uuid(),
 user_a uuid references auth.users(id) on delete set null,
 user_b uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 unique(user_a,user_b),check(user_a<user_b)
);
create table public.chat_messages (
 id bigint generated always as identity primary key,
 conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
 sender_id uuid not null references auth.users(id) on delete cascade,
 client_id uuid not null, body text not null check(length(body) between 1 and 2000),
 created_at timestamptz not null default clock_timestamp(),
 delivered_at timestamptz,read_at timestamptz,
 unique(sender_id,client_id)
);
create index chat_message_pages on public.chat_messages(conversation_id,id desc);
create index chat_send_limits on public.chat_messages(sender_id,created_at desc);
create table public.chat_blocks (
 owner_id uuid not null references auth.users(id) on delete cascade,
 target_id uuid not null references auth.users(id) on delete cascade,
 primary key(owner_id,target_id),check(owner_id<>target_id)
);
create table public.chat_mutes (
 owner_id uuid not null references auth.users(id) on delete cascade,
 conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
 primary key(owner_id,conversation_id)
);
create table public.chat_reports (
 id uuid primary key default gen_random_uuid(),
 reporter_id uuid not null references auth.users(id) on delete cascade,
 subject_id uuid not null references auth.users(id) on delete cascade,
 message_id bigint not null references public.chat_messages(id) on delete cascade,
 reason text not null check(length(reason) between 10 and 1000),
 evidence text not null,created_at timestamptz not null default now(),
 status text not null default 'pending' check(status in ('pending','reviewing','resolved')),
 unique(reporter_id,message_id)
);
-- Membership helpers avoid recursive RLS and use only verified auth.uid().
create function public.chat_member(cid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.chat_conversations where id=cid and auth.uid() in(user_a,user_b));
$$;
create function public.chat_blocked(a uuid,b uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.chat_blocks where (owner_id=a and target_id=b) or (owner_id=b and target_id=a));
$$;
-- No direct writes: all mutations go through identity-checked, rate-limited RPCs.
alter table public.chat_players enable row level security;
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_blocks enable row level security;
alter table public.chat_mutes enable row level security;
alter table public.chat_reports enable row level security;
revoke all on public.chat_players,public.chat_conversations,public.chat_messages,public.chat_blocks,public.chat_mutes,public.chat_reports from public,anon,authenticated;
grant select on public.chat_conversations,public.chat_messages,public.chat_blocks,public.chat_mutes to authenticated;
create policy chat_participant_conversations on public.chat_conversations for select to authenticated using(auth.uid() in(user_a,user_b));
create policy chat_participant_messages on public.chat_messages for select to authenticated using(public.chat_member(conversation_id));
create policy own_chat_blocks on public.chat_blocks for select to authenticated using(owner_id=(select auth.uid()));
create policy own_chat_mutes on public.chat_mutes for select to authenticated using(owner_id=(select auth.uid()));
-- Reports have NO player read policy. Project-owner SQL Editor/service role is
-- the restricted moderation destination; no automatic outgoing messages/emails.
grant all on public.chat_reports to service_role;
create function public.chat_identity(p_name text default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();r public.chat_players;
begin
 if uid is null then raise exception 'Sign in first';end if;
 insert into public.chat_players(user_id,display_name) values(uid,coalesce(nullif(trim(left(p_name,24)),''),'Player')) on conflict(user_id) do nothing;
 if p_name is not null and length(trim(p_name)) between 1 and 24 then update public.chat_players set display_name=trim(p_name) where user_id=uid;end if;
 select * into r from public.chat_players where user_id=uid;
 return jsonb_build_object('player_id',r.player_id,'display_name',r.display_name);
end $$;
create function public.chat_lookup(p_query text) returns table(player_id uuid,display_name text) language sql stable security definer set search_path='' as $$
 select p.player_id,p.display_name from public.chat_players p where auth.uid() is not null and p.user_id<>auth.uid() and not public.chat_blocked(auth.uid(),p.user_id)
 and length(trim(p_query))>=3 and (p.player_id::text=trim(p_query) or p.display_name ilike replace(replace(replace(left(trim(p_query),24),'\','\\'),'%','\%'),'_','\_')||'%' escape '\') order by p.display_name,p.player_id limit 20;
$$;
create function public.chat_open(p_player uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();peer uuid;cid uuid;
begin
 if uid is null then raise exception 'Sign in first';end if;
 select user_id into peer from public.chat_players where player_id=p_player;
 if peer is null or peer=uid or public.chat_blocked(uid,peer) then raise exception 'Player unavailable';end if;
 perform pg_advisory_xact_lock(hashtext(uid::text));
 select id into cid from public.chat_conversations where user_a=least(uid,peer) and user_b=greatest(uid,peer);
 if cid is not null then return cid;end if;
 if (select count(*) from public.chat_conversations where uid in(user_a,user_b) and created_at>now()-interval '1 day')>=30 then raise exception 'Daily conversation limit reached';end if;
 insert into public.chat_conversations(user_a,user_b) values(least(uid,peer),greatest(uid,peer)) on conflict(user_a,user_b) do nothing returning id into cid;
 if cid is null then select id into cid from public.chat_conversations where user_a=least(uid,peer) and user_b=greatest(uid,peer);end if;
 return cid;
end $$;
create function public.chat_list() returns table(id uuid,player_id uuid,display_name text,muted boolean,blocked boolean) language sql stable security definer set search_path='' as $$
 select c.id,p.player_id,coalesce(p.display_name,'Deleted player'),exists(select 1 from public.chat_mutes m where m.owner_id=auth.uid() and m.conversation_id=c.id),exists(select 1 from public.chat_blocks b where b.owner_id=auth.uid() and b.target_id=p.user_id)
 from public.chat_conversations c left join public.chat_players p on p.user_id=case when c.user_a=auth.uid() then c.user_b else c.user_a end where auth.uid() in(c.user_a,c.user_b) order by c.created_at desc limit 200;
$$;
create function public.chat_send(p_conversation uuid,p_client uuid,p_body text) returns public.chat_messages language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();peer uuid;r public.chat_messages;
begin
 if not public.chat_member(p_conversation) then raise exception 'Conversation access denied';end if;
 select case when user_a=uid then user_b else user_a end into peer from public.chat_conversations where id=p_conversation;
 if peer is null or public.chat_blocked(uid,peer) then raise exception 'Messaging unavailable';end if;
 if p_body is null or length(trim(p_body)) not between 1 and 2000 then raise exception 'Message must contain 1–2000 characters';end if;
 perform pg_advisory_xact_lock(hashtext(uid::text));
 select * into r from public.chat_messages where sender_id=uid and client_id=p_client;
 if found then if r.conversation_id<>p_conversation or r.body<>trim(p_body) then raise exception 'Retry ID belongs to a different message';end if;return r;end if;
 if (select count(*) from public.chat_messages where sender_id=uid and created_at>clock_timestamp()-interval '1 minute')>=20 or (select count(*) from public.chat_messages where sender_id=uid and created_at>clock_timestamp()-interval '1 day')>=500 then raise exception 'Send limit reached. Try later';end if;
 insert into public.chat_messages(conversation_id,sender_id,client_id,body) values(p_conversation,uid,p_client,trim(p_body)) returning * into r;return r;
end $$;
create function public.chat_ack(p_conversation uuid,p_ids bigint[],p_read boolean default false) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.chat_member(p_conversation) then raise exception 'Conversation access denied';end if;
 if cardinality(p_ids)>100 then raise exception 'Receipt batch too large';end if;
 update public.chat_messages set delivered_at=coalesce(delivered_at,clock_timestamp()),read_at=case when p_read then coalesce(read_at,clock_timestamp()) else read_at end where conversation_id=p_conversation and id=any(p_ids) and sender_id<>auth.uid() and (delivered_at is null or p_read and read_at is null);
end $$;
create function public.chat_block(p_player uuid,p_block boolean) returns void language plpgsql security definer set search_path='' as $$
declare peer uuid;
begin
 if auth.uid() is null then raise exception 'Sign in first';end if;
 select user_id into peer from public.chat_players where player_id=p_player;
 if peer is null or peer=auth.uid() then raise exception 'Player unavailable';end if;
 if p_block then insert into public.chat_blocks values(auth.uid(),peer) on conflict do nothing;else delete from public.chat_blocks where owner_id=auth.uid() and target_id=peer;end if;
end $$;
create function public.chat_mute(p_conversation uuid,p_mute boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.chat_member(p_conversation) then raise exception 'Conversation access denied';end if;
 if p_mute then insert into public.chat_mutes values(auth.uid(),p_conversation) on conflict do nothing;else delete from public.chat_mutes where owner_id=auth.uid() and conversation_id=p_conversation;end if;
end $$;
create function public.chat_report(p_message bigint,p_reason text) returns uuid language plpgsql security definer set search_path='' as $$
declare m public.chat_messages;rid uuid;
begin
 select * into m from public.chat_messages where id=p_message;
 if m.id is null or not public.chat_member(m.conversation_id) or m.sender_id=auth.uid() then raise exception 'Message unavailable';end if;
 if length(trim(p_reason)) not between 10 and 1000 then raise exception 'Describe the issue in 10–1000 characters';end if;
 perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
 select id into rid from public.chat_reports where reporter_id=auth.uid() and message_id=m.id;if found then return rid;end if;
 if (select count(*) from public.chat_reports where reporter_id=auth.uid() and created_at>now()-interval '1 day')>=5 then raise exception 'Daily report limit reached';end if;
 insert into public.chat_reports(reporter_id,subject_id,message_id,reason,evidence) values(auth.uid(),m.sender_id,m.id,trim(p_reason),m.body) returning id into rid;return rid;
end $$;
-- Revoke default PUBLIC execution on every new function, including private helper.
revoke all on function public.chat_member(uuid),public.chat_blocked(uuid,uuid),public.chat_identity(text),public.chat_lookup(text),public.chat_open(uuid),public.chat_list(),public.chat_send(uuid,uuid,text),public.chat_ack(uuid,bigint[],boolean),public.chat_block(uuid,boolean),public.chat_mute(uuid,boolean),public.chat_report(bigint,text) from public,anon,authenticated;
grant execute on function public.chat_member(uuid),public.chat_identity(text),public.chat_lookup(text),public.chat_open(uuid),public.chat_list(),public.chat_send(uuid,uuid,text),public.chat_ack(uuid,bigint[],boolean),public.chat_block(uuid,boolean),public.chat_mute(uuid,boolean),public.chat_report(bigint,text) to authenticated;
-- Supabase publication is inspected before application; no unrelated tables change.
alter publication supabase_realtime add table public.chat_messages;
commit;
