import {REFERENCE_FITS} from './reference-outfits.js';
import * as T from './vendor/three.module.js';

// Cut the authored skinned surface at exact garment seams. Interpolated skin
// weights keep the new edge vertices on the original humanoid skeleton.
export function tailorBody(source,{female=true,outfit='jacket',face='soft',natural=false,topModel,bottomModel,skirtModel}={}){
 const p=source.attributes.position,n=source.attributes.normal,uv=source.attributes.uv,si=source.attributes.skinIndex,sw=source.attributes.skinWeight;
 const referenceFit=REFERENCE_FITS[topModel];
 const everyday=outfit==='streetwear'&&(!topModel||topModel==='tee'),neck=female?1.49:1.53,waist=referenceFit?referenceFit.hem+(female?0:.035):everyday?(female?.99:1.025):(female?1.02:1.04),cuff=referenceFit?referenceFit.cuff:['varsity','blazer','track','senator','agbada'].includes(topModel)||outfit==='jacket'?.64:topModel==='buba'?.52:topModel==='wrap'?.46:.39,height=female?1.76664:1.81008;
 const sourceVertices=[];
 for(let i=0;i<p.count;i++){
  const pos=[p.getX(i),p.getY(i),p.getZ(i)];
  if(natural){const jaw=Math.max(0,1-Math.abs(pos[1]-(height-.16))/.055);pos[0]*=1-jaw*.06;const chest=Math.max(0,1-Math.abs(pos[1]-1.31)/.16);if(pos[2]>.065)pos[2]-=(pos[2]-.065)*chest*.13;}
  if(face==='angular'&&pos[1]>height-.22&&pos[1]<height-.11&&Math.abs(pos[2])<.09)pos[0]*=1.055;
  sourceVertices.push({p:pos,n:[n.getX(i),n.getY(i),n.getZ(i)],uv:[uv.getX(i),uv.getY(i)],j:[si.getX(i),si.getY(i),si.getZ(i),si.getW(i)],w:[sw.getX(i),sw.getY(i),sw.getZ(i),sw.getW(i)]});
 }
 function mix(a,b,t){
  const weights=new Map();for(let k=0;k<4;k++){weights.set(a.j[k],(weights.get(a.j[k])||0)+a.w[k]*(1-t));weights.set(b.j[k],(weights.get(b.j[k])||0)+b.w[k]*t)}
  const sorted=[...weights].filter(e=>e[1]>.000001).sort((a,b)=>b[1]-a[1]).slice(0,4),sum=sorted.reduce((s,e)=>s+e[1],0),j=[0,0,0,0],w=[0,0,0,0];
  sorted.forEach((v,k)=>{j[k]=v[0];w[k]=v[1]/sum});
  return {p:a.p.map((v,k)=>v+(b.p[k]-v)*t),n:a.n.map((v,k)=>v+(b.n[k]-v)*t),uv:a.uv.map((v,k)=>v+(b.uv[k]-v)*t),j,w};
 }
 // A neckline follows the neck/shoulder slope instead of cutting the whole
 // shoulder at one world height. Keep legacy/classic tailoring unchanged.
 const neckline=v=>v[1]-neck+(referenceFit&&referenceFit.neck!=='crew'?Math.min(1,Math.max(0,(v[2]+.025)/.068)*(referenceFit.neck==='square'?2:1))*(referenceFit.neck==='square'?.10:.075):0)-(natural?Math.max(0,Math.abs(v[0])-.065)*.8:0);
 function clip(poly,axis,value,positive){
  const result=[];
  for(let i=0;i<poly.length;i++){
   const a=poly[i],b=poly[(i+1)%poly.length],da=(typeof axis==='function'?axis(a.p):a.p[axis])-value,db=(typeof axis==='function'?axis(b.p):b.p[axis])-value,insideA=positive?da>=0:da<=0,insideB=positive?db>=0:db<=0;
   if(insideA)result.push(a);
   if(insideA!==insideB)result.push(mix(a,b,da/(da-db)));
  }
  return result;
 }
 const skirtHem=skirtModel?({day:.58,evening:.15,ankara:.42,iro:.36,agbada:.62,senator:.68}[skirtModel]??.58):outfit==='dress'?.58:null;
 const planes=[[1,.045],[1,.115],[1,waist],[neckline,0],[0,-cuff],[0,cuff]];
 if(skirtHem!==null)planes.push([1,skirtHem+.015]);if(outfit==='dress')planes.push([1,.93]);if(bottomModel==='shorts'||referenceFit?.bottom==='cargo')planes.push([1,referenceFit?.bottom==='cargo'?.63:.64]);
 const buckets=Array.from({length:5},()=>({p:[],n:[],uv:[],j:[],w:[]})),seams={collar:[],hem:[],left:[],right:[]};
 function zone(v){
  const [x,y]=v;if(y<.045)return 4;if(y<.115)return 3;if(y<waist)return (outfit==='dress'&&skirtHem!==null&&y<skirtHem+.015)||(bottomModel==='shorts'&&y<.64||referenceFit?.bottom==='cargo'&&y<.63)||outfit==='dress'&&!skirtModel&&y<.93?0:2;
  return neckline(v)<0&&Math.abs(x)<cuff?1:0;
 }
 function output(v,bucket,slot){
  const normal=new T.Vector3(...v.n).normalize(),point=[...v.p];
  const inflation=slot===1?(topModel==='blazer'?.038:['wrap','buba','agbada'].includes(topModel)?.04:topModel==='track'?.026:outfit==='jacket'?.017:.009):slot===2?(bottomModel==='wide'?.014+Math.max(0,.75-point[1])*.075:bottomModel==='joggers'?.014+Math.max(0,1-Math.abs(point[1]-.65)/.6)*.022:everyday?.016:.011):0;
  // Taper the cloth into its cut edge: no open gap or rigid pale piping.
  const edge=slot===1?Math.min(Math.abs(neckline(point)),Math.abs(Math.abs(point[0])-cuff),Math.abs(point[1]-waist)):slot===2?Math.min(Math.abs(point[1]-waist),Math.abs(point[1]-.115)):1;
  const offset=inflation*Math.min(1,edge/.018);point[0]+=normal.x*offset;point[1]+=normal.y*offset;point[2]+=normal.z*offset;
  bucket.p.push(...point);bucket.n.push(normal.x,normal.y,normal.z);bucket.uv.push(...v.uv);bucket.j.push(...v.j);bucket.w.push(...v.w);
 }
 const index=source.index;
 for(let i=0;i<index.count;i+=3){
  let polygons=[[sourceVertices[index.getX(i)],sourceVertices[index.getX(i+1)],sourceVertices[index.getX(i+2)]]];
  for(const [axis,value] of planes){
   const next=[];
   for(const poly of polygons){
    const coordinates=poly.map(v=>typeof axis==='function'?axis(v.p):v.p[axis]);
    if(Math.min(...coordinates)<value-.000001&&Math.max(...coordinates)>value+.000001){
     for(const side of [true,false]){const cut=clip(poly,axis,value,side);if(cut.length>=3)next.push(cut)}
    }else next.push(poly);
   }
   polygons=next;
  }
  for(const poly of polygons){
   const center=[0,0,0];poly.forEach(v=>v.p.forEach((n,k)=>center[k]+=n/poly.length));const slot=zone(center),bucket=buckets[slot];if(everyday&&slot===1||referenceFit&&(slot===1||slot===2))continue;
   // The skirt replaces covered leg fabric; hidden trousers must not poke
   // through it as dark patches when the retained walk animation bends.
   if(skirtHem!==null&&center[1]>skirtHem+.015&&center[1]<waist)continue;
   for(let j=1;j<poly.length-1;j++)for(const v of [poly[0],poly[j],poly[j+1]])output(v,bucket,slot);
   if(slot===1)for(const v of poly){
    if(Math.abs(neckline(v.p))<.00001)seams.collar.push(v.p);
    if(Math.abs(v.p[1]-waist)<.00001)seams.hem.push(v.p);
    if(Math.abs(v.p[0]-cuff)<.00001)seams.left.push(v.p);
    if(Math.abs(v.p[0]+cuff)<.00001)seams.right.push(v.p);
   }
  }
 }
 const all={p:[],n:[],uv:[],j:[],w:[]},geometry=new T.BufferGeometry();let offset=0;
 buckets.forEach((bucket,slot)=>{geometry.addGroup(offset,bucket.p.length/3,slot);offset+=bucket.p.length/3;for(const key of Object.keys(all))for(const value of bucket[key])all[key].push(value)});
 geometry.setAttribute('position',new T.Float32BufferAttribute(all.p,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(all.n,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(all.uv,2));geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(all.j,4));geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(all.w,4));
 function contour(points,axis){
  const unique=[...new Map(points.map(p=>[p.map(v=>v.toFixed(5)).join(','),p])).values()];if(unique.length<4)return [];
  const center=[0,0,0];unique.forEach(p=>p.forEach((n,k)=>center[k]+=n/unique.length));const axes=[0,1,2].filter(a=>a!==axis);
  unique.sort((a,b)=>Math.atan2(a[axes[1]]-center[axes[1]],a[axes[0]]-center[axes[0]])-Math.atan2(b[axes[1]]-center[axes[1]],b[axes[0]]-center[axes[0]]));
  return unique.map(p=>{const radius=Math.hypot(...axes.map(k=>p[k]-center[k]))||1,expand=((outfit==='jacket'?.017:.009)+.0015)/radius;return p.map((v,k)=>k===axis?v:(v-center[k])*(1+expand)+center[k])});
 }
 return {geometry,neck,waist,collar:contour(seams.collar,1),hem:contour(seams.hem,1),left:contour(seams.left,0),right:contour(seams.right,0)};
}
