// Rebuild portable CC0 models and in-place locomotion without Blender.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),src=resolve(root,'tools/source-assets'),dest=resolve(root,'dist/assets/characters');
await mkdir(dest,{recursive:true});
function pack(doc,binary){
 const chunks=[],views=[],accessors=[],viewMap=new Map(),accMap=new Map();let length=0;
 function acc(index){
  if(accMap.has(index))return accMap.get(index);
  const a=structuredClone(doc.accessors[index]);
  if(!viewMap.has(a.bufferView)){
   const v=doc.bufferViews[a.bufferView],data=binary.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength),pad=(4-length%4)%4;
   if(pad){chunks.push(Buffer.alloc(pad));length+=pad}
   viewMap.set(a.bufferView,views.length);views.push({...v,buffer:0,byteOffset:length});chunks.push(data);length+=data.length;
  }
  a.bufferView=viewMap.get(a.bufferView);const out=accessors.length;accMap.set(index,out);accessors.push(a);return out;
 }
 for(const m of doc.meshes||[])for(const p of m.primitives){for(const key of Object.keys(p.attributes)){if(/^(TEXCOORD_[1-9]|COLOR_)/.test(key))delete p.attributes[key];else p.attributes[key]=acc(p.attributes[key])}if(p.indices!==undefined)p.indices=acc(p.indices)}
 for(const s of doc.skins||[])if(s.inverseBindMatrices!==undefined)s.inverseBindMatrices=acc(s.inverseBindMatrices);
 for(const a of doc.animations||[])for(const s of a.samplers){s.input=acc(s.input);s.output=acc(s.output)}
 doc.accessors=accessors;doc.bufferViews=views;doc.buffers=[{byteLength:length}];doc.asset.extras={source:'Quaternius',license:'CC0-1.0',adaptedFor:'Lagos Street'};
 const json=Buffer.from(JSON.stringify(doc)),jp=Buffer.alloc(Math.ceil(json.length/4)*4,32);json.copy(jp);
 const bin=Buffer.concat(chunks,Math.ceil(length/4)*4),out=Buffer.alloc(28+jp.length+bin.length);
 out.writeUInt32LE(0x46546c67,0);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);out.writeUInt32LE(jp.length,12);out.writeUInt32LE(0x4e4f534a,16);jp.copy(out,20);out.writeUInt32LE(bin.length,20+jp.length);out.writeUInt32LE(0x004e4942,24+jp.length);bin.copy(out,28+jp.length);return out;
}
for(const name of ['Superhero_Female_FullBody','Superhero_Male_FullBody','Hair_BuzzedFemale','Hair_Buzzed','Hair_Buns','Hair_Long']){
 const doc=JSON.parse(await readFile(resolve(src,name+'.gltf'),'utf8'));
 for(const m of doc.materials||[]){delete m.normalTexture;delete m.pbrMetallicRoughness.metallicRoughnessTexture;if(/Hair/.test(m.name))delete m.pbrMetallicRoughness.baseColorTexture;else if(/Eyes/.test(m.name))m.pbrMetallicRoughness.baseColorTexture={index:0};else{m.pbrMetallicRoughness.baseColorTexture={index:1};m.normalTexture={index:2,scale:.65}}}
 const sex=name.includes('Female')?'female':'male';doc.images=[{uri:'T_Eye_Brown.webp'},{uri:sex+'-skin.webp'},{uri:sex+'-normal.webp'}];doc.textures=[{source:0},{source:1},{source:2}];
 await writeFile(resolve(dest,name+'.glb'),pack(doc,await readFile(resolve(src,name+'.bin'))));
}
const animation=await readFile(resolve(src,'UAL1_Standard.glb')),jl=animation.readUInt32LE(12),doc=JSON.parse(animation.subarray(20,20+jl)),bin=animation.subarray(28+jl),baseNodes=structuredClone(doc.nodes);
doc.animations=doc.animations.filter(a=>['Idle_Loop','Walk_Loop'].includes(a.name));
for(const a of doc.animations){a.channels=a.channels.filter(c=>c.target.path==='rotation');const map=new Map(),samplers=[];for(const c of a.channels){if(!map.has(c.sampler)){map.set(c.sampler,samplers.length);samplers.push(a.samplers[c.sampler])}c.sampler=map.get(c.sampler)}a.samplers=samplers}
for(const key of ['meshes','materials','skins','images','textures'])delete doc[key];for(const n of doc.nodes){delete n.mesh;delete n.skin}
await writeFile(resolve(dest,'locomotion.glb'),pack(doc,bin));
await writeFile(resolve(dest,'animation-bind.json'),JSON.stringify(baseNodes.filter(n=>n.name).map(n=>({name:n.name,rotation:n.rotation||[0,0,0,1]}))));
console.log('Packed sculpted characters, hair, idle and walk clips.');
