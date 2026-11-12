import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import * as T from '../dist/vendor/three.module.js';
import {createNavigator} from '../dist/navigation.js';
import {ENTRANCES,SHOP_COUNTER,ROOM_EXIT} from '../dist/neighbourhood.js';
import {bookRide} from '../dist/daily-life.js';
import {bikeMounted} from '../dist/dispatch-bike.js';
import {boot,tick,frames,el,click,saved,pagehide,player,action,finishDoor,walkTo,space,stickEvent,worldRenderer,nav} from './game-test-harness.mjs';
const steps=[],step=s=>{steps.push(s);console.log(s);};
function indoors(p){const room=globalThis.__destinationsQa().rooms[space()];const route=createNavigator(room.getColliders(),room.bounds).route(player().position,p);assert(route.length);for(const n of route.slice(1))walkTo(n.x,n.z);}
function street(p){const route=globalThis.__navigationQa.navigate(p);assert(route.length);for(const n of route.slice(1))walkTo(n.x,n.z);}
function exit(){const id=space();indoors(ROOM_EXIT);action('exit-'+id);finishDoor();}
function enter(id){street(ENTRANCES[id].outside);action('enter-'+id);finishDoor();}
function rideTo(x,z){const live=globalThis.__livingQa().state;let count=0;stickEvent('pointerdown');
 while(Math.hypot(live.dispatchBike.x-x,live.dispatchBike.z-z)>.5&&count++<1800){const b=live.dispatchBike,dx=x-b.x,dz=z-b.z,len=Math.hypot(dx,dz),direction=new T.Vector3();worldRenderer().camera.getWorldDirection(direction);const yaw=Math.atan2(-direction.x,-direction.z),sx=Math.cos(yaw)*dx-Math.sin(yaw)*dz,sy=Math.sin(yaw)*dx+Math.cos(yaw)*dz,strength=Math.min(.75,Math.max(.18,len/8)),radius=136*.39,raw=.16+.84*strength;stickEvent('pointermove',sx/len*radius*raw,sy/len*radius*raw);tick();}
 stickEvent('pointerup');frames(20);assert(count<1800,'Bike route blocked at '+JSON.stringify(live.dispatchBike)+' target '+x+','+z);assert.equal(live.dispatchBike.speed,0);pagehide();
}
await boot({search:'?review=places'});exit();enter('dispatch');indoors(SHOP_COUNTER);action('pickup');
assert(el('place-voice-subtitle').textContent.includes('Passenger tickets'));click('parcel-bike-info');assert(el('place-voice-subtitle').textContent.includes('How do I use'));
click('parcel-collect');const collected=el('parcel-collect').onclick;collected();assert.equal(saved().deliverySerial,1);assert(el('place-voice-subtitle').textContent.includes('I am ready'));
click('close');exit();street({x:14.5,z:-28.1});action('bike-mount');
assert(bikeMounted(globalThis.__livingQa().state));const before=saved().money;assert(!bookRide(globalThis.__livingQa().state,'dispatch','shop',0,'danfo').ok);assert.equal(saved().money,before);
nav('phone');assert(el('action').disabled);const beforeMenu={...globalThis.__livingQa().state.dispatchBike};frames(30);assert.deepEqual(globalThis.__livingQa().state.dispatchBike,beforeMenu);click('close');
step('Collected once at the separate parcel desk, read bike instructions, mounted the red cargo bike and blocked a simultaneous passenger booking.');
rideTo(10,-26);rideTo(1.8,-26);rideTo(1.8,18);pagehide();const held=saved().dispatchBike,parcel=saved().delivery;
await boot();assert.equal(saved().dispatchBike.mode,'mounted');assert.equal(saved().dispatchBike.speed,0);assert(Math.hypot(player().position.x-held.x,player().position.z-held.z)<.01);assert.deepEqual(saved().delivery,parcel);
rideTo(1.8,22.5);rideTo(28,22.5);rideTo(28,19.5);
action('bike-dismount');assert.equal(saved().dispatchBike.mode,'parked');assert(player().visible);const parked={...saved().dispatchBike};
step('Rode with real joystick handlers, braked, reloaded while mounted with parcel intact, and parked beside Provisions.');
enter('shop');indoors(SHOP_COUNTER);const money=saved().money,pay=saved().delivery.pay;action('handover');assert.equal(saved().money,money+pay);assert(el('place-voice-subtitle').textContent.includes('I brought the parcel'));
click('close');action('shop');assert.equal(saved().money,money+pay);click('close');exit();assert.equal(saved().dispatchBike.x,parked.x);assert.equal(saved().dispatchBike.z,parked.z);
street({x:parked.x+1.3,z:parked.z});action('bike-mount');rideTo(28,22.5);rideTo(1.8,22.5);rideTo(1.8,-26);rideTo(10,-26);rideTo(13.2,-28.1);action('bike-dismount');assert.equal(saved().dispatchBike.deliveryId,0);
enter('home');assert.equal(saved().delivery.status,'complete');assert.equal(saved().completedDeliveries,1);
step('Dismounted before entering, delivered exactly once, returned the same bike to Dispatch and finished the round at home.');
await writeFile(new URL('../qa/places-vehicles-2/bike-journey.json',import.meta.url),JSON.stringify({status:'passed',scope:'Shipped game, synthetic joystick/UI and rendering doubles; not device/browser visual verification.',steps},null,2));
