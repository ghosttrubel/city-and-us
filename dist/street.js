import * as T from './vendor/three.module.js';
import {buildPlaceFacade} from './place-facades.js';
import {BUILDINGS,KIOSKS,ROADS,ENTRANCES,DISTRICTS,CONNECTIONS} from './neighbourhood.js';
import {mergeGeometries} from './vendor/addons/BufferGeometryUtils.js';

export function streetGroundHeight(x,z){
 if(x>=33&&x<=47&&z>=29.5&&z<=42.5)return .18;
 if((x>=5&&x<=23&&z>=-32&&z<=-26)||(x>=20&&x<=42&&z>=17.8&&z<=20.5))return .17;
 if(x>=0&&x<=42&&z>=20.5&&z<=27.5)return .105;
 if(x>=2.8&&x<=5.6&&((z>=11&&z<=17)||(z>=-35&&z<=-29)))return .09;
 if(z< -40||x>36){if(CONNECTIONS.some(c=>Math.abs(x-c.x)<=c.w/2&&Math.abs(z-c.z)<=c.d/2))return .1;const d=DISTRICTS.find(d=>d.id!=='surulere'&&x>=d.bounds.minX&&x<=d.bounds.maxX&&z>=d.bounds.minZ&&z<=d.bounds.maxZ);if(d){if(Object.values(ENTRANCES).some(e=>Math.abs(x-e.x)<1.1&&z>e.z-.3&&z<e.z+1.8))return .16;const roads=ROADS.filter(r=>r.district===d.id);if(d.id==='island'&&x>=121&&x<=125&&z>=-38&&z<=30)return .18;if(roads.some(r=>r.d>r.w?Math.abs(x-r.x)>=r.w/2&&Math.abs(x-r.x)<=r.w/2+2.8&&Math.abs(z-r.z)<=r.d/2:Math.abs(x-r.x)<=r.w/2&&Math.abs(z-r.z)>=r.d/2&&Math.abs(z-r.z)<=r.d/2+2.8))return .16;if(roads.some(r=>Math.abs(x-r.x)<r.w/2&&Math.abs(z-r.z)<r.d/2))return .1;return .09;}}

 if(Object.values(ENTRANCES).some(e=>Math.abs(x-e.x)<1.1&&z>e.z-.3&&z<e.z+1.8))return .16;
 if((x>=8&&x<=16&&z>=11&&z<=17)||(x>=-25&&x<=-10&&z>=-5.5&&z<=1))return .17;

 if(Math.abs(Math.abs(x)-5.15)<.13&&(z< -14.7||z> -5.3)&&!(x>0&&((z>10&&z<18)||(z>-36&&z<-28)||(z>19&&z<29))))return .245;
 if((Math.abs(x)>=5.15&&Math.abs(x)<=8.85&&Math.abs(z)<48)||(Math.abs(x)<36&&(Math.abs(z+15.7)<1.5||Math.abs(z+4.3)<1.5)))return .17;
 if(Math.abs(x)<5||Math.abs(z+10)<4)return .085;
 return -.105;
}

// Original, locally authored street geometry and texture maps.
// Dimensions are metres; static geometry is batched by material for mobile GPUs.
export function buildStreet(){
 const city=new T.Group(),obstacles=[],traffic=[],npcs=[],materials=new Map(),textures=new Map();
 let seed=7319;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 function texture(type){
  if(textures.has(type))return textures.get(type);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d');
  c.fillStyle=type==='asphalt'?'#878d91':type==='paving'?'#eee9db':'#e9e6de';c.fillRect(0,0,512,512);
  for(let i=0;i<16000;i++){const n=Math.floor(100+rand()*145);c.fillStyle='rgba('+n+','+n+','+n+','+(type==='asphalt'?.38:.18)+')';c.fillRect(rand()*512,rand()*512,rand()*2+1,rand()*2+1)}
  if(type==='paving'){c.strokeStyle='#777e82aa';c.lineWidth=3;for(let y=0;y<=512;y+=64){c.beginPath();c.moveTo(0,y);c.lineTo(512,y);c.stroke();for(let x=(y%128?0:32);x<512;x+=128)c.strokeRect(x,y,128,64)}}
  if(type==='plaster'){for(let i=0;i<70;i++){c.fillStyle='#82796e0b';c.beginPath();c.ellipse(rand()*512,rand()*512,8+rand()*30,4+rand()*80,0,0,Math.PI*2);c.fill()}}
  if(type==='wood'){for(let x=0;x<512;x+=12){c.strokeStyle='#8c807535';c.beginPath();c.moveTo(x,0);c.bezierCurveTo(x+12,130,x-8,350,x+3,512);c.stroke()}}
  const t=new T.CanvasTexture(canvas);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;
  t.repeat.set(type==='asphalt'?6:2,type==='asphalt'?25:2);t.anisotropy=2;textures.set(type,t);return t;
 }
 const palettes={
  plaster:['#e5ebed','#d0dde3','#9bb4be','#adbcc8','#71929e'],
  wood:['#a2b3bd','#536a79'],
  paving:['#d4d8d3'],
  asphalt:['#35434b'],
  plain:['#e9eff1','#c2cdd4','#92a5b0','#607984','#354e5c','#253640','#7f9eaa','#a9b8c0','#5c7480','#acc2c9','#c5b581','#9d7371','#b1a79a','#6d9388','#56838b','#f2f5f5','#a9c5c8']
 };
 const paletteColors=new Map(Object.entries(palettes).map(([key,values])=>[key,values.map(hex=>({hex,color:new T.Color(hex)}))]));
 function paletteColor(value,type){const input=new T.Color(value),choices=paletteColors.get(type||'plain');let best=choices[0],distance=Infinity;for(const choice of choices){const c=choice.color,d=(c.r-input.r)**2+(c.g-input.g)**2+(c.b-input.b)**2;if(d<distance){best=choice;distance=d}}return best.hex}
 function mat(color,type='',metal=0){
  color=paletteColor(color,type);
  const key=[color,type,metal].join('|');
  if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,map:type?texture(type):null,roughness:metal?.48:type==='asphalt'?.97:type==='paving'?.87:.91,metalness:metal}));
  return materials.get(key);
 }
 function mesh(geo,color,x=0,y=0,z=0,parent=city,type='',cast=true){
  const m=new T.Mesh(geo,typeof color==='string'?mat(color,type):color);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;parent.add(m);return m;
 }
 function box(w,h,d,c,x=0,y=0,z=0,parent=city,type='',cast=true){return mesh(new T.BoxGeometry(w,h,d),c,x,y,z,parent,type,cast)}
 function cyl(r,h,c,x,y,z,parent=city,r2=r,segments=10){return mesh(new T.CylinderGeometry(r2,r,h,segments),c,x,y,z,parent)}
 function sphere(r,c,x,y,z,parent=city){return mesh(new T.SphereGeometry(r,10,7),c,x,y,z,parent)}
 function line(points,r,c,parent=city){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),12,r,5,false),c,0,0,0,parent)}
 // One sign atlas, one draw call after batching.
 const atlas=document.createElement('canvas');atlas.width=1024;atlas.height=1024;const ac=atlas.getContext('2d'),at=new T.CanvasTexture(atlas);at.colorSpace=T.SRGBColorSpace;
 const signMat=new T.MeshStandardMaterial({map:at,roughness:.83});let signIndex=0;
 function sign(title,sub,x,y,z,w=4,bg='#244d43',rotation=0,parent=city){
  const i=signIndex++,sx=i%2*512,sy=Math.floor(i/2)*128;
  ac.fillStyle=bg;ac.fillRect(sx,sy,512,128);ac.strokeStyle='#f5e8c0';ac.lineWidth=2;ac.strokeRect(sx+8,sy+8,496,112);
  ac.fillStyle='#fff3d3';ac.textAlign='center';ac.font='bold 39px Arial';ac.fillText(title,sx+256,sy+56,475);ac.font='17px Arial';ac.fillText(sub,sx+256,sy+93,470);
  const geo=new T.PlaneGeometry(w,w/4),uv=geo.getAttribute('uv');
  for(let v=0;v<uv.count;v++)uv.setXY(v,(sx+uv.getX(v)*512)/1024,1-(sy+(1-uv.getY(v))*128)/1024);
  const m=mesh(geo,signMat,x,y,z,parent,'',false);m.rotation.y=rotation;return m;
 }
 // Road, broad pavements, open drains and black/white Lagos curbs.
 box(96,.16,96,'#afab91',4,-.2,0,city,'plaster',false);
 for(const r of ROADS.filter(r=>r.district==='surulere'))box(r.w,.14,r.d,'#414645',r.x,r.d>r.w?-.01:.001,r.z,city,'asphalt',false);
 for(const x of [-7,7])box(3.7,.25,96,'#d1c4a8',x,.035,0,city,'paving',false);
 for(const z of [-15.7,-4.3])box(72,.25,3,'#d1c4a8',0,.035,z,city,'paving',false);
 for(const x of [-5.15,5.15])for(let z=-47;z<48;z+=1.3)if((z<-14.7||z>-5.3)&&!(x>0&&((z>10&&z<18)||(z>-36&&z<-28)||(z>19&&z<29)))){box(.25,.27,1.25,Math.round(z/1.3)%2?'#e0d6ba':'#3e4842',x,.1,z,city,'',false);box(.18,.035,1.23,'#3b4037',x+Math.sign(x)*.34,.18,z,city,'',false)}
 for(const z of [-14.2,-5.8])for(let x=-35;x<36;x+=1.3)if(Math.abs(x)>5.7)box(1.25,.27,.25,Math.round(x/1.3)%2?'#e0d6ba':'#3e4842',x,.1,z,city,'',false);
 for(let z=-46;z<46;z+=4.8)if(z<-16||z>-3)box(.1,.012,2,'#d7cda7',0,.08,z,city,'',false);
 for(let x=-34;x<34;x+=4.8)if(Math.abs(x)>7)box(2,.012,.1,'#d7cda7',x,.09,-10,city,'',false);
 for(const z of [-15.8,-4.2])for(let x=-4.4;x<4.8;x+=1.15)box(.62,.016,2,'#e4dcc1',x,.09,z,city,'',false);
 for(const x of [-6.3,6.3])for(let z=-12.8;z<-6.5;z+=1.05)box(1.8,.017,.58,'#e4dcc1',x,.1,z,city,'',false);
 for(const x of [-5.52,5.52])for(const z of [-1,8,20]){box(.35,.025,.65,'#4e5149',x,.19,z,city);for(let i=0;i<6;i++)box(.34,.02,.025,'#a49d85',x,.21,z-.27+i*.1,city,'',false)}
 // Separate passenger lay-bys, dispatch forecourt and shop access pavement.
 for(const z of [14,-32]){box(2.8,.15,7,'#414645',4.2,.015,z,city,'asphalt',false);box(.12,.012,5,'#d7cda7',5.5,.1,z,city,'',false);}
 box(18,.25,6,'#d1c4a8',14,.035,-29,city,'paving',false);
 box(22,.25,2.7,'#d1c4a8',31,.035,19.15,city,'paving',false);
 box(42,.16,7,'#414645',21,.025,24,city,'asphalt',false);
 for(let x=10;x<40;x+=5)box(2,.012,.1,'#d7cda7',x,.115,24,city,'',false);
 box(3,.014,.12,'#d7cda7',32,.12,20.65,city,'',false);
 // Slightly worn painted lane markings and manhole covers.
 for(const z of [6,27,-26]){const cover=cyl(.38,.012,'#55594e',2.2,.085,z);for(let i=-2;i<=2;i++)box(.55,.014,.025,'#707164',2.2,.1,z+i*.1,city,'',false);cover.castShadow=false}
 function window(parent,x,y,z,w=.95,h=1.05,rotation=0){
  const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rotation;parent.add(g);
  box(w+.15,h+.16,.095,'#d8ceb6',0,0,0,g);
  box(w,h,.11,'#334f50',0,0,.035,g);
  box(w*.43,h*.88,.02,'#6a9592',-w*.23,.01,.101,g,'',false);
  box(.035,h,.04,'#d7c9a8',0,0,.12,g);
  box(w,.035,.04,'#d7c9a8',0,0,.12,g);
  box(w+.22,.09,.22,'#9c8e77',0,-h/2-.09,.06,g);
 }
 function building(x,z,w,d,h,color,title){
  if(title==='Dispatch hub'){const g=buildPlaceFacade('dispatch',w,d,h);g.position.set(x,0,z);city.add(g);obstacles.push({x,z,w:w+.6,d:d+.6});return {x,z:z+d/2+1.5,name:title,group:g};}
  const g=new T.Group();g.position.set(x,0,z);city.add(g);
  const hasDoor=Object.values(ENTRANCES).some(e=>Math.abs(e.x-x)<.1&&Math.abs(e.z-z-d/2)<.4);
  function shell(width,height,depth,c){if(!hasDoor){box(width,height,depth,c,0,height/2,0,g,'plaster');return;}const jamb=(width-1.45)/2;for(const side of [-1,1])box(jamb,height,depth,c,side*(width+1.45)/4,height/2,0,g,'plaster');if(height>2.65)box(1.45,height-2.65,depth,c,0,(height+2.65)/2,0,g,'plaster');box(1.45,Math.min(height,2.65),depth-.75,c,0,Math.min(height,2.65)/2,-.375,g,'plaster');}
  shell(w,h,d,color);if(hasDoor){for(const side of [-1,1])box((w+.22-1.45)/2,.23,d+.22,'#e1c8a1',side*(w+.22+1.45)/4,.32,0,g,'plaster');box(1.45,.12,.8,'#d1c4a8',0,.1,d/2+.2,g,'paving');}else box(w+.22,.23,d+.22,'#e1c8a1',0,.32,0,g,'plaster');
  const low=2.65;shell(w+.03,low,d+.03,x<0?'#658e79':z>0?'#cb8d6a':'#a7bfa1');
  box(w+.25,.2,d+.25,'#ddc5a3',0,low+.08,0,g);box(w+.35,.24,d+.35,'#b69878',0,h+.1,0,g);
  box(w+.12,.32,d+.12,'#bb9b7a',0,h+.37,0,g,'plaster');
  box(w-.5,.06,d-.5,'#9c8c75',0,h+.25,0,g,'',false);
  for(let y=3.8;y<h-.3;y+=2.2)for(let xx=-w/2+1;xx<w/2-.5;xx+=1.65)window(g,xx,y,d/2+.055);
  for(const side of [-1,1])for(let y=3.8;y<h-.3;y+=2.2)for(let zz=-d/2+1;zz<d/2-.5;zz+=1.9)window(g,side*(w/2+.055),y,zz,.9,1.05,side*Math.PI/2);
  for(const xx of [-w/2+.25,w/2-.25])box(.25,h,.2,'#d7bf99',xx,h/2,d/2+.1,g);
  // Ground-floor shutters with ribs, a timber door and painted lintels.
  for(const xx of [-w*.29,w*.29]){
   box(w*.31,1.95,.09,'#829183',xx,1.2,d/2+.07,g);
   for(let y=.3;y<2.13;y+=.15)box(w*.31,.025,.025,'#61796e',xx,y,d/2+.13,g);
  }
  box(1.35,2.5,.09,'#202e2a',0,1.38,d/2+(hasDoor?-.65:.14),g);
  // Balconies, louvres, air conditioner, rooftop tank and antenna.
  if(h>5){box(w*.69,.16,.85,'#ceb99a',0,3.05,d/2+.34,g);for(let xx=-w*.33;xx<w*.34;xx+=.28)box(.035,.7,.035,'#355c55',xx,3.5,d/2+.71,g);box(w*.69,.045,.045,'#355c55',0,3.87,d/2+.71,g)}
  box(1,.52,.42,'#d7d0b9',w/2-.75,2.95,d/2+.23,g);cyl(.18,.025,'#848d81',w/2-.75,2.95,d/2+.46,g).rotation.x=Math.PI/2;
  for(const dx of [-.5,.5])cyl(.045,.8,'#6c7063',-w*.23+dx,h+.7,-d*.18,g);
  cyl(.68,1.02,'#3c4840',-w*.23,h+1.5,-d*.18,g,.6,14);cyl(.63,.08,'#4a574d',-w*.23,h+2.05,-d*.18,g);
  cyl(.025,2.1,'#4d5c52',w*.3,h+1.2,-d*.25,g);box(.9,.03,.03,'#4d5c52',w*.3,h+2.1,-d*.25,g);
  obstacles.push({x,z,w:w+.6,d:d+.6});
  return {x,z:z+d/2+1.5,name:title,group:g};
 }
 const buildings=Object.fromEntries(BUILDINGS.filter(b=>b.district==='surulere').map(b=>[b.id,building(b.x,b.z,b.w,b.d,b.h,b.color,b.name)]));
 const {home,food,dispatch,clinic}=buildings;
 sign('MAMA T’S BUKA','JOLLOF · BEANS · PLANTAIN',12,3.65,11.64,6,'#356671');
 sign('SURULERE HOUSE','12 BODE THOMAS STREET',-12,3.5,10.65,6,'#244f46');
 // The reference terminal carries its own Dispatch & local rides sign.
 sign('SURULERE CLINIC','COMMUNITY HEALTH CENTRE',-27,2.43,31.16,7,'#376c65');
 sign('TODAY’S POTS','JOLLOF · BEANS & PLANTAIN',14.6,1.5,11.7,2.1,'#355b4c');
 sign('MAMA T’S','CHOP FIRST. HUSTLE LATER.',7.94,3.8,8,5.1,'#356671',-Math.PI/2);
 // Fabric canopy over the kitchen terrace, open serving hatch and seating.
 box(8.7,.12,2.9,'#56838b',12,3.3,12.6);for(let i=0;i<8;i++)box(.48,.025,2.9,'#e9eff1',8.45+i*1.02,3.37,12.6);
 for(const x of [8.1,15.9])cyl(.035,2.1,'#53665a',x,1.05,13.5);
 box(2.3,1.2,.08,'#354e5c',12,1.38,11.68);box(2.65,.13,.7,'#e9eff1',12,.88,12.02,city);box(2.5,.58,.08,'#56838b',12,.52,12.32);for(const x of [10.85,13.15])cyl(.035,.7,'#354e5c',x,.52,12.02);
 // Buka display and wash-up zones flank the working board and cooking pot.
 for(const x of [10.7,13.3]){box(.54,.05,.46,'#92a5b0',x,1.58,11.9);for(let i=0;i<4;i++)cyl(.18,.035,'#f2f5f5',x,1.62+i*.038,11.9,city,.18,16);}
 box(1.25,.65,.04,'#354e5c',14.45,1.75,11.72);sign('ORDER · COLLECT','PLEASE QUEUE HERE',14.45,1.77,11.76,1.2,'#354e5c');
 box(.7,.08,.45,'#92a5b0',9.5,1.0,11.95);cyl(.04,.28,'#c2cdd4',9.5,1.16,11.85);
 for(const z of [13.1,16])for(const x of [9.5,14.5]){
  obstacles.push({x,z,w:2.1,d:1.1});cyl(.61,.12,'#a77643',x,.83,z,city,.61,16);cyl(.06,.7,'#4f5e50',x,.43,z);
  for(const dx of [-.77,.77]){box(.48,.07,.45,'#538b80',x+dx,.48,z);box(.48,.5,.06,'#538b80',x+dx,.76,z+.2);for(const dz of [-.16,.16])box(.035,.45,.035,'#526253',x+dx,.24,z+dz)}
 }
 box(8,.16,6,'#d1c4a8',12,.075,14,city,'paving',false);box(15,.16,6.5,'#d1c4a8',-17.5,.075,-2.25,city,'paving',false);
 // A compact market with handmade stalls and produce rather than repeated cubes.
 const market={x:-15,z:-4,name:'Balogun corner'};
 sign('BALOGUN CORNER','FRESH PRODUCE · EVERY DAY',-17,3.45,-.4,7,'#94602f');
 for(let i=0;i<4;i++){
  const x=-23+i*3.6,z=-2.4,g=new T.Group();g.position.set(x,0,z);city.add(g);obstacles.push({x,z,w:3.2,d:2.4});
  box(2.9,.12,1.5,'#967043',0,.92,0,g,'wood');box(2.9,.75,.08,'#b28b52',0,.49,.71,g,'wood');
  for(const xx of [-1.3,1.3])cyl(.035,2.6,'#6b6b50',xx,1.4,.5,g);
  const roof=box(3.3,.055,2.4,['#b66e40','#578372','#c39b49','#467b82'][i],0,2.7,-.1,g);roof.rotation.x=.08;
  for(let j=0;j<6;j++){const stripe=box(.24,.015,2.4,'#ead6a6',-1.35+j*.54,2.735,-.1,g);stripe.rotation.x=.08}
  for(let bin=0;bin<3;bin++){
   const xx=-.9+bin*.9;box(.78,.12,.78,'#6f633f',xx,1.02,0,g,'wood');
   for(const side of [-1,1])box(.77,.16,.04,'#b38a4c',xx,1.13,side*.37,g);
   for(let j=0;j<12;j++)sphere(.085,['#bb4c30','#c39d40','#69834d'][bin],xx+(j%4-1.5)*.16,1.16+Math.floor(j/4)*.065,(Math.floor(j/4)-1)*.15,g);
  }
  for(let k=0;k<2;k++){box(.7,.45,.65,'#9d7445',1,.4,-1.2-k*.72,g,'wood');for(let y=.25;y<.6;y+=.12)box(.73,.045,.68,'#715b3c',1,y,-1.2-k*.72,g)}
 }
 // Palms with bent fronds and narrow leaves, not spherical crowns.
 const leafMat=mat('#627b44');leafMat.side=T.DoubleSide;
 function palm(x,z,h=4.8){
  line([[x,-.14,z],[x-.15,h*.5,z+.07],[x+.13,h,z]],.115,mat('#998260','wood'));
  for(let i=0;i<7;i++){
   const a=i*Math.PI*2/7,verts=[],uvs=[],idx=[];
   for(let j=0;j<=7;j++){
    const t=j/7,len=t*2.15,yy=h+.4*Math.sin(t*Math.PI)-.8*t*t,w=.28*Math.sin(t*Math.PI);
    for(const side of [-1,1]){verts.push(x+.13+Math.cos(a)*len+Math.sin(a)*w*side,yy,z+Math.sin(a)*len-Math.cos(a)*w*side);uvs.push(t,(side+1)/2)}
    if(j<7){const k=j*2;idx.push(k,k+1,k+2,k+1,k+3,k+2)}
   }
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geo.setIndex(idx);geo.computeVertexNormals();mesh(geo,leafMat);
  }
 }
 for(const [x,z,h] of [[-7,18,5.7],[7,-1,5.5],[-7,-28,5],[7,28,6],[-20,19,5.5],[46,29,6]])palm(x,z,h);
 // Power poles, overhead cables, shaded neighbourhood lamps and street signs.
 for(const x of [-7.9,7.9])for(const z of [-18,20]){
  cyl(.09,6.4,'#8b8771',x,3.2,z,city,.065,10);box(1.3,.12,.1,'#5b6658',x,5.9,z);
  for(const dx of [-.5,.5]){cyl(.075,.16,'#aca78e',x+dx,6.05,z);line([[x+dx,6.1,-18],[x+dx,5.4,1],[x+dx,6.1,20]],.012,'#3a453d')}
 }
 for(const z of [0,19,-30])for(const x of [-6.1,6.1]){
  cyl(.045,3.8,'#344e46',x,1.9,z);line([[x,3.7,z],[x,4,z],[x-Math.sign(x)*.4,4.05,z]],.04,'#344e46');
  box(.52,.08,.24,'#42584b',x-Math.sign(x)*.4,4.03,z);box(.4,.015,.18,'#e9d9a9',x-Math.sign(x)*.4,3.98,z,city,'',false);
 }
 for(const x of [-6,6])for(const z of [-16.8,-3.2]){
  cyl(.055,3.2,'#526455',x,1.6,z);box(.32,.83,.27,'#2f413a',x,2.8,z);
  for(let i=0;i<3;i++){const light=sphere(.07,['#b95539','#c4a751','#7d955d'][i],x,3.04-i*.23,z+.145);light.castShadow=false}
 }
 cyl(.045,3.1,'#536356',-6.3,1.55,-3);sign('BODE THOMAS ST.','SURULERE · LAGOS',-6.3,2.9,-2.94,2.6,'#27564b');
 // Salon and provision kiosks, original local lettering, no advertising brands.
 for(const {id,x,z,color,name:title} of KIOSKS){
  if(['showroom','hair-salon','salon'].includes(id)){const accent=id==='hair-salon'?'#266d68':id==='salon'?'#b78386':'#a98158';for(const side of [-1,1])box(1.275,2.65,3,accent,x+side*1.3625,1.33,z,city,'plaster');box(1.45,2.65,2.25,accent,x,1.33,z-.375,city,'plaster');for(const dx of [-1.35,1.35]){box(1.05,1.65,.09,'#aac9c8',x+dx,1.25,z+1.54);box(1.1,.12,.19,'#eee5d1',x+dx,.4,z+1.56);}box(4.5,.18,3.6,'#eee5d1',x,2.75,z);sign(title,id==='showroom'?'FURNITURE · HOME DELIVERY':id==='salon'?'CLOTHES · ACCESSORIES':'CONSULT · STYLE · CARE',x,3.15,z+1.6,4,accent);obstacles.push({x,z,w:4.5,d:3.5});continue;}
  if(title==='Provisions shop'){const facade=buildPlaceFacade('shop',4,3,3);facade.position.set(x,0,z);city.add(facade);obstacles.push({x,z,w:4.5,d:3.5});continue;}
  const entry=Object.values(ENTRANCES).find(e=>Math.abs(e.x-x)<.1&&Math.abs(e.z-z-1.5)<.4);if(entry){for(const side of [-1,1])box(1.275,2.5,3,color,x+side*1.3625,1.25,z,city,'plaster');box(1.45,2.5,2.25,color,x,1.25,z-.375,city,'plaster');}else box(4,2.5,3,color,x,1.25,z,city,'plaster');box(4.5,.12,3.7,'#8b8b72',x,2.6,z);
  for(let zz=z-1.5;zz<z+1.7;zz+=.24)box(4.4,.025,.065,'#a7a68b',x,2.68,zz);
  box(entry?1.35:2,1.55,.07,'#3e5347',x,1.03,z+(entry?.85:1.55));sign(title,title.includes('Salon')?'BRAIDS · LOCS · FITTINGS':'RICE · BEANS · TOMATOES',x,entry?3.15:2.12,z+1.6,3.75,title.includes('Salon')?'#955c41':'#355b4c');
  // Different shopfront treatments, fitted against the existing facade.
  if(title.includes('Salon')){for(const dx of [-1.5,1.5]){box(.62,1.2,.08,'#9cbaa8',x+dx,1.25,z+1.53);box(.7,.07,.2,'#e0d0ae',x+dx,.61,z+1.62);}}else{for(let row=0;row<2;row++)for(let col=0;col<3;col++)box(.28,.25,.13,['#d6a638','#b65335','#557d62'][col],x-1.45+col*.35,.58+row*.32,z+1.58);}
  obstacles.push({x,z,w:4.5,d:3.5});
 }
 // Bunting over the pedestrian market lane.
 line([[-25,3.9,-.7],[-18,3.25,-.7],[-10,3.9,-.7]],.016,'#6e6a4d');
 for(let i=0;i<17;i++){const x=-24.7+i*.85,y=3.25+.65*Math.pow((x+18)/8,2),geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([x,y,-.7,x+.6,y,-.7,x+.3,y-.6,-.7],3));geo.setAttribute('uv',new T.Float32BufferAttribute([0,1,1,1,.5,0],2));geo.computeVertexNormals();const m=mat(['#c0814e','#587e70','#d6bb72'][i%3]);m.side=T.DoubleSide;mesh(geo,m)}
 // Park remains usable, with shade, seating and a small fountain.
 box(14,.15,13,'#9d9f70',40,.06,36,city,'plaster',false);box(3,.03,13,'#cbbd9d',40,.15,36,city,'paving',false);box(14,.03,1.8,'#cbbd9d',40,.17,36,city,'paving',false);
 for(const x of [36,44]){box(2,.15,.65,'#987c4d',x,.65,36,city,'wood');box(2,.6,.1,'#987c4d',x,1,36.35,city,'wood');for(const off of [-.75,.75])box(.08,.6,.5,'#455b48',x+off,.3,36)}
 cyl(1.5,.5,'#b6a587',40,.38,33,city,1.5,24);cyl(1.3,.03,'#6e9f9a',40,.65,33,city,1.3,24);
 sign('STREET GARDENS','SMALL SMALL, ENJOY LIFE.',40,2,42.6,6,'#4c6744');
 for(const z of [3,20,35])for(const x of [-5.9,5.9]){cyl(.2,.62,'#4e6c57',x,.45,z);cyl(.23,.07,'#b9b39a',x,.79,z)}
 // A recognisable danfo silhouette, doors, glass, stripe, lights, bumpers and wheels.
 function vehicle(danfo=true){
  const g=new T.Group(),paint=danfo?'#d8a837':'#7c9388';
  box(1.64,1.15,3.3,paint,0,.94,0,g);box(1.6,.7,2.55,paint,0,1.8,-.2,g);
  box(1.48,.53,.025,'#395b5c',0,1.82,1.09,g);
  box(1.48,.45,.025,'#395b5c',0,1.81,-1.49,g);
  for(const x of [-.813,.813]){for(const z of [-1.05,-.27,.52])box(.02,.48,.64,'#3e6260',x,1.8,z,g);box(.025,.11,3.13,'#363f34',x,1.12,-.02,g);box(.02,.63,.025,'#a47723',x,1.6,-.67,g);box(.025,.05,.17,'#e0cc91',x,1.38,.85,g)}
  box(1.72,.16,.13,'#647065',0,.44,1.67,g);box(1.72,.16,.13,'#647065',0,.44,-1.67,g);box(.58,.2,.02,'#d5c48d',0,.63,1.66,g);
  for(const x of [-.57,.57]){box(.33,.18,.03,'#e7d9ae',x,.9,1.67,g);box(.2,.24,.03,'#aa573d',x,.86,-1.67,g)}
  for(const x of [-.85,.85])for(const z of [-1.06,1.03]){const wheel=cyl(.31,.17,'#313a33',x,.37,z,g,.31,14);wheel.rotation.z=Math.PI/2;const hub=cyl(.15,.18,'#a7a68e',x,.37,z,g,.15,12);hub.rotation.z=Math.PI/2}
  if(danfo){for(const z of [-1.2,1])box(1.7,.06,.06,'#697361',0,2.22,z,g);for(const x of [-.72,.72])box(.05,.07,2.4,'#697361',x,2.29,-.1,g)}
  return g;
 }
 for(let i=0;i<3;i++){const car=vehicle(i!==2);car.position.set(i%2?2.45:-2.45,0,-27+i*23);car.rotation.y=i%2?0:Math.PI;city.add(car);traffic.push(car)}
 // A parked danfo anchors the market corner and stays clear of the pavement.
 const parked=vehicle();parked.position.set(-3.9,.01,14);parked.rotation.y=.025;city.add(parked);obstacles.push({x:-3.9,z:14,w:1.8,d:3.6});
 sign('YABA · OJUELEGBA','DANFO · MAINLAND',-3.9,1.92,15.69,1.25,'#b49035');
 obstacles.push({x:40,z:33,w:3,d:3},... [36,44].map(x=>({x,z:36,w:2.2,d:1})));at.needsUpdate=true;
 // Batch static meshes; leave moving vehicles and later characters independent.
 function batch(parent,exclude=[]){
  parent.updateMatrixWorld(true);const buckets=new Map(),remove=[];
  parent.traverse(o=>{
   if(!o.isMesh||exclude.some(g=>g===o||g.getObjectById(o.id)))return;
   const geometry=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geometry.applyMatrix4(o.matrixWorld);
   for(const name of Object.keys(geometry.attributes))if(!['position','normal','uv'].includes(name))geometry.deleteAttribute(name);
   const positions=geometry.getAttribute('position'),colors=new Float32Array(positions.count*3);for(let i=0;i<positions.count;i++)o.material.color.toArray(colors,i*3);geometry.setAttribute('color',new T.BufferAttribute(colors,3));
   const cell=parent===city?(new T.Box3().setFromObject(o).max.y>.55?Math.floor(o.matrixWorld.elements[12]/12)+','+Math.floor(o.matrixWorld.elements[14]/12):'ground'):'';
   const key=(o.material.map?.uuid||'plain')+'|'+o.material.side+'|'+o.castShadow+'|'+cell;if(!buckets.has(key))buckets.set(key,{material:o.material.clone(),cast:o.castShadow,list:[]});buckets.get(key).list.push(geometry);remove.push(o);
  });
  for(const o of remove){o.parent.remove(o);o.geometry.dispose()}
  for(const b of buckets.values()){b.material.color.set(0xffffff);b.material.vertexColors=true;const geometry=mergeGeometries(b.list);for(const old of b.list)old.dispose();const m=new T.Mesh(geometry,b.material);m.castShadow=b.cast;m.receiveShadow=true;parent.add(m)}
 }
 // Keep each facade/roof independently cuttable; merge colours into vertex data.
 for(const [id,b] of Object.entries(buildings))b.group.userData.selection={kind:'building',id};
 const structures=Object.values(buildings).map(b=>b.group);
 for(const g of structures){const pos=g.position.clone();g.position.set(0,0,0);batch(g);g.position.copy(pos)}
 batch(city,[...traffic,...structures]);
 for(const car of traffic){const pos=car.position.clone(),rot=car.rotation.clone();car.position.set(0,0,0);car.rotation.set(0,0,0);batch(car);car.position.copy(pos);car.rotation.copy(rot);car.traverse(o=>{if(o.isMesh)o.castShadow=false;o.userData.noCameraFade=true})}
 const doors={};for(const e of Object.values(ENTRANCES).filter(e=>e.district==='surulere')){
  box(2.2,.16,2.1,'#d1c4a8',e.x,.075,e.z+.65,city,'paving',false);
  const hinge=new T.Group();hinge.position.set(e.x-.6,.18,e.z+.03);city.add(hinge);
  box(1.2,2.35,.1,'#705c3f',.6,1.175,0,hinge,'wood');box(.06,.2,.08,'#d6a638',1,1.2,.09,hinge);
  hinge.traverse(o=>{if(o.isMesh)o.userData.dynamicCamera=true});doors[e.id]=hinge;
 }
 // Small contact shadows remain readable with mobile shadow maps disabled.
 const shadeMat=new T.MeshBasicMaterial({color:'#354753',transparent:true,opacity:.16,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
 for(const b of BUILDINGS.filter(b=>b.district==='surulere')){const shade=new T.Mesh(new T.PlaneGeometry(b.w+.7,1.2),shadeMat);shade.rotation.x=-Math.PI/2;shade.position.set(b.x,streetGroundHeight(b.x,b.z+b.d/2+.6)+.014,b.z+b.d/2+.6);shade.userData.noCameraFade=true;city.add(shade);}
 return {city,obstacles,traffic,npcs,home,food,dispatch,market,clinic,materials,textures,doors,footprints:[...BUILDINGS,...KIOSKS],roads:ROADS};

}
