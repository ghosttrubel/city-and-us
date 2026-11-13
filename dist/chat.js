import {SUPABASE_URL,SUPABASE_KEY} from './cloud-auth.js';
export function newMessageId(random=globalThis.crypto){const bytes=random.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;const h=[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('');return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);}
export const outboxKey=id=>'city-and-us-chat-outbox-'+id;
export const receiptLabel=m=>m.read_at?'Read':m.delivered_at?'Delivered':'Sent';
export function createChat({auth,storage,disabled=false,enabled=()=>true,Socket=globalThis.WebSocket,uuid=newMessageId,notify=()=>{},schedule=setTimeout,cancel=clearTimeout}){
 let owner=null,generation=0,identity=null,conversations=[],messages=[],current=null,error='',busy=false,socket=null,heartbeat=null,joinTimer=null,retry=null,poll=null,attempt=0,ref=1,heartbeatRef=null,subscriptionIds=[],disposed=false;
 const listeners=new Set(),emit=()=>listeners.forEach(f=>f());
 const guard=()=>{if(disabled||disposed||!auth.user||!enabled())throw Error('Connect and sign in to use chat.');if(owner&&owner!==auth.user.id)throw Error('Account changed.');return auth.user.id};
 async function rpc(name,body={}){const id=guard(),g=generation;const r=await auth.authorized('/rest/v1/rpc/chat_'+name,{method:'POST',body});if(g!==generation||auth.user?.id!==id)throw Error('Account changed.');return r}
 const queue=()=>JSON.parse(storage.getItem(outboxKey(owner))||'[]');
 const put=q=>storage.setItem(outboxKey(owner),JSON.stringify(q));
 function merge(rows){const all=new Map(messages.map(m=>[String(m.id),m]));for(const row of rows)if(row.conversation_id===current)all.set(String(row.id),row);messages=[...all.values()].sort((a,b)=>Number(a.id)-Number(b.id));emit()}
 function closeSocket(){cancel(joinTimer);cancel(heartbeat);heartbeat=null;if(socket){socket.onclose=null;socket.close();socket=null;}subscriptionIds=[];heartbeatRef=null;}
 function reconnect(){closeSocket();cancel(retry);if(!disposed)retry=schedule(()=>{void api.refresh().catch(e=>{error=e.message;emit();reconnect()})},Math.min(30000,1000*2**Math.min(attempt++,5)))}
 function send(event,payload,topic='realtime:chat-'+current){if(socket?.readyState===1){const id=String(++ref);socket.send(JSON.stringify({topic,event,payload,ref:id,...(topic==='phoenix'?{}:{join_ref:'1'})}));return id}}
 async function realtime(){
  closeSocket();if(!Socket||!current)return;
  const token=await auth.accessToken(),g=generation,cid=current;guard();
  if(g!==generation||cid!==current)return;
  const ws=new Socket(SUPABASE_URL.replace('https:','wss:')+'/realtime/v1/websocket?apikey='+encodeURIComponent(SUPABASE_KEY)+'&vsn=1.0.0');socket=ws;joinTimer=schedule(()=>{if(ws===socket&&!subscriptionIds.length){error='Chat subscription timed out. Reconnecting.';emit();reconnect();}},10000);
  ws.onopen=()=>{if(g!==generation){ws.close();return}ws.send(JSON.stringify({topic:'realtime:chat-'+cid,event:'phx_join',ref:'1',join_ref:'1',payload:{config:{postgres_changes:[{event:'*',schema:'public',table:'chat_messages',filter:'conversation_id=eq.'+cid}]},access_token:token}}));
   const beat=async()=>{if(ws!==socket)return;if(heartbeatRef){reconnect();return;}try{send('access_token',{access_token:await auth.accessToken()});heartbeatRef=send('heartbeat',{},'phoenix');heartbeat=schedule(beat,20000)}catch{reconnect()}};heartbeat=schedule(beat,20000);
  };
  ws.onmessage=e=>{if(g!==generation||ws!==socket)return;let m;try{m=JSON.parse(e.data)}catch{return}
   if(m.topic==='phoenix'&&m.ref===heartbeatRef){heartbeatRef=null;return}
   if(m.event==='phx_reply'&&m.ref==='1'){
    if(m.payload?.status!=='ok'){error='Realtime unavailable; reconnecting.';emit();reconnect();return}
    cancel(joinTimer);subscriptionIds=(m.payload.response?.postgres_changes||[]).map(x=>x.id);attempt=0;void api.page().catch(e=>{error=e.message;emit()});
   }else if(m.event==='postgres_changes'&&m.payload?.ids?.some(id=>subscriptionIds.includes(id))){const row=m.payload.data?.record;if(row?.conversation_id===current){if(row.sender_id!==owner&&!messages.some(m=>m.id===row.id)&&!conversations.find(c=>c.id===current)?.muted)notify('New player message');merge([row]);void api.delivered([row]).catch(()=>{});}}
   else if(['phx_error','phx_close'].includes(m.event)||m.event==='system'&&m.payload?.status==='error')reconnect();
  };
  ws.onclose=()=>reconnect();ws.onerror=()=>{if(ws!==socket)return;error='Chat reconnecting. Pending messages are retained.';emit();};
 }
 const api={
  get status(){return {owner,identity,conversations,messages,current,error,busy,outbox:owner?queue():[]}},
  subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)},
  async start(){owner=guard();identity=await rpc('identity');await api.refresh();return identity},
  async profile(name){if(!name.trim()||name.trim().length>24)throw Error('Use a public name of 1–24 characters.');identity=await rpc('identity',{p_name:name});emit()},
  lookup:q=>rpc('lookup',{p_query:q}),
  async refresh(){guard();conversations=await rpc('list');if(current){await api.page();if(!socket)await realtime()}await api.flush();emit();cancel(poll);poll=schedule(()=>void api.refresh().catch(e=>{error=e.message;emit();reconnect()}),15000)},
  async open(player){const cid=await rpc('open',{p_player:player});await api.select(cid)},
  async select(cid){guard();generation++;current=cid;messages=[];closeSocket();await api.page();await realtime();emit()},
  async page(before){
   const id=guard(),g=generation,cid=current;if(!cid)return;
   const rows=await auth.authorized('/rest/v1/chat_messages?conversation_id=eq.'+encodeURIComponent(cid)+'&select=id,conversation_id,sender_id,client_id,body,created_at,delivered_at,read_at&order=id.desc&limit=50'+(before?'&id=lt.'+encodeURIComponent(before):''));
   if(g!==generation||owner!==id)return;merge(rows);await api.delivered(rows);return rows;
  },
  async delivered(rows){const ids=rows.filter(m=>m.sender_id!==owner&&!m.delivered_at).map(m=>m.id);if(ids.length)await rpc('ack',{p_conversation:current,p_ids:ids.slice(0,100),p_read:false})},
  async read(ids){if(ids.length)await rpc('ack',{p_conversation:current,p_ids:ids.slice(0,100),p_read:true})},
  async send(body){guard();const text=body.trim();if(!text||text.length>2000||!current)throw Error('Enter 1–2000 characters in a conversation.');const q=queue();if(q.length>=100)throw Error('Pending message limit reached. Retry or remove pending messages first.');q.push({client_id:uuid(),conversation_id:current,body:text,created_at:new Date().toISOString()});put(q);emit();await api.flush()},
  async flush(){
   if(busy)return;guard();busy=true;const id=owner,g=generation;try{
    for(const m of queue()){
     if(m.failed)continue;const row=await rpc('send',{p_conversation:m.conversation_id,p_client:m.client_id,p_body:m.body});
     if(owner!==id||g!==generation)return;
     put(queue().filter(x=>x.client_id!==m.client_id));merge([row]);error='';
    }attempt=0;
   }catch(e){error=e.message;if(owner===id&&g===generation&&e.status&&e.status<500){const q=queue(),first=q.find(m=>!m.failed);if(first)first.failed=true;put(q);}else reconnect();}finally{busy=false;emit()}
  },
  retry:()=>{put(queue().map(m=>({...m,failed:false})));return api.flush()},
  discard(clientId){guard();put(queue().filter(x=>x.client_id!==clientId));emit()},
  async block(player,value){await rpc('block',{p_player:player,p_block:value});await api.refresh()},
  async mute(value){await rpc('mute',{p_conversation:current,p_mute:value});await api.refresh()},
  report:(id,reason)=>rpc('report',{p_message:id,p_reason:reason}),
  suspend(){generation++;closeSocket();cancel(retry);cancel(poll);current=null;messages=[];conversations=[];identity=null;owner=null;emit()},
  dispose(){api.suspend();disposed=true;off();listeners.clear()}
 };
 const off=auth.subscribe(()=>{if(owner&&auth.user?.id!==owner)api.suspend()});return api;
}
