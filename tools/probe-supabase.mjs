// Read-only live connection probe. Never creates users, sends emails or writes saves.
import {mkdir,writeFile} from 'node:fs/promises';
import {SUPABASE_URL,SUPABASE_KEY} from '../dist/cloud-auth.js';
const checks=[];
for(const path of ['/auth/v1/settings','/rest/v1/player_profiles?select=user_id&limit=1','/rest/v1/player_save_backups?select=user_id,save_format,updated_at&limit=1']){
 try{
  const response=await fetch(SUPABASE_URL+path,{headers:{apikey:SUPABASE_KEY,Origin:'http://localhost:3000'},signal:AbortSignal.timeout(12000)}),data=await response.json();
  checks.push({path,status:response.status,cors:response.headers.get('access-control-allow-origin'),...(path.endsWith('/settings')?{emailEnabled:data.external?.email,signupEnabled:data.disable_signup===false,emailConfirmationRequired:data.mailer_autoconfirm===false}:{message:data.message,code:data.code})});
 }catch(e){checks.push({path,error:e.message})}
}
await mkdir(new URL('../qa/cloud-backups/',import.meta.url),{recursive:true});
await writeFile(new URL('../qa/cloud-backups/live-probe.json',import.meta.url),JSON.stringify({testedAt:new Date().toISOString(),checks,authenticatedFlowsVerified:false},null,2));
console.log(JSON.stringify(checks,null,2));
