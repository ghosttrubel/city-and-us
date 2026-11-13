import {cashChange} from './bank.js';
import {driving} from './road-vehicles.js';
import {PICKUP_STOPS,RIDE_START,FARE_DISTANCE,localRoadPath} from './ride-roads.js';
// Device-local daily life. State transitions and currency settle in one save snapshot.
import {HOME_STATIONS} from './home-layout.js';
import {activeMeals,heldMeal,newMeal,NUTRITION,validPhysicalMeal,kitchenActive} from './home-life.js';
import {ENTRANCES,near} from './neighbourhood.js';
import {routeLength} from './navigation.js';
export const FOOD_SOURCE={x:12,z:13.5};
export const FOOD_MENU=Object.freeze({jollof:{name:'Jollof & plantain',price:800,food:65,mood:8},beans:{name:'Beans & plantain',price:600,food:55,mood:6}});
export const DELIVERY_FEE=150;
export const FOOD_ADDRESSES=['home','dispatch','shop'];
export const RIDE_STOPS=PICKUP_STOPS;
export const RIDE_SERVICES=Object.freeze({neighbourhood:{name:'Neighbourhood car',base:250,step:50},danfo:{name:'Yellow danfo',base:100,step:25}});
export const RIDE_DEPOT=RIDE_START;
const FOOD_ACTIVE=['preparing','collecting','delivering','arrived'],RIDE_ACTIVE=['dispatching','waiting','travelling','arrived'];
export const activeFood=s=>FOOD_ACTIVE.includes(s.daily?.order?.status);
export const activeRide=s=>RIDE_ACTIVE.includes(s.daily?.ride?.status);
export const passenger=s=>['travelling','arrived'].includes(s.daily?.ride?.status);
export const activeCook=s=>['prep','simmer'].includes(s.daily?.cook?.status);
const failure=message=>({ok:false,message}),success=(message,extra={})=>({ok:true,message,...extra});
const int=(n,max=1e9)=>Number.isSafeInteger(n)&&n>=0&&n<=max;
const finite=(n,min,max)=>Number.isFinite(n)&&n>=min&&n<=max;
export function migrateDaily(s,data){s.daily=data?.daily?structuredClone(data.daily):{version:1,foodSerial:0,rideSerial:0,cookSerial:0,order:null,ride:null,cook:null,meals:[],guide:null,stats:{received:0,eaten:0,rides:0,cooked:0}};return s;}
export function validDaily(s){
 const d=s.daily;if(d===undefined)return true;if(!d||d.version!==1||!['foodSerial','rideSerial','cookSerial'].every(k=>int(d[k]))||!d.stats||!['received','eaten','rides','cooked'].every(k=>int(d.stats[k]))||![null,'food','ride','cook'].includes(d.guide)||!Array.isArray(d.meals)||d.meals.length>80||activeMeals(s).length>20)return false;
 if(d.meals.filter(m=>m?.phase==='carried').length>1||d.meals.filter(m=>m?.place==='table'&&['placed','opened','partly-eaten'].includes(m.phase)).length>1)return false;
 const seen=new Set();for(const m of d.meals){if(!m||typeof m.id!=='string'||!/^food-[1-9][0-9]*$|^cook-[1-9][0-9]*$/.test(m.id)||seen.has(m.id)||!Object.hasOwn(NUTRITION,m.recipe)||!validPhysicalMeal(m))return false;seen.add(m.id);const [kind,n]=m.id.split('-');if(Number(n)>d[kind==='food'?'foodSerial':'cookSerial'])return false;}
 const o=d.order;if(o!==null&&(!o||!int(o.id)||o.id<1||o.id>d.foodSerial||!Object.hasOwn(FOOD_MENU,o.menu)||!FOOD_ADDRESSES.includes(o.address)||![...FOOD_ACTIVE,'received','cancelled'].includes(o.status)||o.total!==FOOD_MENU[o.menu].price+DELIVERY_FEE||!finite(o.progress,0,1)))return false;
 const r=d.ride;if(r!==null&&(!r||!int(r.id)||r.id<1||r.id>d.rideSerial||!Object.hasOwn(RIDE_STOPS,r.pickup)||!Object.hasOwn(RIDE_STOPS,r.destination)||r.pickup===r.destination||!Object.hasOwn(RIDE_STOPS,r.dropoff)||![...RIDE_ACTIVE,'complete','cancelled','ended'].includes(r.status)||!Object.hasOwn(RIDE_SERVICES,r.service??'neighbourhood')||r.fare!==rideQuote(r.pickup,r.destination,r.service??'neighbourhood').fare||!finite(r.progress,0,1)||typeof r.early!=='boolean'||!Array.isArray(r.path)||r.path.length<2||r.path.length>32||!r.path.every(p=>p&&finite(p.x,-1.81,40.01)&&finite(p.z,-42.01,42.01))||!finite(r.distance,0,1000)))return false;
 if(r&&['travelling','arrived'].includes(r.status)&&s.location!=='city')return false;
 const c=d.cook;if(c!==null&&(!c||!int(c.id)||c.id<1||c.id>d.cookSerial||!['prep','simmer','complete','cancelled'].includes(c.status)||!int(c.chops,3)||!finite(c.heat,0,100)||!finite(c.burner,0,100)||!finite(c.elapsed,0,60)||!finite(c.good,0,60)||!int(c.stirs,100)||!finite(c.sinceStir,0,60)||![null,'good','practice'].includes(c.quality)))return false;
 return true;
}
export const roadPath=localRoadPath;
export function pathPoint(path,progress){
 const total=routeLength(path);let remaining=Math.min(1,Math.max(0,progress))*total;
 for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],length=Math.hypot(b.x-a.x,b.z-a.z);if(remaining<=length||i===path.length-1){const t=length?Math.min(1,remaining/length):1;return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,heading:Math.atan2(b.x-a.x,b.z-a.z)};}remaining-=length;}
 return {...path[0],heading:0};
}
export function makeDailyRoutes(navigator){return {collect:navigator.route(ENTRANCES.dispatch.outside,FOOD_SOURCE),deliver:Object.fromEntries(FOOD_ADDRESSES.map(id=>[id,navigator.route(FOOD_SOURCE,ENTRANCES[id].outside)]))};}
export function rideQuote(pickup,destination,service='neighbourhood'){if(!Object.hasOwn(RIDE_SERVICES,service)||!Object.hasOwn(RIDE_STOPS,pickup)||!Object.hasOwn(RIDE_STOPS,destination)||pickup===destination)return null;const path=roadPath(RIDE_STOPS[pickup].point,RIDE_STOPS[destination].point),rate=RIDE_SERVICES[service];return {path,fare:rate.base+Math.ceil(Math.abs(FARE_DISTANCE[pickup]-FARE_DISTANCE[destination])/10)*rate.step};}
function mealSpace(s){return activeMeals(s).length+(activeFood(s)?1:0)+(activeCook(s)?1:0)+(kitchenActive(s)?1:0)<20;}
export function orderFood(s,menu,address,expectedSerial,routes){
 const d=s.daily;if(expectedSerial!==d.foodSerial||activeFood(s))return failure('This order was already handled.');if(!Object.hasOwn(FOOD_MENU,menu)||!FOOD_ADDRESSES.includes(address))return failure('Choose an available meal and address.');
 if(!routes?.collect?.length||!routes.deliver[address]?.length)return failure('No delivery route is available. Nothing was charged.');if(!mealSpace(s))return failure('Your meal storage is full. Eat a meal first.');
 const total=FOOD_MENU[menu].price+DELIVERY_FEE;if(s.money<total)return failure('Not enough game currency. Nothing was charged.');if(d.foodSerial>=1e9)return failure('Order limit reached.');
 cashChange(s,-total,'purchase',{sku:'food-'+menu,ref:'food-'+(d.foodSerial+1)});d.order={id:++d.foodSerial,menu,address,total,status:'preparing',progress:0};s.stats.purchases++;return success('Order confirmed. Meet the courier outside '+ENTRANCES[address].name+'.');
}
export function cancelFood(s,id){const o=s.daily.order;if(!o||o.id!==id||!activeFood(s))return failure('This order can no longer be cancelled.');o.status='cancelled';cashChange(s,o.total,'refund',{ref:'food-'+o.id});if(s.daily.guide==='food')s.daily.guide=null;return success('Order cancelled. '+o.total+' game currency refunded.');}
export function receiveFood(s,id,location,position){const o=s.daily.order;if(!o||o.id!==id||o.status!=='arrived'||location!=='city'||!near(position,ENTRANCES[o.address].outside,1.7))return failure('Meet the courier at the delivery entrance first.');if(activeMeals(s).length>=20||heldMeal(s))return failure('Place or store the meal in your hand first.');if(s.daily.meals.some(m=>m.id==='food-'+o.id))return failure('That meal was already received.');o.status='received';newMeal(s,'food-'+o.id,o.menu,{carry:true});s.daily.stats.received++;if(s.daily.guide==='food')s.daily.guide=null;return success('Meal received in your hand. Carry it home to the dining table.');}
export function mealInfo(recipe){return NUTRITION[recipe];}
export function eatMeal(){return failure('Carry the meal to your table, open it, and sit to eat.');}
export function bookRide(s,pickup,destination,expectedSerial,service='neighbourhood'){
 if(driving(s))return failure('Park and exit your vehicle before booking a passenger ride.');
 const d=s.daily,quote=rideQuote(pickup,destination,service);if(expectedSerial!==d.rideSerial||activeRide(s))return failure('This booking was already handled.');if(!quote)return failure('Choose two different stops.');if(s.money<quote.fare)return failure('Not enough game currency. Nothing was charged.');if(d.rideSerial>=1e9)return failure('Trip limit reached.');
 cashChange(s,-quote.fare,'ride',{service,pickup,destination,ref:'ride-'+(d.rideSerial+1)});d.ride={id:++d.rideSerial,service,pickup,destination,dropoff:destination,fare:quote.fare,status:'dispatching',progress:0,path:roadPath(RIDE_DEPOT,RIDE_STOPS[pickup].point),distance:0,early:false};d.guide='ride';return success(RIDE_SERVICES[service].name+' booked. Walk to '+RIDE_STOPS[pickup].name+'.');
}
export function cancelRide(s,id){
 const r=s.daily.ride;if(!r||r.id!==id||!['dispatching','waiting'].includes(r.status))return failure('This ride cannot be refunded after boarding.');r.status='cancelled';cashChange(s,r.fare,'refund',{ref:'ride-'+r.id});if(s.daily.guide==='ride')s.daily.guide=null;return success('Ride cancelled. Full fare refunded.');
}
export function boardRide(s,id,location,position){
 const r=s.daily.ride;if(driving(s)||!r||r.id!==id||r.status!=='waiting'||location!=='city'||!near(position,RIDE_STOPS[r.pickup].curb,1.6))return failure('Meet your vehicle at the pickup marker first.');
 r.status='travelling';r.progress=0;r.path=roadPath(RIDE_STOPS[r.pickup].point,RIDE_STOPS[r.destination].point);r.distance=0;s.daily.guide='ride';return success('On board. Your vehicle is travelling to '+RIDE_STOPS[r.destination].name+'.');
}
export function requestEarlyStop(s,id){
 const r=s.daily.ride;if(!r||r.id!==id||r.status!=='travelling'||r.early)return failure('No early stop is available now.');const here=pathPoint(r.path,r.progress),stops=Object.entries(RIDE_STOPS).map(([id,stop])=>({id,stop,length:routeLength(roadPath(here,stop.point))})).filter(v=>v.length>.3).sort((a,b)=>a.length-b.length),next=[stops[0].id,stops[0].stop];
 r.early=true;r.dropoff=next[0];r.path=roadPath(here,next[1].point);r.progress=0;return success('Stopping at '+next[1].name+'. The agreed fare is retained.');
}
export function alightRide(s,id){const r=s.daily.ride;if(!r||r.id!==id||r.status!=='arrived')return failure('Wait until the vehicle stops.');r.status=r.early?'ended':'complete';if(!r.early)s.daily.stats.rides++;if(s.daily.guide==='ride')s.daily.guide=null;return success('You have arrived at '+RIDE_STOPS[r.dropoff].name+'.',{position:{...RIDE_STOPS[r.dropoff].curb},minutes:Math.max(1,Math.round(r.distance/3))});}
export function startCooking(s,serial,location,position){
 const d=s.daily;if(serial!==d.cookSerial||activeCook(s))return failure('A cooking session is already prepared.');if(location!=='home'||!near(position,{x:3.3,z:-2},1.15))return failure('Walk to your home cooker.');if(s.pantry<1)return failure('Buy groceries at the provisions shop first.');if(!mealSpace(s))return failure('Meal storage is full.');if(d.cookSerial>=1e9)return failure('Cooking limit reached.');
 s.pantry--;d.cook={id:++d.cookSerial,status:'prep',chops:0,heat:35,burner:65,elapsed:0,good:0,stirs:0,sinceStir:2,quality:null};return success('One grocery reserved. Chop the vegetables, then manage the heat.');
}
export function chopFood(s,id){const c=s.daily.cook;if(!c||c.id!==id||c.status!=='prep')return failure('Preparation is already done.');if(++c.chops===3)c.status='simmer';return success(c.status==='prep'?'Chop '+c.chops+' of 3.':'Now simmer: keep heat in the green band, stir twice, then serve.');}
export function setBurner(s,id,value){const c=s.daily.cook;if(!c||c.id!==id||c.status!=='simmer'||!finite(value,0,100))return false;c.burner=value;return true;}
export function stirFood(s,id){const c=s.daily.cook;if(!c||c.id!==id||c.status!=='simmer'||c.sinceStir<2)return failure('Give the pot two seconds before stirring again.');c.stirs=Math.min(100,c.stirs+1);c.sinceStir=0;return success('Stirred. Keep the heat between 55 and 75.');}
export function cookTick(s,dt){const c=s.daily.cook;if(c?.status!=='simmer')return;dt=Math.max(0,Math.min(dt,.25));c.heat=Math.max(0,Math.min(100,c.heat+(c.burner-c.heat)*Math.min(1,dt*.5)));c.elapsed=Math.min(60,c.elapsed+dt);c.sinceStir=Math.min(60,c.sinceStir+dt);if(c.heat>=55&&c.heat<=75)c.good=Math.min(60,c.good+dt);}
export function cancelCooking(s,id){const c=s.daily.cook;if(!c||c.id!==id||!activeCook(s))return failure('This cooking session is already settled.');const refund=c.status==='prep';if(refund&&s.pantry>=99)return failure('Make room in your pantry before returning this grocery.');if(refund)s.pantry++;c.status='cancelled';if(s.daily.guide==='cook')s.daily.guide=null;return success(refund?'Preparation cancelled. Grocery returned.':'Cooking cancelled. The heated ingredient was used.');}
export function serveCooking(s,id){
 const c=s.daily.cook;if(!c||c.id!==id||c.status!=='simmer'||c.elapsed<10)return failure('Simmer for at least 10 seconds before serving.');if(s.daily.meals.length>=20)return failure('Meal storage is full.');const good=c.good>=4&&c.stirs>=2;c.status='complete';c.quality=good?'good':'practice';s.daily.meals.push({id:'cook-'+c.id,recipe:good?'home-jollof':'practice-rice'});s.daily.stats.cooked++;s.stats.cooked++;if(good)s.skills.chef++;s.energy=Math.max(0,s.energy-3);if(s.daily.guide==='cook')s.daily.guide=null;return success(good?'Jollof ready. Cooking skill increased. Eat or store your meal.':'A practice plate. Next time, hold the green heat band and stir twice.',{minutes:30});
}
export function courierPoint(s,routes){const o=s.daily.order;if(!o||!activeFood(s)||o.status==='preparing')return null;if(o.status==='arrived')return {...ENTRANCES[o.address].outside,heading:Math.PI};const path=o.status==='collecting'?routes.collect:routes.deliver[o.address];return path?.length?pathPoint(path,o.progress):null;}
export function ridePoint(s){return activeRide(s)?pathPoint(s.daily.ride.path,s.daily.ride.progress):null;}
export function stepServices(s,dt,routes){
 dt=Math.max(0,Math.min(.25,dt));const events=[],o=s.daily.order;
 if(activeFood(s)&&o.status!=='arrived'){
  const old=o.status;if(o.status==='preparing'){o.progress=Math.min(1,o.progress+dt/6);if(o.progress>=1){o.status='collecting';o.progress=0;}}
  else{const path=o.status==='collecting'?routes.collect:routes.deliver[o.address];if(path?.length){o.progress=Math.min(1,o.progress+dt*3/Math.max(.01,routeLength(path)));if(o.progress>=1){o.status=o.status==='collecting'?'delivering':'arrived';o.progress=o.status==='arrived'?1:0;}}}
  if(old!==o.status)events.push(o.status==='arrived'?'Your food courier is waiting at '+ENTRANCES[o.address].name+'.':o.status==='delivering'?'Your courier collected the meal at Mama T’s.':'Your meal is prepared. The courier is collecting it.');
 }
 const r=s.daily.ride;if(activeRide(s)&&['dispatching','travelling'].includes(r.status)){const length=routeLength(r.path),before=r.progress;r.progress=Math.min(1,r.progress+dt*5/Math.max(.01,length));if(r.status==='travelling')r.distance+=length*(r.progress-before);if(r.progress>=1){r.status=r.status==='dispatching'?'waiting':'arrived';events.push(r.status==='waiting'?'Your ride is at '+RIDE_STOPS[r.pickup].name+'.':'The vehicle has stopped. Use Action to get out.');}}
 return events;
}
export function dailyObjective(s){
 const d=s.daily;if(passenger(s))return d.ride.status==='arrived'?'Ride stopped · Action to get out':'Riding to '+RIDE_STOPS[d.ride.dropoff].name;
 if(activeRide(s))return d.ride.status==='waiting'?'Ride waiting · meet at '+RIDE_STOPS[d.ride.pickup].name:'Vehicle approaching · '+RIDE_STOPS[d.ride.pickup].name;
 if(activeFood(s))return d.order.status==='arrived'?'Food waiting · collect outside '+ENTRANCES[d.order.address].name:'Food order · '+d.order.status;
 if(kitchenActive(s))return 'Home recipe · '+s.homeLife.job.stage+' · use the kitchen stations';if(activeCook(s))return 'Cooking paused · return to your cooker';return null;
}
export function dailyGuidance(s){const d=s.daily;if(d.guide==='ride'&&activeRide(s)){const stop=RIDE_STOPS[passenger(s)?d.ride.dropoff:d.ride.pickup];return {name:stop.name,point:stop.curb,entrance:stop.entrance,service:true};}if(d.guide==='food'&&activeFood(s)){const e=ENTRANCES[d.order.address];return {name:'Food courier · '+e.name,point:e.outside,entrance:e.id,service:true};}if(d.guide==='cook'){const e=ENTRANCES.home;return {name:'Home cooker',point:e.outside,entrance:'home',service:true};}return null;}
