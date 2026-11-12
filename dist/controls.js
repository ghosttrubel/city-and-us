import {joystickVector} from './neighbourhood.js';

export function bindJoystick(element,thumb,onChange,enabled=()=>true){
 let pointerId=null,origin=null,radius=52;
 function reset(){pointerId=null;origin=null;thumb.style.transform='translate(-50%, -50%)';element.classList.remove('engaged');onChange({x:0,y:0,magnitude:0})}
 function update(e){const dx=e.clientX-origin.x,dy=e.clientY-origin.y,length=Math.hypot(dx,dy),factor=length>radius?radius/length:1;thumb.style.transform=`translate(calc(-50% + ${dx*factor}px), calc(-50% + ${dy*factor}px))`;onChange(joystickVector(dx,dy,radius))}
 element.addEventListener('pointerdown',e=>{if(pointerId!==null||!enabled())return;e.preventDefault();e.stopPropagation?.();const r=element.getBoundingClientRect();origin={x:r.left+r.width/2,y:r.top+r.height/2};radius=Math.min(r.width,r.height)*.39;pointerId=e.pointerId;element.setPointerCapture(e.pointerId);element.classList.add('engaged');update(e)});
 element.addEventListener('pointermove',e=>{if(e.pointerId!==pointerId)return;e.preventDefault();update(e)});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])element.addEventListener(type,e=>{if(e.pointerId===pointerId)reset()});
 return {reset,get active(){return pointerId!==null}};
}
