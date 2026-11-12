import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {boot,el,click,pagehide} from './game-test-harness.mjs';
import {AUTH_KEY} from '../dist/cloud-auth.js';
import {SLOT_KEY} from '../dist/cloud-saves.js';
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222';
const tab=new Map();globalThis.sessionStorage={getItem:k=>tab.get(k)??null,setItem:(k,v)=>tab.set(k,v),removeItem:k=>tab.delete(k)};
const oldFetch=globalThis.fetch,db=new Map();let requests=0,serial=0,offline=false;
globalThis.fetch=async(input,init)=>{
 if(!String(input).startsWith('https://yhervptejlpgallfinro.supabase.co'))return oldFetch(input,init);
 requests++;if(offline)throw TypeError('offline');
 const url=new URL(input),body=init.body?JSON.parse(init.body):null,id=init.headers.Authorization==='Bearer token-b'?B:A;
 const response=(data,status=200)=>new Response(JSON.stringify(data),{status});
 if(url.pathname.endsWith('/token'))return response({access_token:body.email.startsWith('b')?'token-b':'token-a',refresh_token:'refresh',expires_in:3600});
 if(url.pathname.endsWith('/user'))return response({id,email:(id===A?'a':'b')+'@example.test'});
 if(url.pathname.endsWith('/logout'))return response({});
 if(url.pathname.endsWith('/player_save_backups')){
  if(init.method==='GET')return response(db.has(id)?[db.get(id)]:[]);
  const row={...body,updated_at:new Date(Date.now()+(++serial)*1000).toISOString()};db.set(id,row);return response([row]);
 }
 throw Error('Unexpected API request');
};
const flush=async()=>{for(let i=0;i<40;i++)await Promise.resolve()};
const account=()=>{click('corner-phone');click('phone-settings');click('cloud-account-open')};
await boot({search:'?review=places'});account();assert.match(el('phonebody').textContent,/disabled/);assert.equal(requests,0);click('close');
const fixture={version:1,data:structuredClone(globalThis.__livingQa().state)};fixture.data.name='Cloud tester';fixture.data.onboarded=true;
localStorage.setItem('lagos-street-v1',JSON.stringify(fixture));
await boot({search:''});account();const guest=localStorage.getItem('lagos-street-v1');el('cloud-email').value='a@example.test';el('cloud-password-input').value='password-test';click('cloud-signin');await flush();assert(el('cloud-import'));assert.equal(db.size,0);assert.equal(localStorage.getItem('lagos-street-v1'),guest);
click('cloud-import');await flush();assert(el('cloud-confirm'));click('cloud-cancel');assert.equal(tab.has(SLOT_KEY),false);
click('cloud-import');await flush();click('cloud-confirm');await flush();assert.equal(tab.get(SLOT_KEY),A);assert.equal(db.size,0);assert.equal(localStorage.getItem('lagos-street-v1'),guest);
await boot({search:''});await flush();account();click('cloud-upload');await flush();assert(el('cloud-confirm'));click('cloud-confirm');await flush();assert.equal(db.get(A).payload.data.name,'Cloud tester');assert.match(el('phonebody').textContent,/Backup saved/);
const key='city-and-us-account-'+A+'-v1',before=JSON.parse(localStorage.getItem(key));
click('cloud-signout');await flush();assert.equal(tab.has(AUTH_KEY),false);el('cloud-email').value='b@example.test';el('cloud-password-input').value='password-test';click('cloud-signin');await flush();assert.equal(document.getElementById('cloud-upload'),null);assert.match(el('phonebody').textContent,/another account/);assert.deepEqual(JSON.parse(localStorage.getItem(key)),before);
click('cloud-signout');await flush();click('cloud-guest');await flush();assert(!tab.has(SLOT_KEY));assert.equal(localStorage.getItem('lagos-street-v1'),guest);
await boot({search:''});const external=JSON.parse(localStorage.getItem('lagos-street-v1'));external.data.money=12345;localStorage.setItem('lagos-street-v1',JSON.stringify(external));pagehide();assert.equal(JSON.parse(localStorage.getItem('lagos-street-v1')).data.money,12345);
localStorage.setItem('lagos-street-v1','{\"invalid\":true}');await boot({search:''});pagehide();assert.equal(localStorage.getItem('lagos-street-v1'),'{\"invalid\":true}');
localStorage.setItem('lagos-street-v1','{broken JSON');await boot({search:''});pagehide();assert.equal(localStorage.getItem('lagos-street-v1'),'{broken JSON');
const results=['Invalid existing saves are retained instead of overwritten by startup or page-hide.','Real game Settings opens account controls; review UI makes no network requests.','Real sign-in handler leaves guest progress untouched. Import cancellation does nothing; explicit confirmation opens a separate account slot without uploading.','Reload boots the selected account story; confirmed upload reaches the mock API and reports success.','Sign-out removes tab credentials; signing in as B hides upload for A’s device story; Guest returns to the original preserved save.','A stale running game cannot overwrite a local story changed by another tab.'];
await writeFile(new URL('../qa/cloud-backups/game-ui-tests.json',import.meta.url),JSON.stringify({passed:true,browserVisuals:false,results},null,2));console.log(results.join('\n'));
