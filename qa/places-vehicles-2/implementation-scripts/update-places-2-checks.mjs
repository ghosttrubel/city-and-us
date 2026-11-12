import fs from 'node:fs';
let s=fs.readFileSync('tools/verify-ride-journey.mjs','utf8').replace("car.position.x-1.8,globalThis.__dailyQa().car.position.z-14","car.position.x-RIDE_STOPS.home.point.x,globalThis.__dailyQa().car.position.z-RIDE_STOPS.home.point.z");
fs.writeFileSync('tools/verify-ride-journey.mjs',s);
s=fs.readFileSync('dist/game.js','utf8').replace("Places & vehicles review · separate save · Provisions, Dispatch ticket desk and Phone → Ride.","Places & vehicles review · separate save · voiced Provisions/Dispatch counters, red parcel bike outside Dispatch, and danfo tickets.");
fs.writeFileSync('dist/game.js',s);
const p=JSON.parse(fs.readFileSync('package.json','utf8'));
p.scripts['check:places-vehicles']='node tools/verify-places-vehicles.mjs && node tools/verify-places-journey.mjs && node tools/verify-places-2-state.mjs && node tools/verify-dispatch-bike-journey.mjs && node tools/verify-place-voice.mjs && node tools/verify-place-voice-assets.mjs';
fs.writeFileSync('package.json',JSON.stringify(p,null,2)+'\n');
console.log('Updated the old stop-coordinate assertion to the relocated stop; registered current batch checks.');
