// CPU geometry/rig checks. This does not replace a rendered browser playtest.
import assert from 'node:assert/strict';
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import * as T from '../dist/vendor/three.module.js';
import {loadCharacterAssets,makeCharacter,animateCharacter,disposeCharacter} from '../dist/character.js';
import {GLTFLoader} from '../dist/vendor/addons/GLTFLoader.js';
import {Buffer} from 'node:buffer';
import {buildStreet,streetGroundHeight} from '../dist/street.js';
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
try{
 await mkdir(new URL('../qa/',import.meta.url),{recursive:true});
 T.Cache.enabled=true;
 const assetDir=new URL('../dist/assets/characters/',import.meta.url);
 for(const name of await readdir(assetDir)){const url=new URL(name,assetDir).href;if(name.endsWith('.glb'))T.Cache.add(url,new Uint8Array(await readFile(new URL(url))).buffer);else if(name.endsWith('.webp'))T.Cache.add(url,{width:512,height:512,close(){}})}
 await writeFile(new URL('./qa-visual-stage.txt',import.meta.url),'Loading assets');
 await loadCharacterAssets();
 await writeFile(new URL('./qa-visual-stage.txt',import.meta.url),'Assets loaded');
 let combinations=0,maximumDraws=0,maximumTriangles=0;const boxes=[];
 for(const sex of ['female','male'])for(const build of ['slim','average','athletic','broad'])for(const outfit of ['streetwear','jacket','native','dress']){
  const hairs=['braids','locs','fade','afro','bun','bald'],accessories=['none','earrings','glasses','chain'];

  const colours=['#38231c','#643d2a','#885037','#a36e49','#c1926e','#ddb795'];
  const appearance={skin:colours[combinations%6],shirt:colours[(combinations+1)%6],bottom:colours[(combinations+2)%6],shoes:colours[(combinations+3)%6],hairColor:colours[(combinations+4)%6]};
  const character=makeCharacter({...appearance,sex,build,outfit,hair:hairs[combinations%6],accessory:accessories[(combinations+Math.floor(combinations/4))%4],face:combinations%2?'soft':'angular'});
  const bounds=new T.Box3();let draws=0,triangles=0;
  const skinMesh=character.getObjectByName(sex==='female'?'Superhero_Female':'SuperHero_Male');
  for(const [index,key] of ['skin','shirt','bottom','shoes'].entries())assert.equal('#'+skinMesh.material[index].color.getHexString(),appearance[key],key+' colour did not reach the model');
  assert.deepEqual(Object.fromEntries(Object.keys(appearance).map(k=>[k,character.userData.appearance[k]])),appearance);
  for(const moving of [false,true])for(let step=0;step<2;step++){
   animateCharacter(character,.31,moving);character.updateMatrixWorld(true);
   character.traverse(mesh=>{
    if(!mesh.isMesh)return;
    const p=mesh.geometry.getAttribute('position'),v=new T.Vector3();
    if(step===0&&!moving){draws+=Array.isArray(mesh.material)?mesh.geometry.groups.filter(g=>g.count>0).length:1;triangles+=(mesh.geometry.index?.count||p.count)/3}
    if(mesh.isSkinnedMesh)mesh.skeleton.update();
    for(let i=0;i<p.count;i+=Math.max(1,Math.floor(p.count/24))){v.fromBufferAttribute(p,i);if(mesh.isSkinnedMesh)mesh.applyBoneTransform(i,v);v.applyMatrix4(mesh.matrixWorld);assert(v.toArray().every(Number.isFinite),'Non-finite skinned vertex');bounds.expandByPoint(v)}
   });
  }
  assert(bounds.min.y>-.08&&bounds.min.y<.12,'Foot grounding outside tolerance');
  assert(bounds.max.y<3.4&&bounds.min.y>-.65&&bounds.max.x<2&&bounds.min.x>-2,'Exploded rig or garment: '+[sex,build,outfit]+' '+JSON.stringify(bounds));
  maximumDraws=Math.max(maximumDraws,draws);maximumTriangles=Math.max(maximumTriangles,triangles);
  boxes.push({sex,build,outfit,minY:bounds.min.y,maxY:bounds.max.y});combinations++;disposeCharacter(character);
 }
 await writeFile(new URL('./qa-visual-stage.txt',import.meta.url),'Building street');
 const street=buildStreet();street.city.updateMatrixWorld(true);let draws=0,triangles=0;
 street.city.traverse(mesh=>{if(mesh.isMesh){assert(mesh.geometry.getAttribute('position'),'Empty street geometry');draws++;triangles+=(mesh.geometry.index?.count||mesh.geometry.getAttribute('position').count)/3}});
 const floorRay=new T.Raycaster();for(const [x,z] of [[0,6],[6.7,6],[-17,-4.8],[12,15.5]]){floorRay.set(new T.Vector3(x,12,z),new T.Vector3(0,-1,0));const floor=floorRay.intersectObject(street.city,true)[0];assert(floor,'Missing walkable ground');assert(Math.abs(floor.point.y-streetGroundHeight(x,z))<.04,'Walk height does not match scene surface')}
 assert(street.obstacles.length>=12);assert.equal(street.traffic.length,3);assert.equal(street.city.children.filter(o=>o.isMesh).length<100,true);
 assert.equal(street.obstacles.some(b=>Math.abs(b.x)<b.w/2&&Math.abs(6-b.z)<b.d/2),false,'Initial spawn blocked');
 await writeFile(new URL('./qa-visual-stage.txt',import.meta.url),'All geometry checks passed');
 const report={combinations,character:{maximumDraws,maximumTriangles},street:{draws,triangles,obstacles:street.obstacles.length},sampleBounds:boxes.slice(0,4),limitation:'CPU rig/geometry checks only; browser rendering and real Android performance still require testing.'};await writeFile(new URL('../qa/geometry.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{
 globalThis.self=originalSelf;GLTFLoader.prototype.parse=originalParse;
 globalThis.fetch=originalFetch;globalThis.document=originalDocument;globalThis.createImageBitmap=originalBitmap;globalThis.ProgressEvent=originalProgress;
}
