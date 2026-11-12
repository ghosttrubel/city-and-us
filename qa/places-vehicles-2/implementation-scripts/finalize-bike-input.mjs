import fs from 'node:fs';
let s=fs.readFileSync('dist/game.js','utf8');
s=s.replace("player.position.set(state.dispatchBike.x,streetGroundHeight(state.dispatchBike.x,state.dispatchBike.z),state.dispatchBike.z);if(now-lastSaved","player.position.set(state.dispatchBike.x,streetGroundHeight(state.dispatchBike.x,state.dispatchBike.z),state.dispatchBike.z);if(moving){walkSeconds+=dt;if(walkSeconds>=10){walkSeconds=0;advance(1)}}if(now-lastSaved");
s=s.replace("addEventListener('pagehide',()=>{dailyPanel","addEventListener('pagehide',()=>{stopKeyboard();dailyPanel");
fs.writeFileSync('dist/game.js',s);
const p=JSON.parse(fs.readFileSync('package.json','utf8'));p.scripts['check:places-vehicles']=p.scripts['check:places-vehicles'].replace('node tools/verify-place-voice-assets.mjs','node tools/verify-ticket-voice-states.mjs && node tools/verify-place-voice-assets.mjs');fs.writeFileSync('package.json',JSON.stringify(p,null,2)+'\n');
console.log('Bike travel advances the existing modest travel clock; leaving the page clears held input and brakes.');
