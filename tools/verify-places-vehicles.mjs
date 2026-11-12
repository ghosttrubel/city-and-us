import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {buildVenueInterior} from '../dist/interior.js';
import {PLACE_STATIONS} from '../dist/place-interiors.js';
import {buildDanfo} from '../dist/danfo.js';
import {buildStreet} from '../dist/street.js';
import {ROOM_EXIT,moveColliding,blocked,STREET_BOUNDS} from '../dist/neighbourhood.js';
import {createNavigator,routeLength} from '../dist/navigation.js';
import {appearanceDefaults} from '../dist/character.js';
import {migrate,validSave} from '../dist/life.js';
import * as D from '../dist/daily-life.js';
import {transportLine,provisionsLine} from '../dist/place-dialogue.js';
const ctx=new Proxy({measureText:s=>({width:s.length*8}),createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
globalThis.document={createElement:()=>({width:512,height:512,getContext:()=>ctx})};
const report={scope:'Actual meshes, collision navigation and save/state functions. Not browser pixels or measured device performance.',rooms:{},rides:[],status:'passed'};
for(const kind of ['shop','dispatch']){
 const v=buildVenueInterior(kind),navigator=createNavigator(v.getColliders(),v.bounds),routes={};
 for(const [id,point] of Object.entries(PLACE_STATIONS[kind])){
  for(const [start,end] of [[ROOM_EXIT,point],[point,ROOM_EXIT]]){
   const route=navigator.route(start,end);assert(route.length>1,kind+' route '+id);let p={...start};
   for(const target of route.slice(1)){for(let i=0;i<2000&&Math.hypot(p.x-target.x,p.z-target.z)>.02;i++){const dx=target.x-p.x,dz=target.z-p.z,len=Math.hypot(dx,dz),step=Math.min(.06,len);p=moveColliding(p,dx/len*step,dz/len*step,v.getColliders(),v.bounds);}assert(Math.hypot(p.x-target.x,p.z-target.z)<.025,'Blocked '+kind+' '+id);}
   routes[id]=route;
  }
 }
 let meshes=0,triangles=0;v.room.traverse(m=>{if(!m.isMesh)return;meshes++;triangles+=(m.geometry.index?.count||m.geometry.attributes.position.count)/3;assert([...m.geometry.attributes.position.array].every(Number.isFinite));});
 assert(meshes<150,kind+' draw-call budget '+meshes);assert(triangles<70000,kind+' triangle budget '+triangles);
 report.rooms[kind]={meshes,triangles,routes};
}
const van=buildDanfo();van.update(.05,'waiting',false);assert(van.door.position.z<0);van.update(.05,'travelling',false);assert.equal(van.door.position.z,.4);assert(van.wheels.every(w=>w.rotation.x>0));
let vanTriangles=0,vanMeshes=0;van.root.traverse(m=>{if(m.isMesh){vanMeshes++;vanTriangles+=(m.geometry.index?.count||m.geometry.attributes.position.count)/3;}});assert(vanTriangles<25000);assert(vanMeshes<65);report.vehicle={meshes:vanMeshes,triangles:vanTriangles};
const world=buildStreet(),navigation=createNavigator(world.obstacles),routes=D.makeDailyRoutes(navigation);
const seed={...appearanceDefaults,name:'Places QA',location:'city',money:15000,food:85,energy:95,mood:80,time:480,day:1,x:0,z:6,rentDay:1,skills:{trader:0,rider:0,chef:0}};
const fresh=()=>migrate(seed,seed,'LS-0123456789ABCDEF');
const reload=s=>{assert(validSave({version:1,data:s}),'Invalid save at '+s.daily.ride?.status);const v=migrate(JSON.parse(JSON.stringify(s)),seed,s.localPlayerId);assert.deepEqual(v,s);return v;};
const until=(s,status)=>{for(let i=0;i<10000&&s.daily.ride.status!==status;i++)D.stepServices(s,.25,routes);assert.equal(s.daily.ride.status,status);};
for(const service of Object.keys(D.RIDE_SERVICES))for(const from of Object.keys(D.RIDE_STOPS))for(const to of Object.keys(D.RIDE_STOPS)){
 if(from===to)continue;let s=fresh();const protectedState=JSON.stringify({wardrobe:s.wardrobe,decor:s.decor,shirt:s.shirt,bottom:s.bottom,skin:s.skin,home:s.home}),q=D.rideQuote(from,to,service);
 const len=routeLength(q.path);for(let at=0;at<=len;at+=.2){const p=D.pathPoint(q.path,at/len);for(const x of [-1.18,1.18])for(const z of [-2.34,2.34])assert(!blocked(p.x+x*Math.cos(p.heading)+z*Math.sin(p.heading),p.z-x*Math.sin(p.heading)+z*Math.cos(p.heading),world.obstacles,STREET_BOUNDS,0),'Danfo footprint intersects static geometry');}
 assert(D.bookRide(s,from,to,0,service).ok);assert(!D.bookRide(s,from,to,0,service).ok);assert.equal(s.money,15000-q.fare);
 s=reload(s);until(s,'waiting');assert(!D.boardRide(s,1,'dispatch',D.RIDE_STOPS[from].curb).ok);assert(!D.boardRide(s,1,'city',{x:100,z:100}).ok);assert(D.boardRide(s,1,'city',D.RIDE_STOPS[from].curb).ok);assert(!D.boardRide(s,1,'city',D.RIDE_STOPS[from].curb).ok);assert(!D.cancelRide(s,1).ok);
 D.stepServices(s,.25,routes);s=reload(s);until(s,'arrived');assert.deepEqual(D.alightRide(s,1).position,D.RIDE_STOPS[to].curb);assert(!D.alightRide(s,1).ok);s=reload(s);assert.equal(s.money,15000-q.fare);assert.equal(s.daily.stats.rides,1);
 assert.equal(JSON.stringify({wardrobe:s.wardrobe,decor:s.decor,shirt:s.shirt,bottom:s.bottom,skin:s.skin,home:s.home}),protectedState);
 report.rides.push({service,from,to,fare:q.fare});
}
for(const stage of ['dispatching','waiting']){const s=fresh();D.bookRide(s,'home','shop',0,'danfo');if(stage==='waiting')until(s,'waiting');assert(D.cancelRide(s,1).ok);assert(!D.cancelRide(s,1).ok);assert.equal(s.money,15000);reload(s);}
let s=fresh();s.money=0;assert(!D.bookRide(s,'home','shop',0,'danfo').ok);assert.equal(s.daily.ride,null);s=fresh();assert(!D.bookRide(s,'home','shop',0,'spaceship').ok);
D.bookRide(s,'home','shop',0);delete s.daily.ride.service;assert.equal(s.daily.ride.fare,300);reload(s);s.daily.ride.service='danfo';assert(!validSave({version:1,data:s}),'Mismatched stored service/fare accepted');s.daily.ride.service='spaceship';assert(!validSave({version:1,data:s}));
s=fresh();D.bookRide(s,'shop','home',0,'danfo');until(s,'waiting');D.boardRide(s,1,'city',D.RIDE_STOPS.shop.curb);D.stepServices(s,.25,routes);assert(D.requestEarlyStop(s,1).ok);s=reload(s);until(s,'arrived');assert(D.alightRide(s,1).ok);assert.equal(s.daily.ride.status,'ended');assert.equal(s.daily.stats.rides,0);assert.equal(s.money,14875);
assert(transportLine(s).includes('last trip'));assert(provisionsLine({...s,delivery:{id:2,status:'carrying'}}).includes('#2'));
const references=['City_And_Us_Buildings_And_Places/Shops/Neighbourhood_Shops_Exteriors.png','City_And_Us_Buildings_And_Places/Shops/Neighbourhood_Shops_Interiors.png','City_And_Us_Buildings_And_Places/Transport_Hubs/Transport_Hubs_Exteriors.png','City_And_Us_Buildings_And_Places/Transport_Hubs/Transport_Hubs_Interiors.png','City_And_Us_Transport/Lagos_Street_Transport/Lagos_Street_Transport.png'];
report.references=[];for(const file of references){const b=await readFile(new URL('../reference/'+file,import.meta.url));report.references.push({file,sha256:createHash('sha256').update(b).digest('hex')});}
await mkdir(new URL('../qa/places-vehicles/',import.meta.url),{recursive:true});await writeFile(new URL('../qa/places-vehicles/state-geometry.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,rooms:Object.fromEntries(Object.entries(report.rooms).map(([k,v])=>[k,{meshes:v.meshes,triangles:v.triangles}])),vehicle:report.vehicle,rideJourneys:report.rides.length},null,2));
