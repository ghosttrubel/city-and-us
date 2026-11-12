import {doorwaySequence} from '../dist/doorway.js';
import {ENTRANCES} from '../dist/neighbourhood.js';
// CPU geometry/rig checks. This does not replace a rendered browser playtest.
import assert from 'node:assert/strict';
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import * as T from '../dist/vendor/three.module.js';
import {loadCharacterAssets,makeCharacter,animateCharacter,disposeCharacter} from '../dist/character.js';
import {GLTFLoader} from '../dist/vendor/addons/GLTFLoader.js';
import {Buffer} from 'node:buffer';
import {buildInterior} from '../dist/interior.js';
import {ACTIVITIES,migrate,validSave,completeActivity} from '../dist/life.js';
import {blocked} from '../dist/neighbourhood.js';
import {createCameraRig} from '../dist/camera.js';
import {animateActivity} from '../dist/activity-pose.js';
const originalSelf=globalThis.self;globalThis.self=globalThis;
const originalFetch=globalThis.fetch,originalDocument=globalThis.document,originalBitmap=globalThis.createImageBitmap,originalProgress=globalThis.ProgressEvent;
globalThis.ProgressEvent=class {constructor(type,init){this.type=type;Object.assign(this,init)}};
const canvasContext=new Proxy({}, {get(target,key){if(key in target)return target[key];return ()=>{}},set(target,key,value){target[key]=value;return true}});
globalThis.document={createElement(){return {width:512,height:512,getContext:()=>canvasContext}}};
globalThis.createImageBitmap=async()=>({width:512,height:512,close(){}});
globalThis.fetch=async(input,init)=>{
 const url=typeof input==='string'?input:input.url||String(input);
 if(url.startsWith('file:')){const bytes=await readFile(fileURLToPath(url));return new Response(bytes,{headers:{'Content-Length':String(bytes.length)}})}
 return originalFetch(input,init);
};
const originalParse=GLTFLoader.prototype.parse;
// Bridge ArrayBuffers across the tool host's VM realms. Browsers and normal
// Node processes do not need this adapter; keep the shipped loader untouched.
GLTFLoader.prototype.parse=function(data,path,onLoad,onError){
 if(typeof data!=='string'&&data?.byteLength){const b=Buffer.from(data);if(b.readUInt32LE(0)===0x46546c67){const length=b.readUInt32LE(12),doc=JSON.parse(b.subarray(20,20+length));const bin=b.subarray(28+length);doc.buffers[0].uri='data:application/octet-stream;base64,'+bin.toString('base64');T.Cache.add(doc.buffers[0].uri,new Uint8Array(bin).buffer);data=JSON.stringify(doc)}}
 return originalParse.call(this,data,path,onLoad,onError);
};

await loadCharacterAssets();
let characters=0,poses=0,hairMeshes=0;
for(const sex of ['female','male'])for(const characterStyle of ['classic','natural'])for(const build of ['slim','average','athletic','broad'])for(const hair of ['bob','fade','bun','braids','locs','afro','bald']){
 const c=makeCharacter({sex,characterStyle,build,hair}),head=c.userData.head,meshes=[];head.traverse(o=>{if(o.isMesh&&o.userData.hair)meshes.push(o)});assert(hair==='bald'||meshes.length>0,hair+' missing');const locals=meshes.map(m=>{m.updateWorldMatrix(true,false);return head.matrixWorld.clone().invert().multiply(m.matrixWorld)});
 const cutaway=createCameraRig();cutaway.register(c);assert.equal(cutaway.entries.length,0,'Animated avatar registered as static occluder');
 for(let i=0;i<24;i++){c.rotation.set(0,i*Math.PI/12,0);animateCharacter(c,.075,i>2);if(i>18)animateActivity(c,['cook','wash','study','sit','sleep'][i-19],.05,.7);c.updateMatrixWorld(true);for(let j=0;j<meshes.length;j++){const m=meshes[j];assert(m.visible);assert.equal(m.material.opacity,1);assert.equal(m.material.side,T.DoubleSide);const relative=head.matrixWorld.clone().invert().multiply(m.matrixWorld);relative.elements.forEach((v,k)=>assert(Math.abs(v-locals[j].elements[k])<1e-6,'Hair detached from animated head'));m.geometry.computeBoundingSphere();const bounds=m.geometry.boundingSphere.clone().applyMatrix4(m.matrixWorld);assert(Number.isFinite(bounds.radius)&&bounds.radius>0);const camera=new T.PerspectiveCamera(40,1,.1,100),focus=head.getWorldPosition(new T.Vector3());camera.position.copy(focus).add(new T.Vector3(Math.sin(i)*2,.4,Math.cos(i)*2));camera.lookAt(focus);camera.updateMatrixWorld();const frustum=new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));assert(frustum.intersectsObject(m),'Visible head hair wrongly outside frustum');}poses++;}
 hairMeshes+=meshes.length;characters++;disposeCharacter(c);
}
const doors=[];
for(const e of Object.values(ENTRANCES))for(const entering of [true,false]){const from=entering?{x:e.outside.x+.4,z:e.outside.z+.1}:{x:.3,z:3.4},seq=doorwaySequence(e,from,entering);let prev=seq.sample(0),switches=0;const frames=[];
 for(let t=.01;t<seq.duration+.011;t+=.01){const f=seq.sample(t);if(f.switched!==prev.switched){switches++;assert.equal(f.cover,1,'Scene change exposed');assert(f.moving);assert(Math.abs(f.doorAngle)>1.5);assert.equal(f.heading,entering?Math.PI:0);}else assert(Math.hypot(f.x-prev.x,f.z-prev.z)<.08,'Doorway position jumps outside covered switch');if(f.phase==='cross')assert(f.moving);frames.push({t,...f});prev=f;}
 assert.equal(switches,1);const end=seq.sample(seq.duration);assert(end.done);assert(Math.abs(end.doorAngle)<1e-10);assert.equal(end.cover,0);assert(Math.abs(end.x-(entering?0:e.outside.x))<1e-6);assert(Math.abs(end.z-(entering?3.35:e.outside.z))<1e-6);doors.push({id:e.id,entering,duration:seq.duration,frames});
}
await mkdir(new URL('../qa/corrections/',import.meta.url),{recursive:true});await writeFile(new URL('../qa/corrections/door-traces.json',import.meta.url),JSON.stringify(doors,null,2));
const report={date:'2026-10-24',characters,poses,hairMeshes,doorSequences:doors.length,status:'passed',scope:'CPU skeleton, materials, frustum, cutaway exclusion and threshold motion. Does not establish live WebGL appearance.'};await writeFile(new URL('../qa/corrections/regression.json',import.meta.url),JSON.stringify(report,null,2));console.log(report);
