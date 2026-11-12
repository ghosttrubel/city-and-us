import * as T from './vendor/three.module.js';
// Original low-poly garment panels, fitted to the retained bind pose.
// Reference images are design guidance, never textures or shipped image assets.
export const REFERENCE_FITS={
 'ref-crop':{hem:1.10,cuff:.37,width:.98,neck:'crew',bottom:'joggers'},
 'ref-square':{hem:1.08,cuff:.64,width:1,neck:'square',bottom:'wide'},
 'ref-relaxed':{hem:.99,cuff:.46,width:1.12,neck:'crew',bottom:'baggy'},
 'ref-camp':{hem:1.0,cuff:.40,width:1.06,neck:'open',bottom:'cargo'}
};
const cache=new Map();
export function addReferenceOutfit({body,rig,referenceGeometry,cloth,pants,own,female,model}){
 const fit=REFERENCE_FITS[model];if(!fit)return;
 const key=(female?'f':'m')+model,dy=female?0:.035,w=female?1:1.12;
 function attach(geometry,material,name){const mat=own(material.clone());mat.side=T.DoubleSide;const mesh=new T.SkinnedMesh(own(geometry.clone()),mat);mesh.name=name;mesh.bind(body.skeleton,body.bindMatrix);mesh.frustumCulled=false;mesh.castShadow=mesh.receiveShadow=true;mesh.userData.referenceGarment=model;rig.add(mesh);return mesh;}
 if(cache.has(key)){const c=cache.get(key);attach(c.top,cloth,'reference-top');attach(c.bottom,pants,'reference-bottom');return;}
 function builder(){const pos=[],uv=[],idx=[];return {pos,uv,idx,
  rings(rows,segments,point){const start=pos.length/3;for(let r=0;r<rows.length;r++)for(let n=0;n<=segments;n++){pos.push(...point(rows[r],n/segments*Math.PI*2,r));uv.push(n/segments,r/(rows.length-1));}for(let r=0;r<rows.length-1;r++)for(let n=0;n<segments;n++){const a=start+r*(segments+1)+n,b=a+segments+1;idx.push(a,b,a+1,a+1,b,b+1);}},
  patch(points){const s=pos.length/3;for(let i=0;i<points.length;i++){pos.push(...points[i]);uv.push(i%2,Math.floor(i/2));}for(let i=1;i<points.length-1;i++)idx.push(s,s+i,s+i+1);},
  finish(){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
   // Share normals at duplicate seam positions, including the joined crotch.
   const normals=g.attributes.normal,seams=new Map();for(let i=0;i<pos.length/3;i++){const k=pos.slice(i*3,i*3+3).map(v=>v.toFixed(5)).join(',');if(!seams.has(k))seams.set(k,[]);seams.get(k).push(i);}for(const list of seams.values()){const normal=new T.Vector3();for(const i of list)normal.add(new T.Vector3().fromBufferAttribute(normals,i));normal.normalize();for(const i of list)normals.setXYZ(i,normal.x,normal.y,normal.z);}
   const source=referenceGeometry.attributes.position,si=referenceGeometry.attributes.skinIndex,sw=referenceGeometry.attributes.skinWeight,indices=[],weights=[];
   for(let i=0;i<pos.length;i+=3){const near=[];for(let j=0;j<source.count;j++){const d=(source.getX(j)-pos[i])**2+(source.getY(j)-pos[i+1])**2+(source.getZ(j)-pos[i+2])**2;if(near.length<3||d<near[2].d){near.push({j,d});near.sort((a,b)=>a.d-b.d);near.length=Math.min(3,near.length);}}const map=new Map();for(const {j,d}of near)for(let k=0;k<4;k++){const bone=si.array[j*4+k];map.set(bone,(map.get(bone)||0)+sw.array[j*4+k]/Math.max(.00001,d));}const best=[...map].sort((a,b)=>b[1]-a[1]).slice(0,4),sum=best.reduce((n,p)=>n+p[1],0);for(let k=0;k<4;k++){indices.push(best[k]?.[0]||0);weights.push((best[k]?.[1]||0)/sum);}}
   g.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));return g;}
 };}
 const top=builder(),sleeveY=1.415+dy,depth=female?1:1.12;
 const rows=[[fit.hem,.19,.143],[fit.hem+.016,.192,.145],[1.19,.194,.15],[1.29,.205,.158],[1.37,.211,.153],[1.415,.210,.134],[1.45,.183,.105],[1.48,.098,.081],[1.493,.072,.068]];
 top.rings(rows,32,([y,x,z],t,r)=>{const c=Math.cos(t),s=Math.sin(t);let yy=y+dy;if(r>=7&&fit.neck==='square')yy-=Math.min(1,Math.max(0,s)*2)*.10;if(r>=7&&fit.neck==='open')yy-=Math.max(0,s)*.075;return [c*x*w*fit.width,yy,s*z*depth-.025];});
 for(const side of [-1,1]){const end=fit.cuff,rows=[[.13,.048,.054],[.21,.070,.073],[.29,.070,.073],[.37,.061,.060]];if(end>.40)rows.push([.43,.057,.057]);if(end>.50)rows.push([.50,.050,.052],[.58,.044,.046]);rows.push([end,.043+(end<.5?.014:0),.047+(end<.5?.012:0)]);rows.sort((a,b)=>a[0]-b[0]);top.rings(rows,20,([x,y,z],t)=>[side*x,sleeveY+Math.cos(t)*y*depth,Math.sin(t)*z*depth+(female?-.055:-.075)]);}
 if(fit.neck==='open'){
  for(const side of [-1,1])top.patch([[side*.045,1.49+dy,.031],[side*.11,1.46+dy,.071],[side*.13,1.40+dy,.12],[side*.055,1.405+dy,.125]].map(([x,y,z])=>[x*w,y,z]));
  // A separate placket and breast pocket have actual raised topology.
  top.patch([[-.012,1.01+dy,.133],[.012,1.01+dy,.133],[.012,1.40+dy,.143],[-.012,1.40+dy,.143]]);
  top.patch([[.07,1.27+dy,.137],[.15,1.27+dy,.126],[.15,1.36+dy,.126],[.07,1.36+dy,.137]]);
 }
 const bottom=builder(),cargo=fit.bottom==='cargo',jog=fit.bottom==='joggers',hem=cargo?.63:.13,waist=1.105+dy;
 // One continuous surface per leg joins its half of the waist at the crotch.
 // The shared inner boundary is coincident, avoiding overlapping hip shells.
 for(const side of [-1,1]){
  const radius=cargo?.112:jog?.112:fit.bottom==='baggy'?.114:.108;
  const rows=cargo?[[hem,radius,.11],[hem+.018,radius+.002,.112],[.74,.118,.123],[.78,.121,.135]]:[[hem,jog?.057:radius,.066+(jog?0:.023)],[hem+.025,jog?.059:radius,.069+(jog?0:.024)],[.23,radius,.10],[.40,radius+.003,.105],[.56,.111,.108],[.72,.119,.128],[.78,.121,.135]];
  const upper=[[.35],[.7],[1]];bottom.rings([...rows,...upper],32,(row,t)=>{const sn=Math.sin(t),cs=Math.cos(t);if(row.length===3){const [y,rx,rz]=row;return [side*(.122+sn*rx)*w,y,cs*rz-.025];}const f=row[0],baseX=.122+sn*.121,topX=Math.max(0,sn)*.184,topY=sn>=0?waist:.82+(waist-.82)*Math.abs(cs);return [side*(baseX+(topX-baseX)*f)*w,.78+(topY-.78)*f,cs*(.135+(.143-.135)*f)-.025];});
  if(cargo){const x=side*.24*w;bottom.patch([[x,.67,-.075],[x,.67,.085],[x+side*.014,.81,.085],[x+side*.014,.81,-.075]]);bottom.patch([[x+side*.017,.79,-.08],[x+side*.017,.79,.09],[x+side*.017,.825,.09],[x+side*.017,.825,-.08]]);}
 }
 // Raised waistband, without dangling rigid cords that intersect the thighs.
 bottom.rings([[waist-.025,.186,.145],[waist-.008,.188,.147],[waist,.186,.145]],32,([y,x,z],t)=>[Math.cos(t)*x*w,y,Math.sin(t)*z-.025]);
 const result={top:top.finish(),bottom:bottom.finish()};cache.set(key,result);attach(result.top,cloth,'reference-top');attach(result.bottom,pants,'reference-bottom');
}
