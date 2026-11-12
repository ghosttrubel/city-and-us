import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import './catalogue-preview-runtime.mjs';
import {loadSquareDenimAsset,setSquareDenimColours} from '../dist/square-denim-outfit.js';
import {makeCharacter,animateCharacter,disposeCharacter} from '../dist/character.js';
import {animateActivity} from '../dist/activity-pose.js';
import * as T from '../dist/vendor/three.module.js';
await loadSquareDenimAsset();
const args={sex:'female',characterStyle:'natural',outfitReview:'square-denim-v2',wardrobe:{equipped:{full:'outfit-f-square-denim'}}};
const a=makeCharacter(args),b=makeCharacter(args),parts=m=>{const out=[];m.traverse(o=>{if(o.userData.exactOutfitCandidate)out.push(o);});return out;},ap=parts(a),bp=parts(b);
assert.equal(ap.length,5);for(const mesh of ap.filter(m=>['Top_Knit','Jeans_Denim'].includes(m.material.name))){const im=mesh.material.map.image,pixels=im.pixels||im.data;let lo=255,hi=0;for(let i=0;i<pixels.length;i+=4){lo=Math.min(lo,pixels[i]);hi=Math.max(hi,pixels[i]);}assert(hi>220,'Fabric must remain neutral/light enough for bright dyes');assert(hi>lo,'Preserve weave/wash variation');}const before=bp.map(m=>m.material.color.getHex());
const original=ap.map(m=>m.material.color.getHex());
setSquareDenimColours(a,{shirt:'#b86b48',bottom:'#92b2d2'});
for(const m of ap){const slot=m.material.userData.recolourSlot;if(slot==='shirt')assert.equal(m.material.color.getHexString(),'b86b48');if(slot==='bottom')assert.equal(m.material.color.getHexString(),m.material.name==='Jeans_Stitch'?new T.Color('#92b2d2').lerp(new T.Color('#c8c1b1'),.12).getHexString():'92b2d2');}
assert.deepEqual(bp.map(m=>m.material.color.getHex()),before,'Dye must not affect other avatars');
assert.equal(ap.find(m=>m.material.name==='Hardware').material.color.getHex(),original[ap.findIndex(m=>m.material.name==='Hardware')]);
assert.throws(()=>setSquareDenimColours(a,{shirt:'invalid'}));
setSquareDenimColours(a);
let maxEdge=0;const poses=[];
for(const build of ['slim','average','athletic','broad']){
 const model=makeCharacter({...args,build}),meshes=parts(model);
 for(const pose of ['idle','walk','sit']){
  for(let frame=0;frame<12;frame++){
   animateCharacter(model,1/12,pose==='walk');if(pose==='sit')animateActivity(model,'sit',1/12,1);
   model.updateMatrixWorld(true);
   for(const m of meshes){m.skeleton.update();const pos=m.geometry.attributes.position,idx=m.geometry.index,points=[];
    for(let i=0;i<pos.count;i++){const p=new T.Vector3().fromBufferAttribute(pos,i);m.applyBoneTransform(i,p);assert(p.toArray().every(Number.isFinite));points.push(p);}
    for(let i=0;i<idx.count;i+=3){const p=points[idx.getX(i)],q=points[idx.getX(i+1)],r=points[idx.getX(i+2)];const edge=Math.max(p.distanceTo(q),q.distanceTo(r),r.distanceTo(p));maxEdge=Math.max(maxEdge,edge);assert(edge<.5,'Exploded mesh in '+build+'/'+pose+' '+m.name+' edge='+edge+' indices='+[idx.getX(i),idx.getX(i+1),idx.getX(i+2)].join(','));}
   }
  }
  poses.push(build+'/'+pose);
 }
 disposeCharacter(model);
}
const source=await readFile(new URL('../art/blender/Square_Denim.blend',import.meta.url));const {zstdDecompressSync}=await import('node:zlib');const unpacked=source.readUInt32LE(0)===0xfd2fb528?zstdDecompressSync(source):source;assert.equal(unpacked.subarray(0,7).toString(),'BLENDER');
const report={status:'passed',poses,framesPerPose:12,maxEdge,independentRecolour:true,hardwareUnchanged:true,editableBlend:true,scope:'Rig/geometry/material regression only; not visual acceptance or phone performance'};
await writeFile(new URL('../qa/blender-outfit/verification.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));disposeCharacter(a);disposeCharacter(b);
