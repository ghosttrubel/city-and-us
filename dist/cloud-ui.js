const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=value=>value?new Date(value).toLocaleString():'None';
const story=value=>value?escape(value.data.name||'Unnamed story')+' · day '+value.data.day+' · ₦'+Math.round(value.data.money).toLocaleString():'No device story';
export function createAccountUI({body,auth,backups,slots,review=false,redirect,getLocal,leaveAccount,download,initialError=''}){
 let alive=true,working=false,notice=initialError,confirmation=null;
 const find=id=>body.querySelector('#'+id);
 const button=(id,label,primary=false)=>'<button class="'+(primary?'primary':'secondary')+'" id="'+id+'">'+label+'</button>';
 async function act(fn){if(working)return;working=true;notice='Working…';render();try{notice=await fn()||''}catch(e){notice=e.message}finally{working=false;render()}}
 function bind(id,fn){const el=find(id);if(el){el.disabled=working;el.onclick=fn}}
 function render(){
  if(!alive)return;
  if(review){body.innerHTML='<p>Review save · accounts and cloud backups are disabled.</p><a class="secondary review-link" href="./">Return to normal play</a>';return;}
  const user=auth.user,s=backups.status;
  body.innerHTML='<div class="cloud-account"><p class="note">Playing: '+(slots.owner?'account device story '+escape(slots.owner.slice(0,8)):'Guest story')+'. Gallery stays on this device.</p><p role="status" aria-live="polite">'+escape(notice||s.error||s.message||'Local play is available offline.')+'</p>'+
   (user?'<p><strong>'+escape(user.email)+'</strong><br><small>'+escape(user.id)+'</small></p>':'<p class="note">Sign-in lasts for this tab. Signing in does not import or upload your story.</p><p class="note">Email links return to: '+escape(redirect)+'</p>')+
   (confirmation?confirmationMarkup(confirmation):user?signedIn(s):signedOut())+
   (auth.pendingLogout?button('cloud-retry-logout','Retry server sign-out'):'')+
   (slots.owner?button('cloud-guest','Return to preserved guest story'):'')+
   '<p class="note">Manual backups only. These are solo-story snapshots, not multiplayer balances, ownership or permissions.</p></div>';
  if(confirmation){
   bind('cloud-cancel',()=>{confirmation=null;backups.cancel();render()});
   bind('cloud-confirm',()=>act(async()=>{const t=confirmation;confirmation=null;await backups.commit(t);return t.kind==='upload'?'Backup saved.':'Opening your chosen story…'}));
  }else if(user){
   bind('cloud-check',()=>act(async()=>{await backups.check();return 'Cloud checked. Review both stories before choosing.'}));
   for(const kind of ['upload','restore','continue','import'])bind('cloud-'+kind,()=>act(async()=>{confirmation=await backups.prepare(kind);return 'Review this choice, then confirm or cancel.'}));
   bind('cloud-password',()=>{const password=find('cloud-new-password').value,repeat=find('cloud-repeat-password').value;if(password.length<8||password!==repeat){notice='Use at least 8 characters and enter the same password twice.';render();return;}act(async()=>{await auth.updatePassword(password);return 'Password updated.'})});
   bind('cloud-profile',()=>{const name=find('cloud-name').value;act(()=>backups.profile(name))});
   bind('cloud-signout',()=>act(async()=>{await auth.signOut();return 'Signed out. Device and guest stories are retained.'}));
   bind('cloud-recovery',()=>{try{const r=slots.recovery(user.id);if(r)download(r.payload,'city-and-us-before-restore.json')}catch(e){notice=e.message;render()}});
  }else{
   for(const kind of ['signin','signup','reset'])bind('cloud-'+kind,()=>{
    const email=find('cloud-email').value.trim(),password=find('cloud-password-input').value,name=find('cloud-signup-name').value;
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){notice='Enter your email address.';render();return;}
    if(kind!=='reset'&&password.length<8){notice='Enter a password of at least 8 characters.';render();return;}
    act(async()=>kind==='reset'?auth.reset(email,redirect):kind==='signup'?auth.signUp(email,password,name,redirect):(await auth.signIn(email,password),'Signed in. Choose which progress to use; nothing has been uploaded.'));
   });
  }
  bind('cloud-retry-logout',()=>act(async()=>{await auth.retrySignOut();return 'Server sign-out confirmed.'}));
  bind('cloud-guest',()=>act(async()=>{leaveAccount();return 'Opening your guest story…'}));
 }
 function confirmationMarkup(t){
  const verb={upload:'Upload this snapshot',restore:'Replace account device story from cloud',import:'Copy guest progress into this account',continue:'Open this account’s device story'}[t.kind];
  return '<h3>'+verb+'?</h3><p>Account: '+escape(auth.user?.email)+'<br>Current story: '+story(t.local)+'<br>Account on this device: '+story(t.target)+'<br>Cloud: '+story(t.cloud?.payload)+'<br>Cloud timestamp: '+escape(date(t.cloud?.updated_at))+'</p>'+
   '<p>'+({upload:'This replaces the cloud snapshot shown above. A newer server snapshot will cause a conflict; it will not be overwritten.',restore:'This replaces only this account’s device story. Its previous device copy will be retained for export. This keeps one recovery copy: export any older recovery copy first, because it will be replaced. Your guest story is preserved.',import:'Your guest story is kept. This creates or replaces the account’s device story, retaining one previous copy for export. Export any older recovery copy first; it will be replaced. It does not upload until you choose Backup to cloud.',continue:'This opens the existing device story for this account. It does not restore or upload a backup.'}[t.kind])+'</p>'+
   button('cloud-confirm','Confirm: '+verb,true)+button('cloud-cancel','Cancel');
 }
 function signedOut(){
  return '<label class="field">Email<input id="cloud-email" type="email" autocomplete="email" maxlength="254"></label><label class="field">Password<input id="cloud-password-input" type="password" autocomplete="current-password" minlength="8"></label><label class="field">Account display name (sign-up)<input id="cloud-signup-name" maxlength="24" autocomplete="nickname"></label>'+button('cloud-signin','Sign in',true)+button('cloud-signup','Create account')+button('cloud-reset','Email password reset link');
 }
 function signedIn(s){
  let recovery=null;try{recovery=slots.recovery(auth.user.id)}catch{}
  return '<p class="note">Cloud saved: '+escape(s.cloud===undefined?'Not checked':date(s.cloud?.updated_at))+'<br>Last checked: '+escape(date(s.lastChecked))+'</p>'+
   button('cloud-check','Check cloud / Retry')+
   (slots.owner===auth.user.id?button('cloud-upload','Backup to cloud',true):!slots.owner?button('cloud-import','Import guest progress into account',true):'<p>This device story belongs to another account. It cannot be uploaded here.</p>')+
   button('cloud-restore','Restore cloud backup')+button('cloud-continue','Open this account’s device story')+
   (recovery?button('cloud-recovery','Export previous device story ('+escape(date(recovery.saved_at))+')'):'')+
   '<details '+(auth.recovery?'open':'')+'><summary>'+ (auth.recovery?'Set your new password':'Account settings')+'</summary><label class="field">New password<input id="cloud-new-password" type="password" autocomplete="new-password" minlength="8"></label><label class="field">Repeat new password<input id="cloud-repeat-password" type="password" autocomplete="new-password"></label>'+button('cloud-password','Save new password')+'<label class="field">Display name<input id="cloud-name" maxlength="24"></label>'+button('cloud-profile','Save account display name')+'</details>'+button('cloud-signout','Sign out');
 }
 render();
 return {tick(){},dispose(){alive=false;confirmation=null;backups.cancel()}};
}
