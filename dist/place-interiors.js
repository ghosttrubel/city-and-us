import {PRODUCTS} from './provisions.js';
import * as T from './vendor/three.module.js';
import {placeMeshKit} from './place-mesh-kit.js';
import {makeCharacter,animateCharacter} from './character.js';
import {ROOM_BOUNDS} from './neighbourhood.js';
export const PLACE_STATIONS=Object.freeze({
 shop:{counter:{x:2.5,z:-1.55},produce:{x:-2.7,z:1.25},shelves:{x:.7,z:.5}},
 dispatch:{parcel:{x:2.5,z:-1.55},tickets:{x:-2.5,z:-1.55}}
});
// Reference selections and hidden-side assumptions: docs/PLACES_VEHICLES_BATCH_1.md.
export function buildPlaceInterior(kind,addDoor){
 const shop=kind==='shop',room=new T.Group();room.name=kind+'-interior';room.position.x=shop?450:300;room.visible=false;
 const k=placeMeshKit(room),{box,cylinder,oval,rod,label,batch,group}=k,colliders=[],fixtures=[];
 const p={wall:shop?'#315d43':'#dba82c',ink:'#30383d',cream:'#eee5ce',tile:'#d5cbb8',wood:'#ad8151',metal:'#a5afb2',green:'#315d43'};
 function fixture(name,x,z,w,d,build){const g=group(name,x,z);if(w&&d)colliders.push({x,z,w,d});build(g);batch(g);fixtures.push(g);return g;}
 box(10,.3,9,p.cream,0,0,0);
 const floor=group('cream-ceramic-tiles');for(let x=-5;x<=5;x++)box(.016,.007,9,p.tile,x,.155,0,floor);for(let z=-4.5;z<=4.5;z++)box(10,.007,.016,p.tile,0,.155,z,floor);batch(floor);
 for(const side of [-1,1]){box(.16,3.5,9,p.wall,side*5,1.9,0);box(.18,.18,9,p.ink,side*4.98,.25,0);}
 box(10,3.5,.16,p.wall,0,1.9,-4.5);box(10,.18,.18,p.ink,0,.25,-4.48);
 const top=group('wall-coping');for(const x of [-4.85,0,4.85])box(.18,3.5,.2,shop?'#496a4e':p.ink,x,1.9,-4.35,top);box(9.9,.22,.24,p.cream,0,3.52,-4.4,top);batch(top);
 function packet(x,y,z,c,g){const start=g.children.length;box(.22,.31,.14,c,x,y,z,g,.02);box(.17,.12,.016,p.cream,x,y+.01,z+.079,g);box(.21,.025,.15,p.ink,x,y+.155,z,g);for(const m of g.children.slice(start))m.userData.product=y<.9?'rice':y<1.5?'beans':'soap';}
 function bottle(x,y,z,c,g){const start=g.children.length;cylinder(.062,.25,c,x,y,z,g,.05,8);cylinder(.025,.065,p.cream,x,y+.15,z,g,.025,8);box(.102,.1,.014,p.cream,x,y,z+.055,g);for(const m of g.children.slice(start))m.userData.product='water';}
 function shelf(g,width,depth,stock=true){for(const x of [-width/2+.045,width/2-.045])box(.07,2.45,depth,p.metal,x,1.4,0,g);box(width,2.4,.06,p.cream,0,1.4,-depth/2+.03,g);
 for(let row=0;row<4;row++){const y=.4+row*.54;box(width,.06,depth,p.cream,0,y,0,g);if(stock)for(let i=0;i<Math.floor(width/.29);i++){const x=-width/2+.18+i*.29,c=['#bc5132','#d3a82e','#34795a','#426b9a'][((i+row)%4)];row===2?bottle(x,y+.18,depth*.15,c,g):packet(x,y+.19,depth*.15,c,g);}}}
 function desk(name,x,z,width=2.65){return fixture(name,x,z,width,1.15,g=>{box(width,.94,1.02,p.wall,0,.66,0,g,.04);box(width+.08,.1,1.18,p.cream,0,1.18,0,g,.03);box(width-.13,.1,.04,p.ink,0,.27,.53,g);rod([.55,1.23,-.1],[.55,1.48,-.1],.035,p.ink,g);box(.57,.37,.07,p.ink,.55,1.6,-.1,g,.025);box(.49,.28,.015,'#8bafb1',.55,1.6,-.058,g);box(.24,.07,.31,p.ink,-.5,1.28,.27,g,.015);box(.16,.012,.12,'#8bafb1',-.5,1.32,.29,g);});}
 function bench(x,z){return fixture('terminal-waiting-bench',x,z,2.3,.7,g=>{for(const xx of [-.85,.85]){rod([xx,.18,-.22],[xx,.62,.08],.045,p.metal,g);rod([xx,.18,.3],[xx,.62,.08],.045,p.metal,g);}for(const xx of [-.76,0,.76]){box(.66,.08,.52,p.ink,xx,.68,0,g,.06);const back=box(.66,.57,.06,p.ink,xx,.98,-.26,g,.04);back.rotation.x=-.08;for(const s of [-1,1])rod([xx+s*.34,.69,.1],[xx+s*.34,.92,.1],.022,'#d6aa47',g);}});}
 if(shop){
  fixture('back-grocery-shelves',-1.45,-3.97,4.5,.7,g=>shelf(g,4.5,.7));
  fixture('right-household-shelf',4.28,.3,.65,3.6,g=>{g.rotation.y=-Math.PI/2;shelf(g,3.6,.65);});
  fixture('centre-double-gondola',-.6,-.1,1.25,2.65,g=>{for(const side of [-1,1]){for(let row=0;row<3;row++){const y=.38+row*.44;box(1.18,.055,2.65,p.cream,0,y,0,g);for(let i=0;i<8;i++){const m=box(.18,.28,.19,['#b44532','#e2b342','#497652','#467da1'][i%4],side*.43,y+.17,-1.08+i*.3,g,.02);m.userData.product=row===0?'biscuits':row===1?'soap':'bundle';box(.015,.11,.14,p.cream,side*.53,y+.17,-1.08+i*.3,g).userData.product=m.userData.product;}}}box(.07,1.35,2.65,p.metal,0,.82,0,g);});
  fixture('wooden-produce-crates',-4,1.0,1.05,3.1,g=>{for(let i=0;i<4;i++){const z=-1.14+i*.76;box(.98,.48,.68,p.wood,0,.4,z,g);for(const x of [-.5,.5])for(let row=0;row<3;row++)box(.035,.1,.68,'#c59a63',x,.26+row*.16,z,g);for(let j=0;j<9;j++)oval((j%3-1)*.24,.7+Math.floor(j/3)*.015,z+(Math.floor(j/3)-1)*.17,.105,.09,.09,['#70933c','#d9b234','#b74631','#b99b55'][i],g).userData.product=i===2?'tomato':'plantain';}});
  fixture('glass-drinks-fridge',4.0,-3.7,1.2,1.15,g=>{box(1.2,2.6,1.1,p.ink,0,1.48,0,g,.045);box(1.08,2.35,.05,'#254957',0,1.48,.57,g);for(let row=0;row<4;row++){box(1,.045,.45,p.metal,0,.52+row*.51,.55,g);for(let i=0;i<5;i++)bottle(-.4+i*.2,.7+row*.51,.61,['#376f48','#ba6035','#417fa3'][i%3],g);}for(const x of [-.53,.53])box(.045,2.4,.08,p.metal,x,1.48,.68,g);box(.045,2.35,.08,p.metal,0,1.48,.68,g);rod([.09,1.05,.74],[.09,1.75,.74],.02,p.cream,g);});
  desk('provisions-checkout',2.5,-2.8);
  label('TAP STOCK TO SELECT · FIXTURES ARE DISPLAY ONLY',0,3.42,-4.36,7,.25,p.ink);
  label('PROVISIONS',-1.5,3.05,-4.37,3.5,.4,p.green);
  label('CHECKOUT',2.5,2.65,-2.72,1.65,.25,p.green);
 }else{
  desk('ticket-counter',-2.5,-2.8);desk('parcel-counter',2.5,-2.8);
  const screen=group('glazed-counter-divider');for(const x of [-3.85,-1.15,1.15,3.85])box(.065,.67,.08,p.metal,x,1.62,-2.92,screen);box(8,.08,.14,p.ink,0,2.02,-2.92,screen);batch(screen);
  fixture('parcel-rack',4.25,.0,.7,2.5,g=>{g.rotation.y=-Math.PI/2;shelf(g,2.5,.7,false);for(let row=0;row<3;row++)for(let i=0;i<4;i++){box(.48,.37,.43,p.wood,-.88+i*.59,.62+row*.54,.07,g);box(.1,.38,.45,p.cream,-.88+i*.59,.62+row*.54,.07,g);}});
  bench(-2.5,.3);bench(-2.5,2.05);bench(2.3,1.65);
  label('TICKETS · LOCAL DANFO',-2.5,2.7,-4.35,3.3,.38,p.ink);label('PARCEL COLLECTION',2.5,2.7,-4.35,3.1,.38,p.ink);
  label('HOME  /  DISPATCH  /  PROVISIONS',0,3.16,-4.34,5.4,.3,p.ink);
 }
 const lights=group('ceiling-lights');for(const x of [-3,0,3])box(.65,.035,.4,p.cream,x,3.46,-1.2,lights);batch(lights);
 const lamp=new T.PointLight('#fff2d9',16,13,2);lamp.position.set(0,3.2,0);room.add(lamp);
 const door=addDoor(room);door.traverse(m=>{if(m.isMesh){m.material=m.material.clone();m.material.color.set(p.wall);}});
 label('EXIT',0,2.92,4.28,1.1,.28,p.ink);
 // Public visitor areas are walkable; staff-only lanes have physical counter barriers.
 const staffPositions=shop?[[2.5,-3.83]]:[[2.5,-3.83],[-2.5,-3.83]];
 colliders.push(...staffPositions.map(([x,z])=>({x,z,w:.55,d:.5})));
 let staff=null;
 return {room,door,bounds:ROOM_BOUNDS,item:fixtures.find(g=>g.name=== (shop?'provisions-checkout':'parcel-counter')),stations:PLACE_STATIONS[kind],getColliders:()=>colliders,get staff(){return staff;},tick(dt,active){if(!active)return;if(!staff){staff=staffPositions.map(([x,z],i)=>{const actor=makeCharacter({sex:i?'female':'male',skin:i?'#885037':'#6b422c',hair:i?'bun':'fade',shirt:shop?'#e4dcc5':i?'#d6a634':'#667780',bottom:'#35413e',accessory:'none'});actor.name=shop?'provisions-shopkeeper':i?'transport-attendant':'parcel-attendant';actor.position.set(x,.16,z);actor.traverse(m=>{if(m.isMesh)m.castShadow=false;});room.add(actor);return actor;});}for(const actor of staff)animateCharacter(actor,dt,false);}};
}
