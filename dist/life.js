import {validMovieWatch} from './movie-catalogue.js';
import {migrateBank,validBank} from './bank.js';
import {migrateRoadVehicles,validRoadVehicles} from './road-vehicles.js';
import {migrateProvisions,validProvisions} from './provisions.js';
import {migrateStreetLayout} from './street-layout-state.js';
import {migrateBike,validBike} from './dispatch-bike.js';
import {migrateEnvironment,validEnvironment,advanceWeather} from './environment-state.js';
import {migrateDestinations,validDestinations} from './destinations-state.js';
import {migrateFoodService,validFoodService} from './food-service.js';
import {migrateHomeLife,validHomeLife} from './home-life.js';
import {HOME_STATIONS} from './home-layout.js';
import {validResolution} from './resolution.js';
import {migrateDaily,validDaily} from './daily-life.js';
import {migrateDecor,validDecor,validatePlacement} from './decor-state.js';
import {migrateWardrobe,validWardrobe} from './wardrobe-state.js';
import {migrateNeighbourhood,validNeighbourhood,STREET_BOUNDS} from './neighbourhood.js';
import {validHomeStyle} from './home-style.js';
// Device-local solo simulation. Currency and identity are not server authority.
export const TRAITS={
  industrious:{name:'Industrious',text:'Earn 10% more on successful shifts.'},
  curious:{name:'Curious',text:'Gain an extra study point at the desk.'},
  hearty:{name:'Hearty',text:'Food drains 25% more slowly.'},
  easygoing:{name:'Easygoing',text:'Mood drains 40% more slowly.'}
};
export const HOMES={
  courtyard:{name:'Courtyard room',rent:1800,text:'A simple, light room. Lowest weekly rent.',wall:'#e8ecef',floor:'#b1bfc5',accent:'#7194a0'},
  studio:{name:'Surulere studio',rent:2500,text:'A calm blue studio. Meals restore 5 extra food.',wall:'#edf0f0',floor:'#b5c0c5',accent:'#6e96a3'},
  loft:{name:'Study loft',rent:4000,text:'A blue reading nook. Gain an extra study point.',wall:'#dfe7ec',floor:'#aab9c1',accent:'#6686a1'}
};
export const GOALS={
  saver:{name:'Build a cushion',text:'Save ₦20,000. Reward: ₦1,000.',target:20000},
  professional:{name:'Find your calling',text:'Reach skill 3 in any job. Reward: ₦1,500.',target:3},
  scholar:{name:'Keep learning',text:'Earn 6 study points. Reward: ₦1,200.',target:6}
};
export const DEFAULT_STORY={traits:['industrious','curious'],goal:'saver',home:'studio'};
export function newPlayerId(){const bytes=new Uint8Array(8);globalThis.crypto.getRandomValues(bytes);return 'LS-'+Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('').toUpperCase()}
export function migrate(data,initial,playerId){
  const s={...structuredClone(initial),...data,skills:{...initial.skills,...data?.skills}};
  s.localPlayerId=playerId;s.nearbyNames=data?.nearbyNames!==false;
  s.characterStyle=data?.characterStyle==='natural'?'natural':'classic';
  s.homeStyle=validHomeStyle(data?.homeStyle)?data?.homeStyle:undefined;
  s.traits=Array.isArray(s.traits)&&s.traits.length===2&&new Set(s.traits).size===2&&s.traits.every(t=>TRAITS[t])?[...s.traits]:[...DEFAULT_STORY.traits];
  s.goal=GOALS[s.goal]?s.goal:DEFAULT_STORY.goal;s.home=HOMES[s.home]?s.home:DEFAULT_STORY.home;
  s.onboarded=typeof data?.onboarded==='boolean'?data.onboarded:!!data?.name;
  s.hygiene=Number.isFinite(s.hygiene)?Math.max(0,Math.min(100,s.hygiene)):85;
  s.pantry=Number.isInteger(s.pantry)&&s.pantry>=0&&s.pantry<=99?s.pantry:3;
  s.study=Number.isInteger(s.study)&&s.study>=0?s.study:0;
  s.stats={cooked:0,washed:0,studied:0,slept:0,shifts:0,purchases:0,...s.stats};
  s.claimedTasks=Array.isArray(s.claimedTasks)?s.claimedTasks:[];
  s.studyFocus=['trader','rider','chef'].includes(s.studyFocus)?s.studyFocus:'trader';s.goalClaimed=!!s.goalClaimed;s.graphics=['phone','balanced','battery'].includes(s.graphics)?s.graphics:'phone';s.resolution=validResolution(s.resolution)?s.resolution:validResolution(initial.resolution)?initial.resolution:'low';
  migrateBank(s);migrateEnvironment(s,data);migrateWardrobe(s,data);migrateDecor(s,data);migrateDaily(s,data);migrateHomeLife(s,data);migrateFoodService(s,data);migrateDestinations(s,data);migrateNeighbourhood(s,data);migrateStreetLayout(s,data);migrateBike(s,data);migrateRoadVehicles(s,data);return migrateProvisions(s,data);
}
export function applyStory(s,choices=DEFAULT_STORY){
  if(s.onboarded)return;
  s.traits=[...choices.traits];s.goal=choices.goal;s.home=choices.home;s.onboarded=true;
}
export function advanceLife(s,min){
  s.time+=min;while(s.time>=1440){s.time-=1440;s.day++}
  advanceWeather(s);s.food=Math.max(0,s.food-min*.07*(s.traits.includes('hearty')?.75:1));
  s.energy=Math.max(0,s.energy-min*.04);
  s.mood=Math.max(0,s.mood-min*.02*(s.traits.includes('easygoing')?.6:1));
  s.hygiene=Math.max(0,s.hygiene-min*.025);
}
export const ACTIVITIES={
  sleep:{name:'Sleep',object:'Bed',minutes:480,detail:'8 game hours · restore energy',x:-2.8,z:-2,stand:[-.8,-1.4]},
  cook:{name:'Prepare food',object:'Cooker',minutes:30,detail:'Play the recipe · 1 grocery · eat or store your meal',x:3.5,z:-3.3,stand:[3.3,-2]},
  wash:{name:'Wash',object:'Bathroom',minutes:20,detail:'20 min · restore hygiene',x:3.6,z:2,stand:[3.2,.5]},
  study:{name:'Study',object:'Desk',minutes:60,detail:'1 game hour · study & job progress',x:.4,z:-3.6,stand:[.3,-1.85]},
  wardrobe:{name:'Change clothes',object:'Wardrobe',detail:'Your full wardrobe & salon',x:-4,z:1.8,stand:[-2.7,1.8]}
  ,sit:{name:'Sit & unwind',object:'Sofa',minutes:30,detail:'30 min · +15 mood',x:-.1,z:2.2,stand:[-.1,1.05]}
  ,computer:{name:'Use computer',object:'Computer',minutes:30,detail:'30 min · +1 study point',x:.4,z:-3.6,stand:[1.25,-2.15]}
};
for(const [id,station] of Object.entries(HOME_STATIONS))if(ACTIVITIES[id])Object.assign(ACTIVITIES[id],{x:station.x,z:station.z,stand:[station.stand.x,station.stand.z]});
export function activityBlock(s,id){
  if(id==='sit'&&!s.furniture)return 'Buy a sofa for your living room first.';
  if(id==='computer'&&s.energy<10)return 'Rest first. Using the computer needs 10 energy.';
  if(id==='cook'&&s.pantry<1)return 'No groceries left. Buy a bag at the market for ₦500.';
  if(id==='study'&&s.energy<15)return 'Sleep first. Studying needs at least 15 energy.';
  return null;
}
export function completeActivity(s,id){
  if(!ACTIVITIES[id]?.minutes||activityBlock(s,id))return false;
  advanceLife(s,ACTIVITIES[id].minutes);
  if(id==='sleep'){s.energy=100;s.mood=Math.min(100,s.mood+15);s.stats.slept++}
  if(id==='cook'){s.pantry--;s.food=Math.min(100,s.food+50+(s.home==='studio'?5:0));s.skills.chef++;s.stats.cooked++}
  if(id==='wash'){s.hygiene=100;s.mood=Math.min(100,s.mood+8);s.stats.washed++}
  if(id==='study'){const points=1+(s.traits.includes('curious')?1:0)+(s.home==='loft'?1:0);s.study+=points;s.skills[s.studyFocus]+=points;s.energy=Math.max(0,s.energy-5);s.stats.studied++}
  if(id==='sit')s.mood=Math.min(100,s.mood+15);
  if(id==='computer'){s.study++;s.energy=Math.max(0,s.energy-3)}
  return true;
}
export function shiftPay(s,pay,success){return Math.round(pay*(success&&s.traits.includes('industrious')?1.1:1))}
export function goalProgress(s){return s.goal==='saver'?s.money+(s.bank?.balance||0):s.goal==='scholar'?s.study:Math.max(s.skills.trader,s.skills.rider,s.skills.chef)}
export function goalReward(s){return s.goal==='professional'?1500:s.goal==='scholar'?1200:1000}
export const TASKS=[
  {id:'food-delivery',name:'Dinner at your door',text:'Receive a phone food delivery and eat a stored meal.',reward:150,done:s=>s.daily?.stats.received>0&&s.daily?.stats.eaten>0},
  {id:'local-ride',name:'Across the neighbourhood',text:'Book a ride, board and get out at your chosen destination.',reward:200,done:s=>s.daily?.stats.rides>0},
  {id:'home-chef',name:'One pot, your way',text:'Play the cooking activity and serve a meal.',reward:150,done:s=>s.daily?.stats.cooked>0},
  {id:'settle',name:'Settle into home',text:'Prepare food, wash and sleep.',reward:500,done:s=>s.stats.cooked>0&&s.stats.washed>0&&s.stats.slept>0},
  {id:'learn',name:'Invest in yourself',text:'Study once at your desk.',reward:300,done:s=>s.stats.studied>0},
  {id:'earn',name:'Earn your daily bread',text:'Complete a successful job shift.',reward:500,done:s=>s.stats.shifts>0},
  {id:'shop',name:'Make the place yours',text:'Buy a sofa at the market or at Home.',reward:400,done:s=>s.furniture}
];
export function validSave(v){
  const d=v?.data;if(v?.version!==1||!d||typeof d.name!=='string'||d.name.length>24)return false;
  if(!validBank(d.bank)||!validMovieWatch(d.movieWatch))return false;
  if(!validEnvironment(d)||!validDaily(d)||!validHomeLife(d.homeLife)||!validFoodService(d.foodService)||!validDestinations(d.cityVisits))return false;
  if(d.wardrobe!==undefined&&!validWardrobe(d.wardrobe))return false;
  if(d.decor!==undefined&&!validDecor(d.decor))return false;
  if(!validHomeStyle(d.homeStyle)||d.characterStyle!==undefined&&!['classic','natural'].includes(d.characterStyle))return false;
  if(!['money','food','energy','mood','time','day','x','z','rentDay'].every(k=>Number.isFinite(d[k]))||!['trader','rider','chef'].every(k=>Number.isFinite(d.skills?.[k])&&d.skills[k]>=0))return false;
  if(d.money<0||d.time<0||d.time>=1440||!Number.isInteger(d.day)||d.day<1||d.x<STREET_BOUNDS.minX-4||d.x>STREET_BOUNDS.maxX+4||d.z<STREET_BOUNDS.minZ-5||d.z>STREET_BOUNDS.maxZ+5||d.rentDay<1||d.rentDay>d.day||['food','energy','mood'].some(k=>d[k]<0||d[k]>100))return false;
  for(const k of ['skin','shirt'])if(!/^#[0-9a-f]{6}$/i.test(d[k]))return false;
  for(const k of ['hairColor','bottom','shoes'])if(d[k]!==undefined&&!/^#[0-9a-f]{6}$/i.test(d[k]))return false;
  for(const [k,values] of Object.entries({sex:['female','male'],build:['slim','average','athletic','broad'],face:['soft','angular'],hair:['bob','locs','braids','fade','afro','bun','bald'],outfit:['streetwear','jacket','native','dress'],accessory:['none','earrings','glasses','chain']}))if(d[k]!==undefined&&!values.includes(d[k]))return false;
  if(d.traits!==undefined&&(!Array.isArray(d.traits)||d.traits.length!==2||new Set(d.traits).size!==2||!d.traits.every(t=>TRAITS[t])))return false;
  if(d.goal!==undefined&&!GOALS[d.goal]||d.home!==undefined&&!HOMES[d.home])return false;
  for(const k of ['pantry','study','hygiene'])if(d[k]!==undefined&&(!Number.isFinite(d[k])||d[k]<0||(k!=='study'&&d[k]>(k==='pantry'?99:100))||(k!=='hygiene'&&!Number.isInteger(d[k]))))return false;
  if(d.stats!==undefined&&(!d.stats||typeof d.stats!=='object'||!['cooked','washed','studied','slept','shifts','purchases'].every(k=>d.stats[k]===undefined||Number.isInteger(d.stats[k])&&d.stats[k]>=0)))return false;
  if(d.claimedTasks!==undefined&&(!Array.isArray(d.claimedTasks)||!d.claimedTasks.every(id=>TASKS.some(t=>t.id===id))))return false;
  if(d.studyFocus!==undefined&&!['trader','rider','chef'].includes(d.studyFocus))return false;
  if(d.graphics!==undefined&&!['phone','balanced','battery'].includes(d.graphics))return false;
  if(d.resolution!==undefined&&!validResolution(d.resolution))return false;
  for(const k of ['onboarded','goalClaimed','furniture','nearbyNames'])if(d[k]!==undefined&&typeof d[k]!=='boolean')return false;
  return validProvisions(d.provisions)&&validRoadVehicles(d)&&validNeighbourhood(d)&&validBike(d)&&(d.streetLayoutVersion===undefined||d.streetLayoutVersion===2);
}
