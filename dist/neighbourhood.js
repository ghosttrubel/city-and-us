import {HOME_BOUNDS} from './home-layout.js';
// Shared spatial data for the scene, collision, map, doors and delivery rules.
export const BUILDINGS=[
 {id:'home',x:-12,z:7,w:8,d:7,h:7.1,color:'#d5ad7b',name:'Your home'},
 {id:'food',x:12,z:8,w:8,d:7,h:5.6,color:'#ddb779',name:'Mama T’s kitchen'},
 {id:'dispatch',x:16,z:-35,w:8,d:7,h:6.2,color:'#b3c4b5',name:'Dispatch hub'},
 {id:'apartments',x:-13,z:-24,w:9,d:9,h:9.3,color:'#c78660',name:'Corner apartments'},
 {id:'flats',x:-27,z:8,w:10,d:8,h:9,color:'#c9b793',name:'Mainland flats'},
 {id:'estate',x:34,z:-33,w:9,d:9,h:13,color:'#a7b4a3',name:'Estate'},
 {id:'neighbourhood',x:38,z:4,w:9,d:8,h:8,color:'#b98065',name:'Neighbourhood'},
 {id:'mainland',x:-26,z:-24,w:9,d:10,h:12,color:'#afaf9a',name:'Mainland'},
 {id:'south-east',x:17,z:37,w:8,d:7,h:7.5,color:'#d4ba8c',name:'Neighbourhood'},
 {id:'south-west',x:-12,z:27,w:8,d:7,h:6,color:'#c5c1a1',name:'Neighbourhood'},
 {id:'clinic',x:-27,z:27,w:9,d:8,h:6,color:'#d9cfb8',name:'Community clinic'}
];
for(const b of BUILDINGS)b.district='surulere';
BUILDINGS.push(
 {id:'library',district:'yaba',x:-14,z:-66,w:9,d:8,h:5.2,color:'#cfb37d',name:'Yaba Reading Room'},
 {id:'hub',district:'yaba',x:14,z:-94,w:10,d:8,h:6.5,color:'#5b9397',name:'Yaba Works'},
 {id:'yaba-court',district:'yaba',x:16,z:-66,w:10,d:8,h:8,color:'#c7916e',name:'Campus court'},
 {id:'yaba-books',district:'yaba',x:-16,z:-97,w:12,d:6,h:3.5,color:'#799678',name:'Book market'},
 {id:'arcade',district:'island',x:82,z:7,w:12,d:10,h:8.2,color:'#dfcba0',name:'Island Trading Arcade'},
 {id:'islandfood',district:'island',x:112,z:7,w:10,d:8,h:4.8,color:'#c87d64',name:'Marina Kitchen'},
 {id:'island-clock',district:'island',x:81,z:-29,w:5,d:5,h:10,color:'#e4d8b5',name:'Marina clock tower'},
 {id:'island-house',district:'island',x:112,z:-31,w:13,d:8,h:11,color:'#9ab4b1',name:'Marina House'}
);
// Reuse existing footprints; unfinished sites stay closed.
for(const [id,name] of Object.entries({'south-west':'Grace Courtyard Church · planned',neighbourhood:'Neighbourhood Mosque · planned',estate:'Mainland Police Station · planned',flats:'Governor Residence Site · planned'})){const b=BUILDINGS.find(b=>b.id===id);b.name=name;b.planned=true;}
Object.assign(BUILDINGS.find(b=>b.id==='island-house'),{name:'Tide Courtyard Hotel',h:8.5,color:'#d6bc8e'});
Object.assign(BUILDINGS.find(b=>b.id==='islandfood'),{name:'Lagoon Pot Eatery'});
BUILDINGS.push({id:'club',district:'ajah',x:183,z:-24,w:10,d:8,h:4.2,color:'#826e92',name:'Lantern Yard Club'},{id:'beach',district:'ajah',x:183,z:16,w:9,d:6,h:3,color:'#bdac78',name:'Coastal Beach Gate'},{id:'president-site',district:'ajah',x:158,z:18,w:9,d:8,h:4,color:'#b6c3ac',name:'Presidential Residence Site · planned',planned:true});
export const DISTRICTS=[
 {id:'surulere',name:'Mainland · Surulere',bounds:{minX:-44,maxX:52,minZ:-48,maxZ:48},description:'Home, delivery rounds & neighbourhood life'},
 {id:'yaba',name:'Mainland · Yaba',bounds:{minX:-32,maxX:32,minZ:-112,maxZ:-52},description:'Reading room, tech work & book market'},
 {id:'island',name:'Victoria Island',bounds:{minX:68,maxX:126,minZ:-42,maxZ:34},description:'Existing waterfront reused: Tide Courtyard Hotel, Lagoon Pot & trading arcade'},
 {id:'ajah',name:'Ajah / coast',bounds:{minX:150,maxX:196,minZ:-40,maxZ:34},description:'Lantern Yard Club and a compact coastal beach'}
];
export const WATER=[{x:60,z:-7,w:14,d:105}];
export const CONNECTIONS=[{x:0,z:-46,w:14,d:12,name:'Yaba link'},{x:52,z:-10,w:32,d:12,name:'Mainland bridge'},{x:138,z:-10,w:24,d:12,name:'Coastal link'}];
export function districtAt(x,z){return DISTRICTS.find(d=>x>=d.bounds.minX&&x<=d.bounds.maxX&&z>=d.bounds.minZ&&z<=d.bounds.maxZ)?.name||CONNECTIONS.find(c=>Math.abs(x-c.x)<=c.w/2&&Math.abs(z-c.z)<=c.d/2)?.name||'City edge'}
export function walkableStreet(x,z,radius=0){
 const inside=(x,z)=>DISTRICTS.some(d=>x>=d.bounds.minX&&x<=d.bounds.maxX&&z>=d.bounds.minZ&&z<=d.bounds.maxZ)||CONNECTIONS.some(c=>Math.abs(x-c.x)<=c.w/2+.001&&Math.abs(z-c.z)<=c.d/2+.001);
 return [[0,0],[-radius,-radius],[-radius,radius],[radius,-radius],[radius,radius]].every(([dx,dz])=>inside(x+dx,z+dz));
}
export const KIOSKS=[{id:'hair-salon',x:-29,z:17,w:4,d:3,color:'#266d68',name:'Hair Salon'},{id:'showroom',x:-23,z:38,w:4,d:3,color:'#a98158',name:'Furniture Showroom'},{id:'salon',x:-21,z:17,w:4,d:3,color:'#a86b43',name:'Boutique'},{id:'shop',x:34,z:16,w:4,d:3,color:'#608a7b',name:'Provisions shop'}];
export const ROADS=[{x:0,z:0,w:10,d:96,district:'surulere'},{x:21,z:24,w:42,d:7,district:'surulere'},{x:0,z:-10,w:72,d:8,district:'surulere'},{x:0,z:-82,w:10,d:60,district:'yaba'},{x:0,z:-80,w:64,d:8,district:'yaba'},{x:97,z:-10,w:58,d:8,district:'island'},{x:97,z:-4,w:9,d:76,district:'island'},{x:173,z:-10,w:46,d:8,district:'ajah'},{x:171,z:-3,w:8,d:66,district:'ajah'},...CONNECTIONS.map(c=>({...c,w:c.name==='Yaba link'?10:c.w,d:c.name==='Yaba link'?c.d:8,district:'link'}))];
export const ENTRANCES=Object.fromEntries(['home','dispatch','shop','library','hub','arcade','islandfood','salon','hair-salon','showroom','island-house','club','beach'].map(id=>{
 const b=[...BUILDINGS,...KIOSKS].find(b=>b.id===id);
 return [id,{id,name:b.name,x:b.x,z:b.z+b.d/2+.2,outside:{x:b.x,z:b.z+b.d/2+1.4},district:b.district||'surulere',address:({home:'12 Bode Thomas St',dispatch:'8 Dispatch Lane',shop:'24 Bode Thomas St',salon:'18 Bode Thomas St','hair-salon':'20 Bode Thomas St',showroom:'6 Courtyard Lane',library:'4 Campus Walk · Yaba',hub:'6 Herbert Way · Yaba',arcade:'12 Market Lane · Victoria Island',islandfood:'8 Waterfront Walk · Victoria Island'})[id]||({ 'island-house':'Hotel court · Victoria Island',club:'Lantern Lane · Ajah',beach:'Coastal boardwalk · Ajah'})[id]}];
}));
export const DESTINATIONS={...ENTRANCES,...Object.fromEntries(BUILDINGS.filter(b=>b.planned).map(b=>[b.id,{id:b.id,name:b.name,x:b.x,z:b.z+b.d/2+.2,outside:{x:b.x,z:b.z+b.d/2+1.4},district:b.district,planned:true,address:'Mapped site only · no interior / appointments yet'}]))};
export const ROOM_EXIT={x:0,z:3.55};
export const PICKUP={x:2.5,z:-1.55};
export const SHOP_COUNTER={x:2.5,z:-1.55};
export const ROOM_BOUNDS={minX:-4.6,maxX:4.6,minZ:-4.1,maxZ:4.1};
export const STREET_BOUNDS={minX:-44,maxX:196,minZ:-112,maxZ:48};
export const PLAYER_RADIUS=.28;
export function near(a,b,radius=1.25){return Math.hypot(a.x-b.x,a.z-b.z)<=radius}
export function joystickVector(dx,dy,radius=52,deadZone=.16){
 const length=Math.hypot(dx,dy),fraction=Math.min(1,length/radius);
 if(fraction<=deadZone)return {x:0,y:0,magnitude:0};
 const magnitude=(fraction-deadZone)/(1-deadZone);
 return {x:dx/length*magnitude,y:dy/length*magnitude,magnitude};
}
export function cameraRelative(x,y,angle){return {x:Math.cos(angle)*x+Math.sin(angle)*y,z:-Math.sin(angle)*x+Math.cos(angle)*y}}
export function blocked(x,z,obstacles,bounds,radius=PLAYER_RADIUS){
 return bounds===STREET_BOUNDS&&!walkableStreet(x,z,radius)||x<bounds.minX||x>bounds.maxX||z<bounds.minZ||z>bounds.maxZ||obstacles.some(b=>Math.abs(x-b.x)<b.w/2+radius&&Math.abs(z-b.z)<b.d/2+radius);
}
// Small steps prevent tunnelling; separate axes allow sliding along furniture.
export function moveColliding(position,dx,dz,obstacles,bounds){
 let x=position.x,z=position.z;const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.12));
 for(let i=0;i<steps;i++){if(!blocked(x+dx/steps,z,obstacles,bounds))x+=dx/steps;if(!blocked(x,z+dz/steps,obstacles,bounds))z+=dz/steps}
 return {x,z};
}
export function migrateNeighbourhood(s,data){
 s.location=['city',...Object.keys(ENTRANCES)].includes(data?.location)?data.location:data?.name?'city':'home';
 s.inside=data?.inside&&Number.isFinite(data.inside.x)&&Number.isFinite(data.inside.z)?{x:data.inside.x,z:data.inside.z}:{x:0,z:3.3};
 s.deliverySerial=Number.isSafeInteger(data?.deliverySerial)&&data.deliverySerial>=0?data.deliverySerial:0;
 s.delivery=data?.delivery?{...data.delivery}:null;
 s.waypoint=DESTINATIONS[data?.waypoint]?data.waypoint:null;
 s.completedDeliveries=Number.isSafeInteger(data?.completedDeliveries)?data.completedDeliveries:0;
 return s;
}
export function validNeighbourhood(d){
 if(d.location!==undefined&&!['city',...Object.keys(ENTRANCES)].includes(d.location))return false;
 if(d.inside!==undefined&&(!d.inside||!Number.isFinite(d.inside.x)||!Number.isFinite(d.inside.z)||d.inside.x<(d.location==='home'?HOME_BOUNDS.minX:-4.6)||d.inside.x>(d.location==='home'?HOME_BOUNDS.maxX:4.6)||d.inside.z<(d.location==='home'?HOME_BOUNDS.minZ:-4.1)||d.inside.z>4.1))return false;
 for(const k of ['deliverySerial','completedDeliveries'])if(d[k]!==undefined&&(!Number.isSafeInteger(d[k])||d[k]<0))return false;
 if(d.waypoint!==undefined&&d.waypoint!==null&&!DESTINATIONS[d.waypoint])return false;
 if(d.delivery!==undefined&&d.delivery!==null){const v=d.delivery;if(!['carrying','return','complete'].includes(v.status)||!Number.isSafeInteger(v.id)||v.id<1||v.id>d.deliverySerial||v.destination!=='shop'||!Number.isFinite(v.pay)||v.pay<0||v.pay>1000000)return false}
 return true;
}
export function collectDelivery(s,location,position){
 if(s.dispatchBike?.mode==='mounted'||Object.values(s.roadVehicles?.vehicles||{}).some(v=>v.mode==='mounted')||location!=='dispatch'||!near(position,PICKUP)||s.delivery&&s.delivery.status!=='complete')return false;
 const base=1200+s.skills.rider*100;
 s.delivery={id:++s.deliverySerial,status:'carrying',destination:'shop',pay:Math.min(1000000,Math.round(base*(s.traits.includes('industrious')?1.1:1)))};
 s.waypoint='shop';return true;
}
export function handOverDelivery(s,location,position){
 if(s.dispatchBike?.mode==='mounted'||Object.values(s.roadVehicles?.vehicles||{}).some(v=>v.mode==='mounted')||location!=='shop'||!near(position,SHOP_COUNTER)||s.delivery?.status!=='carrying')return false;
 // Status and payment are committed to the same local save, preventing repeat UI awards.
 s.delivery.status='return';s.money+=s.delivery.pay;s.skills.rider++;s.stats.shifts++;s.job='Neighbourhood courier';s.waypoint='home';return true;
}
export function arriveHome(s){if(s.delivery?.status==='return'){s.delivery.status='complete';s.completedDeliveries++;s.waypoint=null;return true}return false}
export function deliveryObjective(s){
 if(s.delivery?.status==='carrying')return 'Deliver parcel · Provisions';
 if(s.delivery?.status==='return')return 'Return home to finish your round';
 if(s.waypoint)return 'To '+DESTINATIONS[s.waypoint].name;
 return s.completedDeliveries?'Delivery complete · find another at Dispatch':'Leave home · collect a parcel at Dispatch';
}
export function mapMarkup(s,position,facing){
 const world=s.location==='city'?position:ENTRANCES[s.location].outside;
 const scale=4,px=x=>(x+40)*scale,pz=z=>(z+44)*scale;
 const buildings=[...BUILDINGS,...KIOSKS].map(b=>`<rect x="${px(b.x-b.w/2)}" y="${pz(b.z-b.d/2)}" width="${b.w*scale}" height="${b.d*scale}" rx="2" class="map-building"/>`).join('');
 const roads=ROADS.map(r=>`<rect x="${px(r.x-r.w/2)}" y="${pz(r.z-r.d/2)}" width="${r.w*scale}" height="${r.d*scale}" class="map-road"/>`).join('');
 const doors=Object.values(ENTRANCES).map(e=>`<circle cx="${px(e.x)}" cy="${pz(e.z)}" r="4" class="map-door"/><text x="${px(e.x)+7}" y="${pz(e.z)+4}">${e.name}</text>`).join('');
 const destination=s.waypoint&&ENTRANCES[s.waypoint];
 return `<svg class="neighbourhood-map" viewBox="0 0 320 352" role="img" aria-label="Neighbourhood map derived from street geometry. Gold circles are entrances; the arrow is you."><defs><clipPath id="mapclip"><rect width="320" height="352" rx="14"/></clipPath></defs><g clip-path="url(#mapclip)"><rect width="320" height="352" fill="#d9dfc5"/>${roads}${buildings}${doors}${destination?`<circle cx="${px(destination.x)}" cy="${pz(destination.z)}" r="9" class="map-waypoint"/>`:''}<g transform="translate(${px(world.x)} ${pz(world.z)}) rotate(${-facing*180/Math.PI})"><path d="M0 9 L-6 -6 L0 -3 L6 -6 Z" class="map-player"/></g></g></svg>`;
}
