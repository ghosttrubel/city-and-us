import fs from 'node:fs';
let s=fs.readFileSync('dist/street-layout-state.js','utf8');
s="import {BUILDINGS,KIOSKS,blocked,STREET_BOUNDS} from './neighbourhood.js';\n"+s;
s=s.replace(" s.streetLayoutVersion=2;return s;",[
" // A previously open saved position may now lie inside a relocated closed building.",
" if(s.location==='city'&&!['travelling','arrived'].includes(r?.status)){",
"  const obstacles=[...BUILDINGS,...KIOSKS].map(b=>({x:b.x,z:b.z,w:b.w+.6,d:b.d+.6})).concat([{x:40,z:33,w:3,d:3},{x:36,z:36,w:2.2,d:1},{x:44,z:36,w:2.2,d:1}]);",
"  if(blocked(s.x,s.z,obstacles,STREET_BOUNDS)){let found=false;for(let radius=.5;radius<16&&!found;radius+=.5)for(let i=0;i<32&&!found;i++){const x=s.x+Math.cos(i*Math.PI/16)*radius,z=s.z+Math.sin(i*Math.PI/16)*radius;if(!blocked(x,z,obstacles,STREET_BOUNDS)){s.x=x;s.z=z;found=true;}}}",
" }",
" s.streetLayoutVersion=2;return s;"
].join('\n'));
fs.writeFileSync('dist/street-layout-state.js',s);
s=fs.readFileSync('dist/dispatch-bike.js','utf8').replace("w:1.05,d:2.2","w:Math.abs(Math.cos(b.heading))*1.05+Math.abs(Math.sin(b.heading))*2.2,d:Math.abs(Math.sin(b.heading))*1.05+Math.abs(Math.cos(b.heading))*2.2");
fs.writeFileSync('dist/dispatch-bike.js',s);
s=fs.readFileSync('dist/street.js','utf8').replace("if(Math.abs(Math.abs(x)-5.15)<.13&&(z< -14.7||z> -5.3))","if(Math.abs(Math.abs(x)-5.15)<.13&&(z< -14.7||z> -5.3)&&!(x>0&&((z>10&&z<18)||(z>-36&&z<-28)||(z>19&&z<29))))");
fs.writeFileSync('dist/street.js',s);
console.log('Protected legacy positions against relocated building footprints.');
