import fs from 'node:fs';
let s=fs.readFileSync('tools/verify-places-journey.mjs','utf8');
s=s.replace("action('pickup');assert.equal","action('pickup');click('parcel-collect');click('close');assert.equal");
s=s.replace("action('shop');assert(el('shop-dialogue').textContent.includes('delivery has been paid'))","click('close');action('shop');assert(el('shop-dialogue').textContent.includes('delivery has been paid'))");
fs.writeFileSync('tools/verify-places-journey.mjs',s);
s=fs.readFileSync('dist/daily-ui.js','utf8');
s=s.replace("el('ride-confirm-early').onclick=()=>act(requestEarlyStop(state,r.id),'playerEarly');speak(['playerEarly','ticketEarly']);","el('ride-confirm-early').onclick=()=>{const result=requestEarlyStop(state,r.id);act(result,'playerEarly');if(result.ok)speak(['playerEarly','ticketEarly']);};");
fs.writeFileSync('dist/daily-ui.js',s);
fs.appendFileSync('tools/game-test-harness.mjs',"\nexport {stickEvent};\nsource+='\\nglobalThis.__bikeQa=()=>({world:dispatchBikeWorld,voice:placeVoice,obstacles});';\n");
