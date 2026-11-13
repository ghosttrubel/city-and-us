import assert from 'node:assert/strict';
import {createChat,outboxKey,receiptLabel,newMessageId} from '../dist/chat.js';
assert.match(newMessageId({getRandomValues:b=>crypto.getRandomValues(b)}),/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',cid='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const store=new Map(),storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
let rows=[],lost=false,offline=false,serial=0,nonce=0,notices=0,reads=[],muted=false;
class Socket{
 static instances=[];
 constructor(url){this.url=url;this.readyState=1;this.sent=[];Socket.instances.push(this)}
 send(v){this.sent.push(JSON.parse(v))}
 close(){this.closed=true}
 receive(v){this.onmessage?.({data:JSON.stringify(v)})}
}
function auth(id){const listeners=[];return {user:{id},subscribe:f=>(listeners.push(f),()=>{}),switch(id){this.user={id};listeners.forEach(f=>f())},accessToken:async()=>id+'-token',authorized:async(path,opts={})=>{
 if(offline)throw TypeError('offline');const p=opts.body||{};
 if(path.endsWith('chat_identity'))return {player_id:id+'-public',display_name:'Player'};
 if(path.endsWith('chat_list'))return [{id:cid,player_id:B+'-public',display_name:'Other player',muted}];
 if(path.includes('/chat_messages?')){reads.push(path);return rows.filter(r=>!path.includes('&id=lt.')||r.id<Number(path.split('&id=lt.')[1])).slice(-50).reverse().map(r=>({...r}))}
 if(path.endsWith('chat_send')){let row=rows.find(r=>r.client_id===p.p_client&&r.sender_id===id);if(!row){row={id:++serial,conversation_id:p.p_conversation,sender_id:id,client_id:p.p_client,body:p.p_body,created_at:new Date().toISOString(),delivered_at:null,read_at:null};rows.push(row)}if(lost){lost=false;throw TypeError('reply lost')}return {...row}}
 if(path.endsWith('chat_ack')){for(const r of rows)if(r.sender_id!==id&&p.p_ids.includes(r.id)){r.delivered_at||='delivered';if(p.p_read)r.read_at||='read'}return null}
 if(path.endsWith('chat_mute')){muted=p.p_mute;return null}
 throw Error('Unexpected request '+path)
 }}}
const opts=auth=>({auth,storage,Socket,uuid:()=>String(++nonce),schedule:()=>1,cancel:()=>{},notify:()=>notices++});
let aAuth=auth(A),a=createChat(opts(aAuth));await a.start();await a.select(cid);
lost=true;await a.send('hello');assert.equal(rows.length,1);assert.equal(a.status.outbox.length,1);assert.equal(receiptLabel(rows[0]),'Sent');a.dispose();
a=createChat(opts(aAuth));await a.start();assert.equal(rows.length,1);assert.equal(a.status.outbox.length,0);await a.select(cid);
const b=createChat(opts(auth(B)));await b.start();await b.select(cid);assert.equal(receiptLabel(rows[0]),'Delivered');assert.equal(rows[0].read_at,null);await b.read([rows[0].id]);assert.equal(receiptLabel(rows[0]),'Read');
await a.page(2);assert(reads.at(-1).includes('&id=lt.2'));
const ws=Socket.instances.at(-1);ws.onopen();assert.equal(ws.sent[0].payload.access_token,B+'-token');assert(!ws.url.includes(B+'-token'));ws.receive({event:'phx_reply',ref:'1',payload:{status:'ok',response:{postgres_changes:[{id:99}]}}});
await b.mute(true);ws.receive({event:'postgres_changes',payload:{ids:[99],data:{record:{id:88,conversation_id:cid,sender_id:A,body:'muted'}}}});assert.equal(notices,0);
ws.receive({event:'postgres_changes',payload:{ids:[100],data:{record:{id:89,conversation_id:cid,sender_id:A,body:'unsubscribed'}}}});assert(!b.status.messages.some(r=>r.id===89));
offline=true;await a.send('pending');assert.equal(a.status.outbox.length,1);const before=storage.getItem(outboxKey(A));aAuth.switch(B);assert.equal(a.status.owner,null);assert.equal(storage.getItem(outboxKey(A)),before);assert.equal(storage.getItem(outboxKey(B)),null);a.dispose();b.dispose();
console.log('PASS: chat client durable retry after lost reply, no duplicate insertion, explicit delivered/read receipts, pagination, authenticated realtime subscription, mute and account-scoped pending outbox (network doubles; live pending).');
