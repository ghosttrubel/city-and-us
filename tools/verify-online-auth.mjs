import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';
import {createCloudAuth,AUTH_KEY} from '../dist/cloud-auth.js';
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222';
const map=new Map(),storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
let clock=1000000,rejectRefresh=false,bodySeen,hold;
const response=(v,status=200)=>new Response(JSON.stringify(v),{status});
const fetcher=async(url,init)=>{
 const path=new URL(url),body=init.body&&JSON.parse(init.body);
 if(path.pathname.endsWith('/token')){
  if(hold)await hold;
  if(path.searchParams.get('grant_type')==='refresh_token'&&rejectRefresh)return response({msg:'Session expired'},401);
  bodySeen=body;return response({access_token:'token-a',refresh_token:'refresh-a',expires_in:120});
 }
 if(path.pathname.endsWith('/user'))return response({id:A,email:'test@example.invalid'});
 if(path.pathname.endsWith('/logout'))return response({});
 if(path.pathname.endsWith('/game_connection'))return response({version:1});
 throw Error('Unexpected auth request');
};
let auth=createCloudAuth({storage,fetcher,cryptoApi:webcrypto,now:()=>clock});
const url=new URL(await auth.google('com.cityandus.lagosstreet://auth/callback'));assert.equal(url.searchParams.get('code_challenge_method'),'s256');assert.equal(url.searchParams.get('provider'),'google');
const pending=JSON.parse(storage.getItem('city-and-us-pkce'));assert.equal(pending.verifier.length,43);assert.notEqual(url.searchParams.get('code_challenge'),pending.verifier);
let cleared=false;await auth.init({search:'?code=test-code',clearHash:()=>cleared=true});assert(cleared);assert.equal(bodySeen.auth_code,'test-code');assert.equal(bodySeen.code_verifier,pending.verifier);assert.equal(auth.user.id,A);assert.equal(storage.getItem('city-and-us-pkce'),null);
auth=createCloudAuth({storage,fetcher,now:()=>clock});await auth.init();assert.equal(auth.user.id,A);clock+=120000;await auth.accessToken();assert.equal(auth.user.id,A);clock+=120000;rejectRefresh=true;await assert.rejects(auth.accessToken(),/expired/);assert.equal(auth.user,null);assert.equal(storage.getItem(AUTH_KEY),null);
await auth.google('http://localhost:3000/');let release;hold=new Promise(r=>release=r);const exchange=auth.completeOAuth('delayed');auth.cancelOAuth();release();hold=null;await assert.rejects(exchange,/Account changed/);assert.equal(auth.user,null);
await assert.rejects(auth.completeOAuth('no-verifier'),/expired/);
let handler,adminTargets=[],authorized=true;
const code=stripTypeScriptTypes(await readFile(new URL('../supabase/functions/delete-account/index.ts',import.meta.url),'utf8'));
vm.runInNewContext(code,{Deno:{env:{get:k=>({SUPABASE_URL:'https://service.test',SUPABASE_ANON_KEY:'public',SUPABASE_SERVICE_ROLE_KEY:'server-only-test-value'})[k]},serve:fn=>handler=fn},Response,fetch:async(url,init)=>{
 if(url.endsWith('/auth/v1/user'))return response({id:A},authorized?200:401);
 adminTargets.push(url);assert.equal(init.headers.apikey,'server-only-test-value');return response({});
}});
const request=body=>new Request('https://service.test/functions/v1/delete-account',{method:'POST',headers:{Authorization:'Bearer verified-a','Content-Type':'application/json'},body:JSON.stringify(body)});
assert.equal((await handler(request({confirm:'DELETE',user_id:B}))).status,200);assert(adminTargets[0].endsWith(A));authorized=false;assert.equal((await handler(request({confirm:'DELETE'}))).status,401);assert.equal(adminTargets.length,1);assert.equal((await handler(request({confirm:'no'}))).status,400);
console.log('PASS: OAuth PKCE/cancellation, persistent session refresh/expiry, and actual deletion handler caller binding (Auth/network doubles; live Google, email and deletion pending).');
