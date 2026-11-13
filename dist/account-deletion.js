import {createCloudAuth} from './cloud-auth.js';
const auth=createCloudAuth({storage:localStorage,legacyStorage:sessionStorage}),get=id=>document.getElementById(id),redirect=new URL('account-deletion.html',location.href).href;
let busy=false;
async function action(fn){if(busy)return;busy=true;try{get('status').textContent=await fn()||'Done.'}catch(e){get('status').textContent=e.message}finally{busy=false}}
void action(async()=>{await auth.init({hash:location.hash,search:location.search,clearHash:()=>history.replaceState(null,'',location.pathname)});return auth.user?'Signed in as '+auth.user.email:'Sign in to continue.'});
get('signin').onclick=()=>action(async()=>{await auth.signIn(get('email').value,get('password').value);return 'Signed in as '+auth.user.email});
get('recover').onclick=()=>action(()=>auth.reset(get('email').value,redirect));
get('password-update').onclick=()=>action(async()=>{if(get('password').value.length<8)throw Error('Use at least 8 characters.');await auth.updatePassword(get('password').value);return 'Password updated.'});
get('logout').onclick=()=>action(()=>auth.signOut());
function confirmed(){if(get('confirm').value!=='DELETE')throw Error('Type DELETE to confirm.');if(!auth.user)throw Error('Sign in first.');return auth.user.id}
get('delete').onclick=()=>action(async()=>{const id=confirmed();await auth.deleteAccount();for(const k of ['city-and-us-account-'+id+'-v1','city-and-us-account-'+id+'-v1:recovery','city-and-us-account-'+id+'-v1:player-id','city-and-us-sync-'+id+'-v1','city-and-us-sync-'+id+'-v1:conflict','city-and-us-chat-outbox-'+id])localStorage.removeItem(k);sessionStorage.removeItem('city-and-us-active-slot-v1');return 'Account deleted. Guest stories, gallery and unrelated accounts were retained.'});
get('request').onclick=()=>action(async()=>{const id=confirmed();try{await auth.authorized('/rest/v1/account_deletion_requests',{method:'POST',body:{user_id:id}})}catch(e){if(e.status!==409)throw e}return 'Deletion request recorded for the project owner. Your account remains until deletion is completed.'});
