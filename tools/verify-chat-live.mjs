// Opt-in integration test. Never reads browser sessions or uses a personal player.
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {SUPABASE_URL,SUPABASE_KEY} from '../dist/cloud-auth.js';
if(process.env.RUN_DEDICATED_ACCOUNT_TESTS!=='YES'||process.env.SUPABASE_TEST_PROJECT_REF!=='yhervptejlpgallfinro')throw Error('Explicit dedicated-account/project confirmation is required. See docs/ONLINE_SETUP.md.');
const env=process.env;
async function request(path,token,body,method=body===undefined?'GET':'POST'){
 const r=await fetch(SUPABASE_URL+path,{method,signal:AbortSignal.timeout(15000),headers:{apikey:SUPABASE_KEY,...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
 const data=await r.json().catch(()=>null);return {status:r.status,ok:r.ok,data};
}
const sessions=[];
for(const letter of ['A','B','C']){
 const email=env['SUPABASE_TEST_'+letter+'_EMAIL'],password=env['SUPABASE_TEST_'+letter+'_PASSWORD'];
 if(!email||!password)throw Error('Missing dedicated account '+letter+' credentials. Do not put them in client files.');
 const r=await request('/auth/v1/token?grant_type=password',null,{email,password});
 if(!r.ok||!r.data?.access_token)throw Error('Dedicated account '+letter+' could not sign in; check confirmation/password without logging credentials.');
 sessions.push({id:r.data.user.id,token:r.data.access_token});
}
assert.equal(new Set(sessions.map(s=>s.id)).size,3,'Use three distinct dedicated accounts');
const [a,b,c]=sessions;
const rpc=async(s,name,body={})=>{const r=await request('/rest/v1/rpc/chat_'+name,s.token,body);assert(r.ok,'RPC '+name+' failed ('+r.status+'); check migrations and test account state.');return r.data};
try{
 const pa=await rpc(a,'identity',{p_name:'QA Alpha'}),pb=await rpc(b,'identity',{p_name:'QA Bravo'});await rpc(c,'identity',{p_name:'QA Charlie'});
 const matches=await rpc(a,'lookup',{p_query:pb.player_id});assert.deepEqual(Object.keys(matches[0]).sort(),['display_name','player_id']);
 const cid=await rpc(a,'open',{p_player:pb.player_id}),nonce=randomUUID();
 const sent=await rpc(a,'send',{p_conversation:cid,p_client:nonce,p_body:'Dedicated integration test '+new Date().toISOString()});
 assert.equal(sent.sender_id,a.id);assert.equal(sent.delivered_at,null);assert.equal(sent.read_at,null);
 assert.equal((await rpc(a,'send',{p_conversation:cid,p_client:nonce,p_body:sent.body})).id,sent.id);
 const deniedRead=await request('/rest/v1/chat_messages?conversation_id=eq.'+cid,c.token);assert(deniedRead.ok);assert.deepEqual(deniedRead.data,[]);
 const deniedSend=await request('/rest/v1/rpc/chat_send',c.token,{p_conversation:cid,p_client:randomUUID(),p_body:'Must fail'});assert(!deniedSend.ok&&deniedSend.status!==404);
 const deniedAck=await request('/rest/v1/rpc/chat_ack',c.token,{p_conversation:cid,p_ids:[sent.id],p_read:true});assert(!deniedAck.ok&&deniedAck.status!==404);
 const spoof=await request('/rest/v1/chat_messages',c.token,{conversation_id:cid,sender_id:a.id,client_id:randomUUID(),body:'Must fail'});assert(!spoof.ok&&spoof.status!==404);
 await rpc(b,'ack',{p_conversation:cid,p_ids:[sent.id],p_read:false});
 let row=(await request('/rest/v1/chat_messages?id=eq.'+sent.id,a.token)).data[0];assert(row.delivered_at);assert.equal(row.read_at,null);
 await rpc(b,'ack',{p_conversation:cid,p_ids:[sent.id],p_read:true});row=(await request('/rest/v1/chat_messages?id=eq.'+sent.id,a.token)).data[0];assert(row.read_at);
 await rpc(b,'block',{p_player:pa.player_id,p_block:true});
 const blocked=await request('/rest/v1/rpc/chat_send',a.token,{p_conversation:cid,p_client:randomUUID(),p_body:'Must be blocked'});assert(!blocked.ok);
 await rpc(b,'block',{p_player:pa.player_id,p_block:false});await rpc(b,'mute',{p_conversation:cid,p_mute:true});assert((await rpc(b,'list')).find(r=>r.id===cid).muted);await rpc(b,'mute',{p_conversation:cid,p_mute:false});
 await rpc(b,'report',{p_message:sent.id,p_reason:'Dedicated QA report: verify restricted moderation destination.'});
 const reports=await request('/rest/v1/chat_reports',c.token);assert(!reports.ok||reports.data.length===0);
 console.log('PASS: live dedicated-account REST/RLS checks. Test messages and one moderation report remain for owner review. Realtime transport, Google/native return and deletion still require the documented device/manual checks.');
}finally{
 for(const s of sessions)await request('/auth/v1/logout?scope=local',s.token,{}).catch(()=>{});
}
