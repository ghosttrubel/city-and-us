// Offline visual QA from the same meshes as the game. NOT a browser screenshot.
// Optional tool dependency: @napi-rs/canvas. The playable game needs no packages.
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {Buffer} from 'node:buffer';
import sharp from 'sharp';
import {createCanvas as nativeCanvas} from '@napi-rs/canvas';
async function loadImage(buffer){const {data,info}=await sharp(buffer).ensureAlpha().raw().toBuffer({resolveWithObject:true});return {width:info.width,height:info.height,pixels:new Uint8Array(data.buffer,data.byteOffset,data.byteLength),close(){}}}
function createCanvas(width,height){const canvas={width,height};const context=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),getImageData:()=>({data:new Uint8ClampedArray(canvas.width*canvas.height*4).fill(255)})},{get:(t,k)=>k in t?t[k]:()=>{},set:(t,k,v)=>(t[k]=v,true)});canvas.getContext=()=>context;return canvas;}
import * as T from '../checkpoints/2026-10-24-before-corrections/dist/vendor/three.module.js';
import {GLTFLoader} from '../checkpoints/2026-10-24-before-corrections/dist/vendor/addons/GLTFLoader.js';
import {loadCharacterAssets,makeCharacter,animateCharacter} from '../checkpoints/2026-10-24-before-corrections/dist/character.js';
import {buildInterior} from '../checkpoints/2026-10-24-before-corrections/dist/interior.js';
import {animateActivity} from '../checkpoints/2026-10-24-before-corrections/dist/activity-pose.js';
const originals={document:globalThis.document,fetch:globalThis.fetch,self:globalThis.self,bitmap:globalThis.createImageBitmap,progress:globalThis.ProgressEvent,parse:GLTFLoader.prototype.parse};
globalThis.self=globalThis;
globalThis.document={createElement:()=>nativeCanvas(512,512)};
globalThis.ProgressEvent=class{constructor(type,init){this.type=type;Object.assign(this,init)}};
globalThis.createImageBitmap=async blob=>loadImage(Buffer.from(await blob.arrayBuffer()));
globalThis.fetch=async(input,init)=>{const url=typeof input==='string'?input:input.url||String(input);if(url.startsWith('file:'))return new Response(await readFile(fileURLToPath(url)));return originals.fetch(input,init)};
GLTFLoader.prototype.parse=function(data,path,onLoad,onError){
 if(typeof data!=='string'&&data?.byteLength){const b=Buffer.from(data);if(b.readUInt32LE(0)===0x46546c67){const len=b.readUInt32LE(12),doc=JSON.parse(b.subarray(20,20+len)),bin=b.subarray(28+len);doc.buffers[0].uri='data:application/octet-stream;base64,'+bin.toString('base64');T.Cache.add(doc.buffers[0].uri,new Uint8Array(bin).buffer);data=JSON.stringify(doc)}}
 return originals.parse.call(this,data,path,onLoad,onError);
};
const output=new URL('../qa/corrections/before/',import.meta.url);await mkdir(output,{recursive:true});
const assetDir=new URL('../checkpoints/2026-10-24-before-corrections/dist/assets/characters/',import.meta.url);T.Cache.enabled=true;
for(const name of await readdir(assetDir)){const url=new URL(name,assetDir).href;if(name.endsWith('.glb'))T.Cache.add(url,new Uint8Array(await readFile(new URL(url))).buffer);if(name.endsWith('.webp'))T.Cache.add(url,await loadImage(await readFile(new URL(url))))}
await loadCharacterAssets({force:true});
async function record(result){await writeFile(new URL(result.name+'.json',output),JSON.stringify(result))}
const textureCache=new Map(),linear=Array.from({length:256},(_,i)=>Math.pow(i/255,2.2));
function sampleTexture(texture){
 if(textureCache.has(texture.uuid))return textureCache.get(texture.uuid);
 const image=texture.image;if(!image?.width)return null;if(texture.isDataTexture&&image.data){const out={pixels:image.data,w:image.width,h:image.height,flip:texture.flipY,rx:texture.repeat.x,ry:texture.repeat.y};textureCache.set(texture.uuid,out);return out;}if(image.getContext){const raw=image.getContext('2d').getImageData(0,0,image.width,image.height).data;const out={pixels:new Uint8Array(raw.buffer,raw.byteOffset,raw.byteLength),w:image.width,h:image.height,flip:texture.flipY,rx:texture.repeat.x,ry:texture.repeat.y};textureCache.set(texture.uuid,out);return out;}if(image.pixels){const out={pixels:image.pixels,w:image.width,h:image.height,flip:texture.flipY,rx:texture.repeat.x,ry:texture.repeat.y};textureCache.set(texture.uuid,out);return out;}
 const canvas=createCanvas(image.width,image.height),ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
 const data={pixels:ctx.getImageData(0,0,canvas.width,canvas.height).data,w:canvas.width,h:canvas.height,flip:texture.flipY,rx:texture.repeat.x,ry:texture.repeat.y};
 textureCache.set(texture.uuid,data);return data;
}
function display(c){const x=Math.max(0,c*1.08),mapped=Math.min(1,(x*(2.51*x+.03))/(x*(2.43*x+.59)+.14));return Math.round(255*Math.pow(mapped,1/2.2))}
export async function renderOffline(scene,camera,width,height,name){
 const canvas=createCanvas(width,height),ctx=canvas.getContext('2d'),frame=ctx.createImageData(width,height),pixels=frame.data,depth=new Float32Array(width*height);depth.fill(Infinity);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4,t=y/height;pixels[i]=141+Math.round(t*52);pixels[i+1]=169+Math.round(t*27);pixels[i+2]=160+Math.round(t*18);pixels[i+3]=255}
 scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);camera.updateProjectionMatrix();
 const projection=new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse),light=new T.Vector3(-.45,.75,.55).normalize();
 let triangles=0;
 scene.traverse(mesh=>{
  if(!mesh.isMesh)return;for(let parent=mesh;parent;parent=parent.parent)if(!parent.visible)return;if((Array.isArray(mesh.material)?mesh.material[0]:mesh.material).opacity<.15)return;
  const geo=mesh.geometry,p=geo.attributes.position,n=geo.attributes.normal,uv=geo.attributes.uv,vc=geo.attributes.color,index=geo.index,vertices=[],normalMatrix=new T.Matrix3().getNormalMatrix(mesh.matrixWorld);
  if(mesh.isSkinnedMesh)mesh.skeleton.update();
  for(let i=0;i<p.count;i++){
   const v=new T.Vector3().fromBufferAttribute(p,i),normal=n?new T.Vector3().fromBufferAttribute(n,i):new T.Vector3(0,1,0);
   if(mesh.isSkinnedMesh){const tip=v.clone().addScaledVector(normal,.001);mesh.applyBoneTransform(i,v);mesh.applyBoneTransform(i,tip);normal.copy(tip).sub(v).normalize()}
   v.applyMatrix4(mesh.matrixWorld);normal.applyMatrix3(normalMatrix).normalize();
   const e=projection.elements,w=e[3]*v.x+e[7]*v.y+e[11]*v.z+e[15],clip=v.clone().applyMatrix4(projection);
   vertices.push({cr:vc?vc.getX(i):1,cg:vc?vc.getY(i):1,cb:vc?vc.getZ(i):1,x:(clip.x*.5+.5)*width,y:(-.5*clip.y+.5)*height,z:clip.z,w,u:uv?uv.getX(i):0,v:uv?uv.getY(i):0,light:.72+Math.max(0,normal.y)*.4+Math.max(0,normal.dot(light))*1.9});
  }
  const groups=Array.isArray(mesh.material)?geo.groups:[{start:0,count:index?.count||p.count,materialIndex:0}];
  for(const group of groups){
   const material=Array.isArray(mesh.material)?mesh.material[group.materialIndex]:mesh.material,texture=material.map?sampleTexture(material.map):null,color=material.color||new T.Color('#fff');
   for(let i=group.start;i<group.start+group.count;i+=3){
    const a=vertices[index?index.getX(i):i],b=vertices[index?index.getX(i+1):i+1],c=vertices[index?index.getX(i+2):i+2];
    if(!a||!b||!c||a.w<=.1||b.w<=.1||c.w<=.1)continue;
    const area=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);if(Math.abs(area)<.02||material.side===T.FrontSide&&area>0||material.side===T.BackSide&&area<0)continue;
    const xmin=Math.max(0,Math.floor(Math.min(a.x,b.x,c.x))),xmax=Math.min(width-1,Math.ceil(Math.max(a.x,b.x,c.x))),ymin=Math.max(0,Math.floor(Math.min(a.y,b.y,c.y))),ymax=Math.min(height-1,Math.ceil(Math.max(a.y,b.y,c.y)));
    if(xmin>xmax||ymin>ymax)continue;triangles++;
    for(let y=ymin;y<=ymax;y++)for(let x=xmin;x<=xmax;x++){
     const wa=((b.x-x)*(c.y-y)-(b.y-y)*(c.x-x))/area,wb=((c.x-x)*(a.y-y)-(c.y-y)*(a.x-x))/area,wc=1-wa-wb;if(wa<0||wb<0||wc<0)continue;
     const z=wa*a.z+wb*b.z+wc*c.z,at=y*width+x;if(z>=depth[at])continue;depth[at]=z;
     const inv=wa/a.w+wb/b.w+wc/c.w,u=(wa*a.u/a.w+wb*b.u/b.w+wc*c.u/c.w)/inv,v=(wa*a.v/a.w+wb*b.v/b.w+wc*c.v/c.w)/inv;
     const shade=wa*a.light+wb*b.light+wc*c.light;let r=color.r,g=color.g,bv=color.b;if(material.vertexColors){r*=(wa*a.cr/a.w+wb*b.cr/b.w+wc*c.cr/c.w)/inv;g*=(wa*a.cg/a.w+wb*b.cg/b.w+wc*c.cg/c.w)/inv;bv*=(wa*a.cb/a.w+wb*b.cb/b.w+wc*c.cb/c.w)/inv;}
     if(texture){let tu=u*texture.rx%1,tv=v*texture.ry%1;if(tu<0)tu++;if(tv<0)tv++;if(texture.flip)tv=1-tv;const tx=Math.min(texture.w-1,Math.floor(tu*texture.w)),ty=Math.min(texture.h-1,Math.floor(tv*texture.h)),j=(ty*texture.w+tx)*4;r*=linear[texture.pixels[j]];g*=linear[texture.pixels[j+1]];bv*=linear[texture.pixels[j+2]]}
     const j=at*4;pixels[j]=display(r*shade);pixels[j+1]=display(g*shade);pixels[j+2]=display(bv*shade);
    }
   }
  }
 });
 ctx.putImageData(frame,0,0);ctx.fillStyle='#173e34cc';ctx.fillRect(0,height-34,width,34);ctx.fillStyle='#fff4d5';ctx.font='13px sans-serif';ctx.fillText('OFFLINE MESH PREVIEW · browser lighting and shadows require verification',14,height-12);
 await writeFile(new URL(name,output),await sharp(Buffer.from(pixels),{raw:{width,height,channels:4}}).composite([{input:Buffer.from('<svg width="'+width+'" height="28"><rect width="100%" height="100%" fill="#173e34"/><text x="8" y="18" font-size="10" fill="white">BEFORE · SOFTWARE PREVIEW</text></svg>'),top:height-28,left:0}]).png().toBuffer());return {name,triangles};
}

import {createCameraRig} from '../checkpoints/2026-10-24-before-corrections/dist/camera.js';
import {apartmentCamera} from '../dist/interior-camera.js';

import {buildStreet,streetGroundHeight} from '../checkpoints/2026-10-24-before-corrections/dist/street.js';
import {doorwaySequence} from '../dist/doorway.js';
import {ENTRANCES} from '../checkpoints/2026-10-24-before-corrections/dist/neighbourhood.js';
const street=buildStreet(),home=buildInterior('studio',true,'warm'),scene=new T.Scene(),character=makeCharacter({characterStyle:'natural',hair:'bob',outfit:'streetwear',shirt:'#ede1cb',bottom:'#52665e'}),camera=new T.PerspectiveCamera(40,4/3,.1,200);
scene.add(street.city,home.room);const cutaway=createCameraRig();cutaway.register(street.city);cutaway.register(home.room);const e=ENTRANCES.home;
for(const entering of [true,false]){
 const from=entering?{x:e.outside.x+.25,z:e.outside.z+.6}:{x:.3,z:3.35},sequence=doorwaySequence(e,from,entering),a=sequence.approachTime;
 const times=false?[0,a*.7,a+.15,a+.55,sequence.switchTime-.01,sequence.switchTime+.01,sequence.switchTime+.28,sequence.duration]:[0,.18,.35,.45,.495,.505,.75,1];
 for(let i=0;i<times.length;i++){
  const time=times[i];let frame;
  if(false)frame=sequence.sample(time);else{const p=time,switched=p>=.5,x=switched?(entering?0:e.x):from.x+((entering?e.x:0)-from.x)*p*2,z=switched?(entering?4.05+(3.3-4.05)*(p-.5)*2:e.z+.1+(e.outside.z-e.z-.1)*(p-.5)*2):from.z+((entering?e.z+.05:3.55)-from.z)*p*2;frame={x,z,switched,moving:true,heading:entering?Math.PI:0,doorAngle:-Math.sin(p*Math.PI)*Math.PI/2,cover:0};}
  const indoors=entering?frame.switched:!frame.switched;street.city.visible=!indoors;home.room.visible=indoors;character.removeFromParent();(indoors?home.room:street.city).add(character);character.position.set(frame.x,indoors?.16:streetGroundHeight(frame.x,frame.z),frame.z);character.rotation.set(0,frame.heading,0);animateCharacter(character,.12,frame.moving);street.doors.home.rotation.y=home.door.rotation.y=frame.doorAngle;
  const origin=indoors?150:0,subject=character.position.clone().add(new T.Vector3(origin,1.15,0));let target=subject,desired;
  if(indoors&&false){const shot=apartmentCamera(camera,subject,{origin,angle:.2});target=shot.target;desired=shot.desired;}else desired=subject.clone().add(new T.Vector3(Math.sin(.2)*15,15*(indoors?.85:.58),Math.cos(.2)*15));
  cutaway.reset();cutaway.update(camera,target,desired,1,{overview:false&&indoors,subject});const name='door-'+(entering?'entry':'exit')+'-'+i+'.png';await renderOffline(scene,camera,320,240,name);
  if(frame.cover){const path=new URL(name,output);await writeFile(path,await sharp(await readFile(path)).composite([{input:Buffer.from('<svg width="320" height="212"><rect width="320" height="212" fill="#282119" opacity="'+frame.cover+'"/></svg>'),top:0,left:0}]).png().toBuffer());}
 }
}
