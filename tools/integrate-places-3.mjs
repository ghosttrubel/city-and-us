import fs from 'node:fs/promises';
async function edit(file,fn){const p='dist/'+file,s=await fs.readFile(p,'utf8');await fs.writeFile(p,fn(s));}
function replace(s,a,b){if(!s.includes(a))throw Error('Missing '+a.slice(0,100));return s.replace(a,b);}
await edit('road-vehicles.js',s=>s.replace("v.access?.type!=='permission'","!(v.access?.type==='permission'&&v.access.grantedTo===s.localPlayerId)").replace("position:v===activeDriver(s)?exit:exit","position:exit"));
await edit('dispatch-bike.js',s=>s.replace("createRoadVehicle,validRoadVehicle","rideActive,createRoadVehicle,validRoadVehicle").replace("s.location==='city'&&b.deliveryId","s.location==='city'&&!rideActive(s)&&b.deliveryId"));
await edit('life.js',s=>"import {migrateRoadVehicles,validRoadVehicles} from './road-vehicles.js';\nimport {migrateProvisions,validProvisions} from './provisions.js';\n"+s.replace("return migrateBike(s,data);","migrateBike(s,data);migrateRoadVehicles(s,data);return migrateProvisions(s,data);").replace("return validNeighbourhood(d)&&validBike(d)","return validProvisions(d.provisions)&&validRoadVehicles(d)&&validNeighbourhood(d)&&validBike(d)"));
await edit('daily-life.js',s=>"import {driving} from './road-vehicles.js';\n"+s.replaceAll("s.dispatchBike?.mode==='mounted'","driving(s)").replace('Park and dismount the dispatch bike','Park and exit your vehicle'));
await edit('food-service.js',s=>"import {driving} from './road-vehicles.js';\n"+s.replace("const f=s.foodService;if(view!=='city'","const f=s.foodService;if(driving(s))return no('Park and exit before serving.');if(view!=='city'").replace("return f.active&&view==='city'","return !driving(s)&&f.active&&view==='city'"));
await edit('service-experience.js',s=>"import {driving} from './road-vehicles.js';\n"+s.replace("if(action||location()!=='city'","if(driving(state)||action||location()!=='city'"));
await edit('index.html',s=>s.replace('<link rel="stylesheet" href="visual.css">','<link rel="stylesheet" href="visual.css"><link rel="stylesheet" href="road-ui.css">'));
await edit('dialogue.js',s=>s.replace("if(!silent&&!line.textOnly", "if(false&&!silent&&!line.textOnly").replace('<button id="dialogue-close"','<button id="dialogue-minimise">Minimise</button><button id="dialogue-subtitles">Subtitles</button><button id="dialogue-close"').replace("find('dialogue-close').onclick=close;","find('dialogue-close').onclick=close;find('dialogue-minimise').onclick=()=>{const body=panel.querySelector('.dialogue-body');if(body)body.hidden=!body.hidden;};find('dialogue-subtitles').onclick=()=>{state.dialogue.subtitles=!state.dialogue.subtitles;render();};").replace("const showText=state.dialogue.subtitles||state.dialogue.textOnly||state.dialogue.muted||state.dialogue.volume===0||fallback;","const showText=state.dialogue.subtitles!==false;"));
await edit('game.js',s=>{
s="import {activeDriver,driving,roadVehicles,profileFor,vehicleBox,vehicleObstacles,stepRoadVehicle,enterRoadVehicle,exitRoadVehicle,recoverRoadVehicle,rentRoadCar,returnRoadCar,drivePermission,RENTAL_PRICE} from './road-vehicles.js';\nimport {createVehicleControls} from './vehicle-controls.js';\nimport {createRoadVehicleWorld} from './road-vehicle-world.js';\nimport {openProvisions,openInventory} from './provisions-ui.js';\n"+s;
s=s.replace('let joystickControl=null','let driverControls=null,driveCamera=0,walkingCamera=null;let joystickControl=null');
s=s.replace("const b=state.dispatchBike,key=b.mode+':'+b.x+':'+b.z+':'+b.heading","const key=roadVehicles(state).map(b=>b.mode+':'+b.x+':'+b.z+':'+b.heading).join('|')").replaceAll('...bikeObstacle(state)','...roadVehicles(state).filter(v=>v.mode===\'parked\').map(vehicleBox)');
s=s.replace('const dispatchBikeWorld=createDispatchBike(city);','const dispatchBikeWorld=createDispatchBike(city);const roadWorld=createRoadVehicleWorld(city);');
s=s.replaceAll('if(bikeMounted(state))','if(driving(state))').replace('Stop and dismount the dispatch bike before entering.','Stop and exit your vehicle before entering.');
s=s.replace("if(state.dispatchBike)state.dispatchBike.speed=0;","for(const v of roadVehicles(state))v.speed=0;driverControls?.reset();");
s=s.replace("function sheet(html){","function sheet(html){$('overlay').classList.remove('service-overlay');").replace("function close(){placeVoice.stop();","function close(){$('overlay').classList.remove('service-overlay');placeVoice.stop();");
const marker='function contextAction(){';
const helpers=`
function serviceSheet(html){sheet(html);$('overlay').classList.add('service-overlay');}
function inventory(){openInventory({state,sheet:serviceSheet,save,toast,location:()=>view,position:()=>player.position});}
function driverEnter(v){const r=enterRoadVehicle(state,v,view,player.position,[...obstacles,...servicePlay.obstacles()]);if(r.ok){close();walkingCamera={angle,distance};driveCamera=0;}commitDaily(r);}
function driverExit(){const v=activeDriver(state);if(!v)return;const r=exitRoadVehicle(state,v,[...obstacles,...servicePlay.obstacles()]);if(r.ok&&walkingCamera){angle=walkingCamera.angle;distance=walkingCamera.distance;walkingCamera=null;}commitDaily(r);driverControls.reset();}
function vehicleRecovery(v=activeDriver(state)||roadVehicles(state).find(v=>near(player.position,v,6))){if(!v){toast('Approach your vehicle first.');return;}const r=recoverRoadVehicle(state,v,view,player.position,[...obstacles,...servicePlay.obstacles()]);if(r.ok){close();if(walkingCamera){angle=walkingCamera.angle;distance=walkingCamera.distance;walkingCamera=null;}}commitDaily(r);}
function vehicleMenu(v){const access=drivePermission(state,v),bike=v.profile==='bike';
 serviceSheet('<h2>'+profileFor(v).name+'</h2><p>'+ (access?'Driving access active. Park and stop before exiting.':bike?'Work-bike permission starts when you collect a parcel.':'Self-drive rental: ₦'+RENTAL_PRICE+' until returned to this bay. Balance ₦'+state.money+'. No ownership included.')+'</p><button id="vehicle-enter">Take driving control</button>'+(!bike&&!access?'<button id="vehicle-rent">Review rental · ₦'+RENTAL_PRICE+'</button>':'')+'<button id="vehicle-recover">Recover stuck vehicle · free</button>'+(!bike&&access?'<button id="vehicle-return">Return rental at Dispatch</button>':''));
 $('vehicle-enter').disabled=!access;$('vehicle-enter').onclick=()=>driverEnter(v);$('vehicle-recover').onclick=()=>vehicleRecovery(v);
 if($('vehicle-return'))$('vehicle-return').onclick=()=>{const r=returnRoadCar(state,v,view,player.position);save();vehicleMenu(v);toast(r.message);};
 if($('vehicle-rent'))$('vehicle-rent').onclick=()=>{const serial=state.roadVehicles.serial;serviceSheet('<h2>Confirm self-drive rental</h2><p>Pay ₦'+RENTAL_PRICE+' from your ₦'+state.money+' balance? Access lasts until you return this car at Dispatch. This is not a passenger booking.</p><button id="rental-confirm">Pay and rent</button><button id="rental-cancel">Cancel</button>');$('rental-cancel').onclick=()=>vehicleMenu(v);$('rental-confirm').onclick=()=>{const r=rentRoadCar(state,v,serial,view,player.position);save();vehicleMenu(v);toast(r.message);};};
}
driverControls=createVehicleControls({state,exit:driverExit,recover:()=>vehicleRecovery(),camera:()=>{driveCamera=(driveCamera+1)%3;}});
for(const panel of [$('sheet'),$('dialogue-panel')])for(const event of ['pointerdown','pointerup','click','keydown'])panel.addEventListener(event,e=>{e.stopPropagation?.();if(event==='pointerdown')stopKeyboard();});
`;
s=replace(s,marker,helpers+marker);
const start=s.indexOf(" if(view==='city'&&bikeMounted(state))return"),end=s.indexOf("\n if(view==='city'&&state.daily.ride",start);
if(start<0)throw Error('mounted context');s=s.slice(0,start)+" if(view==='city'&&driving(state))return {id:'vehicle-exit',label:'Park and exit',disabled:Math.abs(activeDriver(state).speed)>.1,run:driverExit};"+s.slice(end);
const a=s.indexOf(" if(view==='city'&&near(player.position,state.dispatchBike"),b=s.indexOf("\n if(view==='city'&&state.daily.order",a);
s=s.slice(0,a)+`
 if(view==='city'){const v=roadVehicles(state).find(v=>near(player.position,v,profileFor(v).width/2+1.7));if(v&&!Object.values(ENTRANCES).some(e=>near(player.position,e.outside,1.2)))return {id:v.profile==='bike'?'bike-mount':'car-rental',label:v.profile==='bike'?'Dispatch bike · drive / recover':'Self-drive car · rental / drive',run:()=>vehicleMenu(v)};}
`+s.slice(b);
s=s.replace(/if\(view==='shop'&&near\(player.position,SHOP_COUNTER\)\)return state.delivery[^\n]+/, "if(view==='shop'&&near(player.position,SHOP_COUNTER))return {id:'shop',label:'Provisions · shop / parcel handover',run:shop};");
s=s.replace("function startJob(type){","function startJob(type){if(driving(state)){toast('Park and exit before working.');return;}").replace('You bought a bag for ₦1,200. Choose a selling price.','Trading practice: supplier cost is ₦1,200. Choose a selling price.');
s=s.replace("function openVenue(kind){","function openVenue(kind){if(driving(state)){toast('Park and exit before visiting.');return;}").replace("park:{x:28,z:34}","park:{x:40,z:42}");
let x=s.indexOf("function parcelCounter("),y=s.indexOf("function transportCounter()",x);
s=s.slice(0,x)+`function parcelCounter(){
 if(view!=='dispatch'||!near(player.position,PICKUP))return;
 const d=state.delivery,status=d?.status;
 serviceSheet('<h2>Parcel dispatch</h2><p id="parcel-status"></p><button id="parcel-collect">Collect parcel</button><button id="parcel-bike-info">Bike instructions</button><button id="parcel-leave">Continue outside</button>');
 $('parcel-status').textContent=status==='carrying'?'Parcel #'+d.id+' is with you. Provisions handover pays '+naira(d.pay)+'.':status==='return'?'Parcel #'+d.id+' was paid. Return home to complete the round.':'Collect a delivery for Provisions. Walk, or use the work bike outside. Passenger tickets are at the separate desk.';
 $('parcel-collect').disabled=['carrying','return'].includes(status);
 $('parcel-collect').onclick=()=>{if(!canWork())return;if(collectDelivery(state,view,player.position)){advance(5);save();parcelCounter();placeVoice.sayText([{speaker:'You',text:'I have collected parcel #'+state.delivery.id+'.'},{speaker:'Parcel attendant',text:'Take am to Provisions. Handover pays '+naira(state.delivery.pay)+'. Work-bike permission is active for this round.'}]);}};
 $('parcel-bike-info').onclick=()=>placeVoice.sayText([{speaker:'Parcel attendant',text:'Approach the red bike outside. Use accelerator, steering and brake/reverse. Stop and dismount before entering. Free recovery moves a stuck bike to nearby safe parking without losing your parcel.'}]);$('parcel-leave').onclick=close;
}
`+s.slice(y);
s=s.replace("sheet('<span class=\"eyebrow\">DISPATCH TICKET DESK","serviceSheet('<span class=\"eyebrow\">DISPATCH TICKET DESK");
x=s.indexOf('function browseProvisions(');y=s.indexOf('\nfunction shop()',x);
s=s.slice(0,x)+`function browseProvisions(){provisionsCounter();}
function provisionsCounter(){
 if(view!=='shop'){guide('shop');return;}
 openProvisions({state,sheet:serviceSheet,save,toast,location:()=>view,position:()=>player.position,close,speak:turns=>placeVoice.sayText(turns),handover:()=>{const d=state.delivery;if(handOverDelivery(state,view,player.position)){advance(30);save();return 'Parcel #'+d.id+' received. Paid '+naira(d.pay)+'. Return home to complete your round.';}return 'Bring your active parcel to the checkout first.';},sofa:buySofa,trade:()=>startJob('trader')});
}
`+s.slice(y);
s=s.replace("else player.visible=true;","else player.visible=activeDriver(state)?.profile!=='compact';");
s=s.replace("const names={jobs:","const names={inventory:'Inventory',jobs:").replace("const paths={wallpaper:","const paths={inventory:'M4 6h16v15H4Z M8 6V3h8v3',wallpaper:");
s=s.replace("if(section==='wallpaper'){","if(section==='inventory'){inventory();return;}if(section==='wallpaper'){");
s=s.replace("value=>stick=value,freeControl","value=>stick=value,()=>freeControl()&&!driving(state)&&!passenger(state)");
s=s.replace("if(k==='e'||k===' '){","if(driving(state)&&k===' '){e.preventDefault();keys.add(k);return;}if(driving(state)&&k==='h'){driverControls.horn();return;}if(driving(state)&&k==='c'){driveCamera=(driveCamera+1)%3;return;}if(k==='e'||k===' '){");
s=s.replace("moving=stepBike(state,dir,dt,[...obstacles,...servicePlay.obstacles()]);player.position.set(state.dispatchBike.x,streetGroundHeight(state.dispatchBike.x,state.dispatchBike.z),state.dispatchBike.z);","const vehicle=activeDriver(state);moving=stepRoadVehicle(state,vehicle,driverControls.input(keys),dt,vehicleObstacles(state,[...obstacles,...servicePlay.obstacles(),...traffic.map(c=>({x:c.position.x,z:c.position.z,w:2,d:4.5}))],vehicle));player.position.set(vehicle.x,streetGroundHeight(vehicle.x,vehicle.z),vehicle.z);player.rotation.y=vehicle.heading;");
s=s.replace("if(!free&&bikeMounted(state))state.dispatchBike.speed=0;","if(!free&&driving(state)){activeDriver(state).speed=0;driverControls.reset();}");
s=s.replace("dispatchBikeWorld.update(state,dt,view,player);","roadWorld.update(state,dt,view);driverControls.update(activeDriver(state),free&&!passenger(state));dispatchBikeWorld.update(state,dt,view,player);");
s=s.replace("const lookTarget=new THREE.Vector3","if(driving(state)&&driveCamera!==1){angle=activeDriver(state).heading+Math.PI;distance=driveCamera===2?20:13;}\n const lookTarget=new THREE.Vector3");
s=s.replace("&&!bikeMounted(state)","&&!driving(state)").replace("'unavailable',!free||passenger(state)","'unavailable',!free||passenger(state)||driving(state)");
s=s.replace('voiced Provisions/Dispatch counters, red parcel bike outside Dispatch, and danfo tickets.','stocked Provisions, work bike and paid self-drive rental outside Dispatch. Voice replacement pending.');
return s;
});
const p=JSON.parse(await fs.readFile('package.json','utf8'));p.scripts.check+=' && node --check dist/road-vehicles.js && node --check dist/vehicle-controls.js && node --check dist/road-vehicle-world.js && node --check dist/provisions.js && node --check dist/provisions-ui.js';await fs.writeFile('package.json',JSON.stringify(p,null,2)+'\n');
console.log('Batch 3 integration saved');
