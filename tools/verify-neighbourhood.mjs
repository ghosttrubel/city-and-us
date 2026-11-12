import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {BUILDINGS,KIOSKS,ENTRANCES,ROOM_BOUNDS,STREET_BOUNDS,ROOM_EXIT,PICKUP,SHOP_COUNTER,joystickVector,cameraRelative,moveColliding,blocked,collectDelivery,handOverDelivery,arriveHome,validNeighbourhood,mapMarkup} from '../dist/neighbourhood.js';
import {buildInterior,buildVenueInterior} from '../dist/interior.js';
const checks=[];
assert.deepEqual(joystickVector(1,1),{x:0,y:0,magnitude:0});
const half=joystickVector(26,0),full=joystickVector(52,0),beyond=joystickVector(520,0);assert(half.magnitude>0&&half.magnitude<full.magnitude);assert.equal(full.magnitude,1);assert.equal(beyond.x,1);
assert(Math.abs(cameraRelative(0,-1,Math.PI/2).x+1)<1e-8);
const wall=[{x:0,z:0,w:2,d:2}],stopped=moveColliding({x:-3,z:0},10,0,wall,STREET_BOUNDS);assert(stopped.x<=-1.28);
const slide=moveColliding({x:-1.3,z:0},1,2,wall,STREET_BOUNDS);assert(slide.z>1.9);assert(!blocked(slide.x,slide.z,wall,STREET_BOUNDS));
checks.push('Joystick dead zone, proportional/clamped magnitude and camera-relative movement; collision sliding and no large-step tunnelling');
for(const id of Object.keys(ENTRANCES)){const e=ENTRANCES[id],b=[...BUILDINGS,...KIOSKS].find(b=>b.id===id);assert.equal(e.x,b.x);assert(e.z>b.z+b.d/2);assert(e.outside.z>e.z)}
for(const type of ['home','dispatch','shop']){const room=type==='home'?buildInterior('studio',true):buildVenueInterior(type);assert(!blocked(ROOM_EXIT.x,ROOM_EXIT.z,room.getColliders(),ROOM_BOUNDS));if(type!=='home'){const target=type==='dispatch'?PICKUP:SHOP_COUNTER;assert(!blocked(target.x,target.z,room.getColliders(),ROOM_BOUNDS))}assert(room.door.isGroup)}
checks.push('Entrances derive from building footprints; room exits and parcel/counter stations have collision-free standing space');
let state={delivery:null,deliverySerial:0,completedDeliveries:0,traits:['industrious','curious'],skills:{rider:2},stats:{shifts:0},money:500,location:'dispatch',inside:{x:0,z:3.3}};
assert.equal(collectDelivery(state,'city',PICKUP),false);assert.equal(collectDelivery(state,'dispatch',{x:0,z:3}),false);assert(collectDelivery(state,'dispatch',PICKUP));assert.equal(collectDelivery(state,'dispatch',PICKUP),false);assert.equal(state.money,500);assert.equal(state.waypoint,'shop');
state=JSON.parse(JSON.stringify(state));assert.equal(handOverDelivery(state,'home',SHOP_COUNTER),false);assert.equal(handOverDelivery(state,'shop',{x:0,z:3}),false);assert(handOverDelivery(state,'shop',SHOP_COUNTER));const paid=state.money;assert.equal(paid,2040);assert.equal(handOverDelivery(state,'shop',SHOP_COUNTER),false);assert.equal(state.money,paid);assert.equal(collectDelivery(state,'dispatch',PICKUP),false);
state=JSON.parse(JSON.stringify(state));assert.equal(handOverDelivery(state,'shop',SHOP_COUNTER),false);assert(arriveHome(state));assert.equal(arriveHome(state),false);assert.equal(state.completedDeliveries,1);assert(collectDelivery(state,'dispatch',PICKUP));assert.equal(state.delivery.id,2);
checks.push('Collection and handover reject wrong space/range; carrying survives serialization; exact-once pay; home return completes round before another pickup');
assert(validNeighbourhood(state));for(const patch of [{inside:{x:100,z:0}},{location:'airport'},{delivery:{...state.delivery,status:'paid'}},{delivery:{...state.delivery,id:99}},{deliverySerial:-1},{waypoint:'fake'}])assert.equal(validNeighbourhood({...state,...patch}),false);
const map=mapMarkup({...state,location:'city'},{x:4,z:5},Math.PI/2);assert(map.includes('map-player'));assert(map.includes('map-building'));assert(map.includes('map-door'));assert(map.includes('map-road'));assert(map.includes('map-waypoint'));
checks.push('Invalid spatial/delivery save fields rejected; map includes shared footprints, roads, entrances, waypoint and facing marker');
const report={date:'2026-10-23',status:'passed',checks,scope:'Pure logic and CPU geometry only. No browser/touch/visual verification or multiplayer claim.'};await writeFile(new URL('../qa/neighbourhood.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
