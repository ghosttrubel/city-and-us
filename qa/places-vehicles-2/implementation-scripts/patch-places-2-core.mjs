import fs from 'node:fs';
function edit(file,fn){const old=fs.readFileSync(file,'utf8');const next=fn(old.replace(/\r\n/g,'\n'));fs.writeFileSync(file,next);}
function rep(s,a,b){if(!s.includes(a))throw Error('Missing '+a.slice(0,100));return s.replace(a,b);}
edit('dist/neighbourhood.js',s=>{
for(const [a,b] of [
["id:'dispatch',x:12,z:-23","id:'dispatch',x:16,z:-35"],["id:'estate',x:26,z:-25","id:'estate',x:34,z:-33"],["id:'neighbourhood',x:27,z:8","id:'neighbourhood',x:38,z:4"],["id:'south-east',x:13,z:27","id:'south-east',x:17,z:37"],["minX:-36,maxX:36,minZ:-40,maxZ:40","minX:-44,maxX:52,minZ:-48,maxZ:48"],["id:'shop',x:22,z:17","id:'shop',x:34,z:16"],["{x:0,z:0,w:10,d:80,district:'surulere'}","{x:0,z:0,w:10,d:96,district:'surulere'},{x:21,z:24,w:42,d:7,district:'surulere'}"],["minX:-36,maxX:196,minZ:-112,maxZ:40","minX:-44,maxX:196,minZ:-112,maxZ:48"],["if(location!=='shop'||!near(position,SHOP_COUNTER)","if(s.dispatchBike?.mode==='mounted'||location!=='shop'||!near(position,SHOP_COUNTER)"]
])s=rep(s,a,b);return s;});
edit('dist/life.js',s=>{s="import {migrateStreetLayout} from './street-layout-state.js';\nimport {migrateBike,validBike} from './dispatch-bike.js';\n"+s;
s=rep(s,"return migrateNeighbourhood(s,data);","migrateNeighbourhood(s,data);migrateStreetLayout(s,data);return migrateBike(s,data);");
s=rep(s,"return validNeighbourhood(d);","return validNeighbourhood(d)&&validBike(d)&&(d.streetLayoutVersion===undefined||d.streetLayoutVersion===2);");return s;});
edit('dist/daily-life.js',s=>{
s="import {PICKUP_STOPS,RIDE_START,FARE_DISTANCE,localRoadPath} from './ride-roads.js';\n"+s;
s=s.replace(/export const RIDE_STOPS=Object.freeze\(\{[\s\S]*?\n\}\);/,"export const RIDE_STOPS=PICKUP_STOPS;");
s=rep(s,"export const RIDE_DEPOT={x:1.8,z:-34};","export const RIDE_DEPOT=RIDE_START;");
s=s.replace(/export function roadPath\(from,to\)\{[\s\S]*?\n\}/,"export const roadPath=localRoadPath;");
s=rep(s,'r.path.length>12','r.path.length>32');s=rep(s,'finite(p.x,-1.81,1.81)&&finite(p.z,-34.01,34.01)','finite(p.x,-1.81,40.01)&&finite(p.z,-42.01,42.01)');
s=rep(s,'RIDE_STOPS[pickup].point.z-RIDE_STOPS[destination].point.z','FARE_DISTANCE[pickup]-FARE_DISTANCE[destination]');
s=rep(s,"const d=s.daily,quote=rideQuote(pickup,destination,service);","if(s.dispatchBike?.mode==='mounted')return failure('Park and dismount the dispatch bike before booking a passenger ride.');\n const d=s.daily,quote=rideQuote(pickup,destination,service);");
s=rep(s,"const r=s.daily.ride;if(!r||r.id!==id||r.status!=='waiting'","const r=s.daily.ride;if(s.dispatchBike?.mode==='mounted'||!r||r.id!==id||r.status!=='waiting'");
s=rep(s,"stops=Object.entries(RIDE_STOPS).sort((a,b)=>a[1].point.z-b[1].point.z),next=here.x<0?stops[0]:stops.find(([,v])=>v.point.z>here.z+.3)||stops[0]","stops=Object.entries(RIDE_STOPS).map(([id,stop])=>({id,stop,length:routeLength(roadPath(here,stop.point))})).filter(v=>v.length>.3).sort((a,b)=>a.length-b.length),next=[stops[0].id,stops[0].stop]");
return s;});
edit('dist/street.js',s=>{
s=rep(s,"export function streetGroundHeight(x,z){","export function streetGroundHeight(x,z){\n if(x>=33&&x<=47&&z>=29.5&&z<=42.5)return .18;\n if((x>=5&&x<=23&&z>=-32&&z<=-26)||(x>=20&&x<=42&&z>=17.8&&z<=20.5))return .17;\n if(x>=0&&x<=42&&z>=20.5&&z<=27.5)return .105;\n if(x>=2.8&&x<=5.6&&((z>=11&&z<=17)||(z>=-35&&z<=-29)))return .09;");
s=rep(s," if(x>=21&&x<=35&&z>=21.5&&z<=34.5)return .18;","");
s=rep(s,"box(72,.16,80,'#afab91',0","box(96,.16,96,'#afab91',4");
s=rep(s,"box(3.7,.25,80","box(3.7,.25,96");
s=rep(s,"for(let z=-39;z<40;z+=1.3)if(z<-14.7||z>-5.3)","for(let z=-47;z<48;z+=1.3)if((z<-14.7||z>-5.3)&&!(x>0&&((z>10&&z<18)||(z>-36&&z<-28)||(z>19&&z<29))))");
s=rep(s,"for(let z=-38;z<38;z+=4.8)","for(let z=-46;z<46;z+=4.8)");
s=rep(s," // Slightly worn painted lane markings",
" // Separate passenger lay-bys, dispatch forecourt and shop access pavement.\n for(const z of [14,-32]){box(2.8,.15,7,'#414645',4.2,.015,z,city,'asphalt',false);box(.12,.012,5,'#d7cda7',5.5,.1,z,city,'',false);}\n box(18,.25,6,'#d1c4a8',14,.035,-29,city,'paving',false);\n box(22,.25,2.7,'#d1c4a8',31,.035,19.15,city,'paving',false);\n box(42,.16,7,'#414645',21,.025,24,city,'asphalt',false);\n for(let x=10;x<40;x+=5)box(2,.012,.1,'#d7cda7',x,.115,24,city,'',false);\n box(3,.014,.12,'#d7cda7',32,.12,20.65,city,'',false);\n // Slightly worn painted lane markings");
s=rep(s,"[23,23,6]","[46,29,6]");
const start=s.indexOf(" box(14,.15,13,"),end=s.indexOf("\n for(const z of [3,20,35])",start);
if(start<0||end<0)throw Error('park range');
s=s.slice(0,start)+s.slice(start,end).replaceAll("28,.","40,.").replaceAll(",28,city",",36,city").replaceAll("[24,32]","[36,44]").replaceAll(",28.35",",36.35").replaceAll(",.3,28)",",.3,36)").replaceAll(",25,city",",33,city").replaceAll(",28,2,34.6",",40,2,42.6")+s.slice(end);
s=rep(s,"{x:28,z:25,w:3,d:3},... [24,32].map(x=>({x,z:28,w:2.2,d:1}))","{x:40,z:33,w:3,d:3},... [36,44].map(x=>({x,z:36,w:2.2,d:1}))");
s=rep(s,"Math.abs(z)<40","Math.abs(z)<48");return s;});
edit('package.json',s=>{const p=JSON.parse(s);for(const file of ['ride-roads','street-layout-state','dispatch-bike','dispatch-bike-world','place-voice','place-voice-lines'])p.scripts.check+=' && node --check dist/'+file+'.js';return JSON.stringify(p,null,2)+'\n';});
console.log('Saved street spacing, routes and save migration.');
