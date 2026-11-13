const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const story=v=>v?escape(v.data.name||'New story')+' · day '+v.data.day+' · ₦'+Math.round(v.data.money).toLocaleString():'No story';
export function createAccountUI({body,auth,backups,slots,sync,review=false,redirect,getLocal,leaveAccount,download,initialError='',removeLocal}){
 let alive=true,working=false,notice=initialError,confirmation=null;
 const find=id=>body.querySelector('#'+id),button=(id,text)=>'<button class="secondary" id="'+id+'">'+text+'</button>';
 async function act(fn){if(working)return;working=true;try{notice=await fn()||''}catch(e){notice=e.message}finally{working=false;render()}}
 function bind(id,fn){const e=find(id);if(e){e.disabled=working;e.onclick=fn}}
 function render(){
  if(!alive)return;
  if(review){body.innerHTML='<p>Review save · accounts and online features are disabled.</p>';return;}
  const user=auth.user,s=sync.status,c=s.choice;
  body.innerHTML='<div class="cloud-account"><p role="status">'+escape(notice||s.issue||s.label)+'</p>'+
   (user?'<p>'+escape(user.email)+'</p>':'<p>Sign in to load your account progress automatically. Guest progress stays separate.</p>')+
   (c?'<h3>'+ (c.kind==='migration'?'Keep your guest progress?':'Choose the progress to keep')+'</h3><p>Device: '+story(c.local)+'</p><p>Account: '+story(c.remote?.payload)+'</p>'+button('sync-local',c.kind==='migration'?'Copy guest progress to this account':'Keep device progress')+button('sync-cloud',c.kind==='migration'?'Start a fresh account story':'Load account progress')+'<p>Guest progress is preserved. Conflicting copies are retained for recovery.</p>':'')+
   (user?'<p>Progress saves on this device immediately and syncs automatically.</p>'+button('cloud-check','Check connection / Retry')+'<details '+(auth.recovery?'open':'')+'><summary>Account settings</summary><label class="field">New password<input id="cloud-new-password" type="password" autocomplete="new-password"></label><label class="field">Repeat password<input id="cloud-repeat-password" type="password" autocomplete="new-password"></label>'+button('cloud-password','Update password')+'<label class="field">Public display name<input id="cloud-name" maxlength="24"></label>'+button('cloud-profile','Save display name')+'</details>'+button('cloud-signout','Sign out'):
    '<label class="field">Email<input id="cloud-email" type="email" autocomplete="email"></label><label class="field">Password<input id="cloud-password-input" type="password" autocomplete="current-password"></label><label class="field">Display name<input id="cloud-signup-name" maxlength="24"></label>'+button('cloud-signin','Sign in')+button('cloud-signup','Create account')+button('cloud-google','Continue with Google')+button('cloud-google-cancel','Cancel Google sign-in')+button('cloud-reset','Email password reset link'))+
   (slots.owner?button('cloud-guest','Open preserved guest story'):'')+
   '<details><summary>Advanced backup and recovery</summary>'+button('cloud-export','Export current device story')+(user?button('cloud-download','Download account save')+button('cloud-recovery','Export previous device story')+button('cloud-conflict-copy','Export preserved conflict copies'):'')+'<p>Gallery media stays on this device. These saves do not establish multiplayer money or ownership.</p></details>'+
   (user?'<details><summary>Delete account and data</summary><p>Permanently deletes this account, online save and chat data. Its local story and pending saves on this device will be removed. Guest stories, gallery media and other accounts remain. Other devices may retain local copies until you erase them.</p><label class="field">Type DELETE<input id="delete-confirm" autocomplete="off"></label>'+button('delete-account','Permanently delete my account')+'</details>':'')+
   '<a class="secondary" href="account-deletion.html">Account deletion and recovery</a><a class="secondary" href="privacy.html">Privacy</a></div>';
  bind('sync-local',()=>act(()=>sync.resolve('local')));bind('sync-cloud',()=>act(()=>sync.resolve(c.kind==='migration'?'fresh':'cloud')));
  bind('cloud-check',()=>act(()=>sync.connect()));
  bind('cloud-export',()=>{try{download(getLocal(),'city-and-us-device.json')}catch(e){notice=e.message;render()}});
  bind('cloud-download',()=>act(async()=>{const r=await backups.check();if(!r)throw Error('No account save yet.');download(r.payload,'city-and-us-account.json');return 'Account copy downloaded.'}));
  bind('cloud-recovery',()=>{const r=slots.recovery(user.id);if(r)download(r.payload,'city-and-us-recovery.json');else {notice='No previous device copy.';render()}});
  bind('cloud-conflict-copy',()=>{const raw=localStorage.getItem('city-and-us-sync-'+user.id+'-v1:conflict');if(raw)download(JSON.parse(raw),'city-and-us-conflict.json');else {notice='No conflict copies.';render()}});
  bind('cloud-guest',()=>act(async()=>{await auth.signOut().catch(e=>{notice=e.message});leaveAccount()}));
  bind('cloud-signout',()=>act(async()=>{await auth.signOut();return 'Signed out. Pending progress remains isolated to this account.'}));
  bind('cloud-password',()=>{const p=find('cloud-new-password').value;if(p.length<8||p!==find('cloud-repeat-password').value){notice='Use matching passwords of at least 8 characters.';render();return}void act(async()=>{await auth.updatePassword(p);return 'Password updated.'})});
  bind('cloud-profile',()=>{const name=find('cloud-name').value;void act(()=>backups.profile(name))});
  bind('delete-account',()=>{if(find('delete-confirm').value!=='DELETE'){notice='Type DELETE to confirm.';render();return}void act(async()=>{const id=auth.user.id;await auth.deleteAccount();removeLocal(id);return 'Account deleted.'})});
  for(const kind of ['signin','signup','reset'])bind('cloud-'+kind,()=>{const email=find('cloud-email').value.trim(),password=find('cloud-password-input').value,name=find('cloud-signup-name').value;if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){notice='Enter your email address.';render();return}void act(async()=>kind==='reset'?auth.reset(email,redirect):kind==='signup'?auth.signUp(email,password,name,redirect):(await auth.signIn(email,password),await sync.connect(),'Account progress checked.'))});
  bind('cloud-google',()=>act(async()=>{const url=await auth.google(globalThis.CityAndroid?'com.cityandus.lagosstreet://auth/callback':redirect);if(globalThis.CityAndroid?.openAuth)CityAndroid.openAuth(url);else location.assign(url);return 'Complete Google sign-in in your browser, or cancel here.'}));
  bind('cloud-google-cancel',()=>{auth.cancelOAuth();notice='Google sign-in cancelled.';render()});
 }
 const off=auth.subscribe(()=>{if(!working)render()}),offSync=sync.subscribe(()=>{if(!working&&!body.contains?.(document.activeElement))render()});
 render();return {tick(){},dispose(){alive=false;off();offSync();confirmation=null}};
}
