import fs from 'node:fs';
function rep(s,a,b){if(!s.includes(a))throw Error('Missing '+a.slice(0,120));return s.replace(a,b);}
let s=fs.readFileSync('dist/game.js','utf8').replace(/\r\n/g,'\n');
s="import {createPlaceVoice} from './place-voice.js';\nimport {bikeMounted,mountBike,dismountBike,stepBike,bikeObstacle} from './dispatch-bike.js';\nimport {createDispatchBike} from './dispatch-bike-world.js';\n"+s;
s=rep(s,"const parcel=new THREE.Group();","const dispatchBikeWorld=createDispatchBike(city);\nconst voiceHUD=document.createElement('aside');voiceHUD.id='place-voice-hud';voiceHUD.hidden=true;document.body.appendChild(voiceHUD);\nconst placeVoice=createPlaceVoice({state,host:()=>{const modal=!$('overlay').classList.contains('hidden');voiceHUD.hidden=modal;return modal?$('sheet'):voiceHUD;}});\nconst parcel=new THREE.Group();");
s=rep(s,"function stopKeyboard(){","function stopKeyboard(){if(state.dispatchBike)state.dispatchBike.speed=0;");
s=rep(s,"function sheet(html){","function sheet(html){placeVoice.stop();voiceHUD.hidden=true;");
s=rep(s,"function close(){","function close(){placeVoice.stop();voiceHUD.hidden=true;");
s=rep(s,"function startDoor(id){","function startDoor(id){\n if(bikeMounted(state)){toast('Stop and dismount the dispatch bike before entering.');return false;}");
s=rep(s,"function contextAction(){","function contextAction(){\n if(view==='city'&&bikeMounted(state))return {id:'bike-dismount',label:state.dispatchBike.speed>.2?'Release movement to stop':'Dismount dispatch bike',disabled:state.dispatchBike.speed>.2,run:()=>{const r=dismountBike(state,[...obstacles,...servicePlay.obstacles()]);commitDaily(r);if(r.ok)placeVoice.say([r.returned?'playerReturnBike':'playerDismount']);}};\n if(view==='city'&&near(player.position,state.dispatchBike,1.9))return {id:'bike-mount',label:'Mount dispatch bike',run:()=>{const r=mountBike(state,view,player.position);commitDaily(r);if(r.ok)placeVoice.say(['playerMount']);else toast(r.message);}};");
s=rep(s,"{x:28,z:34,kind:'park'","{x:40,z:42,kind:'park'");
const pickup=s.split('\n').find(l=>l.includes("return {id:'pickup'"));if(!pickup)throw Error('pickup');
s=rep(s,pickup," if(view==='dispatch'&&near(player.position,PICKUP))return {id:'pickup',label:'Talk to parcel attendant',run:parcelCounter};");
const handover=s.split('\n').find(l=>l.includes("return state.delivery?.status==='carrying'?{id:'handover'"));if(!handover)throw Error('handover');
s=rep(s,handover," if(view==='shop'&&near(player.position,SHOP_COUNTER))return state.delivery?.status==='carrying'?{id:'handover',label:'Hand over parcel',run:()=>{if(handOverDelivery(state,view,player.position)){advance(30);save();provisionsCounter('delivered');}}}:{id:'shop',label:'Shop counter',run:shop};");
s=rep(s,"function transportCounter(){",[
"function parcelCounter(event='hello'){",
" if(view!=='dispatch'||!near(player.position,PICKUP))return;",
" const status=state.delivery?.status,line=event==='collected'?'parcelCollected':event==='needs'?'parcelNeeds':status==='carrying'?'parcelCarrying':status==='return'?'parcelReturn':'parcelHello';",
" sheet('<span class=\"eyebrow\">PARCEL DISPATCH</span><h2>A delivery round.</h2><p>Collect here, then ride the red work bike outside or walk to Provisions. Passenger tickets are at the other desk.</p><button id=\"parcel-collect\" class=\"primary\">Collect parcel</button><button id=\"parcel-bike-info\" class=\"secondary\">How do I use the bike?</button><button id=\"parcel-leave\" class=\"secondary\">Continue outside</button>');",
" $('parcel-collect').disabled=['carrying','return'].includes(status);",
" $('parcel-collect').onclick=()=>{if(!canWork()){parcelCounter('needs');return;}if(collectDelivery(state,view,player.position)){advance(5);save();parcelCounter('collected');}};",
" $('parcel-bike-info').onclick=()=>placeVoice.say(['playerBikeInfo','parcelBikeInfo']);$('parcel-leave').onclick=close;",
" placeVoice.say(event==='collected'?['playerCollect',line]:[line]);",
"}",
"function transportCounter(){"
].join('\n'));
s=rep(s,"initialService:'danfo',atCounter:true","initialService:'danfo',atCounter:true,speak:ids=>placeVoice.say(ids)");
s=rep(s,"if(section==='ride')dailyPanel=createRideApp({container:body,state,","if(section==='ride')dailyPanel=createRideApp({container:body,state,speak:ids=>placeVoice.say(ids),");
s=rep(s,"$('provisions-browse-close').onclick=","placeVoice.say([section==='produce'?'shopProduce':'shopShelves']);\n $('provisions-browse-close').onclick=");
s=rep(s,"$('shopsofa').disabled=state.furniture;$('shopsofa').onclick=buySofa;","placeVoice.say(event==='purchased'?['playerPay','shopPaid']:event==='cancelled'?['playerCancel','shopCancelled']:event==='delivered'?['playerHandover','shopDelivered']:[event==='funds'?'shopFunds':event==='full'?'shopFull':state.delivery?.status==='return'?'shopReturn':state.delivery?.status==='carrying'?'shopParcel':'shopHello']);\n $('shopsofa').disabled=state.furniture;$('shopsofa').onclick=buySofa;");
s=rep(s,"let settled=false;\n  $('shop-dialogue')","let settled=false;placeVoice.say(['playerBag','shopConfirm']);\n  $('shop-dialogue')");
s=rep(s,"settled=true;provisionsCounter();","settled=true;provisionsCounter('cancelled');");
// Mounted bike uses the same touch/keyboard direction, with steering, braking and collision substeps.
s=rep(s,"const dir=cameraRelative(x,y,angle);if(Math.hypot(dir.x,dir.z)>.001)","const dir=cameraRelative(x,y,angle);if(bikeMounted(state)){moving=stepBike(state,dir,dt,[...obstacles,...servicePlay.obstacles()]);player.position.set(state.dispatchBike.x,streetGroundHeight(state.dispatchBike.x,state.dispatchBike.z),state.dispatchBike.z);if(now-lastSaved>1000){savePosition();save();lastSaved=now}}else if(Math.hypot(dir.x,dir.z)>.001)");
s=rep(s,"view==='city'?[...obstacles,...servicePlay.obstacles()]:interiors[view].getColliders()","view==='city'?[...obstacles,...servicePlay.obstacles(),...bikeObstacle(state)]:interiors[view].getColliders()");
s=rep(s,"const dailyEvents=!document.hidden","if(!free&&bikeMounted(state))state.dispatchBike.speed=0;\n const dailyEvents=!document.hidden");
s=rep(s,"traffic.forEach((c,i)=>","dispatchBikeWorld.update(state,dt,view,player);placeVoice.tick(dt);\n traffic.forEach((c,i)=>");
s=rep(s,"parcel.visible=state.delivery?.status==='carrying'&&!editor","parcel.visible=state.delivery?.status==='carrying'&&!editor&&!bikeMounted(state)");
s=s.replaceAll("environment.pause();dialogue.pause();","environment.pause();dialogue.pause();placeVoice.stop();");
s=rep(s,"run:()=>commitDaily(boardRide(state,state.daily.ride.id,view,player.position))","run:()=>{const r=boardRide(state,state.daily.ride.id,view,player.position);commitDaily(r);if(r.ok)placeVoice.say(['playerBoard','ticketTravelling']);}");
s=rep(s,"run:()=>commitDaily(alightRide(state,state.daily.ride.id))","run:()=>{const r=alightRide(state,state.daily.ride.id);commitDaily(r);if(r.ok)placeVoice.say(['playerAlight','ticketComplete']);}");
fs.writeFileSync('dist/game.js',s);
fs.appendFileSync('dist/style.css','\n/* Compact world dialogue; touch controls remain accessible. */\n#place-voice-hud{position:fixed;z-index:22;left:12px;right:12px;top:105px;max-width:560px;margin:auto;max-height:26vh;overflow:auto;background:#edf2f4ed;color:#203541;border-radius:12px;padding:8px;font-size:12px;pointer-events:auto}#place-voice-hud[hidden]{display:none}#place-voice-hud p{margin:3px 0}#place-voice-hud button{display:inline-block;width:auto;padding:6px 10px;font-size:12px;margin:3px}#place-voice-hud .service-receipt{margin:0;padding:4px}\n');
console.log('Integrated voiced provisions/parcel interactions, mount/ride/dismount and subtitle HUD.');
