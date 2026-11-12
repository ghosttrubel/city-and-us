import * as T from './vendor/three.module.js';
import {placeMeshKit} from './place-mesh-kit.js';
import {surfaceMaterial} from './surface-materials.js';
import {makeFurniture} from './furniture-meshes.js';
import {FURNITURE_ITEMS} from './furniture-catalogue.js';
import {makeCharacter,animateCharacter} from './character.js';
import {aimHand} from './home-motion.js';
import {ROOM_BOUNDS} from './neighbourhood.js';
export function buildRetailInterior(kind,addDoor){
 const salon=kind==='hair-salon',room=new T.Group();room.name=kind+'-interior';room.position.x=salon?2100:2250;room.visible=false;
 const {box,cylinder,oval,rod,label,group,batch}=placeMeshKit(room),colliders=[],products=[];
 const cream='#eee7d8',teal='#266d68',wood='#a98158',ink='#303536',brass='#b79b62';
 const floor=box(10,.32,9,cream,0,0,0);floor.material=surfaceMaterial(salon?cream:'#b59c7d',salon?'tile':'wood');floor.material.map=floor.material.map.clone();floor.material.map.repeat.set(salon?3:2,salon?3:2);floor.material.map.needsUpdate=true;
 for(const [w,d,x,z,c]of [[10,.28,0,-4.5,salon?teal:'#596b51'],[.28,9,-5,0,cream],[.28,9,5,0,'#d9cfbb']]){box(w,3.5,d,c,x,1.9,z);box(w+.03,.2,d+.03,ink,x,.3,z);}
 label(salon?'HAIR SALON':'FURNITURE SHOWROOM',0,3.08,-4.32,5,.4,salon?teal:ink);
 const desk=group('service-counter',2.5,-2.8);box(2.5,.94,1.08,salon?teal:wood,0,.65,0,desk,.08);box(2.65,.12,1.2,cream,0,1.18,0,desk,.045);for(let x=-1.1;x<1.2;x+=.13)box(.045,.8,.025,salon?'#77a79d':'#76563e',x,.68,.56,desk);box(.5,.3,.08,ink,.6,1.42,0,desk);batch(desk);colliders.push({x:2.5,z:-2.8,w:2.65,d:1.2},{x:2.5,z:-3.8,w:.55,d:.5});
 label('ATTENDANT',2.5,2.5,-4.3,2,.28,ink);
 let serviceChair=null,working=false,subject=null,elapsed=0;
 if(salon){
  // Reference: Neighbourhood_Shops_Interiors, bottom-right. Clear centre aisle.
  for(const z of [-2.4,.7]){
   const g=group('styling-station',-3.4,z);
   box(.8,2.3,.12,wood,0,1.45,-.7,g);box(.72,1.3,.07,brass,0,1.95,-.6,g,.1);box(.6,1.17,.04,'#b6d3d2',0,1.95,-.55,g,.1);
   box(1.3,.1,.5,cream,0,1.05,-.5,g);cylinder(.37,.08,brass,0,.22,.25,g);cylinder(.09,.4,ink,0,.45,.25,g);box(.75,.16,.7,ink,0,.73,.25,g,.08);box(.78,.65,.14,ink,0,1.08,.57,g,.08);
   for(const x of [-.43,.43])box(.12,.12,.55,wood,x,1.02,.3,g,.04);
   for(let i=0;i<3;i++)cylinder(.045,.22,i===1?teal:cream,-.4+i*.18,1.2,-.48,g);
   batch(g);colliders.push({x:-3.4,z:z+.1,w:1.4,d:1.8});
  }
  const wash=group('wash-basin',3.8,.2);box(.8,.9,.8,ink,0,.6,0,wash,.08);oval(0,1.13,0,.5,.16,.39,cream,wash);oval(0,1.19,.04,.36,.08,.27,'#536d6a',wash);rod([.34,1.1,-.2],[.34,1.5,-.2],.035,brass,wash);rod([.34,1.5,-.2],[.1,1.5,-.2],.035,brass,wash);batch(wash);colliders.push({x:3.8,z:.2,w:1.1,d:1});
  const wait=group('waiting-seat',3.4,2.3);box(1.6,.2,.65,teal,0,.6,0,wait,.08);box(1.6,.55,.14,teal,0,.91,-.3,wait,.08);for(const x of [-.65,.65])box(.06,.4,.55,brass,x,.35,0,wait);batch(wait);colliders.push({x:3.4,z:2.3,w:1.6,d:.8});
  label('STYLES · CONSULT AT DESK',-2.7,3.05,-4.3,3.4,.25,teal);
  serviceChair=group('consultation-styling-chair',2.5,-1.55);cylinder(.34,.07,brass,0,.22,0,serviceChair);cylinder(.08,.39,ink,0,.45,0,serviceChair);box(.7,.14,.65,ink,0,.71,0,serviceChair,.07);box(.72,.6,.12,teal,0,1.03,.3,serviceChair,.06);for(const x of [-.4,.4]){rod([x,.69,0],[x,1,0],.025,brass,serviceChair);box(.1,.09,.5,ink,x,1.02,0,serviceChair,.04);}batch(serviceChair);serviceChair.visible=false;
 }else{
  // Supplied home furniture language, adapted to a showroom; no showroom sheet supplied.
  FURNITURE_ITEMS.forEach((item,i)=>{const x=i<4?-3.3:.1,z=-2.5+(i%4)*1.65;const m=makeFurniture(item.id);m.position.set(x,.18,z);m.userData.product=item.id;room.add(m);products.push(m);if(!item.flat)colliders.push({x,z,w:item.w,d:item.d});label(item.name+' · NGN '+item.price,x,.45,z+.5,1.6,.22,ink).userData.product=item.id;});
  label('SELECT A DISPLAY · HOME DELIVERY INCLUDED',0,2.65,-4.3,5.4,.28,ink);
  const samples=group('material-samples',4.5,1.4);for(let i=0;i<3;i++){const m=box(.16,.6,.7,[wood,teal,cream][i],0,.7+i*.67,0,samples);m.material=surfaceMaterial([wood,teal,cream][i],['wood','fabric','stone'][i]);}colliders.push({x:4.5,z:1.4,w:.3,d:.8});label('MATERIAL SAMPLES · DISPLAY ONLY',3.5,2.9,1.4,2.4,.24,ink);
 }
 const door=addDoor(room);label('EXIT',0,2.95,4.28,1,.25,ink);
 const light=new T.PointLight('#fff0d6',12,13,2);light.position.set(0,3.2,0);room.add(light);
 let staff=null;
 return {room,door,bounds:ROOM_BOUNDS,products,get staff(){return staff;},getColliders:()=>colliders,
 setService(active,player){working=active;subject=player;serviceChair.visible=active;if(!active&&staff)staff.position.set(2.5,.16,-3.8);},
 tick(dt,active){if(!active)return;if(!staff){staff=makeCharacter({sex:'female',skin:'#885037',hair:'bun',shirt:salon?'#e5ddd0':'#77876e',bottom:ink,accessory:'none'});staff.position.set(2.5,.16,-3.8);staff.name=salon?'hair-stylist':'showroom-attendant';room.add(staff);}animateCharacter(staff,dt,false);if(working&&subject){elapsed+=dt;staff.position.set(3.35,.16,-1.55);staff.rotation.y=-Math.PI/2;const target=subject.userData.head.getWorldPosition(new T.Vector3());target.y+=.06+Math.sin(elapsed*5)*.035;aimHand(staff,'r',target);aimHand(staff,'l',target.clone().add(new T.Vector3(.05,0,.12)));}else staff.rotation.y=0;}
 };
}
