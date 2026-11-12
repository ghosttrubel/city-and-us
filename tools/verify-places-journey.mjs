import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {createNavigator} from '../dist/navigation.js';
import {ENTRANCES,SHOP_COUNTER,ROOM_EXIT} from '../dist/neighbourhood.js';
import {RIDE_STOPS} from '../dist/daily-life.js';
import {boot,tick,frames,el,click,choose,saved,pagehide,player,nav,action,finishDoor,walkTo,space,saveSlot} from './game-test-harness.mjs';
const steps=[];function step(s){steps.push(s);console.log(s);}
function indoors(p){const room=globalThis.__destinationsQa().rooms[space()],route=createNavigator(room.getColliders(),room.bounds).route(player().position,p);assert(route.length>0);for(const point of route.slice(1))walkTo(point.x,point.z);}
function street(p){for(const point of globalThis.__navigationQa.navigate(p).slice(1))walkTo(point.x,point.z);}
function enter(id){street(ENTRANCES[id].outside);action('enter-'+id);finishDoor();assert.equal(space(),id);}
function exit(){const id=space();indoors(ROOM_EXIT);action('exit-'+id);finishDoor();}
function until(predicate){for(let n=0;n<8000&&!predicate();n++)tick();assert(predicate(),'Service timeout');}
await boot({search:''});el('nameinput').value='Protected story';click('begin');click('skipintro');pagehide();
const main=saveSlot('lagos-street-v1'),identity=saveSlot('lagos-street-local-player-id');
await boot({search:'?review=places'});assert.equal(space(),'shop');
const protectedState=JSON.stringify({wardrobe:saved().wardrobe,decor:saved().decor,shirt:saved().shirt,bottom:saved().bottom,skin:saved().skin,home:saved().home});
assert(globalThis.__destinationsQa().rooms.shop.staff?.length===1);
indoors({x:-2.7,z:1.25});action('provisions-produce');assert(el('shop-dialogue').textContent.includes('checkout'));click('provisions-browse-close');
indoors(SHOP_COUNTER);action('shop');const balance=saved().money,pantry=saved().pantry;click('buygroceries');const cancelledConfirm=el('provisions-confirm').onclick;click('provisions-cancel');cancelledConfirm();assert.equal(saved().money,balance);
click('buygroceries');const pay=el('provisions-confirm').onclick;pay();pay();assert.equal(saved().money,balance-500);assert.equal(saved().pantry,pantry+3);assert(el('shop-dialogue').textContent.includes('Paid'));
click('close');pagehide();await boot();assert.equal(saved().money,balance-500);assert.equal(saved().pantry,pantry+3);assert.equal(space(),'shop');
step('Browsed produce, cancelled checkout, confirmed groceries twice with one charge, and reloaded the receipt state.');
indoors(SHOP_COUNTER);action('shop');const live=globalThis.__livingQa().state,originalMoney=live.money;live.money=100;click('buygroceries');click('provisions-confirm');assert(el('shop-dialogue').textContent.includes('Nothing has been charged'));assert.equal(live.money,100);live.money=originalMoney;click('close');pagehide();
exit();enter('dispatch');assert.equal(globalThis.__destinationsQa().rooms.dispatch.staff.length,2);
indoors(SHOP_COUNTER);action('pickup');click('parcel-collect');click('close');assert.equal(saved().delivery.status,'carrying');const parcelId=saved().delivery.id;
indoors({x:-2.5,z:-1.55});action('transport-counter');assert.equal(el('ride-service').value,'danfo');assert.equal(el('ride-pickup').value,'dispatch');choose('ride-destination','shop');
click('ride-review');const before=saved().money,book=el('ride-confirm').onclick;book();book();assert.equal(saved().money,before-225);assert.equal(saved().daily.ride.service,'danfo');assert(el('transport-dialogue').textContent.includes('already handled'));
click('ride-cancel');const cancel=el('ride-confirm-cancel').onclick;cancel();cancel();assert.equal(saved().money,before);
choose('ride-service','danfo');choose('ride-pickup','dispatch');choose('ride-destination','shop');click('ride-review');click('ride-confirm');click('close');
exit();street(RIDE_STOPS.dispatch.curb);until(()=>saved().daily.ride.status==='waiting');assert.equal(globalThis.__dailyQa().car.userData.service,'danfo');assert(globalThis.__dailyQa().car.getObjectByName('danfo-passenger-door').position.z<0);action('ride-board');assert.equal(player().visible,false);frames(30);pagehide();const progress=saved().daily.ride.progress;await boot();assert(saved().daily.ride.progress>=progress);assert.equal(saved().delivery.id,parcelId);assert.equal(saved().delivery.status,'carrying');
until(()=>saved().daily.ride.status==='arrived');action('ride-alight');assert(player().visible);assert.equal(saved().daily.stats.rides,1);assert.equal(saved().money,before-225);
step('Booked/cancelled/refunded at the attendant desk, then boarded the danfo, reloaded in transit and alighted at Provisions with the courier parcel intact.');
enter('shop');indoors(SHOP_COUNTER);const handover=globalThis.__dailyQa().context.run,moneyBeforeDelivery=saved().money,payAmount=saved().delivery.pay;action('handover');handover();assert.equal(saved().money,moneyBeforeDelivery+payAmount);assert.equal(saved().delivery.status,'return');
click('close');action('shop');assert(el('shop-dialogue').textContent.includes('delivery has been paid'));click('close');exit();enter('home');assert.equal(saved().delivery.status,'complete');assert.equal(saved().completedDeliveries,1);pagehide();
assert.equal(JSON.stringify({wardrobe:saved().wardrobe,decor:saved().decor,shirt:saved().shirt,bottom:saved().bottom,skin:saved().skin,home:saved().home}),protectedState);
assert.equal(saveSlot('lagos-street-v1'),main);assert.equal(saveSlot('lagos-street-local-player-id'),identity);
step('Completed the original courier handover exactly once and returned home; colours, ownership, decor and main story/identity stayed unchanged.');
await writeFile(new URL('../qa/places-vehicles/journey.json',import.meta.url),JSON.stringify({status:'passed',scope:'Shipped game and synthetic joystick/UI with DOM, WebGL and storage doubles; not live screenshots.',steps},null,2));console.log('Places and vehicles shipped-game journey passed.');
