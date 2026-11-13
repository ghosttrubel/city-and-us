import {validateBackup} from './cloud-saves.js';
export const syncKey=id=>'city-and-us-sync-'+id+'-v1';
export const canonical=v=>JSON.stringify(v,(_,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])):x);
const equal=(a,b)=>canonical(a)===canonical(b);
const copy=v=>JSON.parse(JSON.stringify(v));
// One durable journal per Auth UUID. base is the last acknowledged server version;
// sent survives an ambiguous response, pending always holds the newest local snapshot.
export function createAccountSync({auth,slots,storage,validate,disabled=false,reload=()=>{},freshStory,changed=()=>{},now=Date.now,schedule=setTimeout,cancel=clearTimeout}){
 let ready=disabled,connected=disabled,issue='',choice=null,busy=null,timer=null,heartbeat=null,retries=0,dirtySince=null,disposed=false,activeId=auth.user?.id||null;
 const listeners=new Set(),emit=()=>{changed();listeners.forEach(fn=>fn())};
 const read=id=>JSON.parse(storage.getItem(syncKey(id))||'null');
 const put=(id,j)=>storage.setItem(syncKey(id),JSON.stringify(j));
 const guard=id=>{if(disabled||auth.user?.id!==id)throw Error('Account changed. Pending progress stays with its owner.');};
 const path=id=>'/rest/v1/player_save_backups?user_id=eq.'+id;
 const row=r=>{if(!r)return null;if(r.user_id!==auth.user?.id||r.save_format!==1||!Number.isFinite(Date.parse(r.updated_at)))throw Error('Invalid account save response.');validateBackup(r.payload,validate);return r};
 async function fetchRow(id){guard(id);const rows=await auth.authorized(path(id)+'&select=user_id,save_format,payload,updated_at');guard(id);if(!Array.isArray(rows)||rows.length>1)throw Error('Invalid account save response.');return row(rows[0]||null)}
 function later(ms=2000){cancel(timer);if(!disabled&&!disposed)timer=schedule(()=>{timer=null;void api.connect()},ms)}
 function fail(e){connected=false;ready=false;issue=e.message;emit();later(Math.min(30000,1000*2**Math.min(retries++,5)))}
 function open(id,payload,expected){if(payload&&!equal(payload,expected))slots.replace(id,payload,expected);slots.activate(id);if(slots.owner!==id||!equal(payload,expected)){ready=false;reload();return false}return true}
 function acknowledge(id,j,remote){
  if(j.sent&&remote&&equal(remote.payload,j.sent)){
   j.base={updated_at:remote.updated_at,payload:remote.payload};j.sent=null;
   if(equal(j.pending,remote.payload))j.pending=null;put(id,j);
  }
 }
 async function reconcile(id){
  const remote=await fetchRow(id);guard(id);
  const local=slots.read(id);let j=read(id);
  if(j&&j.user_id!==id)throw Error('Pending save owner mismatch.');
  if(j){
   acknowledge(id,j,remote);
   // Recover an immediate local write interrupted before its journal write.
   if(local&&!equal(local,j.pending||j.base?.payload))j.pending=validateBackup(local,validate);
   const version=remote?.updated_at||null;
   if(j.pending&&equal(j.pending,remote?.payload)){j={user_id:id,base:remote,pending:null,sent:null};}
   else if(j.pending&&version!==(j.base?.updated_at||null)){
    choice={kind:'conflict',id,remote,local,journal:j};ready=false;put(id,j);emit();return false;
   }else if(!j.pending){j.base=remote;j.sent=null;}
  }else if(local&&remote&&!equal(local,remote.payload)){
   choice={kind:'conflict',id,remote,local,journal:null};ready=false;emit();return false;
  }else if(!local&&!remote){
   const guest=slots.read(null);
   if(guest?.data?.name&&!guest.cloudSource){choice={kind:'migration',id,remote:null,local:guest,journal:null};ready=false;emit();return false;}
   const payload=validateBackup(freshStory(),validate);j={user_id:id,base:null,pending:payload,sent:null};put(id,j);open(id,payload,null);return false;
  }else j={user_id:id,base:remote,pending:remote?null:validateBackup(local,validate),sent:null};
  put(id,j);
  const payload=j.pending||remote?.payload||local;
  return open(id,payload,local);
 }
 async function flush(id){
  let j=read(id);if(!j?.pending)return;
  const payload=validateBackup(j.pending,validate);j.sent=payload;put(id,j);emit();
  const rows=await auth.authorized(j.base?path(id)+'&updated_at=eq.'+encodeURIComponent(j.base.updated_at):'/rest/v1/player_save_backups',{method:j.base?'PATCH':'POST',body:{user_id:id,save_format:1,payload},headers:{Prefer:'return=representation'}});
  guard(id);
  if(!Array.isArray(rows)||rows.length!==1){await reconcile(id);return;}
  const remote=row(rows[0]);j=read(id);acknowledge(id,j,remote);
  if(j.pending)later();else dirtySince=null;
 }
 const api={
  get status(){const id=auth.user?.id;let pending=false;try{pending=!!(id&&read(id)?.pending)}catch{}return {ready,connected,choice,issue,label:!connected?'Reconnecting':choice?'Choose progress':pending?'Saving':id?'Saved':'Connected',pending}},
  subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)},
  capture(payload){
   if(disabled||!slots.owner)return;
   const id=slots.owner;guard(id);const safe=validateBackup(payload,validate);let j=read(id);
   if(!j)return; // Legacy account reconciles with the server before gameplay unlocks.
   if(equal(safe,j.pending||j.base?.payload))return;
   j.pending=safe;put(id,j);emit();dirtySince??=now();later(Math.max(0,Math.min(2000,10000-(now()-dirtySince))));
  },
  async connect(){
   if(disabled||disposed)return;if(busy)return busy;cancel(timer);timer=null;
   busy=(async()=>{try{
    await auth.probe();const id=auth.user?.id||null;
    if(id)await auth.validateSession();
    if(id!==(auth.user?.id||null))throw Error('Account changed.');
    connected=true;issue='';
    if(id){if(!await reconcile(id))return;ready=!auth.recovery;await flush(id);}
    else {ready=!slots.owner;choice=null;}
    retries=0;emit();
   }catch(e){if(e.status===409){ready=false;later(100);issue='Checking a concurrent save…';emit();}else fail(e);}
   finally{busy=null;cancel(heartbeat);if(!disposed)heartbeat=schedule(()=>{heartbeat=null;void api.connect()},15000);emit();}})();
   return busy;
  },
  async resolve(which){
   const c=choice;if(!c)throw Error('No save choice is pending.');guard(c.id);
   const remote=await fetchRow(c.id);guard(c.id);
   if(!equal(remote,c.remote)||!equal(c.kind==='migration'?slots.read(null):slots.read(c.id),c.local)){choice=null;await api.connect();throw Error('Progress changed. Review the updated choice.');}
   const target=slots.read(c.id);
   const payload=validateBackup(which==='cloud'?remote?.payload:which==='fresh'?freshStory():c.local,validate);
   // Keep both sides for recovery before an explicit conflict replacement.
   if(c.kind==='conflict')storage.setItem(syncKey(c.id)+':conflict',JSON.stringify({local:c.local,cloud:remote,saved_at:new Date().toISOString()}));
   slots.replace(c.id,payload,target);
   put(c.id,{user_id:c.id,base:remote,pending:equal(payload,remote?.payload)?null:payload,sent:null});
   choice=null;slots.activate(c.id);ready=false;reload();emit();
  },
  disconnected(){if(disabled)return;connected=false;ready=false;emit();later(1000)},
  dispose(){disposed=true;cancel(timer);cancel(heartbeat);unsubscribe();listeners.clear()}
 };
 const unsubscribe=auth.subscribe(()=>{const id=auth.user?.id||null;if(id!==activeId){activeId=id;ready=false;choice=null;cancel(timer);timer=null;emit();later(0);}else if(!auth.recovery)later(0)});
 return api;
}
