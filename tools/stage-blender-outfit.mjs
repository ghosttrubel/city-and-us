// Normalize Blender's bone ordering/rest axes to the existing game skeleton.
// This offline step keeps runtime skin binding cheap and independent of Blender.
import './catalogue-preview-runtime.mjs';
import * as T from '../dist/vendor/three.module.js';
import {GLTFLoader} from '../dist/vendor/addons/GLTFLoader.js';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const bytes=await readFile(new URL('art/blender/Square_Denim_Export.glb',root));
function decode(b){const size=b.readUInt32LE(12);return {json:JSON.parse(b.subarray(20,20+size)),bin:b.subarray(28+size)};}
const raw=decode(bytes),originalBytes=await readFile(new URL('dist/assets/characters/Superhero_Female_FullBody.glb',root)),original=decode(originalBytes);
const loader=new GLTFLoader(),source=await loader.loadAsync(new URL('art/blender/Square_Denim_Export.glb',root).href),bodyScene=await loader.loadAsync(new URL('dist/assets/characters/Superhero_Female_FullBody.glb',root).href);
const body=bodyScene.scene.getObjectByName('Superhero_Female'),canonical=body.skeleton.bones.map(b=>b.name);
source.scene.updateMatrixWorld(true);bodyScene.scene.updateMatrixWorld(true);
const meshes=[];source.scene.traverse(m=>{if(m.isMesh){assert(m.isSkinnedMesh,'Unrigged garment mesh');meshes.push(m);}});
assert.equal(meshes.length,5);
const required=['Top_Knit','Jeans_Denim','Top_Binding','Jeans_Stitch','Hardware'];
assert.deepEqual(meshes.map(m=>m.material.name).sort(),[...required].sort());
const doc={asset:{version:'2.0',generator:'Blender outfit pipeline / retained rig normalization'},scene:original.json.scene||0,scenes:structuredClone(original.json.scenes),nodes:original.json.nodes.map(n=>{const v={...n};delete v.mesh;delete v.skin;return v;}),skins:[],meshes:[],materials:raw.json.materials,textures:raw.json.textures||[],samplers:raw.json.samplers||[],images:[],accessors:[],bufferViews:[],buffers:[{byteLength:0}],extras:{reference:'Denim_and_Everyday_Tops.png / rightmost',back:'plain matching back inferred',status:'single outfit pending visual review',source:'art/blender/Square_Denim.blend'}};
const exportInfo=JSON.parse(await readFile(new URL('qa/blender-outfit/blender-export.json',root),'utf8'));
for(const mat of doc.materials)if(exportInfo.materialColours[mat.name])mat.pbrMetallicRoughness.baseColorFactor=exportInfo.materialColours[mat.name];
const chunks=[];let length=0;
function view(buffer,target){const pad=(4-length%4)%4;if(pad){chunks.push(Buffer.alloc(pad));length+=pad;}const id=doc.bufferViews.length;doc.bufferViews.push({buffer:0,byteOffset:length,byteLength:buffer.length,...(target?{target}:{})});chunks.push(buffer);length+=buffer.length;return id;}
function acc(array,size,target){const type=({1:'SCALAR',2:'VEC2',3:'VEC3',4:'VEC4',16:'MAT4'})[size],a={bufferView:view(Buffer.from(array.buffer,array.byteOffset,array.byteLength),target),componentType:array instanceof Uint8Array?5121:array instanceof Uint16Array?5123:array instanceof Uint32Array?5125:5126,count:array.length/size,type};if(size===3){a.min=[Infinity,Infinity,Infinity];a.max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<array.length;i++){a.min[i%3]=Math.min(a.min[i%3],array[i]);a.max[i%3]=Math.max(a.max[i%3],array[i]);}}doc.accessors.push(a);return doc.accessors.length-1;}
for(const im of raw.json.images||[]){assert(im.bufferView!==undefined,'Export must embed textures');const v=raw.json.bufferViews[im.bufferView];doc.images.push({...im,bufferView:view(raw.bin.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength))});}
for(const skin of original.json.skins){const a=original.json.accessors[skin.inverseBindMatrices],v=original.json.bufferViews[a.bufferView],at=(v.byteOffset||0)+(a.byteOffset||0),data=new Float32Array(a.count*16);for(let i=0;i<data.length;i++)data[i]=original.bin.readFloatLE(at+i*4);doc.skins.push({...skin,inverseBindMatrices:acc(data,16)});}
let triangles=0,maxJointPositionError=0;
for(const m of meshes){
 const remap=m.skeleton.bones.map(b=>{const index=canonical.indexOf(b.name);assert(index>=0,'Unknown bone: '+b.name);const error=b.getWorldPosition(new T.Vector3()).distanceTo(body.skeleton.bones[index].getWorldPosition(new T.Vector3()));maxJointPositionError=Math.max(maxJointPositionError,error);assert(error<.0001,'Changed rest joint position: '+b.name);return index;});
 assert.equal(remap.length,canonical.length,'Retain every existing bone');
 const g=m.geometry.clone();g.applyMatrix4(m.bindMatrix);
 const joints=g.attributes.skinIndex,weights=g.attributes.skinWeight;
 for(let i=0;i<joints.count;i++){let sum=0;for(let k=0;k<4;k++){const at=i*4+k,j=joints.array[at],w=weights.array[at];assert(Number.isFinite(w)&&w>=0&&w<=1);assert(remap[j]!==undefined);joints.array[at]=remap[j];sum+=w;}assert(Math.abs(sum-1)<1e-4);}
 assert([...g.attributes.position.array].every(Number.isFinite));
 g.computeBoundingBox();assert(g.boundingBox.min.y>-.03&&g.boundingBox.max.y<1.7&&g.boundingBox.min.x>-.75&&g.boundingBox.max.x<.75,'Unexpected garment scale/axes');
 const attributes={};for(const [key,name] of [['position','POSITION'],['normal','NORMAL'],['uv','TEXCOORD_0'],['skinIndex','JOINTS_0'],['skinWeight','WEIGHTS_0']]){const a=g.attributes[key];assert(a,'Missing '+key);attributes[name]=acc(a.array,a.itemSize,34962);}
 assert(g.index);triangles+=g.index.count/3;
 const mesh=doc.meshes.length,mi=doc.materials.findIndex(mat=>mat.name===m.material.name);assert(mi>=0);
 doc.meshes.push({name:m.name,primitives:[{attributes,indices:acc(g.index.array,1,34963),material:mi}]});
 doc.scenes[doc.scene].nodes.push(doc.nodes.length);doc.nodes.push({name:m.name,mesh,skin:0,extras:{outfit:'square-denim-v2'}});
 g.dispose();
}
assert(triangles<=35000);doc.buffers[0].byteLength=length;
const bin=Buffer.concat([...chunks,Buffer.alloc((4-length%4)%4)]),jr=Buffer.from(JSON.stringify(doc)),json=Buffer.concat([jr,Buffer.alloc((4-jr.length%4)%4,32)]),header=Buffer.alloc(20),bh=Buffer.alloc(8);
header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+bin.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);bh.writeUInt32LE(bin.length);bh.writeUInt32LE(0x004e4942,4);
const output=Buffer.concat([header,json,bh,bin]);assert(output.length<2*1024*1024,'GLB over 2 MiB budget');
await writeFile(new URL('dist/assets/garments/Square_Denim_Blender.glb',root),output);
const report={status:'passed',triangles,materialBatches:meshes.length,bones:canonical.length,maxJointPositionError,bytes:output.length,sha256:createHash('sha256').update(output).digest('hex'),materials:required,normalWardrobeUnchanged:true};
await writeFile(new URL('qa/blender-outfit/staging.json',root),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
