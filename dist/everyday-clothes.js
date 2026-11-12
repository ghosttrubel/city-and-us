import * as T from './vendor/three.module.js';
// Original retopologised knit top in the retained humanoid bind pose.
// Separate smooth torso and sleeve panels replace painted-on muscle geometry.
const topGeometryCache=new Map();
export function addEverydayTop({body,rig,referenceGeometry,cloth,own,female}){
 function attach(geo){const material=own(cloth.clone());material.side=T.DoubleSide;const mesh=new T.SkinnedMesh(own(geo),material);mesh.name='everyday-panel-shirt';mesh.bind(body.skeleton,body.bindMatrix);mesh.frustumCulled=false;mesh.castShadow=mesh.receiveShadow=true;mesh.userData.everydayGarment=true;rig.add(mesh);return mesh;}
 if(topGeometryCache.has(female))return attach(topGeometryCache.get(female).clone());
 const positions=[],uvs=[],indices=[];const dy=female?0:.035;
 function panel(rings,segments,axis='y',side=1){const start=positions.length/3;
  for(let r=0;r<rings.length;r++){const [at,rx,rz,center]=rings[r];for(let n=0;n<=segments;n++){const t=n/segments*Math.PI*2,c=Math.cos(t),s=Math.sin(t);if(axis==='y')positions.push(c*rx,at+dy-(r===rings.length-1?Math.max(0,s)*.018:0),s*rz-.025);else positions.push(side*at,1.415+dy+c*rx,s*rz+(female?-.055:-.075));uvs.push(n/segments,r/(rings.length-1));}}
  for(let r=0;r<rings.length-1;r++)for(let n=0;n<segments;n++){const a=start+r*(segments+1)+n,b=a+segments+1;if(axis==='x'&&side>0)indices.push(a,a+1,b,a+1,b+1,b);else indices.push(a,b,a+1,a+1,b,b+1);}
 }
 const width=female?1:1.12,depth=female?1:1.12;
 panel([[.99,.184,.14],[1.01,.187,.143],[1.08,.186,.145],[1.18,.19,.147],[1.28,.198,.15],[1.36,.214,.15],[1.405,.218,.133],[1.445,.185,.103],[1.48,.098,.078],[1.493,.071,.065]].map(([y,x,z])=>[y,x*width,z*depth]),32);
 for(const side of [-1,1])panel([[.12,.045,.05],[.18,.064,.065],[.24,.064,.064],[.32,.059,.059],[.38,.055,.053],[.395,.053,.051]].map(([x,y,z])=>[x,y*(female?1:1.18),z*(female?1:1.18)]),20,'x',side);
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();
 const source=referenceGeometry.attributes.position,si=referenceGeometry.attributes.skinIndex,sw=referenceGeometry.attributes.skinWeight,skinIndices=[],weights=[];
 // Blend the nearest three bind-pose samples; no hard pelvis/chest assignment.
 for(let i=0;i<positions.length;i+=3){const near=[];for(let j=0;j<source.count;j++){const d=(source.getX(j)-positions[i])**2+(source.getY(j)-positions[i+1])**2+(source.getZ(j)-positions[i+2])**2;if(near.length<3||d<near[2].d){near.push({j,d});near.sort((a,b)=>a.d-b.d);near.length=Math.min(3,near.length);}}const map=new Map();for(const {j,d} of near){const f=1/Math.max(.00001,d);for(let k=0;k<4;k++){const bone=si.array[j*4+k];map.set(bone,(map.get(bone)||0)+sw.array[j*4+k]*f);}}const best=[...map].sort((a,b)=>b[1]-a[1]).slice(0,4),sum=best.reduce((n,p)=>n+p[1],0);for(let k=0;k<4;k++){skinIndices.push(best[k]?.[0]||0);weights.push((best[k]?.[1]||0)/sum);}}
 geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(skinIndices,4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));topGeometryCache.set(female,geo.clone());return attach(geo);
}
