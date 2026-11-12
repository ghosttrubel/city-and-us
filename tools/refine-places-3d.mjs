import fs from 'node:fs/promises';
async function edit(f,fn){await fs.writeFile(f,fn(await fs.readFile(f,'utf8')));}
await edit('dist/daily-ui.js',s=>s.replace("atCounter=false,speak=()=>{}})","atCounter=false,speak=()=>{},speakText=null})").replace("const message=r?.message||'';speak(","const message=r?.message||'';if(speakText){speakText([{speaker:'Transport attendant',text:message}]);return;}speak("));
await edit('dist/game.js',s=>s.replaceAll("speak:ids=>placeVoice.say(ids)","speakText:turns=>placeVoice.sayText(turns),speak:ids=>placeVoice.say(ids)")
.replace("function freeControl(){return ","function freeControl(){return !document.body.classList.contains('quick-menu-open')&&")
.replace("$('menu-toggle').onclick=()=>{zoomControl.stop();","$('menu-toggle').onclick=()=>{stopKeyboard();zoomControl.stop();")
.replace("$('needs-toggle').onclick=()=>{zoomControl.stop();","$('needs-toggle').onclick=()=>{stopKeyboard();zoomControl.stop();")
.replace("document.addEventListener('keyup',","document.addEventListener('visibilitychange',()=>{if(document.hidden)stopKeyboard();});\ndocument.addEventListener('keyup',"));
await edit('dist/dialogue.js',s=>s.replace('<div class="dialogue-body"><p','<div class="dialogue-body"><small>Authentic Nigerian voice replacement pending.</small><p'));
await edit('tools/verify-places-3-game.mjs',s=>s.replace("lifecycle('blur');frames(2);assert.equal(v.speed,0);click('drive-exit');",`lifecycle('blur');frames(2);assert.equal(v.speed,0);
el('drive-gas').dispatch('pointerdown',{pointerId:14});frames(3);click('corner-phone');tick();assert.equal(v.speed,0);assert(el('vehicle-controls').hidden);click('close');frames(4);assert.equal(v.speed,0,'Held accelerator leaked through phone');
click('drive-exit');`));
await edit('tools/verify-road-vehicles.mjs',s=>"import {beginRecipe,collectIngredient} from '../dist/home-life.js';\nimport {HOME_STATIONS} from '../dist/home-layout.js';\n"+s.replace("assert.equal(s.provisions.items.water,2);","assert.equal(s.provisions.items.water,2);assert(beginRecipe(s,'jollof',s.daily.cookSerial,'home',HOME_STATIONS.prep.stand).ok);for(const key of ['rice','tomato'])assert(collectIngredient(s,s.homeLife.job.id,key,'bag','home',HOME_STATIONS.prep.stand).ok);assert.equal(s.homeLife.job.stage,'prepare');")
.replace("checks.push('Individual stock",`
const returning=fresh();returning.stats.shifts=1;const rented=returning.roadVehicles.vehicles['dispatch-compact'];assert(V.rentRoadCar(returning,rented,0,'city',rented).ok);assert(V.returnRoadCar(returning,rented,'city',rented).ok);assert(!V.drivePermission(returning,rented));assert.equal(returning.money,14100);
checks.push('Individual stock`));
console.log('Menu reset and factual ticket responses saved.');
