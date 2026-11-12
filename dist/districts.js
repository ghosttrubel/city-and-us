import * as T from './vendor/three.module.js';
import {BUILDINGS,ROADS,ENTRANCES,DISTRICTS,CONNECTIONS,WATER} from './neighbourhood.js';
import {mergeGeometries} from './vendor/addons/BufferGeometryUtils.js';
// Original low-poly district geometry. No network fetches or repeated city-sized scene.
export function districtDistance(point,bounds){return Math.hypot(Math.max(bounds.minX-point.x,0,point.x-bounds.maxX),Math.max(bounds.minZ-point.z,0,point.z-bounds.maxZ))}
export const expansionObstacles=BUILDINGS.filter(b=>b.district!=='surulere').map(b=>({x:b.x,z:b.z,w:b.w+.6,d:b.d+.6}));
function author(){
 const root=new T.Group(),details=new T.Group();root.add(details);const mats=new Map();
 const material=c=>{if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,roughness:.87}));return mats.get(c)};
 function box(w,h,d,c,x,y,z,parent=root){const m=new T.Mesh(new T.BoxGeometry(w,h,d),material(c));m.position.set(x,y,z);m.castShadow=h>.6;m.receiveShadow=true;parent.add(m);return m}
 function cylinder(r,h,c,x,y,z,parent=root,r2=r){const m=new T.Mesh(new T.CylinderGeometry(r2,r,h,10),material(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 function sign(title,sub,x,y,z,w=6,parent=root){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#173f46';ctx.fillRect(0,0,512,128);ctx.fillStyle='#fff3ce';ctx.textAlign='center';ctx.font='bold 34px Arial';ctx.fillText(title,256,53,486);ctx.font='19px Arial';ctx.fillText(sub,256,95,486);const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;const mesh=new T.Mesh(new T.PlaneGeometry(w,w/4),new T.MeshStandardMaterial({map:tex,roughness:.85}));mesh.position.set(x,y,z);parent.add(mesh);return mesh}
 function tree(x,z,colour='#59876d'){cylinder(.13,3.3,'#92704e',x,1.65,z,details);const crown=new T.Mesh(new T.IcosahedronGeometry(1.6,0),material(colour));crown.position.set(x,3.9,z);crown.scale.set(1,1.2,1);details.add(crown)}
 // One vertex-colour material per structural group, keeping camera cutaways local.
 function batch(group){group.updateMatrixWorld(true);const buckets=new Map(),remove=[];group.traverse(m=>{if(!m.isMesh||m.material.map||m.userData.dynamicCamera)return;const geo=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();geo.applyMatrix4(m.matrixWorld);const p=geo.getAttribute('position'),c=new Float32Array(p.count*3);for(let i=0;i<p.count;i++)m.material.color.toArray(c,i*3);geo.setAttribute('color',new T.BufferAttribute(c,3));const cell=group===details?Math.floor(m.matrixWorld.elements[12]/12)+','+Math.floor(m.matrixWorld.elements[14]/12):'';const k=m.castShadow+'|'+cell;if(!buckets.has(k))buckets.set(k,{cast:m.castShadow,geos:[]});buckets.get(k).geos.push(geo);remove.push(m)});for(const m of remove){m.parent.remove(m);m.geometry.dispose()}for(const {cast,geos} of buckets.values()){const geo=mergeGeometries(geos);geos.forEach(g=>g.dispose());const mesh=new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,roughness:.86}));mesh.castShadow=cast;mesh.receiveShadow=true;group.add(mesh)}}
 function dispose(){const geometries=new Set(),materials=new Set(),textures=new Set();root.traverse(m=>{if(m.isMesh){geometries.add(m.geometry);for(const a of Array.isArray(m.material)?m.material:[m.material]){materials.add(a);if(a.map)textures.add(a.map)}}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose())}
 return {root,details,box,cylinder,sign,tree,batch,dispose};
}
export function buildDistrict(id){
 const a=author(),{root,details,box,cylinder,sign,tree,batch}=a,d=DISTRICTS.find(d=>d.id===id),b=d.bounds,island=id==='island',coast=id==='ajah',doors={};root.name='district-'+id;
 box(b.maxX-b.minX,.2,b.maxZ-b.minZ,coast?'#e0c797':island?'#c8c6ad':'#bdc6a6',(b.minX+b.maxX)/2,-.01,(b.minZ+b.maxZ)/2);
 for(const r of ROADS.filter(r=>r.district===id)){box(r.w,.03,r.d,'#4a5e60',r.x,.085,r.z);if(r.d>r.w){for(const x of [r.x-r.w/2-1.4,r.x+r.w/2+1.4])box(2.8,.16,r.d,'#e2d6bb',x,.08,r.z);for(let z=r.z-r.d/2+2;z<r.z+r.d/2;z+=5)box(.14,.01,2,'#efdfb6',r.x,.11,z)}else{for(const z of [r.z-r.d/2-1.4,r.z+r.d/2+1.4])box(r.w,.16,2.8,'#e2d6bb',r.x,.08,z);for(let x=r.x-r.w/2+2;x<r.x+r.w/2;x+=5)box(2,.01,.14,'#efdfb6',x,.11,r.z)}}
 for(const data of BUILDINGS.filter(b=>b.district===id)){
  const {x,z,w,d:depth,h,color}=data,g=new T.Group();root.add(g);
  g.userData.selection={kind:'building',id:data.id};const entry=ENTRANCES[data.id];if(entry){for(const side of [-1,1]){box((w-1.45)/2,h,depth,color,x+side*(w+1.45)/4,h/2,z,g);box((w+.25-1.45)/2,.3,depth+.25,'#586f69',x+side*(w+.25+1.45)/4,.3,z,g);}box(1.45,h-2.65,depth,color,x,(h+2.65)/2,z,g);box(1.45,2.65,depth-.75,color,x,1.325,z-.375,g);}else{box(w,h,depth,color,x,h/2,z,g);box(w+.25,.3,depth+.25,'#586f69',x,.3,z,g);}box(w+.35,.25,depth+.35,'#eee0bd',x,h+.12,z,g);
  if(island){for(let xx=x-w/2+.5;xx<x+w/2;xx+=2)if(!entry||Math.abs(xx-entry.x)>.9)box(.32,2.9,.5,'#f2e1bb',xx,1.55,z+depth/2+.2,g);box(w+.9,.25,1.4,'#f0d9aa',x,3,z+depth/2+.5,g)}
  else{box(w+.5,.15,1.7,'#477b7b',x,2.9,z+depth/2+.5,g);for(let xx=x-w/2+1;xx<x+w/2;xx+=2)if(!entry||Math.abs(xx-entry.x)>1.4)box(1.25,1.5,.05,'#749f9a',xx,1.5,z+depth/2+.05,g)}
  for(let y=4.3;y<h-.5;y+=2.2)for(let xx=x-w/2+1;xx<x+w/2;xx+=2){box(1.15,1.4,.12,'#f3e2bd',xx,y,z+depth/2+.04,g);box(.9,1.17,.14,'#446b79',xx,y,z+depth/2+.1,g)}
  const e=ENTRANCES[data.id];if(e){box(1.45,2.5,.08,'#172e34',e.x,1.4,e.z-.8,g);sign(data.name.toUpperCase(),coast?'AJAH · COASTAL QUARTER':island?'VICTORIA ISLAND · WATERFRONT':'MAINLAND · YABA',e.x,3.75,e.z+.3,Math.min(w-1,8),g);box(2.2,.16,2.1,'#e0d4b8',e.x,.075,e.z+.65);const hinge=new T.Group();hinge.position.set(e.x-.6,.18,e.z+.03);root.add(hinge);box(1.2,2.35,.1,'#426c70',.6,1.175,0,hinge).userData.dynamicCamera=true;doors[e.id]=hinge}
  if(data.id==='island-clock'){const face=new T.Mesh(new T.CircleGeometry(1.2,24),new T.MeshBasicMaterial({color:'#f9ecd2'}));face.position.set(x,7.8,z+depth/2+.02);g.add(face);box(.08,.8,.03,'#233d46',x,8.1,z+depth/2+.07,g);box(.65,.08,.03,'#233d46',x+.3,7.8,z+depth/2+.08,g);cylinder(1.4,1.8,'#5e8a82',x,h+1,z,g,0)}
  batch(g);
 }
 if(coast){
  for(const z of [-30,4,26])tree(166,z,'#6b9675');
  box(4,.03,74,'#ebd5aa',194,.12,-3);box(16,.05,74,'#72aaa6',204,-.12,-3);
  for(let z=-32;z<32;z+=8)box(.15,.03,4,'#dbe6cd',197,.02,z,details);
  sign('AJAH · COAST','BEACH · MUSIC · NEIGHBOURHOOD',154,3.2,-16,7);
  sign('RESIDENCE SITE','PLANNED · APPOINTMENTS NOT OPEN',158,2.4,22.2,7);
 }else if(!island){
  for(const x of [-7.5,7.5])for(const z of [-58,-73,-88,-106])tree(x,z);
  sign('YABA','READ · MAKE · GROW',-8,3.6,-54,6);
  // Open-air book tables beside the market, outside the clear approach paths.
  for(const x of [-24,-20,-16]){box(2.3,.18,1,'#8e674b',x,.9,-103,details);for(let i=0;i<5;i++)box(.3,.16,.55,['#cb8c66','#5a8996','#d6b96c'][i%3],x-.85+i*.4,1.06,-103,details)}
 }else{
  for(const x of [71,123])for(const z of [-22,2,23])tree(x,z,'#618e78');
  box(4,.02,68,'#b6c9be',123,.17,-4);for(let z=-35;z<30;z+=4){if(z>=-15&&z<=-3)continue;cylinder(.045,1.2,'#456e72',125,.7,z,details);box(.05,.05,4,'#456e72',125,1.27,z+2,details)}
  sign('VICTORIA ISLAND','WATERFRONT · TIDE COURTYARD',115,3.5,23,8);
 }
 // Reserved billboard inventory: original community artwork, no ad SDK or brands.
 const bx=coast?155:island?72:-27,bz=coast?-32:island?26:-56;for(const x of [bx-2,bx+2])box(.15,4,.15,'#3e5b5e',x,2,bz,details);
 const billboard=sign(coast?'CARE FOR THE COAST':island?'TAKE THE LONG WAY HOME':'MAKE SOMETHING GOOD',coast?'CITY & US · AJAH':island?'CITY & US · VICTORIA ISLAND':'CITY & US · YABA',bx,4,bz,7,details);billboard.userData.adSlot=id+'-community-01';
 // Batch detail only; structures remain separate so they can fade independently.
 batch(details);return {...a,doors,bounds:d.bounds};
}
export function buildConnections(){const a=author(),{box,cylinder,sign,root}=a;root.name='city-connections';
 // Lagoon is scenery only; walkable masks constrain both player and routing to the bridge.
 for(const w of WATER)box(w.w,.05,w.d,'#679b9e',w.x,-.2,w.z);
 for(const c of CONNECTIONS){box(c.w,.2,c.d,'#b6bead',c.x,0,c.z);const r=ROADS.find(r=>r.district==='link'&&r.x===c.x);box(r.w,.025,r.d,'#52696c',r.x,.088,r.z)}
 for(const z of [-15.7,-4.3]){box(15,.12,.12,'#dfd9bc',60.5,1.3,z);for(let x=53;x<68;x+=3)cylinder(.07,1.2,'#829c94',x,.7,z)}
 for(let x=38;x<68;x+=5)box(2,.012,.13,'#eddfb5',x,.11,-10);
 sign('VICTORIA ISLAND →','MAINLAND BRIDGE',33,3.3,-15.8,6);sign('YABA ↑','CAMPUS QUARTER',-5,3.2,-39,4);
 sign('AJAH / COAST →','COASTAL LINK',129,3.2,-15.8,6);return a;
}
