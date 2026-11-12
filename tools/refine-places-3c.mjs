import fs from 'node:fs/promises';
async function edit(file,fn){await fs.writeFile(file,fn(await fs.readFile(file,'utf8')));}
await edit('dist/road-vehicles.js',s=>s.replace("export const profileFor=v=>ROAD_PROFILES[v.profile||'bike'];",`export const HANDLING_LIMITS={maxSpeed:[.5,30],reverseSpeed:[.2,8],acceleration:[.1,15],braking:[.5,30],coast:[.1,10],steering:[.1,4],width:[.5,3],length:[1,10],wheelbase:[.5,7]};
export function profileFor(v){const base=ROAD_PROFILES[v.profile||'bike'];return base?{...base,...v.handling}:null;}
function validHandling(v){return v.handling===undefined||v.handling&&typeof v.handling==='object'&&!Array.isArray(v.handling)&&Object.entries(v.handling).every(([k,n])=>HANDLING_LIMITS[k]&&Number.isFinite(n)&&n>=HANDLING_LIMITS[k][0]&&n<=HANDLING_LIMITS[k][1]);}`)
.replace("createRoadVehicle(id,profile,point,access)","createRoadVehicle(id,profile,point,access,handling={})").replace("distance:0,access:structuredClone(access)","distance:0,handling:structuredClone(handling),access:structuredClone(access)")
.replace("return !!p&&v.version===1","return !!p&&validHandling(v)&&p.wheelbase<=p.length&&v.version===1"));
await edit('dist/game.js',s=>s.replace("Tickets do not include a parcel job.</p>","Tickets do not include a parcel job. Self-drive hire is separate: approach the green hatchback outside, east of the entrance. Complete one paid shift or parcel round, then confirm ₦900 rental.</p>")
.replace('<button id="findshop">Find the shop</button></div>','<button id="findshop">Find the shop</button></div><div class="card"><h3>Road vehicles</h3><p>Green self-drive hatchback outside Dispatch: one completed parcel round or paid shift, then ₦900 confirmed rental. No ownership included.</p><button id="find-rental">Find Dispatch rental bay</button><button id="recover-vehicle">Recover nearby stuck vehicle · free</button></div>')
.replace("$('findshop').onclick=()=>guide('shop');","$('findshop').onclick=()=>guide('shop');$('find-rental').onclick=()=>guide('dispatch');$('recover-vehicle').onclick=()=>vehicleRecovery();"));
await edit('tools/verify-road-vehicles.mjs',s=>s.replace("checks.push('Both profiles",`
const configured=fresh();configured.completedDeliveries=1;const tuned=configured.roadVehicles.vehicles['dispatch-compact'];tuned.handling={maxSpeed:2,acceleration:1,braking:5,steering:.4,width:2.4,length:4.5,wheelbase:2.8};V.rentRoadCar(configured,tuned,0,'city',tuned);Object.assign(tuned,{x:0,z:0,mode:'mounted'});for(let i=0;i<150;i++)V.stepRoadVehicle(configured,tuned,{accelerator:1},.05,[]);assert.equal(tuned.speed,2);assert(V.validRoadVehicle(tuned));assert.deepEqual(migrate(configured,seed,configured.localPlayerId).roadVehicles.vehicles['dispatch-compact'].handling,tuned.handling);
checks.push('Both profiles`));
await edit('tools/verify-places-3-game.mjs',s=>s.replace("await writeFile('qa/places-vehicles-3/game-checks.json'",`
// Re-enter the recovered work bike, drive with the independent controls, park and reload.
action('bike-mount');click('vehicle-enter');tick();const live=globalThis.__livingQa().state;assert.equal(activeDriver(live).profile,'bike');assert(el('drive-handbrake').hidden);
el('drive-gas').dispatch('pointerdown',{pointerId:21});frames(12);el('drive-gas').dispatch('pointerup',{pointerId:21});const bikeDistance=live.dispatchBike.distance;assert(bikeDistance>0);
lifecycle('blur');frames(2);click('drive-exit');tick();assert.equal(live.dispatchBike.mode,'parked');pagehide();await boot();assert.equal(saved().dispatchBike.distance,bikeDistance);assert.equal(saved().delivery.id,parcel);
checks.push('Actual recovered bike UI: remount, accelerator, stopped dismount, walking restored and parcel/parking retained on reload.');
await writeFile('qa/places-vehicles-3/game-checks.json'`));
console.log('Final interaction refinements saved.');
