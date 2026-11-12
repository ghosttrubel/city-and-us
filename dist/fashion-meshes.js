import * as T from './vendor/three.module.js';
// All geometry in this file is original, built in the retained rig's rest pose.
export function addCatalogueHair({a,top,attach,mesh,tube,hairMat}){
 if(!['cornrows','puff','crown','pixie'].includes(a.hair))return false;
 const cap=mesh(new T.SphereGeometry(1,24,16,0,Math.PI*2,0,Math.PI*.57),hairMat,0,top-.065,-.025);cap.scale.set(.097,.089,.096);attach('Head',cap);
 if(a.hair==='cornrows'){
  for(let row=-3;row<=3;row++){const x=row*.023,points=[];for(let j=0;j<=12;j++){const t=j/12*Math.PI*.91;points.push([x,top-.067+Math.sin(t)*(.092-Math.abs(row)*.004),.08*Math.cos(t)-.025]);}attach('Head',tube(points,.0065,hairMat,24));}
  for(let i=-2;i<=2;i++)attach('Head',tube([[i*.024,top-.06,-.11],[i*.025,top-.13,-.1],[i*.018,top-.17,-.08]],.009,hairMat,8));
 }else if(a.hair==='puff'){
  const core=mesh(new T.SphereGeometry(1,18,12),hairMat,0,top+.115,-.045);core.scale.set(.09,.1,.09);attach('Head',core);
  const tie=mesh(new T.TorusGeometry(.057,.012,8,20),hairMat,0,top+.015,-.04);tie.rotation.x=Math.PI/2;attach('Head',tie);
  for(let i=0;i<40;i++){const t=i*2.39996,y=(i+.5)/40*2-1,r=Math.sqrt(1-y*y),curl=mesh(new T.IcosahedronGeometry(.024,1),hairMat,Math.cos(t)*r*.09,top+.115+y*.1,-.045+Math.sin(t)*r*.09);attach('Head',curl);}
 }else if(a.hair==='crown'){
  for(let ring=0;ring<4;ring++){const points=[];for(let j=0;j<=32;j++){const t=j/32*Math.PI*2;points.push([Math.cos(t)*(.095-ring*.008),top-.035+ring*.022+Math.sin(t*8)*.004,-.025+Math.sin(t)*(.09-ring*.008)]);}attach('Head',tube(points,.012,hairMat,40));}
  for(let i=0;i<5;i++){const knot=mesh(new T.TorusGeometry(.035-i*.004,.01,8,20),hairMat,0,top+.04+i*.012,-.045);knot.rotation.x=Math.PI/2;attach('Head',knot);}
 }else{
  for(let i=0;i<18;i++){const x=(i%6-2.5)*.025,z=(Math.floor(i/6)-1)*.035;attach('Head',tube([[x,top-.01,z],[x+.016,top+.03,z+.015],[x+.035,top+.015,z+.04]],.013,hairMat,8));}
 }return true;
}
const sleeveWeights=new Map();
let ankara;
export function ankaraMap(){if(ankara)return ankara;const size=128,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const dx=(x%32)-16,dy=(y%32)-16,r=Math.hypot(dx,dy),edge=Math.abs(dx)+Math.abs(dy),c=r<5?[225,203,144]:r<9?[52,87,77]:edge>23?[235,219,168]:[184,139,91],i=(y*size+x)*4;data.set([...c,255],i);}ankara=new T.DataTexture(data,size,size);ankara.colorSpace=T.SRGBColorSpace;ankara.wrapS=ankara.wrapT=T.RepeatWrapping;ankara.repeat.set(3,3);ankara.magFilter=ankara.minFilter=T.LinearFilter;ankara.needsUpdate=true;return ankara;}
export function addFashionClothes({a,body,rig,referenceGeometry,own,material,cloth,pants,shoe,sole,gold,attach,mesh,tube,top,headY,frontAt}){
 const female=a.sex==='female',dy=female?0:.035;
 const bind=geo=>{const m=new T.SkinnedMesh(own(geo),cloth);m.bind(body.skeleton,body.bindMatrix);m.castShadow=m.receiveShadow=true;m.frustumCulled=false;m.userData.catalogueGarment=true;rig.add(m);return m;};
 function skinNearest(geo){const p=geo.attributes.position,key=a.sex+'|'+p.getX(0)+'|'+p.count,cached=sleeveWeights.get(key);if(cached){geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(cached.indices.slice(),4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(cached.weights.slice(),4));return geo;}const source=referenceGeometry.attributes.position,si=referenceGeometry.attributes.skinIndex,sw=referenceGeometry.attributes.skinWeight,indices=new Uint16Array(p.count*4),weights=new Float32Array(p.count*4);for(let i=0;i<p.count;i++){let best=0,dist=Infinity;for(let j=0;j<source.count;j+=2){const d=(p.getX(i)-source.getX(j))**2+(p.getY(i)-source.getY(j))**2+(p.getZ(i)-source.getZ(j))**2;if(d<dist){dist=d;best=j;}}for(let k=0;k<4;k++){indices[i*4+k]=si.array[best*4+k];weights[i*4+k]=sw.array[best*4+k];}}sleeveWeights.set(key,{indices:indices.slice(),weights:weights.slice()});geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));return geo;}
 if(a.skirtModel){pants.color.copy(cloth.color);pants.map=cloth.map;}
 if(a.print){cloth.map=ankaraMap();cloth.color.set('#ffffff');pants.color.set(a.shirt);}
 if(a.skirtModel){
  const profiles={day:[[.275,.58],[.265,.73],[.23,.97],[.175,1.12]],evening:[[.285,.15],[.28,.40],[.26,.65],[.245,.84],[.175,1.1]],ankara:[[.38,.42],[.36,.64],[.29,.87],[.175,1.12]],iro:[[.225,.36],[.23,.52],[.235,.68],[.235,.84],[.215,.98],[.175,1.1]],agbada:[[.41,.62],[.42,.86],[.38,1.17],[.33,1.4],[.15,1.5]],senator:[[.215,.68],[.22,.82],[.215,.96],[.205,1.11],[.19,1.24]]},profile=profiles[a.skirtModel]||profiles.day;
  const depth=['iro','senator'].includes(a.skirtModel)?.72:.9;
  const rings=[];for(let n=0;n<profile.length-1;n++){const a=profile[n],b=profile[n+1];for(let j=0;j<3;j++){const f=j/3;rings.push(new T.Vector2(T.MathUtils.lerp(a[0],b[0],f),T.MathUtils.lerp(a[1],b[1],f)+dy));}}rings.push(new T.Vector2(profile.at(-1)[0],profile.at(-1)[1]+dy));
  const geo=new T.LatheGeometry(rings,40),p=geo.attributes.position,indices=new Uint16Array(p.count*4),weights=new Float32Array(p.count*4),bones=body.skeleton.bones,hip=bones.findIndex(b=>b.name==='pelvis'),left=bones.findIndex(b=>b.name==='thigh_l'),right=bones.findIndex(b=>b.name==='thigh_r'),spine=bones.findIndex(b=>b.name==='spine_03');
  for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i)*depth;const angle=Math.atan2(z/depth,x),pleat=['day','ankara'].includes(a.skirtModel)?Math.cos(angle*16)*.012*Math.max(0,(1.12+dy-y)/.7):0;x+=Math.cos(angle)*pleat;z+=Math.sin(angle)*pleat*.9;p.setXYZ(i,x,y,z);const leg=.38*Math.max(0,Math.min(1,(1.08+dy-y)/.45)),upper=Math.max(0,Math.min(1,(y-dy-1.08)/.3));
   if(upper>0){indices.set([hip,spine,0,0],i*4);weights.set([1-upper,upper,0,0],i*4);}else{indices.set([hip,left,right,0],i*4);const side=T.MathUtils.clamp(x/.22,-1,1),split=.12*side;weights.set([1-leg,leg*(.5+split),leg*(.5-split),0],i*4);}}
  // One continuous hem follows the averaged thighs, never opposite calves.
  // This avoids the deep split/pinching caused by per-side trouser weights.

  geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));geo.computeVertexNormals();const skirt=bind(geo);skirt.material=own(cloth.clone());skirt.material.side=T.DoubleSide;skirt.userData.clothBase=p.array.slice();skirt.userData.clothTop=profile.at(-1)[1]+dy;skirt.userData.clothHem=profile[0][1]+dy;
  if(a.skirtModel==='iro'){const wrap=mesh(new T.BoxGeometry(.025,.31,.015),gold,-.15,.88+dy,.205);attach('pelvis',wrap);}
 }
 if(a.topModel==='blazer')for(const side of [-1,1]){const lapel=mesh(new T.BoxGeometry(.085,.23,.018),cloth,side*.075,1.37+dy,frontAt(1.37+dy,side*.075)+.025);lapel.rotation.z=side*.3;attach('spine_03',lapel);for(let y=1.12;y<1.35;y+=.1)attach('spine_03',mesh(new T.SphereGeometry(.006,8,6),gold,side*.025,y+dy,frontAt(y+dy)+.018));}
 if(['wrap','buba'].includes(a.topModel)){attach('spine_03',tube([[-.14,1.44+dy,frontAt(1.44+dy,-.14)+.025],[0,1.24+dy,frontAt(1.24+dy)+.035],[.13,1.07+dy,frontAt(1.07+dy,.13)+.025]],.008,gold,20));const bow=mesh(new T.TorusGeometry(.025,.006,6,16),cloth,.15,1.08+dy,.13);bow.scale.x=1.6;attach('pelvis',bow);}
 if(a.topModel==='agbada')for(const side of [-1,1]){const geo=new T.CylinderGeometry(.12,.15,.35,14,5,true);geo.rotateZ(Math.PI/2);geo.translate(side*.37,1.35+dy,0);const sleeve=bind(skinNearest(geo));sleeve.material=own(cloth.clone());sleeve.material.side=T.DoubleSide;}
 if(['track','senator','agbada'].includes(a.topModel)){const collar=mesh(new T.CylinderGeometry(.066,.075,.065,18,1,true),cloth,0,1.48+dy,0);collar.material=own(cloth.clone());collar.material.side=T.DoubleSide;attach('spine_03',collar);for(const side of [-1,1])attach('spine_03',tube([[side*.07,1.43+dy,frontAt(1.43+dy,side*.07)+.025],[side*.07,1.18+dy,frontAt(1.18+dy,side*.07)+.025]],.006,a.topModel==='track'?sole:gold,14));}
 if(a.topModel==='agbada'){for(const side of [-1,1])attach('spine_03',tube([[side*.045,1.46+dy,.21],[side*.08,1.35+dy,.325],[side*.08,1.18+dy,.355]],.006,gold,20));for(let i=0;i<3;i++)attach('spine_03',tube([[0,1.39+dy-i*.065,.30+i*.02],[.035,1.36+dy-i*.065,.315+i*.02],[0,1.33+dy-i*.065,.33+i*.02],[-.035,1.36+dy-i*.065,.315+i*.02],[0,1.39+dy-i*.065,.30+i*.02]],.004,gold,12));}
 if(a.shoeModel&&a.shoeModel!=='trainers')for(const side of [-1,1]){const x=side*(female?.124:.125),bone=side<0?'foot_r':'foot_l';if(a.shoeModel==='boots'){const shaft=mesh(new T.CylinderGeometry(.068,.073,.2,14),shoe,x,.17,-.025);attach(bone,shaft);attach(bone,mesh(new T.BoxGeometry(.026,.07,.018),shoe,x,.27,-.087));}else{const vamp=mesh(new T.SphereGeometry(1,16,10),shoe,x,.058,.012);vamp.scale.set(.067,.04,.145);attach(bone,vamp);attach(bone,mesh(new T.BoxGeometry(.112,.018,.035),gold,x,.103,.035));}}
 if(a.headwear){const clothCap=material(a.headwearColour||'#b78d5d',{roughness:.92});clothCap.userData.headwear=true;if(a.headwear==='fila'){const hat=mesh(new T.CylinderGeometry(.105,.12,.13,24),clothCap,0,top+.015,-.025);hat.rotation.z=.17;attach('Head',hat);const band=mesh(new T.TorusGeometry(.114,.009,8,28),gold,0,top-.044,-.025);band.rotation.x=Math.PI/2;attach('Head',band);}else{const fan=mesh(new T.SphereGeometry(1,24,16),clothCap,0,top+.12,-.1);fan.scale.set(.17,.195,.035);attach('Head',fan);const base=mesh(new T.SphereGeometry(1,20,12),clothCap,0,top-.028,-.028);base.scale.set(.113,.09,.105);attach('Head',base);for(let i=0;i<9;i++){const fold=mesh(new T.TorusGeometry(.09+i*.008,.009,6,30,Math.PI*1.5),clothCap,0,top+.06,-.07-i*.006);fold.rotation.z=-.8+i*.09;fold.scale.y=1.05+i*.045;attach('Head',fold);}}}
}
