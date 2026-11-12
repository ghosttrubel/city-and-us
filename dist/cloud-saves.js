import {isUserId} from './cloud-auth.js';
export const SLOT_KEY='city-and-us-active-slot-v1';
export const GUEST_KEY='lagos-street-v1';
const clone=value=>JSON.parse(JSON.stringify(value));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function createSaveSlots({storage,tab,disabled=false,validate}){
 const keyFor=id=>id?'city-and-us-account-'+id+'-v1':GUEST_KEY;
 let owner=null;try{const id=disabled?null:tab?.getItem(SLOT_KEY);if(isUserId(id))owner=id}catch{}
 const key=keyFor(owner);
 const read=id=>{const raw=storage.getItem(keyFor(id));if(raw===null)return null;const value=JSON.parse(raw);if(!validate(value))throw Error('The saved story is invalid. Export it before making changes.');return value};
 return {
  owner,key,idKey:owner?key+':player-id':'lagos-street-local-player-id',
  read,
  activate(id){
   if(disabled)throw Error('Review saves cannot use accounts.');
   if(id&&!isUserId(id))throw Error('Invalid account.');
   if(id)tab.setItem(SLOT_KEY,id);else tab.removeItem(SLOT_KEY);
  },
  replace(id,payload,expected){
   if(disabled||!isUserId(id))throw Error('Review or invalid account cannot receive a backup.');
   if(!validate(payload))throw Error('The backup failed the existing save validation.');
   const target=keyFor(id),raw=storage.getItem(target),previous=raw===null?null:JSON.parse(raw);
   if(!same(previous,expected))throw Error('This account story changed in another tab. Check again before replacing it.');
   // Never destroy the prior working copy; quota failure aborts before replacement.
   if(previous)storage.setItem(target+':recovery',JSON.stringify({saved_at:new Date().toISOString(),payload:previous}));
   storage.setItem(target,JSON.stringify(payload));
   // Identity is read from the validated snapshot at startup. Do not remap permissions.
   storage.removeItem(target+':player-id');
  },
  recovery(id){return JSON.parse(storage.getItem(keyFor(id)+':recovery')||'null')},
  changedInOtherTab(raw){return storage.getItem(key)!==raw}
 };
}
export const MAX_BACKUP_BYTES=1048576;
export function validateBackup(payload,validate){
 if(!validate(payload))throw Error('This backup failed the existing save validation.');
 if(payload.cloudSource==='review'||payload.data?.reviewMode||payload.data?.outfitReview)throw Error('Review saves cannot be uploaded.');
 // Reject media anywhere, including unknown properties accepted by older save validators.
 function walk(value){
  if(!value||typeof value!=='object')return;
  for(const [key,v] of Object.entries(value)){
   if(['gallery','media','photos','videos','access_token','refresh_token'].includes(key)||typeof v==='string'&&/^(data:|blob:)/i.test(v))throw Error('Media and credentials must stay outside save backups.');
   if(['__proto__','constructor','prototype'].includes(key))throw Error('Invalid backup property.');
   walk(v);
  }
 }
 walk(payload);
 // JSONB adds spaces after punctuation; this conservative encoding bounds its text size.
 if(new TextEncoder().encode(JSON.stringify(payload,null,1)).length>MAX_BACKUP_BYTES)throw Error('Backup exceeds the 1 MiB limit. Export your story locally instead.');
 return clone(payload);
}
export function createCloudBackups({auth,slots,validate,snapshot,disabled=false,beforeSwitch=()=>{},reload=()=>{}}){
 let ticket=null,cloud=undefined,busy=false,lastChecked=null,error='',message='';
 const listeners=new Set(),emit=()=>listeners.forEach(fn=>fn());
 auth.subscribe(()=>{ticket=null;cloud=undefined;lastChecked=null;emit()});
 const guard=()=>{if(disabled)throw Error('Cloud backups are disabled in review mode.');if(!auth.user)throw Error('Sign in first.');return auth.user.id};
 const path=id=>'/rest/v1/player_save_backups?user_id=eq.'+id;
 function rowValid(row,id){
  if(!row)return null;
  if(row.user_id!==id||row.save_format!==1||!row.updated_at||!Number.isFinite(Date.parse(row.updated_at)))throw Error('Unsupported or invalid cloud backup. Local progress is unchanged.');
  validateBackup(row.payload,validate);return row;
 }
 async function fetchRow(id){
  const rows=await auth.authorized(path(id)+'&select=user_id,save_format,payload,updated_at');
  if(!Array.isArray(rows)||rows.length>1)throw Error('Unexpected backup response.');
  return rowValid(rows[0]||null,id);
 }
 async function run(fn){
  if(busy)throw Error('An account operation is already running.');
  busy=true;error='';emit();
  try{return await fn()}catch(e){error=e.message;ticket=null;throw e}finally{busy=false;emit()}
 }
 function checkTicket(t){
  if(!t||ticket!==t||auth.epoch!==t.epoch||guard()!==t.id)throw Error('Confirmation expired. Check the account and try again.');
 }
 return {
  get status(){return {cloud,lastChecked,busy,error,message,ticket}},
  subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)},
  cancel(){ticket=null;emit()},
  check:()=>run(async()=>{const id=guard();ticket=null;cloud=await fetchRow(id);lastChecked=new Date().toISOString();message=cloud?'Cloud backup checked. Choose which progress to keep.':'No cloud backup for this account.';return cloud}),
  prepare:kind=>run(async()=>{
   const id=guard();if(!['upload','restore','continue','import'].includes(kind))throw Error('Unknown backup action.');
   if(kind==='upload'&&slots.owner!==id)throw Error('Import guest progress into this account before uploading.');
   if((kind==='upload'||kind==='import')&&slots.owner&&slots.owner!==id)throw Error('This local story belongs to another account. Return to Guest or restore this account’s backup.');
   const local=validateBackup(snapshot(),validate),target=slots.read(id);
   if(kind==='continue'&&!target)throw Error('No account story is stored on this device.');
   if(kind==='import'&&slots.owner)throw Error('Only a guest story can be imported.');
   cloud=await fetchRow(id);lastChecked=new Date().toISOString();
   if(kind==='restore'&&!cloud)throw Error('No cloud backup is available to restore.');
   ticket={kind,id,epoch:auth.epoch,local,target,cloud:clone(cloud),created_at:new Date().toISOString()};
   return ticket;
  }),
  commit:t=>run(async()=>{
   checkTicket(t);ticket=null;
   // Confirm the exact frozen snapshot shown to the player. Never silently substitute newer progress.
   if(!same(snapshot(),t.local))throw Error('Local progress changed while confirming. Review the updated story and confirm again.');
   if(t.kind==='upload'){
    const body={user_id:t.id,save_format:1,payload:t.local};
    let rows;
    try{
     rows=await auth.authorized(t.cloud?path(t.id)+'&updated_at=eq.'+encodeURIComponent(t.cloud.updated_at):'/rest/v1/player_save_backups',{
      method:t.cloud?'PATCH':'POST',body,
      headers:{Prefer:'return=representation'}
     });
    }catch(e){
     cloud=undefined;
     if(e.status===409)throw Error('Conflict: another device created a backup. Check cloud and choose again.');
     throw Error(e.message+' Upload was not confirmed; check cloud before trying again.');
    }
    if(!Array.isArray(rows)||rows.length!==1){cloud=undefined;throw Error('Conflict: the cloud backup changed. No replacement was made. Check cloud and choose again.');}
    cloud=rowValid(rows[0],t.id);lastChecked=new Date().toISOString();message='Cloud snapshot saved. New gameplay remains local until your next confirmed backup.';
    return cloud;
   }
   // Refresh before restore to catch changes since the preview, as well as changes in another local tab.
   const fresh=await fetchRow(t.id);
   if((fresh?.updated_at||null)!==(t.cloud?.updated_at||null))throw Error('Conflict: the cloud backup changed while confirming. Check again.');
   if(t.kind==='continue'){
    if(!same(slots.read(t.id),t.target))throw Error('The device story changed. Check again.');
    beforeSwitch();
   }else{
    beforeSwitch();
    slots.replace(t.id,t.kind==='restore'?t.cloud.payload:t.local,t.target);
   }
   slots.activate(t.id);reload();return true;
  }),
  async profile(displayName){
   const id=guard(),name=displayName.trim().slice(0,24);
   // Explicit profile update, separate from game state and save snapshots.
   const rows=await auth.authorized('/rest/v1/player_profiles?user_id=eq.'+id+'&select=user_id,display_name');
   await auth.authorized(rows?.length?'/rest/v1/player_profiles?user_id=eq.'+id:'/rest/v1/player_profiles',{method:rows?.length?'PATCH':'POST',body:{user_id:id,display_name:name}});
   return 'Account display name saved.';
  }
 };
}
