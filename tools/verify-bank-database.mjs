import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {randomUUID} from 'node:crypto';
const require=createRequire(new URL('../.qa-db/package.json',import.meta.url)),{PGlite}=require('@electric-sql/pglite'),db=new PGlite();
await db.exec("create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;create publication supabase_realtime;");
for(const file of ['202611120001_auth_and_save_backups.sql','202611130001_online_account_foundation.sql','202611130002_private_chat.sql'])await db.exec(await readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
const A=randomUUID(),B=randomUUID(),C=randomUUID();
await db.query('insert into auth.users values ($1),($2),($3)',[A,B,C]);
let p={version:1,data:{money:18450,location:'city',skills:{rider:0,chef:0,trader:0},traits:[],claimedTasks:[],delivery:{id:1,pay:1200,status:'carrying'}}};
await db.query('insert into public.player_save_backups(user_id,save_format,payload) values($1,1,$2)',[A,p]);
await db.exec(await readFile(new URL('../supabase/migrations/202611140001_city_bank.sql',import.meta.url),'utf8'));
async function as(id,sql,params=[]){await db.exec('set role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);try{return await db.query(sql,params)}finally{await db.exec('reset role')}}
let stamp=(await db.query('select updated_at from public.player_save_backups where user_id=$1',[A])).rows[0].updated_at;
const wallet=async()=>(await as(A,'select * from public.game_wallets')).rows[0];
assert.equal(Number((await wallet()).cash),18450);assert.deepEqual((await db.query('select payload from public.player_save_backups where user_id=$1',[A])).rows[0].payload,p,'migration preserves uploaded snapshot');
p.data.bank={version:1,balance:0,life:0,ops:[],history:[],lastRobbery:0};
const op=(kind,args={},context={skills:{...p.data.skills},traits:[]})=>({id:randomUUID(),kind,args,context,life:p.data.bank.life});
async function save(candidate=p,expected=stamp,id=A){return (await as(id,'select * from public.account_save($1,$2)',[candidate,expected])).rows}
async function commit(){const rows=await save();assert.equal(rows.length,1);stamp=rows[0].updated_at;return rows[0]}
p.data.bank.ops=[op('deposit',{amount:5000})];p.data.money-=5000;p.data.bank.balance=5000;await commit();assert.equal(Number((await wallet()).deposited),5000);
const count=(await db.query('select count(*) from public.cash_ledger')).rows[0].count;await commit();assert.equal((await db.query('select count(*) from public.cash_ledger')).rows[0].count,count,'replayed request does not duplicate debit');
const forged=structuredClone(p);forged.data.money++;await assert.rejects(save(forged),/balances/);
await assert.rejects(as(A,"update public.player_save_backups set payload=jsonb_set(payload,'{data,money}','999999') where user_id=$1",[A]),/Cash changes/);
assert.equal((await as(B,'select * from public.game_wallets')).rows.length,0);
await assert.rejects(as(B,'update public.game_wallets set cash=999999'),/permission denied/);
assert.equal((await save(p,'2000-01-01T00:00:00Z')).length,0,'CAS rejects stale save');
p.data.bank.ops=[op('withdraw',{amount:2000})];p.data.money+=2000;p.data.bank.balance-=2000;await commit();
const insufficient=structuredClone(p);insufficient.data.bank.ops=[op('withdraw',{amount:999999})];await assert.rejects(save(insufficient),/Insufficient/);
const negative=structuredClone(p);negative.data.bank.ops=[op('deposit',{amount:-1})];await assert.rejects(save(negative),/Positive whole/);
p.data.bank.ops=[op('courier',{ref:'parcel-1'})];p.data.money+=1200;p.data.skills.rider=4;p.data.delivery.status='return';await commit();
const again=structuredClone(p);again.data.bank.ops=[op('courier',{ref:'parcel-1'})];again.data.money+=1200;await assert.rejects(save(again),/No unpaid/);
p.data.bank.ops=[op('courier-quote',{ref:'parcel-2'})];await commit();
p.data.bank.ops=[op('courier',{ref:'parcel-2'})];p.data.money+=1600;p.data.skills.rider=9;await commit();
p.data.bank.ops=[op('purchase',{sku:'food-jollof',ref:'food-1'})];p.data.money-=950;await commit();
p.data.bank.ops=[op('refund',{ref:'food-1'})];p.data.money+=950;await commit();
const freeRefund=structuredClone(p);freeRefund.data.bank.ops=[op('refund',{ref:'food-2'})];await assert.rejects(save(freeRefund),/No refundable/);

p.data.bank.ops=[op('basket',{entries:[['rice',2],['water',1]],ref:'basket-1'})];p.data.money-=350;await commit();
p.data.bank.ops=[op('ride',{service:'neighbourhood',pickup:'home',destination:'dispatch',ref:'ride-1'})];p.data.money-=450;await commit();
p.data.bank.ops=[op('refund',{ref:'ride-1'})];p.data.money+=450;await commit();
p.data.bank.ops=[op('purchase',{sku:'rental',ref:'rental-1'})];p.data.money-=900;await commit();
const forbiddenRefund=structuredClone(p);forbiddenRefund.data.bank.ops=[op('refund',{ref:'rental-1'})];await assert.rejects(save(forbiddenRefund),/No refundable/);
for(const [type,pay,skillName,args]of [['service',450,'chef',{}],['chef',1500,'chef',{}],['trader',1100,'trader',{offer:1700}],['records',1530,'rider',{}]]){
 p.data.bank.ops=[op('wage',{type,success:true,ref:randomUUID(),...args})];p.data.money+=pay;p.data.skills[skillName]++;await commit();
}
const invalidTask=structuredClone(p);invalidTask.data.claimedTasks=['earn'];invalidTask.data.bank.ops=[op('task',{id:'earn'})];invalidTask.data.money+=500;await assert.rejects(save(invalidTask),/criteria/);
p.data.stats={shifts:4};p.data.claimedTasks=['earn'];p.data.bank.ops=[op('task',{id:'earn'})];p.data.money+=500;await commit();
const repeatTask=structuredClone(p);repeatTask.data.bank.ops=[op('task',{id:'earn'})];repeatTask.data.money+=500;await assert.rejects(save(repeatTask),/duplicate key/);
p.data.goal='professional';p.data.goalClaimed=true;p.data.bank.ops=[op('goal',{})];p.data.money+=1500;await commit();
const other={version:1,data:{money:99999,bank:{balance:0,ops:[]}}};await assert.rejects(save(other,null,B),/operator approval/);assert.equal((await as(B,'select * from public.game_wallets')).rows.length,0);
const approved={version:1,data:{money:27000,bank:{version:1,balance:3000,life:0,ops:[],history:[]},claimedTasks:[]}};
await assert.rejects(as(B,'insert into public.wallet_import_approvals(user_id,payload) values($1,$2)',[B,approved]),/permission denied/);
await db.query('insert into public.wallet_import_approvals(user_id,payload) values($1,$2)',[B,approved]);
await assert.rejects(save(other,null,B),/Approved import differs/);
const imported=(await save(approved,null,B))[0];assert(imported);assert.equal(Number((await as(B,'select * from public.game_wallets')).rows[0].deposited),3000);
assert((await db.query('select consumed_at from public.wallet_import_approvals where user_id=$1',[B])).rows[0].consumed_at);
await assert.rejects(save({...approved,data:{...approved.data,money:28000}},imported.updated_at,B),/balances/);
const before=await wallet(),rb=randomUUID();
// Deterministic SQL random seed for the isolated engine only; production chance remains capped.
await db.exec("select setseed(.5);update public.robbery_tuning set chance=.1;");
let robbed;
for(let n=0;n<200&&!robbed;n++){await db.exec('update public.game_wallets set last_check=null');const rows=(await as(A,'select * from public.bank_robbery($1)',[rb])).rows;if(rows.length)robbed=rows[0]}
assert(robbed);assert.equal(Number((await wallet()).deposited),Number(before.deposited));assert(Number(before.cash)-Number((await wallet()).cash)<=500);
const after=await wallet();await as(A,'select * from public.bank_robbery($1)',[rb]);assert.equal(Number((await wallet()).cash),Number(after.cash));
await db.exec('update public.game_wallets set last_check=null');await as(A,'select * from public.bank_robbery($1)',[randomUUID()]);assert.equal(Number((await wallet()).cash),Number(after.cash),'cooldown');
p=robbed.payload;stamp=robbed.updated_at;p.data.bank.ops=[op('reset',{})];p.data.money=15000;p.data.bank.balance=0;p.data.bank.life++;await commit();assert.equal(Number((await wallet()).life),1);
await db.query('delete from auth.users where id=$1',[A]);assert.equal((await db.query('select * from public.game_wallets')).rows.length,1);assert.equal((await db.query('select * from public.game_wallets')).rows[0].user_id,B);assert.equal((await db.query('select * from auth.users')).rows.length,2);
await db.close();console.log('PASS: actual bank SQL in isolated PostgreSQL: migration, atomic transfers, replay/CAS, forged balances, insufficient funds, owner isolation, fixed parcel quotes, charge-backed refunds, guest import guard, cash-only robbery/cooldown/retry, reset and deletion. Live pending.');
