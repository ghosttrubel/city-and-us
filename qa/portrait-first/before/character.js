import {createBehaviour} from './character-behaviour.js';
import {previewMakeupTexture,makeupValues} from './makeup-preview.js';
import {resolvedFashion} from './fashion-catalogue.js';
import {addCatalogueHair,addFashionClothes} from './fashion-meshes.js';
import * as T from './vendor/three.module.js';
import {mergeGeometries} from './vendor/addons/BufferGeometryUtils.js';
import {tailorBody} from './garments.js';
import {GLTFLoader} from './vendor/addons/GLTFLoader.js';
import {clone as cloneSkeleton} from './vendor/addons/SkeletonUtils.js';

export const appearanceDefaults={characterStyle:'classic',sex:'female',build:'average',face:'soft',skin:'#885037',shirt:'#e58b55',hair:'braids',hairColor:'#241b19',outfit:'jacket',bottom:'#324c64',shoes:'#efe8da',accessory:'earrings'};
const templates=new Map(),bindRotations=new Map(),garmentCache=new Map();
let animationSource,loadPromise,fabric;
export function loadCharacterAssets({force=false}={}){
 if(force){templates.clear();bindRotations.clear();loadPromise=null;fabric=null}
 if(loadPromise)return loadPromise;
 T.Cache.enabled=true;
 const loader=new GLTFLoader(),path=new URL('./assets/characters/',import.meta.url).href;
 loadPromise=Promise.all([
  ...['Superhero_Female_FullBody','Superhero_Male_FullBody','Hair_BuzzedFemale','Hair_Buzzed','Hair_Buns','Hair_Long'].map(async name=>{const gltf=await loader.loadAsync(path+name+'.glb');templates.set(name,gltf.scene)}),
  loader.loadAsync(path+'locomotion.glb').then(gltf=>animationSource=gltf.animations),
  fetch(path+'animation-bind.json').then(r=>{if(!r.ok)throw Error('Animation bind data missing');return r.json()}).then(nodes=>nodes.forEach(n=>bindRotations.set(n.name,new T.Quaternion(...n.rotation))))
 ]).then(()=>true);
 return loadPromise;
}
function fabricMap(){
 if(fabric)return fabric;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const c=canvas.getContext('2d');
 c.fillStyle='#e7e5e0';c.fillRect(0,0,128,128);
 for(let i=0;i<128;i+=2){c.strokeStyle=i%4?'#dedbd5':'#f4f1eb';c.beginPath();c.moveTo(i,0);c.lineTo(i,128);c.stroke();c.strokeStyle='#dad8d233';c.beginPath();c.moveTo(0,i);c.lineTo(128,i);c.stroke()}
 fabric=new T.CanvasTexture(canvas);fabric.wrapS=fabric.wrapT=T.RepeatWrapping;fabric.repeat.set(7,7);fabric.colorSpace=T.SRGBColorSpace;return fabric;
}
function retargetClips(rig){
 return animationSource.map(source=>{
  const tracks=[];
  for(const track of source.tracks){
   const name=track.name.slice(0,track.name.lastIndexOf('.')),bone=rig.getObjectByName(name),rest=bindRotations.get(name);
   if(!bone||!rest||!track.name.endsWith('.quaternion'))continue;
   const adjustment=bone.quaternion.clone().multiply(rest.clone().invert()),values=track.values.slice(),q=new T.Quaternion();
   for(let i=0;i<values.length;i+=4){q.fromArray(values,i).premultiply(adjustment).normalize().toArray(values,i)}
   tracks.push(new T.QuaternionKeyframeTrack(track.name,track.times.slice(),values));
  }
  return new T.AnimationClip(source.name,source.duration,tracks);
 });
}
export function makeCharacter(input={}){
 if(!templates.size)throw Error('Load the sculpted character assets before creating a character.');
 const a=resolvedFashion({...appearanceDefaults,...input}),female=a.sex==='female',natural=a.characterStyle==='natural',g=new T.Group(),owned=new Set();
 const rig=cloneSkeleton(templates.get('Superhero_'+(female?'Female':'Male')+'_FullBody'));g.add(rig);
 const own=resource=>(owned.add(resource),resource);
 const material=(color,extra={})=>own(new T.MeshStandardMaterial({color,roughness:.83,...extra}));
 const cloth=material(a.shirt,{map:fabricMap()}),pants=material(a.bottom,{map:fabricMap()}),shoe=material(a.shoes),sole=material('#d9d3c7'),hairMat=material(a.hairColor,{roughness:.86,side:T.DoubleSide}),gold=material('#d6ae57',{metalness:.74,roughness:.3});
 const bodyName=female?'Superhero_Female':'SuperHero_Male',body=rig.getObjectByName(bodyName);
 if(!body?.isSkinnedMesh)throw Error('Character skin missing: '+bodyName);
 rig.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o!==body){o.material=own(o.material.clone());if(/Eyebrows/.test(o.name)){o.material=natural?material(new T.Color(a.hairColor).lerp(new T.Color(a.skin),.25)):hairMat;if(natural){o.geometry=own(o.geometry.clone());const p=o.geometry.attributes.position;let low=Infinity,high=-Infinity;for(let i=0;i<p.count;i++){low=Math.min(low,p.getY(i));high=Math.max(high,p.getY(i))}const mid=(low+high)/2;for(let i=0;i<p.count;i++)p.setY(i,mid+(p.getY(i)-mid)*.62);o.geometry.computeVertexNormals();}}else{o.material.color.set('#ffffff');o.material.roughness=.35;}}}});
 const skin=own(body.material.clone());skin.color.set(a.skin);skin.roughness=natural?.88:.7;skin.side=T.FrontSide;skin.normalScale.setScalar(natural?.16:.55);
 if(a.makeup){const map=previewMakeupTexture(skin.map,a.skin,a.sex,a.makeup);if(map){skin.map=own(map);skin.color.set('#ffffff');}const cosmetics=makeupValues(a.makeup);rig.traverse(o=>{if(o.isMesh&&/Eyebrows/.test(o.name)&&cosmetics.brows)o.material.color.lerp(new T.Color(a.hairColor),cosmetics.brows);});}
 const referenceGeometry=body.geometry,cacheKey=[a.sex,a.face,a.outfit,a.characterStyle,a.topModel,a.bottomModel,a.skirtModel].join('|');
 let tailored=garmentCache.get(cacheKey);if(!tailored){tailored={...tailorBody(referenceGeometry,{female,outfit:a.outfit,face:a.face,natural,topModel:a.topModel,bottomModel:a.bottomModel,skirtModel:a.skirtModel}),refs:0};garmentCache.set(cacheKey,tailored)}tailored.refs++;
 body.geometry=tailored.geometry;body.material=[skin,cloth,pants,shoe,sole];
 const height=female?1.76664:1.81008,neck=tailored.neck,waist=tailored.waist;
 function frontAt(y,x=0){const p=referenceGeometry.attributes.position;let min=Infinity;for(let i=0;i<p.count;i++)min=Math.min(min,(p.getX(i)-x)**2*2+(p.getY(i)-y)**2);let z=-Infinity;for(let i=0;i<p.count;i++)if((p.getX(i)-x)**2*2+(p.getY(i)-y)**2<min+.0004)z=Math.max(z,p.getZ(i));return z+.021}
 // Attach rigid details in the authored reference pose, then let the rig animate.
 rig.updateMatrixWorld(true);
 function attach(boneName,object){rig.add(object);rig.updateMatrixWorld(true);rig.getObjectByName(boneName).attach(object);return object}
 function mesh(geo,mat,x=0,y=0,z=0){const o=new T.Mesh(own(geo),mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;return o}
 function tube(points,r,mat,segments=20){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),segments,r,6,false),mat)}
 const headY=female?1.65:1.696,top=height,neckY=neck+.016;
 // Authored buzz cut/bun meshes plus shaped braids, locs and afro options.
 if(['fade','bun','bob','wig'].includes(a.hair)){
  const name=['bob','wig'].includes(a.hair)?'Hair_Long':a.hair==='bun'?'Hair_Buns':female?'Hair_BuzzedFemale':'Hair_Buzzed';
  // The authored hair is a thin two-sided shell, not a closed solid.
  // Keep its inner faces when the animated head turns away from the camera.
  const h=templates.get(name).clone(true);h.name='hairstyle-'+a.hair;h.traverse(o=>{if(o.isMesh){o.material=hairMat;o.castShadow=true;o.geometry.computeBoundingSphere();}});
  if(a.hair==='bob')h.scale.set(1,.78,1);if(a.hair==='wig')h.scale.set(1.08,1.17,1.04);const bounds=new T.Box3().setFromObject(h);h.position.y+=(top+.012)-bounds.max.y;attach('Head',h);
 }else if(addCatalogueHair({a,top,attach,mesh,tube,hairMat})){}else if(a.hair!=='bald'){
  const cap=mesh(new T.SphereGeometry(1,20,14,0,Math.PI*2,0,Math.PI*.56),hairMat,0,top-.065,-.025);cap.scale.set(.095,.087,.094);attach('Head',cap);
  if(a.hair==='afro'){
   const geo=new T.IcosahedronGeometry(.028,1);
   for(let i=0;i<70;i++){const t=i*2.399963,yy=(i+.5)/70,rr=Math.sqrt(1-yy*yy),p=mesh(geo.clone(),hairMat,Math.cos(t)*rr*.12,top-.065+yy*.15,Math.sin(t)*rr*.11-.025);p.scale.set(1,1.15,1);attach('Head',p)}
  }else{
   const count=a.hair==='braids'?22:18,len=a.hair==='braids'?.38:.2;
   for(let i=0;i<count;i++){const t=i/count*Math.PI*2,x=Math.cos(t)*.083,z=Math.sin(t)*.065-.03,side=Math.sign(x)||1;
    const points=[[x*.65,top-.003,z*.65],[x,top-.045,z],[side*(Math.abs(x)+.035),top-.12,z-.015],[side*(.09+Math.abs(x)*.3),top-len,-.04+Math.sin(t)*.06]];
    const braid=tube(points,a.hair==='braids'?.008:.012,hairMat,14);attach('Head',braid);
    if(a.hair==='braids'&&i%3===0){const end=points.at(-1),cuff=mesh(new T.CylinderGeometry(.01,.01,.018,8),gold,...end);attach('Head',cuff)}
   }
  }
 }
 if(!a.skirtModel&&(a.outfit==='dress'||a.outfit==='native')){
  const dress=a.outfit==='dress',profile=dress?[[.34,.58],[.32,.73],[.24,.97],[.18,1.12]]:[[.25,.87],[.255,1.02],[.205,1.22]];
  const geo=own(new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),32));geo.scale(1,1,.73);
  const p=geo.getAttribute('position'),skinIndices=new Uint16Array(p.count*4),weights=new Float32Array(p.count*4),hipIndex=body.skeleton.bones.findIndex(b=>b.name==='pelvis');
  for(let i=0;i<p.count;i++){skinIndices[i*4]=hipIndex;weights[i*4]=1}
  geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(skinIndices,4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
  const skirt=new T.SkinnedMesh(geo,cloth);skirt.bind(body.skeleton,body.bindMatrix);skirt.castShadow=true;skirt.receiveShadow=true;rig.add(skirt);
 }
 // Collar, jacket zipper, seams, shoe panels, laces, hoops and chain are local
 // geometry and never depend on an avatar service or client credentials.
 const trim=material('#eadcc2',{roughness:.7});
 function piping(points,bone,mat,r=.004){if(points.length<4)return;const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),true);attach(bone,mesh(new T.TubeGeometry(curve,Math.max(32,points.length),r,6,true),mat))}
 piping(tailored.collar.filter(p=>Math.abs(p[0])<.14),'spine_03',trim);piping(tailored.hem,'pelvis',a.outfit==='jacket'?trim:cloth,.003);
 piping(tailored.left,a.outfit==='jacket'?'lowerarm_l':'upperarm_l',trim,.003);piping(tailored.right,a.outfit==='jacket'?'lowerarm_r':'upperarm_r',trim,.003);
 if(a.outfit==='jacket'){
  const zipper=[];for(let y=waist+.015;y<=neck-.008;y+=.025)zipper.push([0,y,frontAt(y)+.003]);attach('spine_03',tube(zipper,.0028,trim,36));
  for(const side of [-1,1]){const pocket=[];for(let i=0;i<=5;i++){const x=side*(.075+i*.014),y=waist+.14-i*.007;pocket.push([x,y,frontAt(y,x)+.003])}attach('spine_03',tube(pocket,.0028,trim,10))}
  attach('spine_03',mesh(new T.BoxGeometry(.009,.024,.005),gold,0,neck-.08,frontAt(neck-.08)+.005));
 }else if(a.outfit==='native'){
  for(let y=1.12;y<neck-.03;y+=.07)attach('spine_03',mesh(new T.SphereGeometry(.0045,8,6),gold,0,y,frontAt(y)));
 }
 for(const side of [-1,1]){
  const foot=side<0?'foot_r':'foot_l',x=side*(female?.124:.125);
  const tongue=mesh(new T.SphereGeometry(1,12,8),shoe,x,.067,0);tongue.scale.set(.061,a.shoeModel==='loafers'?.037:.065,.14);attach(foot,tongue);
  const outsole=mesh(new T.SphereGeometry(1,14,8),sole,x,.012,0);outsole.scale.set(.063,.025,.145);attach(foot,outsole);
  if(!a.shoeModel||a.shoeModel==='trainers')for(let i=0;i<4;i++)attach(foot,tube([[x-.026,.129-i*.004,-.025+i*.018],[x+.026,.129-i*.004,-.025+i*.018]],.0022,trim,4));
 }
 if(a.accessory==='earrings')for(const side of [-1,1]){const hoop=mesh(new T.TorusGeometry(.034,.004,8,22),gold,side*.088,headY-.078,-.007);hoop.rotation.y=side*.3;attach('Head',hoop)}
 if(a.accessory==='glasses'){
  const dark=material('#242321',{metalness:.3,roughness:.4});
  for(const side of [-1,1]){const frame=mesh(new T.TorusGeometry(.035,.0035,6,24),dark,side*.039,headY+.005,.087);frame.scale.y=.72;attach('Head',frame);attach('Head',tube([[side*.075,headY+.005,.085],[side*.089,headY+.005,-.01]],.003,dark,4))}
  attach('Head',tube([[-.007,headY+.005,.088],[.007,headY+.005,.088]],.003,dark,4));
 }
 if(a.accessory==='chain')attach('spine_03',tube([[-.055,neckY,frontAt(neckY,-.055)],[-.066,neckY-.095,frontAt(neckY-.095,-.066)+.008],[0,neckY-.15,frontAt(neckY-.15)+.008],[.066,neckY-.095,frontAt(neckY-.095,.066)+.008],[.055,neckY,frontAt(neckY,.055)]],.004,gold));
 addFashionClothes({a,body,rig,referenceGeometry,own,material,cloth,pants,shoe,sole,gold,attach,mesh,tube,top,headY,frontAt});
 // Merge rigid details per bone/material; an afro or braid style costs one
 // hair draw call rather than one draw call for each curl or braid.
 for(const bone of body.skeleton.bones){
  const groups=new Map();
  for(const child of [...bone.children]){
   if(!child.isMesh||child.isSkinnedMesh)continue;
   child.updateMatrix();const geo=child.geometry.index?child.geometry.toNonIndexed():child.geometry.clone();geo.applyMatrix4(child.matrix);
   const key=child.material.uuid;if(!groups.has(key))groups.set(key,{mat:child.material,geos:[],objects:[]});groups.get(key).geos.push(geo);groups.get(key).objects.push(child);
  }
  for(const group of groups.values()){
   if(group.objects.length<2){group.geos.forEach(geo=>geo.dispose());continue}
   const merged=own(mergeGeometries(group.geos)),object=new T.Mesh(merged,group.mat);object.castShadow=true;object.receiveShadow=true;
   group.objects.forEach(o=>bone.remove(o));group.geos.forEach(geo=>geo.dispose());bone.add(object);
  }
 }
 const soleGroup=body.geometry.groups.find(group=>group.materialIndex===4),soleSamples=Array.from({length:32},(_,i)=>soleGroup.start+Math.floor(i/31*(soleGroup.count-1))),groundPoint=new T.Vector3(),groundOrigin=new T.Vector3();
 const clips=retargetClips(rig),mixer=new T.AnimationMixer(rig),idle=mixer.clipAction(clips.find(c=>c.name==='Idle_Loop')),walk=mixer.clipAction(clips.find(c=>c.name==='Walk_Loop'));
 idle.play();idle.setEffectiveTimeScale(natural?.82:1);walk.setEffectiveTimeScale(natural?1.12:1.25);let walking=false;
 // Tag the entire avatar before any environment/cutaway registration.
 g.traverse(o=>{o.userData.noCameraFade=true;if(o.isMesh&&o.material===hairMat)o.userData.hair=true;if(o.isMesh&&o.material?.userData?.headwear)o.userData.headwear=true});
 const scale=2.32/height,bulk={slim:.89,average:1,athletic:1.08,broad:1.22}[a.build]||1;
 g.scale.set(scale*bulk,scale,scale*(a.build==='broad'?1.1:1));rig.position.y=.012;
 g.userData={appearance:a,head:rig.getObjectByName('Head'),legs:[],arms:[],rig,mixer,owned,releaseGeometry(){tailored.refs--;if(tailored.refs===0){tailored.geometry.dispose();garmentCache.delete(cacheKey)}},
  update(dt,moving){if(moving!==walking){walking=moving;const next=moving?walk:idle,old=moving?idle:walk;next.reset().play();old.crossFadeTo(next,.2,false)}mixer.update(dt);rig.position.y=0;g.updateMatrixWorld(true);body.skeleton.update();let lowest=Infinity;for(const i of soleSamples){groundPoint.fromBufferAttribute(body.geometry.attributes.position,i);body.applyBoneTransform(i,groundPoint);groundPoint.applyMatrix4(body.matrixWorld);lowest=Math.min(lowest,groundPoint.y)}g.getWorldPosition(groundOrigin);rig.position.y=(groundOrigin.y+.012-lowest)/g.scale.y;g.updateMatrixWorld(true)},
 };
 g.userData.behaviour=createBehaviour(g,body,rig.getObjectByName('Eyes'),headY,own);mixer.update(0);g.updateMatrixWorld(true);return g;
}
export function animateCharacter(g,dt,moving=false){g.userData.update?.(dt,moving);g.userData.behaviour?.tick(dt,moving)}
export function disposeCharacter(g){g.userData.releaseGeometry?.();g.userData.mixer?.stopAllAction();g.userData.mixer?.uncacheRoot(g.userData.rig);for(const resource of g.userData.owned||[])resource.dispose()}
