import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createCloudAuth,AUTH_KEY,SUPABASE_KEY} from '../dist/cloud-auth.js';
import {createSaveSlots,createCloudBackups,validateBackup,SLOT_KEY,GUEST_KEY} from '../dist/cloud-saves.js';
import {appearanceDefaults} from '../dist/character.js';
import {migrate,validSave} from '../dist/life.js';
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222';
class Storage{
 data=new Map();fail=false;
 getItem(k){return this.data.get(k)??null}
 setItem(k,v){if(this.fail)throw Error('Storage full');this.data.set(k,String(v))}
 removeItem(k){this.data.delete(k)}
}
const copy=v=>JSON.parse(JSON.stringify(v)),groups=[];
const initial={...appearanceDefaults,name:'Guest',money:15000,food:85,energy:95,mood:80,time:480,day:1,x:0,z:6,skills:{trader:0,rider:0,chef:0},job:'Your story starts here',furniture:false,rentDay:1,studyFocus:'trader'};
const fixture=()=>({version:1,data:migrate(initial,initial,'LS-1234567890ABCDEF')});
assert(validSave(fixture()));
const db=new Map(),profiles=new Map(),requests=[],tokens=new Map(),refreshes=new Map();
let offline=false,lostReply=false,serial=0,clock=Date.now(),hold=null;
const stamp=()=>new Date(clock+(++serial)*1000).toISOString();
function session(id){const access_token='access-'+id+'-'+(++serial),refresh_token='refresh-'+id+'-'+serial;tokens.set(access_token,id);refreshes.set(refresh_token,id);return{access_token,refresh_token,expires_in:3600,user:{id,email:(id===A?'a':'b')+'@example.test'}}}
const response=(value,status=200)=>new Response(JSON.stringify(value),{status});
async function fetcher(url,options){
 if(offline)throw TypeError('offline');
 const u=new URL(url),body=options.body?JSON.parse(options.body):null,path=u.pathname,method=options.method;
 requests.push({path,method,body,headers:options.headers,query:u.searchParams});
 assert.equal(options.headers.apikey,SUPABASE_KEY);
 if(path.endsWith('/signup'))return response({id:A,confirmation_sent_at:stamp()});
 if(path.endsWith('/recover'))return response({});
 if(path.endsWith('/token')){
  if(hold){const pending=hold;hold=null;await pending}
  if(u.searchParams.get('grant_type')==='refresh_token'){const id=refreshes.get(body.refresh_token);return id?response(session(id)):response({msg:'Refresh token expired'},401)}
  if(body.password!=='password-test')return response({msg:'Invalid login credentials'},400);
  return response(session(body.email.startsWith('a')?A:B));
 }
 const token=options.headers.Authorization?.replace('Bearer ',''),id=tokens.get(token);
 if(!id)return response({msg:'Not authenticated'},401);
 if(path.endsWith('/user'))return response({id,email:(id===A?'a':'b')+'@example.test'});
 if(path.endsWith('/logout')){tokens.delete(token);return response({})}
 const table=path.endsWith('/player_profiles')?profiles:db;
 if(method==='GET'){const selected=u.searchParams.get('user_id')?.slice(3);return response(selected===id&&table.has(id)?[table.get(id)]:[])}
 if(body.user_id!==id)return response({message:'RLS denied'},403);
 if(method==='POST'&&table.has(id))return response({message:'duplicate key'},409);
 if(method==='PATCH'){
  assert.equal(u.searchParams.get('user_id'),'eq.'+id);
  if(!table.has(id))return response([]);
  if(table===db&&u.searchParams.get('updated_at')!=='eq.'+table.get(id).updated_at)return response([]);
 }
 const row={...copy(body),...(table===db?{updated_at:stamp()}:{created_at:stamp()})};table.set(id,row);
 if(lostReply){lostReply=false;throw TypeError('response lost after write')}
 return response(options.headers.Prefer==='return=representation'?[row]:null);
}
const local=new Storage(),tab=new Storage(),auth=createCloudAuth({storage:tab,fetcher,now:()=>clock});
local.setItem(GUEST_KEY,JSON.stringify(fixture()));const guestRaw=local.getItem(GUEST_KEY);
const slots=()=>createSaveSlots({storage:local,tab,validate:validSave});
let current=slots(),snapshot=fixture(),reloads=0;
const backup=()=>createCloudBackups({auth,slots:current,validate:validSave,snapshot:()=>copy(snapshot),reload:()=>reloads++});
let service=backup();
await auth.init();assert.equal(auth.user,null);assert.equal(requests.length,0);
assert.match(await auth.signUp('a@example.test','password-test','Account A','http://localhost:3000/'),/Check your email/);assert.equal(auth.user,null);
await assert.rejects(auth.signIn('a@example.test','wrong'),/Invalid login/);
await auth.signIn('a@example.test','password-test');assert.equal(auth.user.id,A);
assert.equal(local.getItem(GUEST_KEY),guestRaw);assert.equal(db.size,0);
await auth.reset('a@example.test','http://localhost:3000/');await auth.updatePassword('new-password-test');
await service.profile('Account A');assert.equal(profiles.get(A).display_name,'Account A');
groups.push('Sign-up awaiting email confirmation, sign-in errors, sign-in, reset request, password update and explicit profile update use the real REST client against a controlled Auth/Data API double; sign-in never copies or uploads progress.');

await assert.rejects(service.prepare('upload'),/Import guest/);
let t=await service.prepare('import');service.cancel();await assert.rejects(service.commit(t),/expired/);assert.equal(reloads,0);
t=await service.prepare('import');await service.commit(t);assert.equal(reloads,1);assert.equal(db.size,0);assert.equal(local.getItem(GUEST_KEY),guestRaw);
current=slots();assert.equal(current.owner,A);snapshot=current.read(A);service=backup();
t=await service.prepare('upload');await service.commit(t);assert.equal(db.get(A).payload.data.money,15000);
assert.equal(requests.at(-1).headers.Prefer,'return=representation');
const firstCloud=copy(db.get(A));snapshot.data.money=16100;
t=await service.prepare('upload');assert.equal(db.get(A).updated_at,firstCloud.updated_at);service.cancel();assert.equal(db.get(A).payload.data.money,15000);
groups.push('Guest import requires a valid confirmation, keeps the guest save, opens an account slot and does not upload automatically. Upload is separately confirmed and uses returned server timestamps.');

t=await service.prepare('upload');db.set(A,{...copy(firstCloud),updated_at:stamp()});await assert.rejects(service.commit(t),/Conflict/);assert.equal(db.get(A).payload.data.money,15000);
t=await service.prepare('upload');snapshot.data.money++;await assert.rejects(service.commit(t),/Local progress changed/);
t=await service.prepare('upload');await service.commit(t);assert.equal(db.get(A).payload.data.money,16101);
snapshot.data.money=17000;t=await service.prepare('upload');lostReply=true;await assert.rejects(service.commit(t),/Upload was not confirmed/);assert.equal(db.get(A).payload.data.money,17000);await assert.rejects(service.commit(t),/expired/);await service.check();assert.equal(service.status.cloud.payload.data.money,17000);
offline=true;const offlineStory=copy(snapshot);await assert.rejects(service.check(),/Local progress is safe/);assert.deepEqual(snapshot,offlineStory);offline=false;
groups.push('Concurrent cloud updates, changed local snapshots and lost success responses cannot be retried blindly. Network failures preserve local progress; Check cloud reconciles an ambiguous upload.');

const accountKey=current.key;local.setItem(accountKey,JSON.stringify(snapshot));
const beforeRestore=local.getItem(accountKey);
db.get(A).payload.data.money=18000;db.get(A).updated_at=stamp();
t=await service.prepare('restore');assert.equal(local.getItem(accountKey),beforeRestore);await service.commit(t);
assert.equal(current.read(A).data.money,18000);assert.deepEqual(current.read(A),db.get(A).payload);assert.equal(current.recovery(A).payload.data.money,17000);assert.equal(current.read(A).data.localPlayerId,'LS-1234567890ABCDEF');assert.equal(local.getItem(GUEST_KEY),guestRaw);
snapshot=current.read(A);t=await service.prepare('restore');db.get(A).updated_at=stamp();await assert.rejects(service.commit(t),/Conflict/);
t=await service.prepare('restore');const other=copy(snapshot);other.data.money=19000;local.setItem(accountKey,JSON.stringify(other));await assert.rejects(service.commit(t),/another tab/);
snapshot=other;t=await service.prepare('restore');local.fail=true;await assert.rejects(service.commit(t),/Storage full/);local.fail=false;assert.equal(current.read(A).data.money,19000);
groups.push('Restore confirms the source and destination, rechecks cloud and local revisions, preserves the prior device story for export, retains story identity and aborts safely on storage quota failure.');

t=await service.prepare('upload');await auth.signOut();assert.equal(auth.user,null);assert.equal(tab.getItem(AUTH_KEY),null);await assert.rejects(service.commit(t),/expired/);
await auth.signIn('b@example.test','password-test');await assert.rejects(service.prepare('upload'),/Import guest/);await assert.rejects(service.prepare('import'),/another account/);
assert.equal(current.read(A).data.money,19000);assert.equal(db.has(B),false);
current.activate(null);current=slots();snapshot=current.read(null);service=backup();t=await service.prepare('import');await service.commit(t);current=slots();snapshot=current.read(B);service=backup();
t=await service.prepare('upload');db.set(B,{user_id:B,save_format:1,payload:fixture(),updated_at:stamp()});await assert.rejects(service.commit(t),/Conflict/);
offline=true;await assert.rejects(auth.signOut(),/Signed out on this tab/);assert.equal(auth.user,null);assert.equal(tab.getItem(AUTH_KEY),null);offline=false;await auth.retrySignOut();assert.equal(auth.pendingLogout,false);
groups.push('Sign-out invalidates pending confirmations, account B cannot upload account A’s local story, per-account local/cloud rows remain separate, first-insert races conflict, and offline sign-out clears local credentials with a revocation retry.');

await auth.signIn('a@example.test','password-test');clock+=3600*1000;
const oldToken=JSON.parse(tab.getItem(AUTH_KEY)).access_token;await auth.authorized('/rest/v1/player_profiles?user_id=eq.'+A);assert.notEqual(JSON.parse(tab.getItem(AUTH_KEY)).access_token,oldToken);assert.equal(auth.user.id,A);
const resumed=createCloudAuth({storage:tab,fetcher,now:()=>clock});await resumed.init();assert.equal(resumed.user.id,A);
const recoverySession=session(A),recoveryAuth=createCloudAuth({storage:new Storage(),fetcher});let cleared=false;
await recoveryAuth.init({hash:'#access_token='+recoverySession.access_token+'&refresh_token='+recoverySession.refresh_token+'&type=recovery',clearHash:()=>cleared=true});assert(cleared);assert(recoveryAuth.recovery);await recoveryAuth.updatePassword('changed-password');assert(!recoveryAuth.recovery);
await auth.signOut();let unblock;hold=new Promise(resolve=>unblock=resolve);const pending=auth.signIn('a@example.test','password-test');await auth.signOut();unblock();await assert.rejects(pending,/Account changed/);assert.equal(auth.user,null);
groups.push('Session resume, expiry refresh, recovery callbacks with immediate URL credential removal, password update and a delayed sign-in arriving after sign-out are covered.');

const beforeRequests=requests.length;
const reviewAuth=createCloudAuth({disabled:true,storage:tab,fetcher});await reviewAuth.init({hash:'#access_token=review'});
const reviewSlots=createSaveSlots({storage:local,tab,disabled:true,validate:validSave});
const reviewBackups=createCloudBackups({auth:reviewAuth,slots:reviewSlots,validate:validSave,snapshot:fixture,disabled:true});
await assert.rejects(reviewAuth.signIn('a@example.test','password-test'),/review/);await assert.rejects(reviewBackups.prepare('upload'),/review/);assert.equal(requests.length,beforeRequests);
assert.throws(()=>validateBackup({...fixture(),cloudSource:'review'},validSave),/Review/);
assert.throws(()=>validateBackup({...fixture(),gallery:[]},validSave),/Media/);
assert.throws(()=>validateBackup({...fixture(),unknown:'x'.repeat(1048576)},validSave),/1 MiB/);
assert.throws(()=>validateBackup({version:900,data:{}},validSave),/validation/);
const file=await readFile(new URL('../dist/game.js',import.meta.url),'utf8');
assert(file.includes("storyIsReview=reviewMode||v.cloudSource==='review'"));
assert(file.includes('localStorage.getItem(KEY)!==lastStored'));
groups.push('Review mode makes zero Auth/Data API calls, review provenance survives file imports, credentials/gallery/media/oversized/invalid snapshots are rejected, and the game guards against stale-tab local overwrites.');
await mkdir(new URL('../qa/cloud-backups/',import.meta.url),{recursive:true});
await writeFile(new URL('../qa/cloud-backups/logic-tests.json',import.meta.url),JSON.stringify({testedAt:new Date().toISOString(),passed:true,liveAuth:false,groups},null,2));
console.log(groups.join('\n'));
