import fs from 'node:fs';
let s=fs.readFileSync('dist/daily-ui.js','utf8');
const start=s.indexOf('export function createRideApp('),end=s.indexOf('export function createCookingUI',start);
let part=s.slice(start,end);
function rep(a,b){if(!part.includes(a))throw Error('Missing '+a);part=part.replace(a,b);}
rep("atCounter=false})","atCounter=false,speak=()=>{}})");
rep("act=r=>{commit(r);render();if(!r?.ok&&el('transport-dialogue'))el('transport-dialogue').textContent='Transport attendant: '+r.message;};",
"act=(r,reply)=>{commit(r);render();if(!r?.ok&&el('transport-dialogue'))el('transport-dialogue').textContent='Transport attendant: '+r.message;const message=r?.message||'';speak(r?.ok?[...(reply?[reply]:[]),voiceStatus()]:[/currency|balance/.test(message)?'ticketFunds':/counter/.test(message)?'ticketCounter':/pickup marker/.test(message)?'ticketBoardFirst':/stops/.test(message)?'ticketChoose':/stops\\.|stopped|Wait until/.test(message)?'ticketWaitStop':'ticketHandled']);};\n function voiceStatus(){return ({dispatching:'ticketDispatching',waiting:'ticketWaiting',travelling:'ticketTravelling',arrived:'ticketArrived',complete:'ticketComplete',ended:'ticketComplete',cancelled:'ticketRefund'})[state.daily.ride?.status]||'ticketHello';}");
rep("act(boardRide(state,r.id,location(),position()))","act(boardRide(state,r.id,location(),position()),'playerBoard')");
rep("act(alightRide(state,r.id))","act(alightRide(state,r.id),'playerAlight')");
rep("act(cancelRide(state,r.id))","act(cancelRide(state,r.id),'playerCancelRide')");
rep("act(requestEarlyStop(state,r.id))","act(requestEarlyStop(state,r.id),'playerEarly');speak(['playerEarly','ticketEarly'])");
rep("const q=rideQuote(pickup,destination,service);if(!q)return;","const q=rideQuote(pickup,destination,service);if(!q){speak(['ticketChoose']);return;}speak(['fare'+q.fare]);");
rep("bookRide(state,from,to,serial,selectedService));","bookRide(state,from,to,serial,selectedService),'playerBook');");
rep("if((r?.status||'')!==lastStatus){render();return;}","if((r?.status||'')!==lastStatus){render();speak([voiceStatus()]);return;}");
rep("render();return {kind:'ride'","render();speak([voiceStatus()]);return {kind:'ride'");
fs.writeFileSync('dist/daily-ui.js',s.slice(0,start)+part+s.slice(end));
console.log('Connected passenger fare, booking, boarding, arrival and refund voice.');
