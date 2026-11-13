import {cashChange} from './bank.js';
import {BUILDINGS,ENTRANCES,blocked,walkableStreet,STREET_BOUNDS,near} from './neighbourhood.js';
export const ROAD_PROFILES=Object.freeze({
 bike:Object.freeze({kind:'bike',name:'Dispatch bike',maxSpeed:7.2,reverseSpeed:2,acceleration:4,braking:10,coast:2.5,steering:2.1,width:1.05,length:2.5,wheelbase:1.7,handbrake:false}),
 compact:Object.freeze({kind:'car',name:'Compact rental',maxSpeed:11,reverseSpeed:3,acceleration:3.3,braking:9,coast:1.5,steering:.8,width:1.85,length:4,wheelbase:2.55,handbrake:true})
});
export const RENTAL_BAY={x:22,z:-24},RENTAL_PRICE=900;
export const HANDLING_LIMITS={maxSpeed:[.5,30],reverseSpeed:[.2,8],acceleration:[.1,15],braking:[.5,30],coast:[.1,10],steering:[.1,4],width:[.5,3],length:[1,10],wheelbase:[.5,7]};
export function profileFor(v){const base=ROAD_PROFILES[v.profile||'bike'];return base?{...base,...v.handling}:null;}
function validHandling(v){return v.handling===undefined||v.handling&&typeof v.handling==='object'&&!Array.isArray(v.handling)&&Object.entries(v.handling).every(([k,n])=>HANDLING_LIMITS[k]&&Number.isFinite(n)&&n>=HANDLING_LIMITS[k][0]&&n<=HANDLING_LIMITS[k][1]);}
const ok=(message,extra={})=>({ok:true,message,...extra}),no=message=>({ok:false,message});
export const roadVehicles=s=>[s.dispatchBike,...Object.values(s.roadVehicles?.vehicles||{})].filter(Boolean);
export const activeDriver=s=>roadVehicles(s).find(v=>v.mode==='mounted')||null;
export const driving=s=>!!activeDriver(s);
export const rideActive=s=>['dispatching','waiting','travelling','arrived'].includes(s.daily?.ride?.status);
export function createRoadVehicle(id,profile,point,access,handling={}){if(!ROAD_PROFILES[profile])throw Error('Unknown road profile');return {id,version:1,profile,mode:'parked',x:point.x,z:point.z,heading:0,speed:0,distance:0,handling:structuredClone(handling),access:structuredClone(access)};}
export function migrateRoadVehicles(s,data){
 s.roadVehicles=data?.roadVehicles?structuredClone(data.roadVehicles):{version:1,serial:0,vehicles:{'dispatch-compact':createRoadVehicle('dispatch-compact','compact',RENTAL_BAY,{type:'rental',active:false,renterId:null})}};
 for(const v of roadVehicles(s)){v.speed=0;if(v.mode==='mounted'&&!drivePermission(s,v))v.mode='parked';}
 return s;
}
export function drivePermission(s,v){
 const a=v.access;if(!a||a.active!==true)return false;
 if(a.type==='ownership')return a.ownerId===s.localPlayerId;
 if(a.type==='rental')return a.renterId===s.localPlayerId;
 if(a.type==='permission'&&a.grantedTo===s.localPlayerId){
  if(!a.job)return true;
  return a.job==='parcel'&&!!s.delivery&&(['carrying','return'].includes(s.delivery.status)||s.delivery.status==='complete'&&v.deliveryId===s.delivery.id);
 }return false;
}
function validAccess(a){return a&&['rental','ownership','permission'].includes(a.type)&&typeof a.active==='boolean'&&['ownerId','renterId','grantedTo'].every(k=>a[k]===undefined||a[k]===null||typeof a[k]==='string'&&a[k].length<80)&&(!a.job||a.job==='parcel');}
export function validRoadVehicle(v){const p=profileFor(v);return !!p&&validHandling(v)&&p.wheelbase<=p.length&&v.version===1&&['parked','mounted'].includes(v.mode)&&Number.isFinite(v.x)&&Number.isFinite(v.z)&&v.x>=STREET_BOUNDS.minX&&v.x<=STREET_BOUNDS.maxX&&v.z>=STREET_BOUNDS.minZ&&v.z<=STREET_BOUNDS.maxZ&&Number.isFinite(v.heading)&&Math.abs(v.heading)<=Math.PI+1e-6&&Number.isFinite(v.speed)&&v.speed>=-p.reverseSpeed&&v.speed<=p.maxSpeed&&Number.isFinite(v.distance)&&v.distance>=0&&v.distance<1e9&&validAccess(v.access);}
export function validRoadVehicles(s){
 const r=s.roadVehicles;if(r===undefined)return true;
 if(!r||r.version!==1||!Number.isSafeInteger(r.serial)||r.serial<0||!r.vehicles||Object.keys(r.vehicles).length>30)return false;
 if(!Object.entries(r.vehicles).every(([id,v])=>id===v.id&&validRoadVehicle(v)))return false;
 const mounted=roadVehicles(s).filter(v=>v.mode==='mounted');return mounted.length<=1&&(!mounted.length||s.location==='city'&&!rideActive(s)&&drivePermission(s,mounted[0]));
}
// Pedestrians can use these spaces. Road vehicles cannot enter terraces or door thresholds.
export const VEHICLE_EXCLUSIONS=Object.freeze([
 {id:'buka-terrace',x:12,z:14.4,w:9.7,d:6.9},
 ...Object.values(ENTRANCES).map(e=>({id:'door-'+e.id,x:e.x,z:e.z+.45,w:2.5,d:1.5}))
]);
export function vehicleObstacles(s,staticObstacles,except=null){return [...staticObstacles,...VEHICLE_EXCLUSIONS,...roadVehicles(s).filter(v=>v!==except).map(v=>vehicleBox(v))];}
export function vehicleBox(v){const p=profileFor(v),c=Math.abs(Math.cos(v.heading)),n=Math.abs(Math.sin(v.heading));return {x:v.x,z:v.z,w:c*p.width+n*p.length,d:n*p.width+c*p.length};}
// Separating-axis test covers the entire oriented footprint, not a few point samples.
export function roadClear(v,x,z,heading,obstacles,profile=profileFor(v)){
 const hw=profile.width/2+.1,hl=profile.length/2+.1,c=Math.cos(heading),n=Math.sin(heading),ac=Math.abs(c),an=Math.abs(n);
 for(const side of [-1,0,1])for(const end of [-1,0,1]){const xx=x+side*hw*c+end*hl*n,zz=z-side*hw*n+end*hl*c;if(!walkableStreet(xx,zz,.02)||xx<STREET_BOUNDS.minX||xx>STREET_BOUNDS.maxX||zz<STREET_BOUNDS.minZ||zz>STREET_BOUNDS.maxZ)return false;}
 return !obstacles.some(o=>{const dx=o.x-x,dz=o.z-z,ow=o.w/2,od=o.d/2;
 return Math.abs(dx)<ow+ac*hw+an*hl&&Math.abs(dz)<od+an*hw+ac*hl&&Math.abs(dx*c-dz*n)<hw+ow*ac+od*an&&Math.abs(dx*n+dz*c)<hl+ow*an+od*ac;});
}
export function stepRoadVehicle(s,v,input,dt,obstacles,profile=profileFor(v)){
 if(v.mode!=='mounted')return false;dt=Math.max(0,Math.min(.05,dt));
 if(!drivePermission(s,v)){v.speed=0;return false;}
 const gas=Math.max(0,Math.min(1,input.accelerator||0)),brake=Math.max(0,Math.min(1,input.brake||0)),steer=Math.max(-1,Math.min(1,input.steering||0)),parking=profile.handbrake&&input.handbrake;
 // Brake first; continued brake input at rest selects reverse automatically.
 let target=brake?(gas?0:-profile.reverseSpeed*brake):gas?profile.maxSpeed*gas:0;
 if(parking)target=0;
 const reversing=v.speed*target<0,rate=parking?profile.braking*2:reversing||!target||brake&&v.speed>0?brake||parking?profile.braking:profile.coast:profile.acceleration;
 const nextSpeed=v.speed+Math.sign(target-v.speed)*Math.min(Math.abs(target-v.speed),rate*dt);
 v.speed=reversing&&v.speed*nextSpeed<0?0:nextSpeed;
 const length=v.speed*dt,steps=Math.max(1,Math.ceil(Math.abs(length)/.06));let moved=0;
 for(let i=0;i<steps;i++){
  const travel=length/steps,turn=steer*profile.steering*travel/profile.wheelbase,heading=Math.atan2(Math.sin(v.heading+turn),Math.cos(v.heading+turn)),x=v.x+Math.sin(heading)*travel,z=v.z+Math.cos(heading)*travel;
  if(!roadClear(v,x,z,heading,obstacles,profile)){v.speed=0;break;}
  v.x=x;v.z=z;v.heading=heading;moved+=Math.abs(travel);
 }
 v.distance+=moved;return moved>.0001;
}
export function safeRoadExit(v,obstacles){
 const p=profileFor(v),c=Math.cos(v.heading),n=Math.sin(v.heading),own=vehicleBox(v);
 for(const gap of [.55,.9,1.3])for(const side of [1,-1])for(const along of [0,-p.length*.25,p.length*.25]){
  const distance=p.width/2+gap,point={x:v.x+c*side*distance+n*along,z:v.z-n*side*distance+c*along};
  if(blocked(point.x,point.z,[...obstacles,own],STREET_BOUNDS,.4))continue;
  let clear=true;for(let t=0;t<=1;t+=.1){const edge=p.width/2+.35+(gap-.35)*t,xx=v.x+c*side*edge+n*along,zz=v.z-n*side*edge+c*along;if(blocked(xx,zz,obstacles,STREET_BOUNDS,.28)){clear=false;break;}}
  if(clear)return point;
 }return null;
}
export function enterRoadVehicle(s,v,location,position,obstacles){
 if(location!=='city'||activeDriver(s)||v.mode!=='parked'||!near(position,v,profileFor(v).width/2+1.7))return no('Approach the parked vehicle on foot.');
 if(!drivePermission(s,v))return no('A valid rental, ownership or driving permission is required.');
 if(rideActive(s))return no('Finish or cancel your passenger booking first.');
 if(!roadClear(v,v.x,v.z,v.heading,vehicleObstacles(s,obstacles,v)))return no('This vehicle is in an unsuitable space. Use free vehicle recovery.');
 v.mode='mounted';v.speed=0;if(v.access.job==='parcel')v.deliveryId=s.delivery.id;
 return ok('Driving controls active. Accelerator, steering and brake/reverse are separate.',{position:{x:v.x,z:v.z}});
}
export function exitRoadVehicle(s,v,obstacles){
 if(v.mode!=='mounted')return no('You are already on foot.');
 if(Math.abs(v.speed)>.1)return no('Stop completely before exiting.');
 const point=safeRoadExit(v,[...obstacles,...roadVehicles(s).filter(o=>o!==v).map(vehicleBox)]);
 if(!point)return no('No clear exit beside this vehicle. Reverse to open ground or use free recovery.');
 v.mode='parked';v.speed=0;return ok('Parked safely. Walking controls restored.',{position:point});
}
export function recoverRoadVehicle(s,v,location,position,obstacles){
 if(location!=='city'||rideActive(s)||activeDriver(s)&&activeDriver(s)!==v||Math.abs(v.speed)>.1)return no('Stop the vehicle before recovery. Finish any passenger journey first.');
 if(v.mode!=='mounted'&&!near(position,v,6))return no('Approach the stuck vehicle to recover it.');
 if(!drivePermission(s,v)&&!(v.access?.type==='permission'&&v.access.grantedTo===s.localPlayerId))return no('Driving access is required to recover this vehicle.');
 const all=vehicleObstacles(s,obstacles,v);
 if(roadClear(v,v.x,v.z,v.heading,all)&&safeRoadExit(v,obstacles))return no('A clear exit is available. Park or use brake/reverse to manoeuvre.');
 for(let radius=1;radius<=20;radius++)for(let i=0;i<24;i++)for(const heading of [v.heading,0,Math.PI/2]){
  const trial={...v,x:v.x+Math.cos(i*Math.PI/12)*radius,z:v.z+Math.sin(i*Math.PI/12)*radius,heading};
  if(!roadClear(trial,trial.x,trial.z,heading,all))continue;const exit=safeRoadExit(trial,[...obstacles,...roadVehicles(s).filter(o=>o!==v).map(vehicleBox)]);if(!exit)continue;
  Object.assign(v,{x:trial.x,z:trial.z,heading,mode:'parked',speed:0});return ok('Vehicle recovered to nearby safe parking. No charge; parcel and inventory unchanged.',{position:exit,recovered:true});
 }return no('No safe parking space found nearby. Nothing was changed or charged.');
}
export function rentRoadCar(s,v,serial,location,position){
 if(serial!==s.roadVehicles.serial||v.access.type!=='rental'||v.access.active)return no('This rental was already handled or is unavailable.');
 if(location!=='city'||!near(position,v,3)||activeDriver(s)||rideActive(s))return no('Approach this car on foot after finishing other journeys.');
 if(!(s.completedDeliveries>=1||s.stats?.shifts>=1))return no('Complete one parcel round or paid work shift to unlock self-drive rental.');
 if(s.money<RENTAL_PRICE)return no('Rental costs ₦'+RENTAL_PRICE+'. Your balance is ₦'+s.money+'. Nothing was charged.');
 cashChange(s,-RENTAL_PRICE,'purchase',{sku:'rental',ref:'rental-'+(s.roadVehicles.serial+1)});s.roadVehicles.serial++;v.access={type:'rental',active:true,renterId:s.localPlayerId};
 return ok('Rental paid: ₦'+RENTAL_PRICE+'. You may drive this car until you return it to the Dispatch rental bay. No ownership granted.');
}
export function returnRoadCar(s,v,location,position){
 if(v.access.type!=='rental'||!v.access.active||v.access.renterId!==s.localPlayerId)return no('There is no active rental to return.');
 if(v.mode!=='parked'||Math.abs(v.speed)>.1||location!=='city'||!near(position,v,3)||!near(v,RENTAL_BAY,4))return no('Park near the Dispatch rental bay and exit before returning the car.');
 v.access={type:'rental',active:false,renterId:null};s.roadVehicles.serial++;return ok('Rental returned. No extra charge. Driving permission ended.');
}
