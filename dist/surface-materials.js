import * as T from './vendor/three.module.js';
// Small original procedural material maps. Shared across rooms; no downloads.
const maps=new Map();
export function surfaceMap(kind){
 if(maps.has(kind))return maps.get(kind);const size=128,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const noise=((Math.imul(x+19,374761393)^Math.imul(y+7,668265263))>>>0)%17;
  let v=245-noise*.35;
  if(kind==='wood')v=235+Math.sin(x*.8+Math.sin(y*.08)*1.4)*8+noise*.45;
  if(kind==='fabric')v=240+((x+y)%2?6:-6)+noise*.25;
  if(kind==='tile')v=x%32<1||y%32<1?176:244+noise*.35;
  if(kind==='stone')v=233+noise;
  const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=Math.max(0,Math.min(255,v));data[i+3]=255;
 }
 const map=new T.DataTexture(data,size,size);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.magFilter=T.LinearFilter;map.minFilter=T.LinearMipmapLinearFilter;map.generateMipmaps=true;map.needsUpdate=true;maps.set(kind,map);return map;
}
export function surfaceMaterial(color,kind='paint'){
 const material=new T.MeshStandardMaterial({color,roughness:({metal:.32,tile:.6,wood:.78,fabric:.96,stone:.72,paint:.9})[kind]??.85,metalness:kind==='metal'?.65:0});
 if(kind!=='metal'&&kind!=='paint')material.map=surfaceMap(kind);material.userData.surface=kind;return material;
}
