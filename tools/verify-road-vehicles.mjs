import {beginRecipe,collectIngredient} from '../dist/home-life.js';
import {HOME_STATIONS} from '../dist/home-layout.js';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {migrate,validSave} from '../dist/life.js';
import {appearanceDefaults} from '../dist/character.js';
import {buildStreet} from '../dist/street.js';
import {collectDelivery,PICKUP,SHOP_COUNTER,handOverDelivery} from '../dist/neighbourhood.js';
import {bookRide} from '../dist/daily-life.js';
import * as V from '../dist/road-vehicles.js';
import {PRODUCTS,basketChange,quoteBasket,checkout,useProvision} from '../dist/provisions.js';
const context=new Proxy({measureText:s=>({width:s.length*8}),createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
globalThis.document={createElement:()=>({getContext:()=>context})};
const seed={...appearanceDefaults,name:'Road QA',location:'city',money:15000,food:85,energy:95,mood:80,time:480,day:1,x:0,z:6,rentDay:1,skills:{trader:0,rider:0,chef:0}},fresh=()=>migrate(seed,seed,'LS-0123456789ABCDEF'),world=buildStreet(),checks=[];
let s=fresh(),car=s.roadVehicles.vehicles['dispatch-compact'];
assert(!V.drivePermission(s,car));assert(!V.enterRoadVehicle(s,car,'city',car,world.obstacles).ok);assert(!V.rentRoadCar(s,car,0,'city',car).ok,'Progression needed');s.completedDeliveries=1;
assert(V.roadClear(car,car.x,car.z,car.heading,V.vehicleObstacles(s,world.obstacles,car)),'Rental bay obstructed');
assert(V.rentRoadCar(s,car,0,'city',car).ok);assert.equal(s.money,14100);assert(!V.rentRoadCar(s,car,0,'city',car).ok);assert(V.enterRoadVehicle(s,car,'city',car,world.obstacles).ok);assert(!bookRide(s,'dispatch','shop',0,'danfo').ok);
for(let i=0;i<15;i++)V.stepRoadVehicle(s,car,{accelerator:1},.05,V.vehicleObstacles(s,world.obstacles,car));
assert(car.distance>0);assert(!V.exitRoadVehicle(s,car,world.obstacles).ok);const moving=structuredClone(s);assert(validSave({version:1,data:s}));s=migrate(moving,seed,s.localPlayerId);car=s.roadVehicles.vehicles['dispatch-compact'];assert.equal(car.speed,0);assert(V.drivePermission(s,car));assert(V.exitRoadVehicle(s,car,world.obstacles).ok);
checks.push('No free access; earned progression and confirmed single rental charge; mounted passenger booking blocked; drive, stopped exit and rental reload.');
for(const profile of ['compact','bike']){
 const a=fresh();a.completedDeliveries=1;collectDelivery(a,'dispatch',PICKUP);const v=profile==='bike'?a.dispatchBike:a.roadVehicles.vehicles['dispatch-compact'];if(profile==='compact')V.rentRoadCar(a,v,0,'city',v);
 Object.assign(v,{x:0,z:0,heading:0,mode:'mounted',speed:0});const obs=[{x:0,z:7,w:30,d:1}];
 for(let i=0;i<150;i++)V.stepRoadVehicle(a,v,{accelerator:1},.05,obs);assert(V.roadClear(v,v.x,v.z,v.heading,obs));const front=v.z;
 for(let i=0;i<60;i++)V.stepRoadVehicle(a,v,{brake:1},.05,obs);assert(v.z<front-1);assert(v.speed<0);
 v.speed=0;assert(V.exitRoadVehicle(a,v,obs).ok);
 for(const access of [{type:'ownership',active:true,ownerId:a.localPlayerId},{type:'permission',active:true,grantedTo:a.localPlayerId},{type:'rental',active:true,renterId:a.localPlayerId}]){v.access=access;assert(V.drivePermission(a,v));for(const k of ['ownerId','grantedTo','renterId'])if(v.access[k])v.access[k]='OTHER';assert(!V.drivePermission(a,v));}
}

const configured=fresh();configured.completedDeliveries=1;const tuned=configured.roadVehicles.vehicles['dispatch-compact'];tuned.handling={maxSpeed:2,acceleration:1,braking:5,steering:.4,width:2.4,length:4.5,wheelbase:2.8};V.rentRoadCar(configured,tuned,0,'city',tuned);Object.assign(tuned,{x:0,z:0,mode:'mounted'});for(let i=0;i<150;i++)V.stepRoadVehicle(configured,tuned,{accelerator:1},.05,[]);assert.equal(tuned.speed,2);for(let i=0;i<30;i++)V.stepRoadVehicle(configured,tuned,{accelerator:1,brake:1},.05,[]);assert.equal(tuned.speed,0,'Brake must override simultaneous accelerator');assert(V.validRoadVehicle(tuned));assert.deepEqual(migrate(configured,seed,configured.localPlayerId).roadVehicles.vehicles['dispatch-compact'].handling,tuned.handling);
checks.push('Both profiles collide without tunnelling, reverse, stop and exit; ownership, rental and explicit permission reject other players.');
s=fresh();collectDelivery(s,'dispatch',PICKUP);const bike=s.dispatchBike;Object.assign(bike,{x:12,z:20,heading:Math.PI});assert(V.enterRoadVehicle(s,bike,'city',bike,world.obstacles).ok);
for(let i=0;i<300;i++)V.stepRoadVehicle(s,bike,{accelerator:1},.05,V.vehicleObstacles(s,world.obstacles,bike));assert(bike.z>19,'Bike entered buka terrace');const stopped=bike.z;for(let i=0;i<60;i++)V.stepRoadVehicle(s,bike,{brake:1},.05,V.vehicleObstacles(s,world.obstacles,bike));assert(bike.z>stopped+1);
Object.assign(bike,{x:12,z:13.002,heading:Math.PI,speed:0,mode:'mounted'});const before=JSON.stringify({money:s.money,delivery:s.delivery,pantry:s.pantry,wardrobe:s.wardrobe});const recovery=V.recoverRoadVehicle(s,bike,'city',bike,world.obstacles);assert(recovery.ok);assert.equal(JSON.stringify({money:s.money,delivery:s.delivery,pantry:s.pantry,wardrobe:s.wardrobe}),before);assert(V.roadClear(bike,bike.x,bike.z,bike.heading,V.vehicleObstacles(s,world.obstacles,bike)));assert.equal(bike.mode,'parked');
checks.push('Exact old buka trap recovered for free with parcel/cash/inventory retained; terrace excluded and reverse escapes approach.');
s=fresh();basketChange(s,'rice',2);basketChange(s,'tomato',1);basketChange(s,'water',2);let q=quoteBasket(s);assert.equal(q.total,550);const money=s.money;assert(!checkout(s,q,'city',SHOP_COUNTER).ok);assert(checkout(s,q,'shop',SHOP_COUNTER).ok);assert.equal(s.money,money-550);assert.equal(s.homeLife.ingredients.bag.rice,2);assert.equal(s.provisions.items.water,2);assert(beginRecipe(s,'jollof',s.daily.cookSerial,'home',HOME_STATIONS.prep.stand).ok);for(const key of ['rice','tomato'])assert(collectIngredient(s,s.homeLife.job.id,key,'bag','home',HOME_STATIONS.prep.stand).ok);assert.equal(s.homeLife.job.stage,'prepare');assert(!checkout(s,q,'shop',SHOP_COUNTER).ok);assert(useProvision(s,'water','city',{}).ok);assert.equal(s.provisions.items.water,1);
basketChange(s,'soap',1);q=quoteBasket(s);assert(checkout(s,q,'shop',SHOP_COUNTER).ok);assert(!useProvision(s,'soap','city',{}).ok);assert(useProvision(s,'soap','home',{x:4.8,z:.8}).ok);
basketChange(s,'beans',1);q=quoteBasket(s);basketChange(s,'beans',1);assert(!checkout(s,q,'shop',SHOP_COUNTER).ok);s.money=0;assert(!quoteBasket(s).ok);assert(validSave({version:1,data:s}));const reloaded=migrate(s,seed,s.localPlayerId);assert.deepEqual(reloaded.provisions,s.provisions);assert.deepEqual(reloaded.homeLife.ingredients,s.homeLife.ingredients);

const returning=fresh();returning.stats.shifts=1;const rented=returning.roadVehicles.vehicles['dispatch-compact'];assert(V.rentRoadCar(returning,rented,0,'city',rented).ok);assert(V.returnRoadCar(returning,rented,'city',rented).ok);assert(!V.drivePermission(returning,rented));assert.equal(returning.money,14100);
checks.push('Individual stock/quantities/total, atomic checkout, duplicate/stale/funds/location guards, usable ingredients/consumables and reload.');
await writeFile('qa/places-vehicles-3/state-checks.json',JSON.stringify({status:'passed',checks},null,2));console.log(JSON.stringify({status:'passed',checks},null,2));
