// Supabase Auth's public REST API. No secrets or SDK/CDN dependency.
export const SUPABASE_URL='https://yhervptejlpgallfinro.supabase.co';
export const SUPABASE_KEY='sb_publishable_1oEViFRYDew0mlAHvQut8A__fX3njy7';
export const AUTH_KEY='city-and-us-auth-v1';
export const isUserId=id=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id||'');
export function createCloudAuth({storage,fetcher=globalThis.fetch,disabled=false,now=Date.now,legacyStorage,cryptoApi=globalThis.crypto}={}){
 let session=null,epoch=0,refreshing=null,pendingLogout=null,recovery=false;
 const listeners=new Set();
 const notify=()=>listeners.forEach(fn=>fn());
 const assert=e=>{if(disabled)throw Error('Cloud accounts are disabled in review saves.');if(e!==epoch)throw Error('Account changed. Please try again.');};
 function persist(value){
  if(value)storage?.setItem(AUTH_KEY,JSON.stringify(value));else storage?.removeItem(AUTH_KEY);
  session=value;notify();
 }
 async function request(path,{method='GET',body,token,headers={}}={}){
  if(disabled)throw Error('Cloud accounts are disabled in review saves.');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try{
   const response=await fetcher(SUPABASE_URL+path,{method,headers:{apikey:SUPABASE_KEY,...headers,...(token?{Authorization:'Bearer '+token}:{}),...(body!==undefined?{'Content-Type':'application/json'}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:controller.signal,cache:'no-store'});
   const text=await response.text();let data;try{data=text?JSON.parse(text):null}catch{throw Error('The server returned an unreadable response. Retry when connected.')}
   if(!response.ok){const error=Error(data?.msg||data?.message||data?.error_description||'Cloud request failed ('+response.status+').');error.status=response.status;error.code=data?.code;throw error;}
   return data;
  }catch(e){if(e.name==='AbortError'||e instanceof TypeError)throw Error('Connection unavailable or timed out. Local progress is safe. Retry when connected.');throw e;}
  finally{clearTimeout(timer);}
 }
 async function accept(data,e,expectedId){
  assert(e);
  if(!data?.access_token||!data?.refresh_token)throw Error('No session was returned. Confirm your email, then sign in.');
  const user=await request('/auth/v1/user',{token:data.access_token});assert(e);
  if(!isUserId(user?.id)||expectedId&&user.id!==expectedId)throw Error('Invalid account identity.');
  const value={recovery,access_token:data.access_token,refresh_token:data.refresh_token,expires_at:Number(data.expires_at)||Math.floor(now()/1000)+(Number(data.expires_in)||3600),user:{id:user.id,email:user.email||''}};
  persist(value);return value;
 }
 async function ensure(){
  assert(epoch);if(!session)throw Error('Sign in first.');
  // Read the shared credential before refresh so a resumed tab never reuses an old refresh token.
  if(storage){let shared=null;try{shared=JSON.parse(storage.getItem(AUTH_KEY)||'null')}catch{}if(shared?.user?.id!==session.user.id){++epoch;session=shared&&isUserId(shared.user?.id)?shared:null;notify();throw Error('Account changed. Sign in again.');}if(shared.access_token!==session.access_token)session=shared;}
  if(session.expires_at*1000>now()+60000)return session;
  if(!refreshing){const e=epoch;const refresh=async()=>{
   assert(e);if(storage){const shared=JSON.parse(storage.getItem(AUTH_KEY)||'null');if(shared?.user?.id!==session?.user?.id)throw Error('Account changed.');if(shared?.expires_at*1000>now()+60000){session=shared;return session;}if(shared)session=shared;}const old=session;
   const result=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:old.refresh_token}});
   const value=await accept(result,e,old.user.id);
   if(value.user.id!==old.user.id){persist(null);throw Error('Account identity changed. Sign in again.');}
   return value;
  };refreshing=(globalThis.navigator?.locks?globalThis.navigator.locks.request('city-and-us-auth-refresh',refresh):refresh()).catch(error=>{if(e===epoch&&[400,401,403].includes(error.status)){++epoch;recovery=false;persist(null);}throw error}).finally(()=>{refreshing=null});}
  return refreshing;
 }
 return {
  get user(){return session?.user||null},get epoch(){return epoch},get recovery(){return recovery},get pendingLogout(){return !!pendingLogout},
  subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)},
  async init({hash='',search='',clearHash=()=>{}}={}){
   if(disabled)return;
   const params=new URLSearchParams(hash.replace(/^#/,''));
   const query=new URLSearchParams(search);
   if(query.has('code')){const code=query.get('code');clearHash();await this.completeOAuth(code);return;}
   if(query.has('error')){clearHash();storage?.removeItem('city-and-us-pkce');throw Error(query.get('error_description')||'Google sign-in was cancelled.');}
   // Remove credentials from browser history before any await.
   if(params.has('access_token')||params.has('error')||params.has('error_description'))clearHash();
   if(params.has('error_description'))throw Error(params.get('error_description'));
   if(params.has('access_token')){
    const e=++epoch;
    recovery=params.get('type')==='recovery';
    await accept({access_token:params.get('access_token'),refresh_token:params.get('refresh_token'),expires_in:params.get('expires_in')},e);
    return;
   }
   if(!storage?.getItem(AUTH_KEY)&&legacyStorage?.getItem(AUTH_KEY)){storage?.setItem(AUTH_KEY,legacyStorage.getItem(AUTH_KEY));legacyStorage.removeItem(AUTH_KEY);}
   let saved;try{saved=JSON.parse(storage?.getItem(AUTH_KEY)||'null')}catch{storage?.removeItem(AUTH_KEY)}
   if(saved?.access_token&&saved?.refresh_token&&isUserId(saved?.user?.id)){
    session=saved;recovery=saved.recovery===true;const e=epoch,s=await ensure();
    const user=await request('/auth/v1/user',{token:s.access_token});assert(e);
    if(user.id!==s.user.id){persist(null);throw Error('Session identity mismatch. Sign in again.');}
    notify();
   }
  },
  async signIn(email,password){assert(epoch);if(session)throw Error('Sign out before switching accounts.');const e=++epoch;return accept(await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email:email.trim(),password}}),e)},
  async signUp(email,password,displayName,redirect){
   assert(epoch);if(session)throw Error('Sign out before creating another account.');const e=++epoch;
   const data=await request('/auth/v1/signup?redirect_to='+encodeURIComponent(redirect),{method:'POST',body:{email:email.trim(),password,data:{display_name:displayName.trim().slice(0,24)}}});assert(e);
   if(data?.access_token)await accept(data,e);
   return data?.access_token?'Signed in. No progress has been imported.':'Check your email to confirm your account, then sign in. If you already have an account, use Sign in or Reset password.';
  },
  async reset(email,redirect){await request('/auth/v1/recover?redirect_to='+encodeURIComponent(redirect),{method:'POST',body:{email:email.trim()}});return 'If this address has an account, a password reset link will be emailed. Check spam as well.'},
  async updatePassword(password){const e=epoch,s=await ensure();await request('/auth/v1/user',{method:'PUT',token:s.access_token,body:{password}});assert(e);recovery=false;persist({...session,recovery:false});},
  async signOut(){
   storage?.removeItem('city-and-us-pkce');legacyStorage?.removeItem(AUTH_KEY);const token=session?.access_token;++epoch;refreshing=null;recovery=false;
   // Clear this tab immediately even if server revocation fails.
   persist(null);pendingLogout=token||pendingLogout;
   if(pendingLogout)await this.retrySignOut();
  },
  async retrySignOut(){
   if(!pendingLogout)return;
   try{await request('/auth/v1/logout?scope=local',{method:'POST',token:pendingLogout});pendingLogout=null}
   catch(e){if(e.status===401||e.status===403){pendingLogout=null;return}throw Error('Signed out on this tab. Server sign-out could not be confirmed. Retry sign-out when connected.')}
  },
  async probe(){const result=await request('/rest/v1/rpc/game_connection',{method:'POST',body:{}});if(result?.version!==1)throw Error('Game service setup is incomplete. Progress remains on this device.');return result;},
  async validateSession(){const e=epoch,s=await ensure();try{const user=await request('/auth/v1/user',{token:s.access_token});assert(e);if(user.id!==s.user.id)throw Error('Session identity mismatch.');return user;}catch(error){if(e===epoch&&[401,403].includes(error.status)){++epoch;persist(null);}throw error;}},
  async google(redirect){
   const e=epoch;assert(e);if(session)throw Error('Sign out before switching accounts.');
   const bytes=cryptoApi.getRandomValues(new Uint8Array(32));
   const b64=b=>btoa(String.fromCharCode(...b)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
   const verifier=b64(bytes),challenge=b64(new Uint8Array(await cryptoApi.subtle.digest('SHA-256',new TextEncoder().encode(verifier))));
   assert(e);storage.setItem('city-and-us-pkce',JSON.stringify({verifier,created:now(),redirect}));
   const url=new URL(SUPABASE_URL+'/auth/v1/authorize');url.search=new URLSearchParams({provider:'google',redirect_to:redirect,code_challenge:challenge,code_challenge_method:'s256'});return url.href;
  },
  async completeOAuth(code){
   if(session)throw Error('Sign out before switching accounts.');
   const pending=JSON.parse(storage.getItem('city-and-us-pkce')||'null');
   if(!pending||now()-pending.created>600000)throw Error('Google sign-in expired or was opened on another device. Try again.');
   const e=++epoch;const result=await request('/auth/v1/token?grant_type=pkce',{method:'POST',body:{auth_code:code,code_verifier:pending.verifier}});
   storage.removeItem('city-and-us-pkce');return accept(result,e);
  },
  cancelOAuth(){++epoch;storage.removeItem('city-and-us-pkce')},
  syncSession(){const raw=storage.getItem(AUTH_KEY);let next=null;try{next=raw?JSON.parse(raw):null}catch{}if(next?.access_token===session?.access_token)return;++epoch;session=next&&isUserId(next.user?.id)?next:null;recovery=!!session?.recovery;notify();},
  async accessToken(){return (await ensure()).access_token},
  async deleteAccount(){await this.authorized('/functions/v1/delete-account',{method:'POST',body:{confirm:'DELETE'}});++epoch;recovery=false;persist(null);},
  async authorized(path,options={}){
   const e=epoch,s=await ensure();assert(e);
   const data=await request(path,{...options,token:s.access_token});assert(e);return data;
  }
 };
}
