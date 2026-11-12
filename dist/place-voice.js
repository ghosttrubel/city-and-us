import {PLACE_LINES} from './place-voice-lines.js';
// Existing generic recordings are retained on disk but are not approved voices.
export function createPlaceVoice({state,save=()=>{},host=()=>document.getElementById('sheet')}){
 let panel=null,turns=[],index=0,minimized=false;
 function render(){const container=host();if(!container||!turns.length)return;panel=container.querySelector('#place-voice');if(!panel){
  panel=document.createElement('section');panel.id='place-voice';container.appendChild(panel);
  for(const event of ['pointerdown','pointerup','click','keydown'])panel.addEventListener(event,e=>{if(event!=='keydown'||!['Escape','Tab'].includes(e.key))e.stopPropagation?.();});
 }panel.hidden=false;
 panel.innerHTML='<div class="dialogue-heading"><strong id="place-speaker"></strong><button id="place-minimise" aria-label="Minimise dialogue" aria-expanded="true" aria-controls="place-voice-subtitle place-turn-controls">−</button><button id="place-close" aria-label="Close dialogue">×</button></div><p id="place-voice-subtitle" role="status"></p><div id="place-turn-controls"><button id="place-next">Next →</button><details><summary>Dialogue options</summary><button id="place-voice-replay">Replay turn</button><button id="place-subtitles">Subtitles</button><label>Voice volume<input id="place-volume" type="range" min="0" max="1" step=".05"></label><small>Approved Nigerian voice recordings are not installed. Text dialogue is available.</small></details></div>';
 const el=id=>panel.querySelector('#'+id);el('place-speaker').textContent=turns[index].speaker;el('place-voice-subtitle').textContent=state.dialogue.subtitles===false?'Subtitles off':turns[index].text;el('place-voice-subtitle').hidden=minimized;el('place-turn-controls').hidden=minimized;
 el('place-minimise').textContent=minimized?'+':'−';el('place-minimise').setAttribute('aria-label',minimized?'Expand dialogue':'Minimise dialogue');el('place-minimise').setAttribute('aria-expanded',String(!minimized));
 el('place-minimise').onclick=()=>{minimized=!minimized;render();};el('place-close').onclick=()=>{panel.hidden=true;};el('place-voice-replay').onclick=()=>{minimized=false;render();};
 el('place-next').disabled=index>=turns.length-1;el('place-next').hidden=index>=turns.length-1;el('place-next').onclick=()=>{index=Math.min(index+1,turns.length-1);render();};el('place-subtitles').onclick=()=>{state.dialogue.subtitles=!state.dialogue.subtitles;save();render();};el('place-volume').value=state.dialogue.volume;el('place-volume').oninput=()=>{state.dialogue.volume=Number(el('place-volume').value);save();};
 }
 function sayText(values){turns=values;index=0;minimized=false;render();}
 return {sayText,say(ids){sayText(ids.filter(id=>PLACE_LINES[id]).map(id=>{const l=PLACE_LINES[id];return {speaker:({player:'You',shop:'Shopkeeper',parcel:'Parcel attendant',ticket:'Transport attendant'})[l.speaker]||'Attendant',text:l.text};}));},stop(){if(panel)panel.hidden=true;},tick(){},get playing(){return false;}};
}
