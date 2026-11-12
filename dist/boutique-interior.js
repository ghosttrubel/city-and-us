import {surfaceMaterial} from './surface-materials.js';
import * as T from './vendor/three.module.js';
import {softBox} from './soft-geometry.js';
import {mergeGeometries} from './vendor/addons/BufferGeometryUtils.js';
import {makeCharacter,animateCharacter} from './character.js';
import {animateActivity} from './activity-pose.js';
import {aimHand} from './home-motion.js';
import {ROOM_BOUNDS} from './neighbourhood.js';
import {createBoutiqueMirrors} from './boutique-mirrors.js';

// Original venue fixtures. Display garments are shop scenery, not catalogue items
// or reproductions of the owner's rejected reference-outfit batch.
export const BOUTIQUE_STATIONS={checkout:{x:2.5,z:-1.55},stylist:{x:2.15,z:2.55},fitting:{x:-2.9,z:-2.15}};
export function buildBoutiqueInterior(addDoor){
 const room=new T.Group();room.name='salon-interior';room.position.x=1200;room.visible=false;
 const colliders=[],materials=new Map(),mirrors=[],fixtures=[];
 const palette={ink:'#433c37',metal:'#b79b62',wall:'#f1e6dd',floor:'#dfd5c6',teal:'#b78386',lilac:'#d3b4b1',white:'#f6f0e5'};
 function mat(c){if(!materials.has(c))materials.set(c,surfaceMaterial(c,c===palette.metal?'metal':c===palette.floor?'stone':c===palette.lilac||c===palette.teal?'fabric':'paint'));return materials.get(c);}
 function mesh(g,c,x,y,z,parent=room){const m=new T.Mesh(g,mat(c));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
 function box(w,h,d,c,x,y,z,parent=room,r=.025){return mesh(softBox(w,h,d,r),c,x,y,z,parent);}
 function rod(a,b,r,c,parent){const v=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.sub(v);const m=mesh(new T.CylinderGeometry(r,r,delta.length(),8),c,...v.addScaledVector(delta,.5).toArray(),parent);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m;}
 function oval(x,y,z,sx,sy,sz,c,parent){const m=mesh(new T.SphereGeometry(1,12,8),c,x,y,z,parent);m.scale.set(sx,sy,sz);return m;}
 function label(text,x,y,z,w=2.6,h=.4,c=palette.ink,parent=room){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const ctx=canvas.getContext('2d');ctx.fillStyle=c;ctx.fillRect(0,0,512,96);ctx.fillStyle=palette.white;ctx.font='600 34px Arial';ctx.textAlign='center';ctx.fillText(text,256,61,490);const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex}));m.position.set(x,y,z);m.userData.noCameraFade=true;parent.add(m);return m;}
 function fixture(name,x,z,w,d,build){const g=new T.Group();g.name=name;g.position.set(x,0,z);room.add(g);if(w&&d)colliders.push({x,z,w,d});build(g);batch(g);fixtures.push(g);return g;}
 function batch(g){g.updateMatrixWorld(true);const groups=new Map();for(const m of [...g.children]){if(!m.isMesh||m.material.map||m.userData.noBatch)continue;m.updateMatrix();const geo=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();geo.applyMatrix4(m.matrix);const list=groups.get(m.material)||[];list.push(geo);groups.set(m.material,list);g.remove(m);m.geometry.dispose();}for(const [material,geos] of groups){const geo=mergeGeometries(geos),m=new T.Mesh(geo,material);m.castShadow=m.receiveShadow=true;g.add(m);geos.forEach(g=>g.dispose());}}
 box(10,.3,9,palette.floor,0,0,0);
 // Large-format ceramic tile joints and restrained contrasting perimeter.
 const grid=new T.Group();room.add(grid);for(let x=-5;x<=5;x++)box(.012,.006,9,'#b5a594',x,.154,0,grid,0);for(let z=-4.5;z<=4.5;z++)box(10,.006,.012,'#b5a594',0,.154,z,grid,0);batch(grid);
 box(10,3.5,.14,palette.wall,0,1.9,-4.5);box(.14,3.5,9,'#e6c9c1',-5,1.9,0);box(.14,3.5,9,'#e6c9c1',5,1.9,0);
 for(const x of [-4.88,4.88])box(.06,.16,9,palette.ink,x,.23,0);box(10,.16,.06,palette.ink,0,.23,-4.38);
 label('BOUTIQUE · CLOTHES & ACCESSORIES',.2,3.12,-4.4,4.7,.5);
 function mirror(x,y,z,w,h){box(w+.12,h+.12,.09,palette.metal,x,y,z-.03);const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({color:'#aac5d6',metalness:.9,roughness:.08}));m.position.set(x,y,z+.03);m.userData.noCameraFade=true;m.name='working-mirror';room.add(m);mirrors.push(m);return m;}
 mirror(-.75,1.57,-4.3,.95,2.5);
 // Fitting alcove: a real curtained opening, seat and full-length mirror.
 fixture('fitting-area',-3.15,-3.55,2.2,1.45,g=>{box(.09,2.65,1.45,palette.lilac,-1.08,1.48,0,g);box(.09,2.65,1.45,palette.lilac,1.08,1.48,0,g);rod([-1.08,2.8,.72],[1.08,2.8,.72],.035,palette.metal,g);for(const side of [-1,1])for(let i=0;i<5;i++){const x=side*(.72+i*.065);const curtain=mesh(new T.CylinderGeometry(.07,.07,2.3,8,1,true,0,Math.PI),palette.lilac,x,1.59,.7,g);curtain.rotation.y=i%2?Math.PI:0;}box(.75,.14,.5,palette.teal,0,.64,-.35,g,.06);for(const x of [-.27,.27])rod([x,.18,-.35],[x,.58,-.35],.025,palette.metal,g);});
 // Only the partitions and bench are solid; the centre is enterable.
 colliders.pop();colliders.push({x:-4.23,z:-3.55,w:.09,d:1.45},{x:-2.07,z:-3.55,w:.09,d:1.45},{x:-3.15,z:-3.9,w:.75,d:.5});
 mirror(-3.15,1.67,-4.27,.8,2.3);label('FITTING',-3.15,2.99,-2.82,1.8,.32);
 function garment(g,x,z,c,long=false){
  // Neckline, shoulders, sleeves and waist are cut into the mesh outline.
  const shape=new T.Shape();const pts=long?[[-.13,.01],[-.23,-.09],[-.25,-.4],[-.16,-.42],[-.14,-.18],[-.14,-.58],[-.28,-.94],[.28,-.94],[.14,-.58],[.14,-.18],[.16,-.42],[.25,-.4],[.23,-.09],[.13,.01],[.09,-.08],[-.09,-.08]]:[[-.12,0],[-.28,-.08],[-.36,-.29],[-.23,-.35],[-.16,-.22],[-.17,-.65],[.17,-.65],[.16,-.22],[.23,-.35],[.36,-.29],[.28,-.08],[.12,0],[.08,-.1],[-.08,-.1]];pts.forEach(([a,b],i)=>i?shape.lineTo(a,b):shape.moveTo(a,b));shape.closePath();const cloth=mesh(new T.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:true,bevelThickness:.014,bevelSize:.014,bevelSegments:1,steps:1}),c,x,2.12,z,g);cloth.rotation.y=Math.PI/2;
  rod([x,2.18,z-.21],[x,2.31,z],.013,palette.metal,g);rod([x,2.31,z],[x,2.18,z+.21],.013,palette.metal,g);rod([x,2.18,z-.21],[x,2.18,z+.21],.013,palette.metal,g);const hook=mesh(new T.TorusGeometry(.045,.01,5,10,Math.PI*1.5),palette.metal,x,2.35,z,g);hook.rotation.y=Math.PI/2;
 }
 fixture('hanging-clothing-rail',-4.02,.2,.85,3.1,g=>{for(const z of [-1.45,1.45]){rod([0,.17,z],[0,2.42,z],.035,palette.metal,g);rod([-.34,.19,z],[.34,.19,z],.04,palette.ink,g);}rod([0,2.42,-1.45],[0,2.42,1.45],.035,palette.metal,g);for(let i=0;i<6;i++)garment(g,0,-1.12+i*.44,['#798eae','#e6eaf2','#859fab','#a8a2c0','#3e526b','#b7c5d7'][i],i%3===0);});
 function shoe(g,x,y,z,c){oval(x,y+.065,z,.105,.075,.22,c,g);oval(x,y+.012,z+.02,.11,.025,.24,palette.white,g);box(.14,.025,.1,palette.ink,x,y+.13,z-.08,g);for(let i=0;i<3;i++)rod([x-.055,y+.13,z+i*.035],[x+.055,y+.13,z+i*.035],.008,palette.white,g);}
 fixture('shoes-and-accessories',-.75,-3.52,1.15,.55,g=>{for(const x of [-.51,.51])rod([x,.17,-.21],[x,1.15,-.21],.024,palette.metal,g);for(const y of [.35,.72,1.09])box(1.15,.04,.55,palette.white,0,y,0,g);for(const x of [-.32,.02,.34])shoe(g,x,.38,0,x<0?palette.ink:palette.teal);for(const x of [-.29,.28]){box(.32,.25,.19,palette.lilac,x,.88,0,g,.05);const handle=mesh(new T.TorusGeometry(.105,.018,6,12,Math.PI),palette.ink,x,1.04,0,g);}const tray=mesh(new T.CylinderGeometry(.16,.18,.04,16),palette.metal,.1,1.13,0,g);const necklace=mesh(new T.TorusGeometry(.1,.008,5,20),palette.ink,.1,1.16,0,g);necklace.rotation.x=-Math.PI/2;});
 function mannequin(x,z,turn){fixture('mannequin-display',x,z,.75,.7,g=>{mesh(new T.CylinderGeometry(.35,.38,.08,20),palette.ink,0,.2,0,g);const body=new T.Group();g.add(body);body.rotation.y=turn;const form=mesh(new T.LatheGeometry([new T.Vector2(.14,1.02),new T.Vector2(.18,1.17),new T.Vector2(.13,1.36),new T.Vector2(.21,1.61),new T.Vector2(.24,1.72),new T.Vector2(.095,1.82)],16),palette.white,0,0,0,body);oval(0,2.04,0,.12,.17,.115,palette.white,body);rod([0,1.81,0],[0,1.95,0],.055,palette.white,body);for(const s of [-1,1]){rod([s*.11,1.06,0],[s*.12,.31,0],.07,palette.white,body);oval(s*.12,.3,.08,.08,.055,.16,palette.white,body);rod([s*.24,1.69,0],[s*.31,1.28,.02],.055,palette.white,body);rod([s*.31,1.28,.02],[s*.27,1.05,.06],.045,palette.white,body);}body.updateMatrix();for(const m of [...body.children]){m.applyMatrix4(body.matrix);g.add(m);}g.remove(body);});}
 mannequin(-3.65,2.85,.25);mannequin(-2.3,2.85,-.18);
 // Checkout: recessed attendant space, POS terminal, card reader and bag hooks.
 fixture('checkout',2.5,-2.8,2.65,1.1,g=>{for(const x of [-1.18,1.18])box(.14,.95,1,palette.ink,x,.66,0,g);box(2.5,.85,.09,palette.teal,0,.67,.47,g);box(2.7,.11,1.14,palette.white,0,1.2,0,g,.05);for(let x=-1.1;x<=1.15;x+=.13)rod([x,.28,.53],[x,1.04,.53],.012,palette.metal,g);rod([.5,1.25,-.1],[.5,1.52,-.1],.045,palette.ink,g);box(.68,.4,.055,palette.ink,.5,1.64,-.1,g);box(.59,.31,.015,'#8ac7cf',.5,1.64,-.063,g);box(.22,.06,.3,palette.ink,-.55,1.31,.25,g);box(.16,.012,.12,'#91cad2',-.55,1.347,.23,g);box(.4,.06,.3,palette.lilac,-.25,1.28,-.2,g);});
 label('CHECKOUT',2.5,2.75,-4.36,2.1,.34);
 label('DISPLAY PROPS · BROWSE AT CHECKOUT',2.9,2.3,.1,3.1,.28);
 fixture('folded-clothes-table',3.1,1.1,2.2,1.1,g=>{box(2.2,.12,1.1,'#a98158',0,.96,0,g);for(const x of [-.9,.9])box(.1,.75,.9,palette.ink,x,.55,0,g);for(let i=0;i<4;i++)box(.65,.1,.65,i%2?palette.teal:palette.white,i<2?-.55:.55,1.09+(i%2)*.11,0,g);});
 const lightMaterial=new T.MeshBasicMaterial({color:'#f0f5ff'});for(const x of [-3,0,3]){const light=new T.Mesh(new T.CylinderGeometry(.32,.32,.035,20),lightMaterial);light.position.set(x,3.48,-1.4);room.add(light);}const light=new T.PointLight('#eef4ff',15,13,2);light.position.set(0,3.3,-.5);room.add(light);
 const door=addDoor(room);door.traverse(m=>{if(m.isMesh){m.material=m.material.clone();m.material.color.set(palette.ink);}});
 // Door trim is independent of other interiors.
 for(const m of room.children)if(m.isMesh&&m.position.z===4.3){m.material=m.material.clone();m.material.color.set(palette.metal);}
 label('EXIT',0,2.94,4.29,1.15,.3);
 const reflection=createBoutiqueMirrors(mirrors);let staff=null,elapsed=0;
 function people(){if(staff)return;const attendant=makeCharacter({sex:'female',skin:'#885037',hair:'bun',shirt:'#e5ddd0',bottom:'#433c37',accessory:'none'}),browser=makeCharacter({sex:'male',skin:'#885037',hair:'fade',shirt:'#8da8bc',bottom:'#34415c',accessory:'none'});attendant.position.set(2.5,.16,-3.83);attendant.name='boutique-attendant';browser.position.set(-2.95,.16,.2);browser.rotation.y=-Math.PI/2;browser.name='boutique-browser';room.add(attendant,browser);staff={attendant,browser};}
 return {room,door,bounds:ROOM_BOUNDS,item:fixtures.find(g=>g.name==='checkout'),stations:BOUTIQUE_STATIONS,getColliders:()=>[...colliders,{x:2.5,z:-3.83,w:.5,d:.45},{x:-2.95,z:.2,w:.5,d:.55}],get staff(){return staff;},tick(dt,active){if(!active)return;people();elapsed+=dt;animateCharacter(staff.attendant,dt,false);animateCharacter(staff.browser,dt,false);aimHand(staff.browser,'r',new T.Vector3(1196.2,1.75,.2+Math.sin(elapsed)*.08));},renderMirrors:reflection.render,mirrors};
}
