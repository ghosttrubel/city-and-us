import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {buildStreet} from '../dist/street.js';
import {appearanceDefaults} from '../dist/character.js';
import {migrate,validSave} from '../dist/life.js';
import {migrateStreetLayout,BIKE_RACK} from '../dist/street-layout-state.js';
import {mountBike,dismountBike,stepBike,validBike,bikeClear} from '../dist/dispatch-bike.js';
import {collectDelivery,handOverDelivery,PICKUP,SHOP_COUNTER,ENTRANCES,blocked,STREET_BOUNDS} from '../dist/neighbourhood.js';
import {bookRide,boardRide,rideQuote,RIDE_STOPS} from '../dist/daily-life.js';
import {createNavigator} from '../dist/navigation.js';
const ctx=new Proxy({measureText:s=>({width:s.length*8}),createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
globalThis.document={createElement:()=>({getContext:()=>ctx})};
const world=buildStreet(),nav=createNavigator(world.obstacles);
const seed={...appearanceDefaults,name:'Bike QA',location:'city',money:15000,food:85,energy:95,mood:80,time:480,day:1,x:0,z:6,rentDay:1,skills:{trader:0,rider:0,chef:0}};
const fresh=()=>migrate(seed,seed,'LS-0123456789ABCDEF'),checks=[];
for(const [old,target] of [[{x:12,z:-18.1},{x:16,z:-30.1}],[{x:22,z:19.9},{x:34,z:18.9}],[{x:28,z:34},{x:40,z:42}]]){
 const s=migrate({...seed,...old},seed,'LS-0123456789ABCDEF');assert(Math.hypot(s.x-target.x,s.z-target.z)<.001);const twice=migrate(s,seed,s.localPlayerId);assert.deepEqual(twice,s);assert(validSave({version:1,data:s}));
}
for(const old of [{x:34,z:-33},{x:38,z:4},{x:17,z:37},{x:40,z:33}]){const s=migrate({...seed,...old},seed,'LS-0123456789ABCDEF');assert(!blocked(s.x,s.z,world.obstacles,STREET_BOUNDS),'Legacy position trapped');}
for(const status of ['dispatching','waiting','travelling','arrived']){
 const old=fresh();delete old.streetLayoutVersion;bookRide(old,'dispatch','shop',0,'danfo');Object.assign(old.daily.ride,{status,progress:status==='waiting'||status==='arrived'?1:.4,path:[{x:1.8,z:-18},{x:1.8,z:23}]});const before={id:old.daily.ride.id,fare:old.daily.ride.fare,money:old.money};
 const s=migrate(old,seed,old.localPlayerId);assert.equal(s.daily.ride.status,status);assert.equal(s.daily.ride.progress,old.daily.ride.progress);assert.equal(s.money,before.money);assert.equal(s.daily.ride.fare,before.fare);assert.equal(s.daily.ride.id,before.id);assert(validSave({version:1,data:s}));
}
checks.push('Legacy Dispatch, shop and park coordinates migrate once; newly occupied footprints escape safely; all four active passenger states retain money, fare, ID and progress.');
for(const id of Object.keys(RIDE_STOPS)){const r=nav.route(RIDE_STOPS[id].curb,ENTRANCES[id].outside);assert(r.length>=2);for(let i=1;i<r.length;i++)assert(nav.segment(r[i-1],r[i]));}
let s=fresh();assert(!mountBike(s,'city',BIKE_RACK).ok);assert(collectDelivery(s,'dispatch',PICKUP));assert(!mountBike(s,'dispatch',BIKE_RACK).ok);assert(mountBike(s,'city',BIKE_RACK).ok);
const protectedState=JSON.stringify({money:s.money,wardrobe:s.wardrobe,decor:s.decor,skin:s.skin,shirt:s.shirt});
assert(!bookRide(s,'dispatch','shop',0,'danfo').ok);assert(!handOverDelivery(s,'shop',SHOP_COUNTER));
for(let i=0;i<30;i++)stepBike(s,{x:0,z:1},.05,world.obstacles);
assert(s.dispatchBike.speed>0);assert(!dismountBike(s,world.obstacles).ok);
const reload=migrate(JSON.parse(JSON.stringify(s)),seed,s.localPlayerId);assert.equal(reload.dispatchBike.mode,'mounted');assert.equal(reload.dispatchBike.speed,0);assert.equal(reload.dispatchBike.distance,s.dispatchBike.distance);
for(let i=0;i<30;i++)stepBike(s,{x:0,z:0},.05,world.obstacles);
assert.equal(s.dispatchBike.speed,0);assert(dismountBike(s,world.obstacles).ok);assert(validBike(s));
assert.equal(JSON.stringify({money:s.money,wardrobe:s.wardrobe,decor:s.decor,skin:s.skin,shirt:s.shirt}),protectedState);
s=fresh();collectDelivery(s,'dispatch',PICKUP);mountBike(s,'city',BIKE_RACK);s.dispatchBike.x=0;s.dispatchBike.z=0;s.dispatchBike.heading=0;
const wall=[{x:0,z:4,w:20,d:1}];for(let i=0;i<300;i++)stepBike(s,{x:0,z:1},.05,wall);assert(s.dispatchBike.z<2.31);assert(bikeClear(s.dispatchBike.x,s.dispatchBike.z,s.dispatchBike.heading,wall));
assert(!dismountBike(s,[{x:0,z:s.dispatchBike.z,w:10,d:10}]).ok);
checks.push('Bike requires a parcel, city location and no passenger booking; moving dismount and mounted handover denied; reload brakes; wall collision cannot tunnel; blocked dismount keeps rider mounted.');
const checkpoint=new URL('../checkpoints/2026-11-08-before-places-batch-2/',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('manifest.json',checkpoint),'utf8'));
const records=manifest.files||manifest;
assert(Array.isArray(records));
const protectedNames=['dist/character.js','dist/fashion-catalogue.js','dist/wardrobe-state.js','dist/wardrobe-garments.js','dist/home-life.js','dist/home-interior.js','dist/decor-state.js','dist/decor-ui.js','dist/place-interiors.js','dist/place-facades.js','.openai/hosting.json'];
let protectedFiles=0;
for(const entry of records){const file=entry.file||entry.path;if(protectedNames.includes(file)||file.startsWith('reference/')||file.startsWith('dist/assets/characters/')||file.startsWith('dist/assets/garments/')||file.startsWith('art/blender/')){const bytes=await readFile(new URL('../'+file,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256,file);protectedFiles++;}}
for(const file of ['README.md','ROADMAP.md','docs/OWNER_REQUIREMENTS.md']){const old=await readFile(new URL(file,checkpoint),'utf8'),now=await readFile(new URL('../'+file,import.meta.url),'utf8');assert(now.replace(/\r\n/g,'\n').includes(old.replace(/\r\n/g,'\n')),file+' history lost');}
checks.push('Approved Provisions visual modules, character/outfit sources and references, property/colour modules and hosting identity unchanged; full prior roadmap retained.');
await writeFile(new URL('../qa/places-vehicles-2/state-preservation.json',import.meta.url),JSON.stringify({status:'passed',protectedFiles,checks},null,2));console.log(JSON.stringify({status:'passed',protectedFiles,checks},null,2));
