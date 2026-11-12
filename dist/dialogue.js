import {LINES} from './dialogue-lines.js';
// NPC -> selected player reply -> NPC response. Playback never owns the controls.
export function createDialogue({state,player,panel,stopInput,gesture=()=>{},commit=()=>{},valid=()=>true}){
 let session=null,line=null,queue=[],choices=[],audio=null,remaining=0,after=null,fallback=false,token=0,silent=false,stall=0,mediaTime=0,ended=false;
 const find=id=>panel.querySelector('#'+id);
 const readingTime=()=>Math.min(8,Math.max(1.4,(line?.text.length||0)/19));
 function actor(role){return role==='player'?player():session?.actor?.();}
 function stopAudio(){const current=audio;audio=null;if(current){current.onended=null;current.onerror=null;try{current.pause();}catch{}}if(line)actor(line.speaker)?.userData.behaviour?.speak(false);}
 function close(){const onClose=session?.onClose;stopAudio();for(const m of [player(),session?.actor?.()]){m?.userData.behaviour?.lookAt(null);m?.userData.behaviour?.speak(false);}session=null;line=null;queue=[];choices=[];after=null;token++;panel.classList.add('hidden');panel.innerHTML='';stopInput();onClose?.();}
 function render(){if(!session)return;const showText=state.dialogue.subtitles!==false;
 panel.innerHTML='<div class="dialogue-heading"><strong id="dialogue-speaker"></strong><button id="dialogue-minimise" aria-label="Minimise conversation" aria-expanded="true" aria-controls="dialogue-body">−</button><button id="dialogue-close" aria-label="Exit conversation">×</button></div><div id="dialogue-body" class="dialogue-body"><p id="dialogue-subtitle" role="status"></p><div id="dialogue-choices"></div><button id="dialogue-text" class="dialogue-text">'+(line?'Continue in text':'Replay line')+'</button><details><summary>Dialogue options</summary><button id="dialogue-subtitles">Subtitles</button><small>Authentic Nigerian voice replacement pending.</small></details></div>';
 find('dialogue-speaker').textContent=(line||session.last)?.speaker==='player'?'You':session.name+' · NPC';find('dialogue-subtitle').textContent=showText?(line||session.last)?.text||'Choose a reply.':line?'Speaking…':'Choose a reply.';find('dialogue-close').onclick=close;find('dialogue-minimise').onclick=()=>{const body=find('dialogue-body');if(body){body.hidden=!body.hidden;find('dialogue-minimise').textContent=body.hidden?'+':'−';find('dialogue-minimise').setAttribute('aria-expanded',String(!body.hidden));find('dialogue-minimise').setAttribute('aria-label',body.hidden?'Expand conversation':'Minimise conversation');}};find('dialogue-subtitles').onclick=()=>{state.dialogue.subtitles=!state.dialogue.subtitles;render();};
 find('dialogue-text').onclick=()=>{if(line){silent=true;fallback=true;finishLine();}else if(session.lastId)say([session.lastId],choices);};
 if(!line)for(const choice of choices){const b=document.createElement('button');b.id='dialogue-'+choice.id;b.textContent=LINES[choice.line].text;b.onclick=()=>choose(choice.id);find('dialogue-choices').appendChild(b);}
 }
 function useText(){if(!session||!line)return;stopAudio();silent=true;fallback=true;remaining=readingTime();render();}
 function next(){stopAudio();if(!session)return;if(!queue.length){line=null;const fn=after;after=null;if(fn)fn();if(session)render();return;}
 const id=queue.shift(),definition=LINES[id];if(!definition){close();return;}line={...definition,id};session.last=line;session.lastId=id;fallback=false;remaining=readingTime();const m=actor(line.speaker);if(['hello','busy','deliveryhello','ayoexperienced'].includes(id))m?.userData.behaviour?.greet();
 if(false&&!silent&&!line.textOnly&&!state.dialogue.textOnly&&!state.dialogue.muted&&state.dialogue.volume>0&&typeof Audio!=='undefined'){
  const stamp=++token;try{const suffix=line.speaker==='player'?'-'+(state.sex==='male'?'male':'female'):'';const current=audio=new Audio(new URL('./assets/dialogue/'+id+suffix+'.wav',import.meta.url).href);current.volume=state.dialogue.volume;stall=0;mediaTime=0;ended=false;remaining=30;
  const isCurrent=()=>stamp===token&&current===audio;
  current.onended=()=>{if(isCurrent()){ended=true;remaining=0;}};current.onerror=()=>{if(isCurrent())useText();};
  Promise.resolve(current.play()).then(()=>{if(isCurrent())m?.userData.behaviour?.speak(true);}).catch(()=>{if(isCurrent())useText();});
  }catch{useText();}
 }else fallback=true;render();}
 function finishLine(){if(!line)return;stopAudio();next();}
 function say(ids,nextChoices=choices,done=null){queue=[...ids];choices=nextChoices;after=done;next();}
 function choose(id){if(line||!session)return;if(!valid(session)){close();return;}const choice=choices.find(c=>c.id===id);if(!choice)return;gesture(choice.id,session);say([choice.line,...(typeof choice.reply==='function'?choice.reply():choice.reply||[])],choice.next||choices,()=>{if(!session||!valid(session))return close();if(choice.effect)commit(choice.effect,session);if(choice.end)close();});}
 function start(config){close();silent=false;session=config;stopInput();panel.classList.remove('hidden');player().userData.behaviour?.lookAt(()=>session?.actor?.()?.getWorldPosition(player().position.clone())||player().position);config.actor?.()?.userData.behaviour?.lookAt(()=>player().getWorldPosition(player().position.clone()));say([config.open],config.choices);}
 return {start,close,choose,get active(){return !!session;},get session(){return session;},get line(){return line;},tick(dt){if(!session)return;if(!valid(session)){close();return;}if(line){remaining-=dt;if(audio&&remaining>0){const current=Number(audio.currentTime)||0;if(current>mediaTime+.01){mediaTime=current;stall=0;}else stall+=dt;if(stall>=3){useText();return;}}if(remaining<=0){if(audio&&!ended)useText();else finishLine();}}},settingsChanged(){if(line)useText();},pause(){close();}};
}
export function streetChoices(busy=false){
 const thanks={id:'thanks',line:'thanks',reply:[busy?'ayogoodbye':'welcome'],end:true};
 if(busy){const back={id:'another',line:'another',reply:['ayoanother']};const main=[
  {id:'work',line:'work',reply:['ayowork'],next:[{id:'parcel',line:'parcelquestion',reply:['ayoparcel']},{id:'kitchen',line:'kitchenquestion',reply:['ayokitchen']},back,thanks]},
  {id:'directions',line:'directions',reply:['ayonorth'],effect:'dispatch',next:[{id:'desk',line:'deskquestion',reply:['ayodesk']},{id:'route',line:'routequestion',reply:['ayoroute'],effect:'dispatch'},back,thanks]},
  {id:'break',line:'breakquestion',reply:['ayobreak'],next:[{id:'food',line:'foodquestion',reply:['ayofood']},{id:'later',line:'talklater',reply:['ayolater'],end:true},back,thanks]},thanks];back.next=main;return main;}
 return [{id:'greet',line:'greet',reply:['well']},{id:'directions',line:'directions',reply:['north'],effect:'dispatch'},{id:'work',line:'work',reply:['jobs']},{id:'casual',line:'casual',reply:['garden'],next:[{id:'more',line:'askmore',reply:['refuse']},thanks]},thanks];
}
export function deliveryChoices(state,received=false){return received?[{id:'thanks',line:'deliverythanks',reply:['goodbye'],end:true}]:[
 {id:'receive',line:'receive',reply:['handover'],effect:'receive',next:deliveryChoices(state,true)},
 {id:'dish',line:'dishquestion',reply:()=>[state.daily.order.menu]},
 {id:'extra',line:'extra',reply:['noextra']},
 {id:'later',line:'later',reply:['wait'],end:true}
];}
