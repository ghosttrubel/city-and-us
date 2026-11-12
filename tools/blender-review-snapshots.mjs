// Actual exported outfit on the game's character/poses; Blender renders, not game screenshots.
import './catalogue-preview-runtime.mjs';
import * as T from '../dist/vendor/three.module.js';
import {makeCharacter,animateCharacter,disposeCharacter} from '../dist/character.js';
import {animateActivity} from '../dist/activity-pose.js';
import {loadSquareDenimAsset,setSquareDenimColours} from '../dist/square-denim-outfit.js';
import {writeFile,mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),sharp=require('sharp'),dir=new URL('../qa/blender-outfit/',import.meta.url);
await mkdir(new URL('textures/',dir),{recursive:true});await loadSquareDenimAsset();
const m=makeCharacter({sex:'female',skin:'#885037',characterStyle:'natural',hair:'bun',accessory:'none',shoes:'#323234',outfitReview:'square-denim-v2',wardrobe:{equipped:{full:'outfit-f-square-denim'}}});
const textures=new Map(),materials=new Map();
async function material(mat){
 if(materials.has(mat.uuid))return materials.get(mat.uuid).id;
 let map=null;
 if(mat.map){const texture=mat.map;if(!textures.has(texture.uuid)){const im=texture.image;let pixels=ArrayBuffer.isView(im.data)?im.data:im.pixels;if(!pixels&&im.getContext)pixels=im.getContext('2d').getImageData(0,0,im.width,im.height).data;if(pixels){const name='textures/map-'+textures.size+'.png';await writeFile(new URL(name,dir),await sharp(Buffer.from(pixels),{raw:{width:im.width,height:im.height,channels:4}}).png().toBuffer());textures.set(texture.uuid,name);}}map=textures.get(texture.uuid)||null;}
 const id=materials.size;materials.set(mat.uuid,{id,name:mat.name||'material-'+id,color:mat.color.toArray(),roughness:mat.roughness??.8,metalness:mat.metalness||0,map,flipY:mat.map?.flipY||false,repeat:mat.map?.repeat.toArray()||[1,1]});return id;
}
for(const [name,yaw,pose] of [['front',0,'idle'],['side',Math.PI/2,'idle'],['back',Math.PI,'idle'],['seated',.65,'sit'],['recolour',0,'idle']]){
 m.rotation.set(0,yaw,0);m.position.y=pose==='sit'?.63:0;
 for(let i=0;i<12;i++)animateCharacter(m,.05,false);
 if(pose==='sit')animateActivity(m,'sit',.016,1);
 if(name==='recolour'){setSquareDenimColours(m,{shirt:'#a65f45',bottom:'#8599ac'});materials.clear();}
 m.updateMatrixWorld(true);const meshes=[],objects=[];m.traverse(o=>{if(o.isMesh)objects.push(o)});
 for(const mesh of objects){let visible=true;for(let p=mesh;p;p=p.parent)if(!p.visible)visible=false;if(!visible)continue;
  const g=mesh.geometry,p=g.attributes.position,uv=g.attributes.uv,n=g.attributes.normal,index=g.index,verts=[],normals=[],uvs=[];
  if(mesh.isSkinnedMesh)mesh.skeleton.update();
  const normalMatrix=new T.Matrix3().getNormalMatrix(mesh.matrixWorld);
  for(let i=0;i<p.count;i++){
   const v=new T.Vector3().fromBufferAttribute(p,i),normal=new T.Vector3().fromBufferAttribute(n,i);
   if(mesh.isSkinnedMesh){const tip=v.clone().addScaledVector(normal,.001);mesh.applyBoneTransform(i,v);mesh.applyBoneTransform(i,tip);normal.copy(tip).sub(v).normalize();}
   v.applyMatrix4(mesh.matrixWorld);normal.applyMatrix3(normalMatrix).normalize();
   verts.push([v.x,-v.z,v.y]);normals.push([normal.x,-normal.z,normal.y]);uvs.push(uv?[uv.getX(i),uv.getY(i)]:[0,0]);
  }
  const mats=Array.isArray(mesh.material)?mesh.material:[mesh.material],ids=[];for(const mat of mats)ids.push(await material(mat));
  const faces=[],faceMaterials=[],groups=Array.isArray(mesh.material)?g.groups:[{start:0,count:index?.count||p.count,materialIndex:0}];
  for(const group of groups)for(let i=group.start;i<group.start+group.count;i+=3){faces.push([index?index.getX(i):i,index?index.getX(i+1):i+1,index?index.getX(i+2):i+2]);faceMaterials.push(group.materialIndex);}
  meshes.push({name:mesh.name||'detail',verts,normals,uvs,faces,faceMaterials,materials:ids});
 }
 await writeFile(new URL(name+'-snapshot.json',dir),JSON.stringify({scope:'Game mesh/pose snapshot for Blender rendering, not a game screenshot',materials:[...materials.values()],meshes}));
 console.log('Snapshot:',name);
}
disposeCharacter(m);
