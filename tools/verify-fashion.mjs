import {createCameraRig as hairCameraRig} from '../dist/camera.js';
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

import {FASHION_ITEMS} from '../dist/fashion-catalogue.js';
import {purchaseFashion,equipFashion,previewFashion,saveLook,wearLook,unequipFashion} from '../dist/wardrobe-state.js';
await loadCharacterAssets();
const initial={name:'Catalogue QA',sex:'female',build:'average',face:'soft',characterStyle:'natural',skin:'#885037',shirt:'#ede1cb',bottom:'#52665e',shoes:'#efe8da',hairColor:'#241b19',hair:'bob',outfit:'streetwear',accessory:'earrings',money:100000,food:80,energy:80,mood:80,time:480,day:1,x:0,z:6,rentDay:1,skills:{trader:1,rider:1,chef:1}};
const s=migrate(initial,initial,'LS-0123456789ABCDEF');assert.equal(s.money,100000);assert.equal(s.hair,'bob');assert.deepEqual(s.wardrobe.equipped,{full:'outfit-f-square-denim'});const before=JSON.stringify(s),draft=previewFashion(s,'hair-cornrows');assert.equal(JSON.stringify(s),before);assert.equal(draft.wardrobe.equipped.hair,'hair-cornrows');const balance=s.money;assert(purchaseFashion(s,'hair-cornrows').ok);assert.equal(s.money,balance-850);assert(purchaseFashion(s,'hair-cornrows').ok);assert.equal(s.money,balance-850);const poor=structuredClone(s);poor.money=0;assert(!purchaseFashion(poor,'native-agbada').ok);assert(!poor.wardrobe.owned.includes('native-agbada'));assert(!equipFashion(poor,'native-agbada'));assert(!purchaseFashion(s,'__proto__').ok);assert(equipFashion(s,'hair-cornrows'));saveLook(s,'First look');const reloaded=migrate(JSON.parse(JSON.stringify(s)),initial,s.localPlayerId);assert.deepEqual(reloaded,s);assert(validSave({version:1,data:s}));assert(wearLook(reloaded,s.wardrobe.looks[0].id));unequipFashion(reloaded,'hair');assert(!reloaded.wardrobe.equipped.hair);
for(const item of FASHION_ITEMS.filter(i=>!i.sex||i.sex===s.sex)){purchaseFashion(s,item.id);assert(equipFashion(s,item.id));}assert(validSave({version:1,data:s}));
let combinations=0,poseSamples=0,maxTriangles=0;const failures=[];
for(const sex of ['female','male'])for(const build of ['slim','average','athletic','broad'])for(const item of FASHION_ITEMS.filter(i=>!i.sex||i.sex===sex)){const state=migrate({...initial,sex,build},initial,initial.localPlayerId);purchaseFashion(state,item.id);equipFashion(state,item.id);const c=makeCharacter(state),head=c.userData.head,hairMeshes=[];head.traverse(o=>{if(o.isMesh&&(o.userData.hair||o.userData.headwear))hairMeshes.push(o)});assert(item.id==='hair-bald'||hairMeshes.length>0,'Missing '+item.id);const locals=hairMeshes.map(m=>head.matrixWorld.clone().invert().multiply(m.matrixWorld));const cutaway=hairCameraRig();cutaway.register(c);assert.equal(cutaway.entries.length,0);let turn=0;let triangles=0;c.traverse(o=>{if(o.isMesh)triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;});maxTriangles=Math.max(maxTriangles,triangles);
 for(const pose of ['idle','walk','sit','cook','wash','study','sleep']){c.rotation.set(pose==='sleep'?-Math.PI/2:0,turn++*Math.PI/4,0);if(['idle','walk'].includes(pose))animateCharacter(c,.12,pose==='walk');else animateActivity(c,pose,.05,.8);c.updateMatrixWorld(true);c.traverse(o=>{if(o.isSkinnedMesh){o.skeleton.update();for(const value of o.skeleton.boneMatrices)assert(Number.isFinite(value),item.id+' nonfinite pose');const position=o.geometry.attributes.position;for(let v=0;v<position.count;v+=Math.max(1,Math.floor(position.count/50))){const p=new T.Vector3().fromBufferAttribute(position,v);o.applyBoneTransform(v,p);assert(Number.isFinite(p.x+p.y+p.z),item.id+' invalid skinned vertex');assert(p.length()<5,item.id+' exploded garment');}}if(o.userData.hair)assert.equal(o.material.side,T.DoubleSide);});for(const [index,m] of hairMeshes.entries()){assert(m.visible&&m.material.opacity===1);const local=head.matrixWorld.clone().invert().multiply(m.matrixWorld);local.elements.forEach((v,k)=>assert(Math.abs(v-locals[index].elements[k])<1e-6,'Hair detached '+item.id));const camera=new T.PerspectiveCamera(40,1,.1,30),focus=head.getWorldPosition(new T.Vector3());camera.position.copy(focus).add(new T.Vector3(Math.sin(turn)*2,.3,Math.cos(turn)*2));camera.lookAt(focus);camera.updateMatrixWorld();const frustum=new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));assert(frustum.intersectsObject(m),'Hair culled '+item.id);}poseSamples++;}
 disposeCharacter(c);combinations++;if(combinations%35===0)console.log(sex,build,combinations,poseSamples);
}
const report={date:'2026-10-25',status:'passed',catalogueItems:FASHION_ITEMS.length,combinations,poseSamples,maxTriangles,scope:'CPU skeleton, geometry, transactional inventory and save checks; not visual fit or device certification.'};await writeFile(new URL('../qa/wardrobe-home/fashion.json',import.meta.url),JSON.stringify(report,null,2));console.log(report);
