// Limits guard near-plane intersection and depth precision, not gameplay views.
export function zoomDistance(distance,steps){
 if(!Number.isFinite(distance)||distance<=0)distance=15;
 if(!Number.isFinite(steps))return distance;
 return Math.max(.35,Math.min(8192,distance*Math.exp(steps*.12)));
}
export function bindZoomButtons(inside,outside,change,enabled=()=>true){
 let held=null,suppressClick=false;
 function stop(){const old=held;held=null;if(old)try{old.element.releasePointerCapture?.(old.pointer);}catch{}}
 for(const [element,direction] of [[inside,-1],[outside,1]]){
  element.addEventListener('pointerdown',e=>{if(held||!enabled()||e.button>0)return;e.preventDefault();e.stopPropagation?.();suppressClick=true;held={element,direction,pointer:e.pointerId,elapsed:0};element.setPointerCapture?.(e.pointerId);change(direction);});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])element.addEventListener(type,e=>{if(held?.pointer===e.pointerId)stop();});
  element.onclick=e=>{if(e?.detail>0&&suppressClick){suppressClick=false;return;}if(enabled())change(direction);};
  element.addEventListener('contextmenu',e=>e.preventDefault());
 }
 for(const type of ['blur','pagehide','city-inputreset','city-pausechange'])globalThis.addEventListener(type,stop);
 document.addEventListener('visibilitychange',stop);
 return {stop,tick(dt){if(!enabled()){stop();return;}if(!held)return;const before=held.elapsed;held.elapsed+=dt;const repeat=Math.max(0,held.elapsed-.18)-Math.max(0,before-.18);if(repeat>0)change(8*repeat*held.direction);},get active(){return !!held;}};
}
