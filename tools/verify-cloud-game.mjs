import {cashChange} from '../dist/bank.js';
import assert from 'node:assert/strict';
import {boot,el,click,pagehide} from './game-test-harness.mjs';
import {AUTH_KEY} from '../dist/cloud-auth.js';
import {SLOT_KEY} from '../dist/cloud-saves.js';
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',tab=new Map();
globalThis.sessionStorage={getItem:k=>tab.get(k)??null,setItem:(k,v)=>tab.set(k,v),removeItem:k=>tab.delete(k)};
const oldFetch=globalThis.fetch,db=new Map();let requests=0,serial=0,offline=false,loseAccountReply=false;
globalThis.fetch=async(input,init)=>{
 if(!String(input).startsWith('https://yhervptejlpgallfinro.supabase.co'))return oldFetch(input,init);
 requests++;if(offline)throw TypeError('offline');const url=new URL(input),body=init.body?JSON.parse(init.body):null,id=init.headers.Authorization==='Bearer token-b'?B:A,response=(data,status=200)=>new Response(JSON.stringify(data),{status});
 if(url.pathname.endsWith('/game_connection'))return response({version:1});
 if(url.pathname.endsWith('/account_save')){const old=db.get(id);if((old?.updated_at||null)!==body.p_expected)return response([]);const row={user_id:id,save_format:1,payload:body.p_payload,updated_at:new Date(++serial*1000).toISOString()};db.set(id,row);if(loseAccountReply){loseAccountReply=false;throw TypeError('Reply lost after committed write');}return response([row]);}
 if(url.pathname.endsWith('/token'))return response({access_token:body.email.startsWith('b')?'token-b':'token-a',refresh_token:'refresh',expires_in:3600});
 if(url.pathname.endsWith('/user'))return response({id,email:(id===A?'a':'b')+'@example.test'});
 if(url.pathname.endsWith('/logout'))return response({});
 if(url.pathname.endsWith('/player_save_backups')){if(init.method==='GET')return response(db.has(id)?[db.get(id)]:[]);const old=db.get(id);if(old&&init.method==='POST')return response({},409);if(old&&url.searchParams.get('updated_at')!=='eq.'+old.updated_at)return response([]);const row={...body,updated_at:new Date(++serial*1000).toISOString()};db.set(id,row);return response([row]);}
 throw Error('Unexpected API request '+url.pathname);
};
const account=()=>{click('corner-phone');click('phone-settings');click('cloud-account-open')};
await boot({search:'?review=places'});account();assert.match(el('phonebody').textContent,/disabled/);assert.equal(requests,0);
const fixture={version:1,data:structuredClone(globalThis.__livingQa().state)};fixture.data.name='Account tester';fixture.data.onboarded=true;localStorage.setItem('lagos-street-v1',JSON.stringify(fixture));
await boot({search:''});let q=globalThis.__onlineQa();await q.sync.connect();assert(q.sync.status.ready);const guest=localStorage.getItem('lagos-street-v1');await q.auth.signIn('a@example.test','password-test');await q.sync.connect();assert.equal(q.sync.status.choice.kind,'migration');assert.equal(db.size,0);await q.sync.resolve('local');assert.equal(tab.get(SLOT_KEY),A);assert.equal(localStorage.getItem('lagos-street-v1'),guest);
await boot({search:''});q=globalThis.__onlineQa();await q.sync.connect();assert.equal(db.get(A).payload.data.name,'Account tester');assert(q.sync.status.ready);cashChange(q.state,-800,'purchase',{sku:'eat',ref:'qa-eat'});q.save();offline=true;await q.sync.connect();assert(!q.sync.status.ready);const pending=q.state.money;pagehide();
await boot({search:''});q=globalThis.__onlineQa();assert.equal(q.state.money,pending);assert(!q.sync.status.ready);offline=false;await q.sync.connect();assert.equal(db.get(A).payload.data.money,pending);assert(q.sync.status.ready);

click('corner-phone');click('phone-bank');const beforeBank=q.state.money;el('bank-amount').value='1000';click('bank-deposit');assert.equal(q.state.money,beforeBank);click('bank-cancel');assert.equal(q.state.money,beforeBank);el('bank-amount').value='1000';click('bank-deposit');loseAccountReply=true;await el('bank-confirm').onclick();assert.equal(q.state.money,beforeBank-1000);assert.equal(q.state.bank.balance,1000);assert(q.sync.status.pending);const transferId=q.state.bank.history[0].id;
await boot({search:''});q=globalThis.__onlineQa();await q.sync.connect();assert(q.sync.status.ready);assert(!q.sync.status.pending);assert.equal(q.state.bank.balance,1000);assert.equal(q.state.money,beforeBank-1000);assert.equal(q.state.bank.history.filter(t=>t.id===transferId).length,1);assert.equal(db.get(A).payload.data.bank.balance,1000);
account();click('close');click('corner-phone');click('phone-settings');click('reset');click('confirmreset');assert.equal(tab.get(SLOT_KEY),A);assert(localStorage.getItem(AUTH_KEY));
await boot({search:''});q=globalThis.__onlineQa();await q.sync.connect();assert.equal(db.get(A).payload.data.money,15000);assert.equal(q.auth.user.id,A);assert.equal(q.state.localPlayerId,fixture.data.localPlayerId);
await q.auth.signOut();await q.auth.signIn('b@example.test','password-test');await q.sync.connect();assert.equal(db.has(B),false);assert.equal(q.sync.status.choice.kind,'migration');assert.equal(db.get(A).payload.data.money,15000);
await q.auth.signOut();tab.delete(SLOT_KEY);localStorage.setItem('lagos-street-v1','{broken JSON');await boot({search:''});pagehide();assert.equal(localStorage.getItem('lagos-street-v1'),'{broken JSON');
console.log('PASS: shipped game review isolation, auto account load, durable pending reload, offline pause/reconnect, bank confirmation/cancel/lost-response reload, preserved guest, reset/account identity, switching and corrupt-save preservation. API/DOM doubles only.');
