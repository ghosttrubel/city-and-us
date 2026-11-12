import {BUILDINGS,KIOSKS,blocked,STREET_BOUNDS} from './neighbourhood.js';
import {RIDE_STOPS,RIDE_DEPOT,roadPath,pathPoint} from './daily-life.js';
// Layout migration is independent of cash, ownership, identity and indoor coordinates.
export const STREET_LAYOUT_VERSION=2;
export const BIKE_RACK={x:13.2,z:-28.1};
const moves=[{x:12,z:-23,dx:4,dz:-12,w:11,d:11},{x:22,z:17,dx:12,dz:-1,w:7,d:7},{x:28,z:28,dx:12,dz:8,w:14,d:13}];
export function migrateStreetLayout(s,data){
 if(data?.streetLayoutVersion===2){s.streetLayoutVersion=2;return s;}
 const m=moves.find(m=>Math.abs(s.x-m.x)<=m.w/2&&Math.abs(s.z-m.z)<=m.d/2);if(m){s.x+=m.dx;s.z+=m.dz;}
 const r=s.daily?.ride;
 if(r&&['dispatching','waiting','travelling','arrived'].includes(r.status)){
  const before=r.status==='dispatching'||r.status==='waiting',from=before?RIDE_DEPOT:RIDE_STOPS[r.pickup].point,to=RIDE_STOPS[before?r.pickup:r.dropoff].point;
  r.path=roadPath(from,to);
  if(!before&&r.pickup===r.dropoff)r.path=roadPath(RIDE_DEPOT,to);
  if(r.status==='waiting'||r.status==='arrived')r.progress=1;
  if(['travelling','arrived'].includes(r.status)){const p=pathPoint(r.path,r.progress);s.x=p.x;s.z=p.z;}
 }
 // A previously open saved position may now lie inside a relocated closed building.
 if(s.location==='city'&&!['travelling','arrived'].includes(r?.status)){
  const obstacles=[...BUILDINGS,...KIOSKS].map(b=>({x:b.x,z:b.z,w:b.w+.6,d:b.d+.6})).concat([{x:40,z:33,w:3,d:3},{x:36,z:36,w:2.2,d:1},{x:44,z:36,w:2.2,d:1}]);
  if(blocked(s.x,s.z,obstacles,STREET_BOUNDS)){let found=false;for(let radius=.5;radius<16&&!found;radius+=.5)for(let i=0;i<32&&!found;i++){const x=s.x+Math.cos(i*Math.PI/16)*radius,z=s.z+Math.sin(i*Math.PI/16)*radius;if(!blocked(x,z,obstacles,STREET_BOUNDS)){s.x=x;s.z=z;found=true;}}}
 }
 s.streetLayoutVersion=2;return s;
}
