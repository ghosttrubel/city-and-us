import {profileFor} from './road-vehicles.js';

// One touch layout for every road profile. Handling and permission stay in road-vehicles.
const icon=path=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+path+'"></path></svg>';
const icons={
 left:icon('M13 4 5 12l8 8 M21 4l-8 8 8 8'),
 right:icon('m3 4 8 8-8 8 M11 4l8 8-8 8'),
 horn:icon('M4 9h4l8-5v16l-8-5H4z M8 15l2 5h3 M20 8q4 4 0 8'),
 camera:icon('M3 7h4l2-3h6l2 3h4v13H3z M16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0'),
 exit:icon('M10 4H4v16h6 M9 12h12m-5-5 5 5-5 5'),
 recover:icon('M5 7a8 8 0 1 1-1 8 M5 2v5h5'),
 handbrake:icon('M8 6a7 7 0 0 0 0 12 M16 6a7 7 0 0 1 0 12 M10 16V8h3a2 2 0 0 1 0 4h-3')
};
function pedal(gas){
 const holes=(gas?[18,32,46,60,74]:[39,51,63]).map(y=>(gas?[19,31]:[13,25,37,49]).map(x=>'<circle cx="'+x+'" cy="'+y+'" r="3.2"></circle>').join('')).join('');
 return '<svg class="pedal-art" viewBox="0 0 '+(gas?'50 92':'62 92')+'" aria-hidden="true"><path class="pedal-neck" d="'+(gas?'M22 80h6v11h-6z':'M27 67h8v24h-8z')+'"></path><path class="pedal-face" d="'+(gas?'M13 4h24q6 0 6 6v67q0 7-7 7H14q-7 0-7-7V10q0-6 6-6z':'M8 30h46q6 0 4 7l-7 30q-1 5-6 5H17q-5 0-6-5L4 37q-2-7 4-7z')+'"></path><g class="pedal-grip">'+holes+'</g></svg>';
}
export function createVehicleControls({state,exit,recover,camera}){
 const root=document.createElement('section');root.id='vehicle-controls';root.hidden=true;root.setAttribute('aria-label','Driving controls');document.body.appendChild(root);
 const tool=(id,label)=>'<button type="button" id="drive-'+id+'" aria-label="'+label+'" title="'+label+'">'+icons[id]+'</button>';
 root.innerHTML='<div class="drive-dashboard"><output id="drive-speed" aria-live="off"><span id="drive-gear">D</span><span><b id="drive-speed-value">0</b><small>km/h</small></span></output><div class="drive-tools">'+tool('horn','Horn')+tool('camera','Change driving camera')+tool('handbrake','Hold parking brake')+tool('recover','Recover stuck vehicle · free, when stopped')+tool('exit','Park and exit · stop first')+'</div></div><div class="drive-pedals"><div class="drive-steering">'+tool('left','Steer left')+tool('right','Steer right')+'</div><div class="drive-feet"><button type="button" id="drive-brake" aria-label="Brake; hold at a stop to reverse" title="Brake; hold at a stop to reverse">'+pedal(false)+'<span>Brake / R</span></button><button type="button" id="drive-gas" aria-label="Accelerate" title="Accelerate">'+pedal(true)+'<span id="drive-gas-label">Gas</span></button></div></div>';
 const el=id=>root.querySelector('#drive-'+id),held=new Map();
 const bindings=[['left','a','arrowleft'],['right','d','arrowright'],['gas','w','arrowup'],['brake','s','arrowdown'],['handbrake',' ']];
 const buttons=new Map(bindings.map(([id])=>[id,el(id)]));
 let enabled=false,active=null,audio=null,lastKeys=new Set(),lastSpeed='',lastGear='',lastProfile=null;
 function feedback(keys=lastKeys){
  const values=[...held.values()];
  for(const [id,...shortcuts] of bindings){const b=buttons.get(id),down=enabled&&!b.hidden&&(values.includes(id)||shortcuts.some(k=>keys.has(k)));
   if(b.getAttribute('aria-pressed')!==String(down)){b.setAttribute('aria-pressed',String(down));b.classList.toggle('pressed',down);}
  }
 }
 function reset(){
  const pointers=[...held];held.clear();lastKeys=new Set();feedback();
  for(const [pointer,id] of pointers)if(typeof pointer==='number')try{buttons.get(id).releasePointerCapture?.(pointer);}catch{}
 }
 for(const [id] of bindings){
  const b=buttons.get(id);b.setAttribute('aria-pressed','false');
  b.addEventListener('pointerdown',e=>{
   e.preventDefault?.();e.stopPropagation?.();
   if(!enabled||b.hidden||e.button>0)return;
   held.set(e.pointerId,id);b.setPointerCapture?.(e.pointerId);feedback();
  });
  for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,e=>{e.preventDefault?.();e.stopPropagation?.();held.delete(e.pointerId);feedback();});
  // Focused buttons also work with Enter/Space, without triggering a walking action.
  b.addEventListener('keydown',e=>{if(!['Enter',' '].includes(e.key))return;e.preventDefault?.();if(enabled&&!b.hidden){held.set('key-'+id,id);feedback();}});
  b.addEventListener('keyup',e=>{if(!['Enter',' '].includes(e.key))return;e.preventDefault?.();held.delete('key-'+id);feedback();});
  b.addEventListener('blur',()=>{held.delete('key-'+id);feedback();});
 }
 for(const event of ['pointerdown','pointerup','click','keydown','contextmenu'])root.addEventListener(event,e=>{e.stopPropagation?.();if(event==='contextmenu')e.preventDefault?.();});
 el('exit').onclick=()=>{if(enabled&&Math.abs(active.speed)<=.1)exit();};
 el('recover').onclick=()=>{if(enabled&&Math.abs(active.speed)<=.1)recover();};
 el('camera').onclick=()=>{if(enabled)camera();};
 function horn(){if(!enabled||state.dialogue.muted||state.dialogue.volume<=0)return;const Context=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Context)return;try{audio??=new Context();audio.resume?.();const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.frequency.value=active&&profileFor(active).kind==='bike'?420:280;gain.gain.value=state.dialogue.volume*.09;oscillator.connect(gain);gain.connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+.18);}catch{}}
 el('horn').onclick=horn;
 return {root,reset,horn,input(keys=new Set()){
  if(!enabled)return {};
  lastKeys=keys;feedback(keys);const values=[...held.values()],on=(id,...ks)=>values.includes(id)||ks.some(k=>keys.has(k));
  return {accelerator:+on('gas','w','arrowup'),brake:+on('brake','s','arrowdown'),steering:+on('left','a','arrowleft')-+on('right','d','arrowright'),handbrake:!!profileFor(active).handbrake&&on('handbrake',' ')};
 },
 update(v,allowed){
  if(active!==v)reset();active=v;enabled=!!v&&allowed;root.hidden=!enabled;document.body.classList.toggle('driving',!!v);
  if(!enabled)reset();if(!v)return;
  const p=profileFor(v),bike=p.kind==='bike',speed=String(Math.round(Math.abs(v.speed)*3.6)),gear=v.speed<-.1?'R':'D',stopped=Math.abs(v.speed)<=.1;
  if(speed!==lastSpeed){el('speed-value').textContent=speed;lastSpeed=speed;}
  if(gear!==lastGear){el('gear').textContent=gear;el('gear').dataset.gear=gear;lastGear=gear;}
  const label=speed+' kilometres per hour · '+(gear==='R'?'Reverse':stopped?'Stopped · forward ready':'Forward');
  if(el('speed').getAttribute('aria-label')!==label)el('speed').setAttribute('aria-label',label);
  if(lastProfile!==(v.profile||'bike')){
   lastProfile=v.profile||'bike';
   root.dataset.kind=p.kind;root.setAttribute('aria-label',p.name+' driving controls');
   el('handbrake').hidden=!p.handbrake;
   el('gas-label').textContent=bike?'Throttle':'Gas';
   el('gas').setAttribute('aria-label',bike?'Accelerate · bike throttle':'Accelerate');
   const exitLabel=bike?'Park and dismount · stop first':'Park and exit · stop first';
   el('exit').setAttribute('aria-label',exitLabel);el('exit').title=exitLabel;
  }
  el('exit').disabled=!stopped;el('recover').disabled=!stopped;
 }
 };
}
