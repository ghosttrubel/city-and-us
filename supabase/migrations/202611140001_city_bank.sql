-- Freeze existing uploaded cash once. No client balance can seed a wallet afterward.
begin;
do $$begin if exists(select 1 from public.player_save_backups where (payload#>>'{data,money}')::numeric<>trunc((payload#>>'{data,money}')::numeric) or (payload#>>'{data,money}')::numeric<0 or coalesce((payload#>>'{data,bank,balance}')::numeric,0)<>trunc(coalesce((payload#>>'{data,bank,balance}')::numeric,0))) then raise exception 'Non-whole legacy cash requires an exact audited migration; no data changed';end if;end $$;
create table public.game_wallets(user_id uuid primary key references auth.users(id) on delete cascade,cash bigint not null check(cash>=0),deposited bigint not null default 0 check(deposited>=0),life integer not null default 0,last_robbery timestamptz,last_check timestamptz);
create table public.cash_ledger(user_id uuid not null references auth.users(id) on delete cascade,id uuid not null,life integer not null,kind text not null,args jsonb not null,ref text,delta bigint not null,cash bigint not null,deposited bigint not null,created_at timestamptz not null default clock_timestamp(),primary key(user_id,id),unique(user_id,life,ref,kind));
create table public.cash_receipts(user_id uuid not null references auth.users(id) on delete cascade,life integer not null,ref text not null,kind text not null,amount bigint not null check(amount>=0),claimed boolean not null default false,primary key(user_id,life,ref,kind));
alter table public.cash_receipts enable row level security;revoke all on public.cash_receipts from public,anon,authenticated;grant all on public.cash_receipts to service_role;
create table public.wallet_import_approvals(user_id uuid primary key references auth.users(id) on delete cascade,payload jsonb not null,approved_at timestamptz not null default clock_timestamp(),consumed_at timestamptz);
alter table public.wallet_import_approvals enable row level security;revoke all on public.wallet_import_approvals from public,anon,authenticated;grant all on public.wallet_import_approvals to service_role;
create table public.cash_prices(sku text primary key,price bigint not null check(price>=0));
create table public.robbery_tuning(id boolean primary key default true check(id),enabled boolean not null default true,cooldown_seconds integer not null default 1800 check(cooldown_seconds>=600),check_seconds integer not null default 120 check(check_seconds>=60),chance numeric not null default .025 check(chance between 0 and .1),fraction numeric not null default .08 check(fraction between 0 and .1),cap integer not null default 500 check(cap between 0 and 1000),min_cash integer not null default 1000);
insert into public.robbery_tuning default values;
insert into public.game_wallets(user_id,cash,deposited,life) select user_id,(payload#>>'{data,money}')::bigint,coalesce((payload#>>'{data,bank,balance}')::bigint,0),coalesce((payload#>>'{data,bank,life}')::integer,0) from public.player_save_backups where coalesce(payload->>'cloudSource','')<>'review';
alter table public.game_wallets enable row level security;alter table public.cash_ledger enable row level security;alter table public.cash_prices enable row level security;alter table public.robbery_tuning enable row level security;
revoke all on public.game_wallets,public.cash_ledger,public.cash_prices,public.robbery_tuning from public,anon,authenticated;
grant select on public.game_wallets,public.cash_ledger to authenticated;
grant all on public.game_wallets,public.cash_ledger,public.cash_prices,public.robbery_tuning to service_role;
create policy wallet_owner on public.game_wallets for select to authenticated using(user_id=auth.uid());
create policy ledger_owner on public.cash_ledger for select to authenticated using(user_id=auth.uid());
create function public.guard_wallet_snapshot() returns trigger language plpgsql security definer set search_path='' as $$
declare w public.game_wallets;
begin
 if current_setting('city.wallet_write',true)='yes' then return new;end if;
 select * into w from public.game_wallets where user_id=new.user_id;
 if not found then
  if (new.payload#>>'{data,money}')::numeric is distinct from 15000::numeric or coalesce((new.payload#>>'{data,bank,balance}')::numeric,0)<>0 then raise exception 'Imported legacy cash needs an audited one-time server migration. Local progress is preserved.';end if;
  insert into public.game_wallets(user_id,cash) values(new.user_id,15000);return new;
 end if;
 if (new.payload#>>'{data,money}')::numeric is distinct from w.cash::numeric or coalesce((new.payload#>>'{data,bank,balance}')::numeric,0)<>w.deposited or coalesce((new.payload#>>'{data,bank,life}')::integer,0)<>w.life then raise exception 'Cash changes require the account_save transaction';end if;return new;
end $$;
create trigger guard_wallet_snapshot before insert or update on public.player_save_backups for each row execute function public.guard_wallet_snapshot();
create function public.seed_wallet_receipts(p_user uuid,p_payload jsonb,p_life integer) returns void language plpgsql security definer set search_path='' as $seed$
declare ref_id text; amount bigint; claim text;
begin
 if p_payload#>>'{data,daily,order,status}' in('preparing','collecting','delivering','arrived') then
  select price into amount from public.cash_prices where sku='food-'||(p_payload#>>'{data,daily,order,menu}');
  if amount is not null then insert into public.cash_receipts values(p_user,p_life,'food-'||(p_payload#>>'{data,daily,order,id}'),'refund',amount,false);end if;
 end if;
 if p_payload#>>'{data,daily,ride,status}' in('dispatching','waiting') then
  select price into amount from public.cash_prices where sku='ride-'||coalesce(p_payload#>>'{data,daily,ride,service}','neighbourhood')||'-'||(p_payload#>>'{data,daily,ride,pickup}')||'-'||(p_payload#>>'{data,daily,ride,destination}');
  if amount is not null then insert into public.cash_receipts values(p_user,p_life,'ride-'||(p_payload#>>'{data,daily,ride,id}'),'refund',amount,false);end if;
 end if;
 if p_payload#>>'{data,cityVisits,hotel,status}'='booked' then insert into public.cash_receipts values(p_user,p_life,'hotel-'||(p_payload#>>'{data,cityVisits,hotel,id}'),'refund',700,false);end if;
 if p_payload#>>'{data,delivery,status}'='carrying' then insert into public.cash_receipts values(p_user,p_life,'parcel-'||(p_payload#>>'{data,delivery,id}'),'courier',(p_payload#>>'{data,delivery,pay}')::bigint,false);end if;
 for claim in select value from jsonb_array_elements_text(coalesce(p_payload#>'{data,claimedTasks}','[]')) loop
  insert into public.cash_ledger(user_id,id,life,kind,args,ref,delta,cash,deposited) values(p_user,gen_random_uuid(),p_life,'task','{}','task-'||claim,0,(p_payload#>>'{data,money}')::bigint,coalesce((p_payload#>>'{data,bank,balance}')::bigint,0));
 end loop;
 if p_payload#>>'{data,goalClaimed}'='true' then insert into public.cash_ledger(user_id,id,life,kind,args,ref,delta,cash,deposited) values(p_user,gen_random_uuid(),p_life,'goal','{}','goal',0,(p_payload#>>'{data,money}')::bigint,coalesce((p_payload#>>'{data,bank,balance}')::bigint,0));end if;
end $seed$;
revoke all on function public.seed_wallet_receipts(uuid,jsonb,integer) from public,anon,authenticated;
create function public.account_save(p_payload jsonb,p_expected timestamptz default null) returns setof public.player_save_backups language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); old public.player_save_backups;w public.game_wallets;approved jsonb;o jsonb;a jsonb;ctx jsonb;existing public.cash_ledger;delta bigint;cost bigint;entry jsonb;skill bigint;bonus numeric;kind text;op_ref text;claim text;price bigint;newlife integer;other text;fare bigint;
begin
 if uid is null then raise exception 'Sign in first';end if;
 if p_payload is null or p_payload#>>'{data,money}' is null or p_payload->>'cloudSource'='review' or octet_length(p_payload::text)>1048576 or p_payload->>'version' is distinct from '1' then raise exception 'Invalid account payload';end if;
 perform pg_advisory_xact_lock(hashtext(uid::text));
 select * into old from public.player_save_backups where user_id=uid for update;
 if old.updated_at is distinct from p_expected then return;end if;
 select * into w from public.game_wallets where user_id=uid for update;
 if not found then
  select payload into approved from public.wallet_import_approvals where user_id=uid and consumed_at is null for update;
  if found then
   if approved is distinct from p_payload or jsonb_array_length(coalesce(approved#>'{data,bank,ops}','[]'))<>0 then raise exception 'Approved import differs from the pending snapshot';end if;
   if (approved#>>'{data,money}')::numeric<>trunc((approved#>>'{data,money}')::numeric) or coalesce((approved#>>'{data,bank,balance}')::numeric,0)<>trunc(coalesce((approved#>>'{data,bank,balance}')::numeric,0)) then raise exception 'Approval must preserve exact whole currency';end if;
   insert into public.game_wallets(user_id,cash,deposited,life) values(uid,(approved#>>'{data,money}')::bigint,coalesce((approved#>>'{data,bank,balance}')::bigint,0),coalesce((approved#>>'{data,bank,life}')::integer,0)) returning * into w;
   perform public.seed_wallet_receipts(uid,approved,w.life);
   update public.wallet_import_approvals set consumed_at=clock_timestamp() where user_id=uid;
  else
   if (p_payload#>>'{data,money}')::numeric is distinct from 15000::numeric or coalesce((p_payload#>>'{data,bank,balance}')::numeric,0)<>0 then raise exception 'Imported legacy cash requires operator approval; it remains preserved locally';end if;
   insert into public.game_wallets(user_id,cash) values(uid,15000) returning * into w;
  end if;
 end if;
 if jsonb_array_length(coalesce(p_payload#>'{data,bank,ops}','[]'))>500 then raise exception 'Too many pending operations';end if;
 for o in select value from jsonb_array_elements(coalesce(p_payload#>'{data,bank,ops}','[]')) loop
  a:=o->'args';ctx:=o->'context';kind:=o->>'kind';op_ref:=a->>'ref';delta:=0;
  select * into existing from public.cash_ledger where user_id=uid and id=(o->>'id')::uuid;
  if found then if existing.kind<>kind or existing.args<>a then raise exception 'Operation ID reused with different data';end if;continue;end if;
  if (o->>'life')::integer is distinct from w.life then raise exception 'Different story life';end if;
  if kind='purchase' then select p.price into price from public.cash_prices p where sku=a->>'sku';if price is null then raise exception 'Unknown purchase';end if;delta:=-price;
  elsif kind='basket' then
   for entry in select value from jsonb_array_elements(a->'entries') loop
    select p.price into price from public.cash_prices p where sku='product-'||(entry->>0);
    if price is null or (entry->>1)::numeric<>trunc((entry->>1)::numeric) or (entry->>1)::integer not between 1 and 100 then raise exception 'Invalid basket';end if;delta:=delta-price*(entry->>1)::integer;
   end loop;
  elsif kind='ride' then
   select p.price into price from public.cash_prices p where sku='ride-'||(a->>'service')||'-'||(a->>'pickup')||'-'||(a->>'destination');
   if price is null then raise exception 'Unknown route';end if;delta:=-price;
  elsif kind='refund' then
   update public.cash_receipts set claimed=true where user_id=uid and life=w.life and ref=op_ref and cash_receipts.kind='refund' and not claimed returning amount into price;
   if price is null then raise exception 'No refundable charge';end if;delta:=price;
  elsif kind='courier-quote' then
   skill:=(ctx->'skills'->>'rider')::bigint;
   if skill is null or skill<0 or skill>coalesce((p_payload#>>'{data,skills,rider}')::bigint,0) or ctx->'traits' is distinct from p_payload#>'{data,traits}' then raise exception 'Invalid quote context';end if;
   price:=least(1000000,round((1200+skill*100)*case when ctx->'traits' ? 'industrious' then 1.1 else 1 end));
   insert into public.cash_receipts(user_id,life,ref,kind,amount) values(uid,w.life,op_ref,'courier',price);
  elsif kind='courier' then
   update public.cash_receipts set claimed=true where user_id=uid and life=w.life and ref=op_ref and cash_receipts.kind='courier' and not claimed returning amount into price;
   if price is null then raise exception 'No unpaid parcel quote';end if;delta:=price;
  elsif kind='wage' then
   other:=case when kind='courier' or a->>'type'='records' then 'rider' when a->>'type'='service' then 'chef' else a->>'type' end;
   skill:=coalesce((ctx->'skills'->>other)::bigint,0);
   if skill<0 or skill>coalesce((p_payload->'data'->'skills'->>other)::bigint,0) or skill<coalesce((old.payload->'data'->'skills'->>other)::bigint,0) then raise exception 'Skill context mismatch';end if;
   if ctx->'traits' is distinct from p_payload#>'{data,traits}' then raise exception 'Trait context mismatch';end if;
   bonus:=case when ctx->'traits' ? 'industrious' and (kind='courier' or coalesce((a->>'success')::boolean,false)) then 1.1 else 1 end;
   if a->>'type'='records' then delta:=round((900+skill*70)*bonus);
   elsif a->>'type'='service' then delta:=round(450*bonus);
   elsif a->>'type'='chef' then delta:=round((case when (a->>'success')::boolean then 1400+skill*100 else 350 end)*bonus);
   elsif a->>'type'='trader' then
    if (a->>'success')::boolean and ((a->>'offer')::integer not between 1250 and 2600 or mod((a->>'offer')::integer,50)<>0) then raise exception 'Invalid offer';end if;
    delta:=round((case when (a->>'success')::boolean then (a->>'offer')::integer-1200+600+skill*100 else 250 end)*bonus);
   else raise exception 'Unknown shift';end if;
  elsif kind='task' then
   claim:=a->>'id';select p.price into price from public.cash_prices p where sku='task-'||claim;
   op_ref:='task-'||claim;
   if not coalesce(case claim
    when 'food-delivery' then (p_payload#>>'{data,daily,stats,received}')::integer>0 and (p_payload#>>'{data,daily,stats,eaten}')::integer>0
    when 'local-ride' then (p_payload#>>'{data,daily,stats,rides}')::integer>0
    when 'home-chef' then (p_payload#>>'{data,daily,stats,cooked}')::integer>0
    when 'settle' then (p_payload#>>'{data,stats,cooked}')::integer>0 and (p_payload#>>'{data,stats,washed}')::integer>0 and (p_payload#>>'{data,stats,slept}')::integer>0
    when 'learn' then (p_payload#>>'{data,stats,studied}')::integer>0
    when 'earn' then (p_payload#>>'{data,stats,shifts}')::integer>0
    when 'shop' then (p_payload#>>'{data,furniture}')::boolean else false end,false) then raise exception 'Task criteria not met';end if;
   if price is null or not coalesce(p_payload#>'{data,claimedTasks}' ? claim,false) then raise exception 'Invalid task claim';end if;delta:=price;
  elsif kind='goal' then
   op_ref:='goal';
   if p_payload#>>'{data,goalClaimed}' is distinct from 'true' then raise exception 'Goal not claimed';end if;
   if not coalesce(case p_payload#>>'{data,goal}'
    when 'saver' then w.cash+w.deposited>=20000
    when 'scholar' then (p_payload#>>'{data,study}')::integer>=6
    when 'professional' then greatest((p_payload#>>'{data,skills,rider}')::integer,(p_payload#>>'{data,skills,trader}')::integer,(p_payload#>>'{data,skills,chef}')::integer)>=3
    else false end,false) then raise exception 'Goal criteria not met';end if;
   delta:=case p_payload#>>'{data,goal}' when 'professional' then 1500 when 'scholar' then 1200 when 'saver' then 1000 else null end;
  elsif kind in('deposit','withdraw') then
   cost:=(a->>'amount')::bigint;if cost is null or cost<=0 or cost::numeric<>(a->>'amount')::numeric then raise exception 'Positive whole amount required';end if;
   if kind='deposit' then if w.cash<cost then raise exception 'Insufficient carried cash';end if;delta:=-cost;w.deposited:=w.deposited+cost;
   else if w.deposited<cost then raise exception 'Insufficient deposits';end if;delta:=cost;w.deposited:=w.deposited-cost;end if;
  elsif kind='reset' then w.life:=w.life+1;delta:=15000-w.cash;w.deposited:=0;
  else raise exception 'Unknown cash operation';end if;
  if delta is null or w.cash+delta<0 then raise exception 'Insufficient cash or invalid operation';end if;
  if (kind='ride' or kind='purchase' and (a->>'sku' like 'food-%' or a->>'sku'='hotel')) and op_ref is not null then
   insert into public.cash_receipts(user_id,life,ref,kind,amount) values(uid,w.life,op_ref,'refund',-delta);
  end if;
  w.cash:=w.cash+delta;
  insert into public.cash_ledger(user_id,id,life,kind,args,ref,delta,cash,deposited) values(uid,(o->>'id')::uuid,(o->>'life')::integer,kind,a,op_ref,delta,w.cash,w.deposited);
 end loop;
 if w.cash is distinct from (p_payload#>>'{data,money}')::numeric or w.deposited<>coalesce((p_payload#>>'{data,bank,balance}')::numeric,0) or w.life<>coalesce((p_payload#>>'{data,bank,life}')::integer,0) then raise exception 'Client balances do not match validated operations';end if;
 update public.game_wallets set cash=w.cash,deposited=w.deposited,life=w.life where user_id=uid;
 perform set_config('city.wallet_write','yes',true);
 insert into public.player_save_backups(user_id,save_format,payload) values(uid,1,p_payload) on conflict(user_id) do update set payload=excluded.payload,save_format=1;
 return query select * from public.player_save_backups where user_id=uid;
end $$;
create function public.bank_robbery(p_id uuid) returns setof public.player_save_backups language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();w public.game_wallets;s public.player_save_backups;t public.robbery_tuning;loss bigint;
begin
 if uid is null then raise exception 'Sign in first';end if;perform pg_advisory_xact_lock(hashtext(uid::text));
 select * into w from public.game_wallets where user_id=uid for update;select * into s from public.player_save_backups where user_id=uid for update;select * into t from public.robbery_tuning;
 if w.user_id is null or s.payload#>>'{data,location}'<>'city' or not t.enabled then return;end if;
 if exists(select 1 from public.cash_ledger where user_id=uid and id=p_id) then return query select * from public.player_save_backups where user_id=uid;return;end if;
 if w.last_check>clock_timestamp()-make_interval(secs=>t.check_seconds) then return;end if;
 update public.game_wallets set last_check=clock_timestamp() where user_id=uid;
 if w.cash<t.min_cash or w.last_robbery>clock_timestamp()-make_interval(secs=>t.cooldown_seconds) or random()>=t.chance then return;end if;
 loss:=least(t.cap,floor(w.cash*t.fraction));w.cash:=w.cash-loss;
 update public.game_wallets set cash=w.cash,last_robbery=clock_timestamp() where user_id=uid;
 insert into public.cash_ledger(user_id,id,life,kind,args,delta,cash,deposited) values(uid,p_id,w.life,'npc-robbery','{}',-loss,w.cash,w.deposited);
 perform set_config('city.wallet_write','yes',true);
 update public.player_save_backups set payload=jsonb_set(payload,'{data,money}',to_jsonb(w.cash)) where user_id=uid;
 return query select * from public.player_save_backups where user_id=uid;
end $$;
revoke all on function public.guard_wallet_snapshot(),public.account_save(jsonb,timestamptz),public.bank_robbery(uuid) from public,anon,authenticated;
grant execute on function public.account_save(jsonb,timestamptz),public.bank_robbery(uuid) to authenticated;
insert into public.cash_prices(sku,price) values
('sofa',3000),
('clinic',1200),
('eat',800),
('groceries',500),
('hotel',700),
('takeaway',700),
('rental',900),
('food-jollof',950),
('food-beans',750),
('fashion-outfit-casual',0),
('fashion-outfit-f-crop-joggers',0),
('fashion-outfit-m-camp-cargo',0),
('fashion-outfit-varsity',0),
('fashion-outfit-track',1900),
('fashion-top-tee',0),
('fashion-top-blazer',1450),
('fashion-top-wrap',1100),
('fashion-bottom-slim',0),
('fashion-bottom-wide',1250),
('fashion-bottom-shorts',650),
('fashion-dress-day',0),
('fashion-dress-evening',2300),
('fashion-native-ankara',1800),
('fashion-native-agbada',2500),
('fashion-native-senator',1650),
('fashion-native-iro',1950),
('fashion-headwrap-gele',950),
('fashion-cap-fila',700),
('fashion-hair-braids',0),
('fashion-hair-locs',0),
('fashion-hair-afro',0),
('fashion-hair-fade',0),
('fashion-hair-bob',0),
('fashion-hair-bun',0),
('fashion-hair-cornrows',850),
('fashion-hair-puff',900),
('fashion-hair-crown',1100),
('fashion-hair-wig',1300),
('fashion-hair-pixie',700),
('fashion-hair-bald',0),
('fashion-shoe-trainers',0),
('fashion-shoe-boots',1100),
('fashion-shoe-loafers',850),
('fashion-accessory-hoops',0),
('fashion-accessory-glasses',0),
('fashion-accessory-chain',0),
('fashion-outfit-f-square-denim',0),
('fashion-outfit-f-tank-denim',0),
('fashion-outfit-m-relaxed-denim',0),
('fashion-top-f-square-charcoal',0),
('fashion-bottom-f-washed-black',0),
('fashion-top-f-scoop-tank',0),
('fashion-bottom-f-blue-wide',0),
('fashion-top-m-relaxed-tee',0),
('fashion-bottom-m-blue-baggy',0),
('furniture-round-table',600),
('furniture-coffee-table',1200),
('furniture-bookcase',1900),
('furniture-cabinet',1600),
('furniture-floor-lamp',850),
('furniture-plant',500),
('furniture-rug',750),
('furniture-runner',650),
('product-rice',125),
('product-tomato',100),
('product-beans',125),
('product-plantain',125),
('product-water',100),
('product-biscuits',150),
('product-soap',200),
('product-bundle',500),
('rent-courtyard',1800),
('rent-studio',2500),
('rent-loft',4000),
('task-food-delivery',150),
('task-local-ride',200),
('task-home-chef',150),
('task-settle',500),
('task-learn',300),
('task-earn',500),
('task-shop',400),
('ride-neighbourhood-home-dispatch',450),
('ride-neighbourhood-home-shop',300),
('ride-neighbourhood-dispatch-home',450),
('ride-neighbourhood-dispatch-shop',500),
('ride-neighbourhood-shop-home',300),
('ride-neighbourhood-shop-dispatch',500),
('ride-danfo-home-dispatch',200),
('ride-danfo-home-shop',125),
('ride-danfo-dispatch-home',200),
('ride-danfo-dispatch-shop',225),
('ride-danfo-shop-home',125),
('ride-danfo-shop-dispatch',225);
-- Freeze legacy receipts only from already uploaded snapshots.
select public.seed_wallet_receipts(user_id,payload,coalesce((payload#>>'{data,bank,life}')::integer,0)) from public.player_save_backups where coalesce(payload->>'cloudSource','')<>'review';
commit;
