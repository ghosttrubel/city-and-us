import {apartmentCamera} from '../dist/interior-camera.js';
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
const findings=[];
const initial={name:'Review',sex:'female',skin:'#885037',shirt:'#ede1cb',money:12345,food:80,energy:80,mood:70,time:480,day:1,x:0,z:6,rentDay:1,skills:{trader:2,rider:1,chef:3}};
const old=migrate(initial,initial,'LS-0123456789ABCDEF');assert.equal(old.characterStyle,'classic');assert.equal(old.money,12345);
const revised=migrate({...old,characterStyle:'natural',hair:'bob',homeStyle:'clay',furniture:true},initial,old.localPlayerId);assert(validSave({version:1,data:revised}));assert.deepEqual(migrate(JSON.parse(JSON.stringify(revised)),initial,old.localPlayerId),revised);
for(const invalid of [{homeStyle:'__proto__'},{homeStyle:4},{characterStyle:'unknown'},{hair:'fake'}])assert(!validSave({version:1,data:{...revised,...invalid}}));
const money=revised.money;assert(completeActivity(revised,'sit'));assert(completeActivity(revised,'computer'));assert.equal(revised.money,money);
findings.push('Legacy look/money retained; natural style, bob and finishes round-trip; malformed styles rejected; sitting/computer apply bounded effects');
let triangles=0;
for(const furnished of [false,true]){
 const home=buildInterior('studio',furnished,'warm');home.room.visible=true;
 const colliders=home.getColliders(),step=.2,queue=[[0,3.4]],visited=new Set(['0,17']);
 for(let i=0;i<queue.length;i++)for(const [dx,dz] of [[step,0],[-step,0],[0,step],[0,-step]]){
  const x=Math.round((queue[i][0]+dx)/step)*step,z=Math.round((queue[i][1]+dz)/step)*step,key=Math.round(x/step)+','+Math.round(z/step);
  if(visited.has(key)||blocked(x,z,colliders,home.bounds))continue;visited.add(key);queue.push([x,z]);
 }
 for(const [id,a] of Object.entries(ACTIVITIES)){if(id==='sit'&&!furnished)continue;assert(!blocked(...a.stand,colliders,home.bounds),id+' standing point blocked');assert(queue.some(([x,z])=>Math.hypot(x-a.stand[0],z-a.stand[1])<.25),id+' unreachable');}
 if(furnished){home.room.traverse(o=>{if(o.isMesh)triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3});assert(triangles<10000);}
 const rig=createCameraRig();rig.register(home.room);const wall=rig.entries.find(e=>e.mesh.geometry.parameters?.width===10&&e.mesh.geometry.parameters?.height===3.5);const material=wall.mesh.material;home.setStyle('dusk');assert.equal(wall.mesh.material,material);assert.equal(material.color.getHexString(),'d5dfe0');const upholstery=[];home.sofa.traverse(m=>{if(m.userData.upholstery)upholstery.push(m.material.color.getHexString())});assert(upholstery.length>=4);assert(upholstery.every(c=>c==='476b7b'));
 const camera=new T.PerspectiveCamera(40,1,.1,200),subject=new T.Vector3(150,1.3,0),target=new T.Vector3(150,1,0);
 for(const [w,h] of [[390,844],[844,390],[320,568],[1280,900]]){camera.aspect=w/h;camera.updateProjectionMatrix();const frame=apartmentCamera(camera,subject,{wide:true,angle:.38});rig.reset();rig.update(camera,frame.target,frame.desired,.05,{overview:true,subject});for(const x of [-5,5])for(const z of [-4.5,4.5]){const p=new T.Vector3(150+x,.16,z).project(camera);assert(Math.abs(p.x)<.98&&Math.abs(p.y)<.98,'Apartment out of overview frame');}for(const angle of [-.7,.2,.7]){const close=apartmentCamera(camera,subject,{angle});rig.reset();rig.update(camera,close.target,close.desired,.05,{overview:true,subject});for(const x of [-.5,.5])for(const y of [.16,2.8]){const p=new T.Vector3(150+x,y,0).project(camera);assert(Math.abs(p.x)<.98&&Math.abs(p.y)<.98,'Avatar clips in close-follow view');}}}
}
findings.push('All seven furniture stations reachable with/without sofa; apartment below 10k triangles; finish changes retain cutaway material; whole floor fits four CPU viewports');
let combinations=0;
for(const sex of ['female','male'])for(const outfit of ['streetwear','jacket','native','dress']){
 const c=makeCharacter({characterStyle:'natural',sex,outfit,hair:'bob'});combinations++;
 for(const moving of [false,true]){animateCharacter(c,.12,moving);c.traverse(o=>{if(o.isSkinnedMesh){o.skeleton.update();for(const n of o.skeleton.boneMatrices)assert(Number.isFinite(n));}});}
 for(const id of ['cook','wash','study','computer','sit','sleep']){c.rotation.set(id==='sleep'?-Math.PI/2:0,0,0);animateActivity(c,id,.05,1);c.traverse(o=>{if(o.isBone)for(const n of o.matrixWorld.elements)assert(Number.isFinite(n));});}
 c.rotation.set(0,0,0);animateCharacter(c,.05,true);assert(new T.Box3().setFromObject(c).getSize(new T.Vector3()).y<3.3);disposeCharacter(c);
}
findings.push('Eight natural-style sex/outfit combinations with bob retain finite idle/walk/activity transforms and return to walking');
const report={date:'2026-10-24',status:'passed',combinations,apartmentTriangles:triangles,checks:findings,scope:'CPU geometry/logic only; no rendered browser, native touch or Android performance claim.'};await writeFile(new URL('../qa/review.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
