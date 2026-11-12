import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/addons/GLTFLoader.js';
const ASSETS={square:'Batch01_Square_Denim.glb',tank:'Batch01_Tank_Denim.glb',male:'Batch01_Male_Everyday.glb'};
const cache=new Map();let loading;
export function loadWardrobeAssets(){
 if(!loading)loading=Promise.all(Object.entries(ASSETS).map(async([key,file])=>{
  const gltf=await new GLTFLoader().loadAsync(new URL('./assets/garments/'+file,import.meta.url).href),parts=[];
  gltf.scene.traverse(m=>{if(m.isSkinnedMesh)parts.push(m);});
  if(parts.length!==5)throw Error('Incomplete garment asset: '+file);
  cache.set(key,parts);
 })).catch(e=>{loading=null;throw e;});
 return loading;
}
export function addWardrobeGarments({body,rig,own,appearance:a}){
 const choices=[['top',a.garmentTop],['bottom',a.garmentBottom]],meshes=[];
 for(const [slot,key] of choices){
  const parts=cache.get(key);if(!parts)throw Error('Garment not loaded: '+key);
  for(const source of parts){
   const partSlot=source.name.startsWith('Top_')?'top':'bottom';if(partSlot!==slot)continue;
   const material=own(source.material.clone()),mesh=new T.SkinnedMesh(source.geometry,material);
   material.userData.recolourSlot=material.name==='Hardware'?'hardware':slot==='top'?'shirt':'bottom';
   const dye=slot==='top'?a.shirt:a.bottom;
   if(material.name==='Jeans_Stitch')material.color.set(dye).lerp(new T.Color('#c8c1b1'),.12);
   else if(material.name!=='Hardware')material.color.set(dye);
   mesh.name=source.name;mesh.bind(body.skeleton,body.bindMatrix);mesh.frustumCulled=false;
   mesh.castShadow=mesh.receiveShadow=true;mesh.userData.wardrobeGarment={asset:key,slot};
   if(a.outfitReview==='square-denim-v2')mesh.userData.exactOutfitCandidate='square-denim-v2';
   rig.add(mesh);meshes.push(mesh);
  }
 }
 return meshes;
}
