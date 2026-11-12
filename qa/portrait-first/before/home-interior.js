import * as T from './vendor/three.module.js';
import {HOME_BOUNDS,HOME_FIXED_COLLIDERS,HOME_SOFA_COLLIDER} from './home-layout.js';
import {HOMES} from './life.js';
import {HOME_STYLES} from './home-style.js';
// Original modest-cost room and action props. No downloaded assets.
export function buildHomeInterior(homeId,furnished,homeStyle){
 const room=new T.Group();room.position.x=150;room.visible=false;room.name='home-interior';const mats=new Map(),objects=[],walls=[];
 function mat(c){if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,roughness:.85}));return mats.get(c);}
 function box(w,h,d,c,x,y,z,parent=room){const o=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 function cyl(r,h,c,x,y,z,parent=room){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,12),mat(c));o.position.set(x,y,z);parent.add(o);return o;}
 function station(id){const g=new T.Group();g.userData.activity=id;room.add(g);objects.push(g);return g;}
 const floor=box(14,.3,11,'#bda47e',0,0,-1);for(let x=-6.5;x<7;x+=.65)box(.014,.006,10.8,'#a88e6c',x,.155,-1);
 walls.push(box(14,3.5,.15,'#e5ddc9',0,1.9,-6.5),box(.15,3.5,11,'#e5ddc9',-7,1.9,-1),box(.15,3.5,11,'#e5ddc9',7,1.9,-1));for(const x of [-4,4])walls.push(box(6,1.1,.15,'#e5ddc9',x,.7,4.5));for(const x of [-6.87,6.87])box(.1,.14,11,'#faf0d9',x,.3,-1);box(14,.14,.1,'#faf0d9',0,.3,-6.37);
 const bed=station('sleep');box(3,.55,3.6,'#80664d',-4.7,.48,-3.6,bed);box(2.95,.27,3.55,'#efdfbd',-4.7,.89,-3.6,bed);const blanket=box(2.96,.1,2.1,'#719782',-4.7,1.08,-2.95,bed);for(const x of [-5.4,-4])box(1.1,.18,.6,'#f8edcf',x,1.12,-4.8,bed);box(3.1,1.2,.14,'#80664d',-4.7,.83,-5.5,bed);walls.push(box(.12,2.6,1.7,'#e5ddc9',-2.65,1.45,-5.45));
 const wardrobe=station('wardrobe');box(1.4,2.6,1,'#997653',-5.8,1.45,1.1,wardrobe);for(const x of [-6.15,-5.45]){box(.65,2.4,.05,'#bda17a',x,1.45,1.62,wardrobe);box(.035,.24,.05,'#dec18b',x+(x< -5.8?.2:-.2),1.45,1.67,wardrobe);}
 const work=station('study');box(2.7,.12,.9,'#a77f58',.3,1.12,-5.45,work);for(const x of [-.85,1.45])for(const z of [-5.8,-5.1])box(.08,.9,.08,'#7b624c',x,.62,z,work);
 function chair(x,z,parent){box(.6,.12,.55,'#8b7259',x,.67,z,parent);box(.6,.65,.08,'#a7916b',x,.98,z+.28,parent);for(const a of [-.23,.23])for(const b of [-.2,.2])box(.06,.5,.06,'#6b5c49',x+a,.4,z+b,parent);}
 chair(-.3,-4.65,work);const computer=station('computer');chair(1,-4.65,computer);box(.75,.47,.05,'#324f4b',1,1.57,-5.65,computer);box(.66,.38,.015,'#9cc7ba',1,1.57,-5.61,computer);box(.06,.24,.06,'#526e64',1,1.25,-5.65,computer);const keyboard=box(.65,.035,.25,'#d6ded2',1,1.22,-5.22,computer);for(let i=0;i<3;i++)box(.55,.012,.018,'#80968a',1,1.245,-5.29+i*.07,computer);
 const book=new T.Group();book.position.set(-.3,1.22,-5.15);work.add(book);box(.58,.025,.4,'#e4d9bd',0,0,0,book);const page=box(.28,.01,.39,'#fff1d6',.15,.02,0,book);for(let i=0;i<5;i++){box(.2,.006,.008,'#8c8c7a',-.15,.02,-.13+i*.06,book);box(.2,.006,.008,'#8c8c7a',.15,.03,-.13+i*.06,book);}
 const prep=station('prep'),cook=station('cook');for(const [x,parent] of [[3.2,prep],[5.2,cook]]){box(1.95,1.02,1,'#b8956b',x,.68,-5.1,parent);box(2,.12,1.1,'#e8ddc5',x,1.25,-5.1,parent);for(const dx of [-.47,.47]){box(.86,.75,.035,'#a88562',x+dx,.78,-4.58,parent);box(.3,.03,.04,'#e0c18c',x+dx,1.02,-4.54,parent);}box(1.9,.6,.4,'#e5d9c0',x,2.7,-6.18,parent);}
 const board=box(.75,.045,.5,'#ad8050',3.2,1.34,-4.95,prep);const ingredients=new T.Group();prep.add(ingredients);for(let i=0;i<6;i++)box(.1,.08,.08,i%2?'#c0643e':'#e7d8a7',2.94+(i%3)*.14,1.4,-5.02+Math.floor(i/3)*.16,ingredients);ingredients.visible=false;
 box(1,.04,.85,'#35443c',5.2,1.34,-5.1,cook);for(const z of [-5.35,-4.9])cyl(.2,.035,'#202f2a',5.2,1.38,z,cook);const pot=cyl(.29,.3,'#758e83',5.2,1.56,-4.95,cook);const stew=cyl(.26,.02,'#be673a',5.2,1.72,-4.95,cook);stew.visible=false;
 function cabinet(id,x,z,colour){const g=station(id);box(.9,1.95,1,colour,x,1.13,z,g);const door=box(.86,1.85,.055,id==='fridge'?'#dce3d7':'#a5875d',x,1.13,z+.53,g);box(.04,.45,.06,'#687e70',x-.3,1.25,z+.59,g);const contents=new T.Group();contents.position.set(x,0,z+.56);g.add(contents);contents.visible=false;for(let i=0;i<3;i++)box(.8,.045,.05,'#ebdec0',0,.55+i*.45,0,contents);return {g,door,contents};}
 const fridge=cabinet('fridge',6.1,-2.5,'#aebfb2'),cupboard=cabinet('cupboard',6.1,-.5,'#8c7553');
 const table=station('table');box(1.6,.13,1,'#ac8358',-2.2,1.06,.4,table);for(const x of [-2.85,-1.55])for(const z of [.05,.75])box(.085,.85,.085,'#7b6048',x,.62,z,table);chair(-2.2,1.35,table);
 const sofa=station('sit');box(2.3,.55,1,'#739681',.4,.58,2.1,sofa);box(2.4,.8,.15,'#739681',.4,1,2.65,sofa);for(const x of [-.75,1.55])box(.15,.7,1.1,'#739681',x,.72,2.1,sofa);sofa.visible=furnished;box(2.7,.02,1.5,'#d2af7a',.4,.17,.25);
 const bathroom=station('wash');box(3,.035,3.2,'#b4cdc3',5.35,.19,2.7,bathroom);walls.push(box(.12,1.45,2.7,'#c1d3c6',3.75,.91,2.8,bathroom));box(3.2,1.45,.12,'#c1d3c6',5.4,.91,4.05,bathroom);box(.045,1.1,.045,'#95a99e',6.35,1.9,3.4,bathroom);box(.7,.05,.3,'#a5b8ac',6.05,2.48,3.4,bathroom);
 const curtain=box(2.1,1.65,.025,'#e9dfc4',5.55,1.3,1.8,bathroom);curtain.visible=false;curtain.userData.noCameraFade=true;
 const water=new T.InstancedMesh(new T.CylinderGeometry(.012,.012,.15,4),new T.MeshBasicMaterial({color:'#a7d8d8',transparent:true,opacity:.6}),24);bathroom.add(water);water.visible=false;const dummy=new T.Object3D();
 const hinge=new T.Group();hinge.position.set(-.8,.16,4.3);room.add(hinge);box(1.6,2.35,.1,'#88704e',.8,1.175,0,hinge).userData.dynamicCamera=true;for(const x of [-.94,.94])box(.12,2.55,.18,'#e9d9b5',x,1.42,4.3);box(2,.13,.18,'#e9d9b5',0,2.69,4.3);
 // Activity surfaces and seats must remain legible while the walls cut away.
 for(const parent of [work,computer,table])parent.traverse(o=>{if(o.isMesh)o.userData.noCameraFade=true;});
 const light=new T.PointLight('#ffe5bd',7,15,2);light.position.set(0,3.2,-1);room.add(light);
 function setStyle(id){const s=HOME_STYLES[id];if(!s)return;walls.forEach(o=>o.material.color.set(s.wall));floor.material.color.set(s.wood);blanket.material.color.set(s.fabric);}
 function setHome(id){const h=HOMES[id];if(!h)return;walls.forEach(o=>o.material.color.set(h.wall));floor.material.color.set(h.floor);blanket.material.color.set(h.accent);mat('#739681').color.set(h.accent);}setHome(homeId);setStyle(homeStyle);function pick(ray){const hit=ray.intersectObjects(objects.filter(o=>o.visible),true)[0];let o=hit?.object;while(o&&o!==room){if(o.userData.activity)return o.userData.activity;o=o.parent;}return null;}
 return {room,sofa,door:hinge,bounds:HOME_BOUNDS,getColliders:()=>[...HOME_FIXED_COLLIDERS,...(sofa.visible?[HOME_SOFA_COLLIDER]:[])],setHome,setStyle,pick,refs:{book,page,keyboard,ingredients,pot,stew,board,fridge,cupboard,curtain,water},activityTick(id,time){water.visible=curtain.visible=id==='wash';if(water.visible){for(let i=0;i<24;i++){dummy.position.set(5.35+(i%4)*.22,2.35-((time*1.9+i*.17)%1.8),2.7+Math.floor(i/4)*.12);dummy.updateMatrix();water.setMatrixAt(i,dummy.matrix);}water.instanceMatrix.needsUpdate=true;}page.rotation.z=id==='study'?Math.max(0,Math.sin(time*1.4))*.7:0;}};
}
