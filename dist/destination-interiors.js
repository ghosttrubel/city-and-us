import * as T from './vendor/three.module.js';
import {addInteriorDoor} from './interior.js';
import {ROOM_BOUNDS} from './neighbourhood.js';
import {DESTINATION_IDS,DESTINATION_STATIONS} from './destinations-state.js';
export function buildDestinationInterior(id){
 const room=new T.Group();room.name=id+'-interior';room.position.x=1350+DESTINATION_IDS.indexOf(id)*150;room.visible=false;const mats=new Map(),colliders=[],refs={};
 const mat=c=>{if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,roughness:.85}));return mats.get(c);};
 function box(w,h,d,c,x,y,z,solid=false){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);room.add(m);m.castShadow=h>.5;m.receiveShadow=true;if(h<1.5&&y<1.8)m.userData.noCameraFade=true;if(solid)colliders.push({x,z,w,d});return m;}
 function sign(text,x,y,z,c='#2c544c'){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle=c;ctx.fillRect(0,0,512,128);ctx.fillStyle='#fff1d0';ctx.font='bold 32px Arial';ctx.textAlign='center';ctx.fillText(text,256,75,490);const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(3.6,.9),new T.MeshBasicMaterial({map:tex}));m.position.set(x,y,z);m.userData.noCameraFade=true;room.add(m);return m;}
 box(10,.3,9,id==='beach'?'#e4c996':id==='club'?'#394451':'#bc9975',0,0,0);
 if(id!=='beach'){box(10,3.4,.14,id==='club'?'#465064':'#e6d3b0',0,1.85,-4.5);box(.14,3.4,9,'#d3ba92',-5,1.85,0);box(.14,3.4,9,id==='club'?'#536473':'#d3ba92',5,1.85,0);}
 if(id==='island-house'){
  sign('TIDE COURTYARD HOTEL',0,2.7,-4.4);box(2.5,1.05,1.1,'#756447',2.5,.7,-2.8,true);box(2.7,.12,1.2,'#e5cc9e',2.5,1.29,-2.8);box(.6,.06,.4,'#799b8a',2.5,1.39,-2.6);
  box(2.6,.55,2.8,'#8a694a',-2.9,.48,-1.9,true);box(2.55,.25,2.75,'#eee0c0',-2.9,.87,-1.9);box(2.56,.08,1.6,'#769584',-2.9,1.04,-1.5);box(2.6,1.2,.13,'#8a694a',-2.9,.82,-3.35);for(const x of [-3.55,-2.25])box(.9,.16,.55,'#f3e9d1',x,1.07,-2.95);box(.12,2.5,1.8,'#ccb68e',-.8,1.4,-3.55,true);box(1.2,.12,.65,'#719183',2.9,.65,1,true);box(1.2,.65,.08,'#719183',2.9,.98,1.3);
 }else if(id==='club'){
  sign('LANTERN YARD · FREE DANCE',0,2.8,-4.38,'#4c3a64');box(3.2,1.05,1.1,'#433f59',0,.7,-3.4,true);for(const x of [-1,1]){const deck=new T.Mesh(new T.CylinderGeometry(.32,.32,.04,20),mat('#94b8ae'));deck.position.set(x,1.27,-3.3);room.add(deck);}refs.beat=box(3.2,.025,2.8,'#bbaa68',0,.17,-.6);refs.beat.userData.noCameraFade=true;for(const x of [-3.7,3.7]){box(.9,1.6,.8,'#293b43',x,.95,-3.7,true);for(const z of [-1,1.5])box(1.1,.5,1,'#8d718a',x,.5,z,true);}for(const x of [-3,-1,1,3]){box(.2,.3,.2,'#e6c987',x,3,-2);box(.02,.6,.02,'#a9b4a4',x,3.45,-2);}
 }else if(id==='beach'){
  sign('COASTAL BEACH · LEAVE IT CLEAN',0,2.7,-4.5);box(14,.06,14,'#6ca8a5',0,-.02,-11.5);for(let i=0;i<4;i++)box(10,.03,.13,'#d6e7d7',0,.03,-4.9-i*.8);for(const x of [-4.7,4.7]){box(.12,2.6,.12,'#92744b',x,1.45,3.5);box(1.2,.08,.9,'#c1a678',x,2.7,3.5);}box(.65,.85,.65,'#477b64',-3,.6,2.7,true);sign('RECYCLE',-3,1.55,2.6).scale.setScalar(.4);refs.litter=[];for(let i=0;i<3;i++){const p=DESTINATION_STATIONS.beach['litter'+i],m=box(.22,.1,.3,['#d8b178','#79aaa0','#b8b6ca'][i],p.x,.23,p.z);m.userData.noCameraFade=true;refs.litter.push(m);}box(1.5,.12,.7,'#9a7957',3.4,.65,2.8,true);box(1.5,.6,.08,'#9a7957',3.4,1,3.1);
 }else{
  sign('LAGOON POT · PEPPER YAM',0,2.7,-4.4,'#87553e');box(2.7,1,1.2,'#956747',2.5,.65,-2.8,true);box(2.85,.12,1.35,'#e2c297',2.5,1.21,-2.8);for(let i=0;i<6;i++)box(.18,.12,.18,'#dcca92',1.7+i*.28,1.36,-2.65);box(.9,.5,.6,'#657c73',3.2,1.55,-3);for(const z of [-2,1]){box(1.5,.12,.85,'#ad8863',-2.7,1.02,z,true);box(.6,.5,.6,'#7e9e8b',-2.7,.5,z+1,true);}box(.1,1.5,2.8,'#72958c',-4.8,1.8,-1.2);
 }
 const door=addInteriorDoor(room);const light=new T.PointLight(id==='club'?'#d9bbef':'#ffe3af',id==='club'?3:5,12,2);light.position.set(0,3,0);room.add(light);return {room,door,bounds:ROOM_BOUNDS,getColliders:()=>colliders,refs,stations:DESTINATION_STATIONS[id]};
}
