import {buildDestinationInterior} from './destination-interiors.js';
import {DESTINATION_IDS} from './destinations-state.js';
import {buildHomeInterior} from './home-interior.js';
import {HOME_FIXED_COLLIDERS,HOME_SOFA_COLLIDER} from './home-layout.js';
import * as T from './vendor/three.module.js';
import {HOMES} from './life.js';
import {HOME_STYLES} from './home-style.js';
import {ROOM_BOUNDS} from './neighbourhood.js';
// Original cutaway interior, built locally without reference artwork.
export function buildInterior(homeId,furnished,homeStyle){return buildHomeInterior(homeId,furnished,homeStyle);}

export function addInteriorDoor(room){
 const material=new T.MeshStandardMaterial({color:'#705c3f',roughness:.8});
 const hinge=new T.Group();hinge.position.set(-.6,.16,4.3);room.add(hinge);
 const leaf=new T.Mesh(new T.BoxGeometry(1.2,2.35,.1),material);leaf.position.set(.6,1.175,0);leaf.castShadow=true;leaf.userData.dynamicCamera=true;hinge.add(leaf);
 const trim=new T.MeshStandardMaterial({color:'#e4cf9d'});for(const x of [-.72,.72]){const post=new T.Mesh(new T.BoxGeometry(.12,2.55,.18),trim);post.position.set(x,1.4,4.3);room.add(post)}
 const lintel=new T.Mesh(new T.BoxGeometry(1.56,.13,.18),trim);lintel.position.set(0,2.67,4.3);room.add(lintel);return hinge;
}
export function buildVenueInterior(kind){
 const room=new T.Group();room.position.set(kind==='dispatch'?300:450,0,0);room.visible=false;const mats=new Map();
 function box(w,h,d,c,x,y,z){if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,roughness:.84}));const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),mats.get(c));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;room.add(mesh);return mesh}
 box(10,.3,9,'#b9a17c',0,0,0);box(10,3.5,.16,kind==='dispatch'?'#b9c9bf':'#dbc5a0',0,1.9,-4.5);box(.16,3.5,9,'#c5ba9d',-5,1.9,0);
 for(let x=-4;x<5;x++)box(.025,.01,9,'#8a806b',x,.16,0);
 box(2.5,.95,1.2,'#896746',2.5,.65,-2.8);box(2.65,.1,1.3,'#e4d7b9',2.5,1.18,-2.8);
 const item=box(.65,.5,.48,kind==='dispatch'?'#bb8a50':'#528474',2.5,1.47,-2.8);item.userData.interaction=kind==='dispatch'?'pickup':'counter';
 box(.1,.51,.49,'#e8d2a0',2.5,1.47,-2.8);
 for(const z of [-3,-.7,1.6]){box(1,2.4,1.6,'#6d7769',-3.8,1.38,z);for(let y=.5;y<2.5;y+=.6){box(1.12,.06,1.7,'#c1a57b',-3.8,y,z);for(let q=0;q<3;q++)box(.65,.35,.35,kind==='dispatch'?'#b58e5a':['#9c613f','#a4ad69','#6e9275'][q],-3.8,y+.2,z-.5+q*.5)}}
 box(2.3,1.3,.06,'#315747',0,2.4,-4.36);
 const light=new T.PointLight('#ffe6b7',22,14,2);light.position.set(0,3,0);room.add(light);
 const door=addInteriorDoor(room),colliders=[{x:2.5,z:-2.8,w:2.65,d:1.3},...[-3,-.7,1.6].map(z=>({x:-3.8,z,w:1.12,d:1.7}))];
 return {room,door,bounds:ROOM_BOUNDS,getColliders:()=>colliders,item};
}

// Compact, themed public rooms. The counter has the same clear standing area as
// existing venues; activities still require physically approaching it.
export function buildDistrictInterior(kind){
 if(DESTINATION_IDS.includes(kind))return buildDestinationInterior(kind);
 const ids=['library','hub','arcade','islandfood'],index=ids.indexOf(kind);
 const value=buildVenueInterior(kind);value.room.position.x=600+index*150;
 const {room}=value;room.name=kind+'-interior';
 const colours={library:['#aa805b','#d7d8c2'],hub:['#54858c','#b8d1d3'],arcade:['#b38c61','#e3d1b0'],islandfood:['#bd7f60','#e7c6ac']};
 const [accent,wall]=colours[kind];
 // Own materials keep public-room colours independent of the retained shop.
 room.traverse(m=>{if(!m.isMesh)return;m.material=m.material.clone();const p=m.geometry.parameters;if(p.height===3.5)m.material.color.set(wall);if(p.width===2.5)m.material.color.set(accent)});
 const mat=new T.MeshStandardMaterial({color:accent,roughness:.8});
 function item(w,h,d,x,y,z,c=mat){const m=new T.Mesh(new T.BoxGeometry(w,h,d),c);m.position.set(x,y,z);room.add(m);return m}
 if(kind==='library')for(let i=0;i<6;i++)item(.2,.4,.4,1.6+i*.3,1.45,-2.8,new T.MeshStandardMaterial({color:['#528e83','#dba66a','#778eb5'][i%3]}));
 if(kind==='hub'){item(1.1,.7,.08,2.5,1.65,-2.8,new T.MeshStandardMaterial({color:'#273e50'}));item(.9,.52,.02,2.5,1.65,-2.74,new T.MeshStandardMaterial({color:'#82c8c2',emissive:'#326c70',emissiveIntensity:.3}));item(.9,.05,.35,2.5,1.27,-2.4)}
 if(kind==='islandfood'){const pot=new T.Mesh(new T.CylinderGeometry(.35,.3,.35,12),new T.MeshStandardMaterial({color:'#879c9b',metalness:.3,roughness:.5}));pot.position.set(2.5,1.42,-2.8);room.add(pot)}
 return value;
}

export function buildFashionInterior(){
 const value=buildVenueInterior('shop');value.room.position.x=1200;value.room.name='salon-interior';const room=value.room;
 const mats=new Map();function box(w,h,d,c,x,y,z){if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,roughness:.78}));const m=new T.Mesh(new T.BoxGeometry(w,h,d),mats.get(c));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;room.add(m);return m;}
 // Clothing rail, hanging silhouettes, full-length mirrors and salon station.
 for(const z of [-3,-.7,1.6]){box(.055,2.4,.055,'#aa8e58',-2.7,1.35,z-.65);box(.055,2.4,.055,'#aa8e58',-2.7,1.35,z+.65);box(.055,.055,1.4,'#aa8e58',-2.7,2.52,z);for(let i=0;i<3;i++){box(.06,.82,.35,['#bd805e','#617e75','#c3b18b'][i],-2.7,1.96,z-.42+i*.42);box(.065,.24,.58,['#bd805e','#617e75','#c3b18b'][i],-2.7,2.24,z-.42+i*.42);}}
 box(1.2,2.65,.08,'#a58a60',.2,1.6,-4.3);box(1.04,2.43,.025,'#a5c3c1',.2,1.6,-4.24);box(.85,.12,.7,'#574d43',3.8,.7,.6);box(.85,.8,.15,'#bd987b',3.8,1.05,1);box(.8,.9,.08,'#a7c8c1',4.84,1.9,.6).rotation.y=Math.PI/2;
 const base=value.getColliders;value.getColliders=()=>[...base(),{x:-2.7,z:-3,w:.5,d:1.4},{x:-2.7,z:-.7,w:.5,d:1.4},{x:-2.7,z:1.6,w:.5,d:1.4},{x:3.8,z:.8,w:1,d:1}];return value;
}
