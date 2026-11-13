import {receiptLabel} from './chat.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createChatUI({body,chat,auth,connected,openAccount}){
 let alive=true,notice='',results=[],working=false,draft='',reporting=null,reading=new Set();const find=id=>body.querySelector('#'+id);
 const button=(id,label)=>'<button class="secondary" id="'+id+'">'+label+'</button>';
 async function act(fn){if(working)return;working=true;try{notice='';await fn()}catch(e){notice=e.message}finally{working=false;render()}}
 function bind(id,fn){const e=find(id);if(e){e.disabled=working;e.onclick=fn}}
 function render(){
  if(!alive)return;draft=find('chat-draft')?.value??draft;
  if(!auth.user||!connected()){body.innerHTML='<p>Connect and sign in to message other players.</p>'+button('chat-account','Open account');bind('chat-account',openAccount);return;}
  if(reporting){const m=reporting;body.innerHTML='<h3>Report this message</h3><p>'+esc(m.body)+'</p><label>Reason (10–1000 characters)<textarea id="report-reason" maxlength="1000"></textarea></label>'+button('report-submit','Submit to moderation')+button('report-cancel','Cancel');bind('report-cancel',()=>{reporting=null;render()});bind('report-submit',()=>{const reason=find('report-reason').value;void act(async()=>{const id=await chat.report(m.id,reason);reporting=null;notice='Report recorded for the project owner: '+id})});return;}
  const oldHistory=find('chat-history'),oldTop=oldHistory?.scrollTop||0,oldHeight=oldHistory?.scrollHeight||0,atBottom=!oldHistory||oldHeight-oldTop-oldHistory.clientHeight<40,oldFirst=oldHistory?.querySelector('[data-message]')?.getAttribute('data-message');
  const focused=document.activeElement,focusId=focused?.id,focusValue=focused?.value,start=focused?.selectionStart;
  const s=chat.status,c=s.conversations.find(c=>c.id===s.current);
  body.innerHTML='<p role="status">'+esc(notice||s.error)+'</p><p>Your public Player ID: '+esc(s.identity?.player_id||'Connecting…')+'</p><details><summary>Public name</summary><input id="chat-name" maxlength="24" value="'+esc(s.identity?.display_name||'')+'">'+button('chat-name-save','Save name')+'</details><label class="field">Find player by public ID or name (3+ characters)<input id="chat-search" maxlength="60"></label>'+button('chat-find','Find player')+results.map((p,i)=>button('chat-result-'+i,esc(p.display_name)+' · '+esc(p.player_id))).join('')+'<h3>Conversations</h3>'+s.conversations.map((p,i)=>button('chat-conv-'+i,esc(p.display_name)+(p.muted?' · muted':''))).join('')+
   (s.current?'<h3>'+esc(c?.display_name||'Conversation')+'</h3>'+button('chat-older','Load earlier messages')+'<div id="chat-history" style="max-height:35vh;overflow:auto">'+s.messages.map((m,i)=>'<p data-message="'+m.id+'"><strong>'+ (m.sender_id===s.owner?'You':'Player')+'</strong>: <span style="white-space:pre-wrap;overflow-wrap:anywhere">'+esc(m.body)+'</span><br><small>'+esc(new Date(m.created_at).toLocaleString())+' · '+(m.sender_id===s.owner?receiptLabel(m):'Received')+'</small>'+(m.sender_id!==s.owner?button('chat-report-'+i,'Report message'):'')+'</p>').join('')+'</div>'+s.outbox.filter(m=>m.conversation_id===s.current).map((m,i)=>'<p>Pending: '+esc(m.body)+'</p>'+button('chat-remove-'+i,'Remove pending message')).join('')+'<label class="field">Message<textarea id="chat-draft" maxlength="2000">'+esc(draft)+'</textarea></label>'+button('chat-send','Send')+button('chat-retry','Retry pending messages')+(c?.player_id?button('chat-block',c.blocked?'Unblock player':'Block player'):'')+button('chat-mute',c?.muted?'Unmute conversation':'Mute conversation'):'')+
   '<p class="note">Sent means stored by the service. Delivered means a recipient client acknowledged receiving it. Read means it was displayed in their visible conversation. Muting suppresses conversation alerts; it does not block messages.</p>';
  bind('chat-find',()=>{const q=find('chat-search').value;void act(async()=>{results=await chat.lookup(q)})});
  bind('chat-name-save',()=>{const name=find('chat-name').value;void act(()=>chat.profile(name))});
  results.forEach((p,i)=>bind('chat-result-'+i,()=>act(async()=>{draft='';await chat.open(p.player_id);await chat.refresh()})));
  s.conversations.forEach((p,i)=>bind('chat-conv-'+i,()=>act(async()=>{draft='';await chat.select(p.id)})));
  bind('chat-send',()=>{const text=find('chat-draft').value;draft='';find('chat-draft').value='';void act(()=>chat.send(text))});
  bind('chat-retry',()=>act(()=>chat.retry()));bind('chat-older',()=>act(()=>chat.page(s.messages[0]?.id)));
  bind('chat-block',()=>act(()=>chat.block(c.player_id,!c.blocked)));bind('chat-mute',()=>act(()=>chat.mute(!c?.muted)));
  s.outbox.filter(m=>m.conversation_id===s.current).forEach((m,i)=>bind('chat-remove-'+i,()=>chat.discard(m.client_id)));
  s.messages.forEach((m,i)=>bind('chat-report-'+i,()=>{reporting=m;render()}));
  if(focusId&&find(focusId)&&['INPUT','TEXTAREA'].includes(focused.tagName)){const field=find(focusId);field.value=focusValue;field.focus();if(typeof start==='number')field.setSelectionRange?.(start,start);}
  const history=find('chat-history');if(history){history.onscroll=markRead;history.scrollTop=atBottom?history.scrollHeight:oldFirst&&oldFirst!==String(s.messages[0]?.id)?oldTop+history.scrollHeight-oldHeight:oldTop;}
  requestAnimationFrame(markRead);
 }
 // A visible page is insufficient: acknowledge only message elements inside the
 // scroll viewport, after layout, never the full paginated result set.
 function markRead(){if(!alive||document.hidden||!document.hasFocus?.())return;const box=find('chat-history');if(!box)return;const bounds=box.getBoundingClientRect(),ids=[];for(const el of box.querySelectorAll('[data-message]')){const r=el.getBoundingClientRect(),id=el.getAttribute('data-message'),m=chat.status.messages.find(m=>String(m.id)===id);if(m?.sender_id!==chat.status.owner&&!m?.read_at&&!reading.has(id)&&r.top>=bounds.top&&r.bottom<=bounds.bottom){ids.push(id);reading.add(id)}}if(ids.length)void chat.read(ids).catch(()=>ids.forEach(id=>reading.delete(id)))}
 const off=chat.subscribe(()=>{if(!working)render()});render();void act(()=>chat.start());
 return {tick(){markRead()},dispose(){alive=false;off();chat.suspend()}};
}
