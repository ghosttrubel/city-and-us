// Logic regression checks using the shipped game module and actual 3D assets.
// The small DOM and renderer doubles do NOT validate browser layout, pixels,
// WebGL, touch dispatch or Android performance. No user save is read or written.
import assert from 'node:assert/strict';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import * as T from '../dist/vendor/three.module.js';
import {GLTFLoader} from '../dist/vendor/addons/GLTFLoader.js';
import {loadCharacterAssets,appearanceDefaults} from '../dist/character.js';
import {ENTRANCES,PICKUP,SHOP_COUNTER} from '../dist/neighbourhood.js';

const root=new URL('../',import.meta.url),ids=new Set();
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&quot;','"');
class Element {
 constructor(tag='div'){
  this.tagName=tag.toUpperCase();this.children=[];this.parentNode=null;this.attributes={};this.dataset={};this.style={};this.listeners={};this.className='';this.value='';this.disabled=false;this.width=512;this.height=512;this.clientWidth=560;this.clientHeight=520;this._text='';
  this.classList={contains:c=>this.className.split(/\s+/).includes(c),add:(...cs)=>{this.className=[...new Set([...this.className.split(/\s+/).filter(Boolean),...cs])].join(' ')},remove:(...cs)=>{this.className=this.className.split(/\s+/).filter(c=>!cs.includes(c)).join(' ')},toggle:(c,on)=>{const want=on??!this.classList.contains(c);want?this.classList.add(c):this.classList.remove(c);return want}};
 }
 appendChild(el){el.remove();this.children.push(el);el.parentNode=this;return el}
 remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(c=>c!==this);this.parentNode=null}
 setAttribute(k,v){this.attributes[k]=v;if(k==='id'){this.id=v;ids.add(v)}else if(k==='class')this.className=v;else if(k.startsWith('data-'))this.dataset[k.slice(5)]=v;else this[k]=v}
 insertAdjacentHTML(position,html){assert.equal(position,'beforeend');parse(html,this)}
 querySelector(selector){return selector.startsWith('#')?findAll(this,e=>e.id===selector.slice(1))[0]||null:null}
 getAttribute(k){return this.attributes[k]??null}
 set innerHTML(html){this.children.forEach(c=>c.parentNode=null);this.children=[];this._text='';parse(html,this)}
 get textContent(){return this._text+this.children.map(c=>c.textContent).join('')}
 set textContent(s){this.children.forEach(c=>c.parentNode=null);this.children=[];this._text=String(s)}
 addEventListener(type,cb){(this.listeners[type]??=[]).push(cb)}
 dispatch(type,init={}){const e={target:this,preventDefault(){},...init};this['on'+type]?.(e);for(const cb of this.listeners[type]??[])cb(e)}
 click(){if(this.disabled)return;if(this.tagName==='A')lastDownload={href:this.href,download:this.download};this.dispatch('click')}
 focus(){doc.activeElement=this}
 getBoundingClientRect(){if(this.parentNode?.id==='world')return {left:0,top:0,width:innerWidth,height:innerHeight};if(this.id==='joystick')return {left:20,top:innerHeight-164,width:136,height:136};return {left:0,top:0,width:this.clientWidth,height:this.clientHeight}}
 setPointerCapture(){}
 getContext(){return context}
 querySelectorAll(selector){return findAll(this,el=>selector==='nav button'?el.tagName==='BUTTON'&&el.parentNode?.tagName==='NAV':selector==='[data-job]'?el.dataset.job!==undefined:selector==='button, input, select, [tabindex]'?['BUTTON','INPUT','SELECT'].includes(el.tagName)||el.attributes.tabindex!==undefined:false)}
}
const context=new Proxy({createLinearGradient:()=>({addColorStop(){}}),measureText:t=>({width:t.length*8})},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
function parse(html,parent){
 const stack=[parent],token=/<\/([a-z][\w-]*)\s*>|<([a-z][\w-]*)([^>]*?)>|([^<]+)/gi;
 for(const m of html.matchAll(token)){
  if(m[1]){if(stack.length>1)stack.pop();continue}
  if(m[2]){
   const el=new Element(m[2]);
   for(const a of m[3].matchAll(/([\w-]+)(?:="([^"]*)"|'([^']*)'|=([^\s>]+))?/g))el.setAttribute(a[1],decode(a[2]??a[3]??a[4]??''));
   stack.at(-1).appendChild(el);
   if(!['INPUT','IMG','BR','HR','META','LINK','AREA','SOURCE'].includes(el.tagName))stack.push(el);
  }else if(m[4])stack.at(-1)._text+=decode(m[4]);
 }
 for(const select of findAll(parent,e=>e.tagName==='SELECT'))select.value=select.children.find(c=>c.tagName==='OPTION')?.value??'';
}
function findAll(parent,predicate){return parent.children.flatMap(el=>[...(predicate(el)?[el]:[]),...findAll(el,predicate)])}
let doc,raf=[],clock=1000,timers=new Map(),timerId=0,events={},renderers=[],lastDownload,reloads=0,bootNumber=0;
const storage=new Map();
function resetDom(html){
 doc=new Element('document');parse(html,doc);
 doc.createElement=tag=>new Element(tag);doc.getElementById=id=>findAll(doc,e=>e.id===id)[0]??null;
 globalThis.document=doc;globalThis.self=globalThis;
 globalThis.innerWidth=1280;globalThis.innerHeight=900;globalThis.devicePixelRatio=1;
 globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 globalThis.location={reload(){reloads++}};
 globalThis.requestAnimationFrame=cb=>(raf.push(cb),raf.length);
 globalThis.addEventListener=(type,cb)=>(events[type]??=[]).push(cb);
}
class RendererDouble{
 constructor(){this.domElement=new Element('canvas');this.shadowMap={};this.ratio=1;this.disposed=false;renderers.push(this)}
 setPixelRatio(n){this.ratio=n}
 getPixelRatio(){return this.ratio}
 setSize(w,h){this.domElement.width=Math.round(w*this.ratio);this.domElement.height=Math.round(h*this.ratio)}
 render(scene,camera){this.scene=scene;this.camera=camera;scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);this.renders=(this.renders??0)+1}
 dispose(){this.disposed=true}
 forceContextLoss(){this.contextLost=true}
}
globalThis.__gameQaRenderer=RendererDouble;
const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
resetDom(html);
globalThis.ProgressEvent=class {constructor(type,init){this.type=type;Object.assign(this,init)}};
globalThis.createImageBitmap=async()=>({width:512,height:512,close(){}});
const nativeFetch=globalThis.fetch;
globalThis.fetch=async(input,init)=>{
 const url=typeof input==='string'?input:input.url||String(input);
 if(url.startsWith('file:')){const bytes=await readFile(fileURLToPath(url));return new Response(bytes,{headers:{'Content-Length':String(bytes.length)}})}
 return nativeFetch(input,init);
};
const originalParse=GLTFLoader.prototype.parse;
GLTFLoader.prototype.parse=function(data,path,onLoad,onError){
 if(typeof data!=='string'&&data?.byteLength){
  const b=Buffer.from(data);
  if(b.readUInt32LE(0)===0x46546c67){const length=b.readUInt32LE(12),json=JSON.parse(b.subarray(20,20+length)),bin=b.subarray(28+length);json.buffers[0].uri='data:application/octet-stream;base64,'+bin.toString('base64');T.Cache.add(json.buffers[0].uri,new Uint8Array(bin).buffer);data=JSON.stringify(json)}
 }
 return originalParse.call(this,data,path,onLoad,onError);
};
T.Cache.enabled=true;
const assetDir=new URL('../dist/assets/characters/',import.meta.url);
for(const name of await readdir(assetDir)){
 const url=new URL(name,assetDir).href;
 if(name.endsWith('.glb'))T.Cache.add(url,new Uint8Array(await readFile(new URL(url))).buffer);
 else if(name.endsWith('.webp'))T.Cache.add(url,{width:512,height:512,close(){}});
}
await loadCharacterAssets();
GLTFLoader.prototype.parse=originalParse;
Object.defineProperty(globalThis,'performance',{configurable:true,value:{now:()=>clock}});
globalThis.setTimeout=(cb,ms=0)=>(timers.set(++timerId,{cb,due:clock+ms}),timerId);
globalThis.clearTimeout=id=>timers.delete(id);
globalThis.setInterval=(cb,ms)=>(timers.set(++timerId,{cb,due:clock+ms,interval:ms}),timerId);
globalThis.clearInterval=id=>timers.delete(id);

const threeURL=new URL('../dist/vendor/three.module.js',import.meta.url).href;
const shim='data:text/javascript,'+encodeURIComponent('export * from '+JSON.stringify(threeURL)+';export const WebGLRenderer=globalThis.__gameQaRenderer;');
let source=await readFile(new URL('../dist/game.js',import.meta.url),'utf8');
source=source.replace(/from '(\.\/[^']+)'/g,(_,path)=>'from '+JSON.stringify(path==='./vendor/three.module.js'?shim:new URL(path,new URL('../dist/game.js',import.meta.url)).href));
source+='\nglobalThis.__navigationQa={route:()=>activeRoute.map(p=>({x:p.x,z:p.z})),navigate:p=>navigator.route(player.position,p),districts:()=>[...loadedDistricts.keys()],cameraEntries:()=>cameraRig.entries,routeDots:()=>routeDots.count};';
async function boot(){
 raf=[];timers.clear();events={};renderers=[];resetDom(html);
 await import('data:text/javascript,'+encodeURIComponent(source+'\n//# sourceURL=game-logic-qa-'+(++bootNumber)+'.js'));
 tick();
}
function tick(ms=50){
 clock+=ms;
 for(const [id,t] of [...timers])if(t.due<=clock){if(t.interval)t.due=clock+t.interval;else timers.delete(id);t.cb()}
 const frames=raf;raf=[];for(const cb of frames)cb(clock);
}
function frames(n){for(let i=0;i<n;i++)tick()}
function el(id){const e=doc.getElementById(id);assert(e,'Missing UI element #'+id);return e}
function click(id){el(id).click()}
function choose(id,value,type='change'){el(id).value=value;el(id).dispatch(type);tick()}
function saved(){return JSON.parse(storage.get('lagos-street-v1')).data}
function pagehide(){for(const cb of events.pagehide??[])cb()}
function player(){let p;renderers[0].scene?.traverse(o=>{if(Object.hasOwn(o.userData.appearance??{},'name'))p=o});assert(p,'Player missing from world');return p}
function nav(view){doc.querySelectorAll('nav button').find(b=>b.dataset.view===view).click();tick()}
function tapWorld(x,z){
 const renderer=renderers[0],p=new T.Vector3(x,0,z).project(renderer.camera);
 assert(Math.abs(p.x)<1&&Math.abs(p.y)<1,'Test tap must be inside the viewport');
 const event={clientX:(p.x*.5+.5)*innerWidth,clientY:(-.5*p.y+.5)*innerHeight,pointerId:1};
 renderer.domElement.dispatch('pointerdown',event);renderer.domElement.dispatch('pointerup',event);tick();
}

const passed=[],sequence=[];function step(message){sequence.push(message);console.log('Sequence: '+message)}
function space(){if(player().parent.name.endsWith('-interior'))return player().parent.name.replace('-interior','');return player().parent.position.x===150?'home':player().parent.position.x===300?'dispatch':player().parent.position.x===450?'shop':'city'}
function action(id){tick();assert.equal(el('action').dataset.context,id,'Expected context '+id+' at '+JSON.stringify({space:space(),x:player().position.x,z:player().position.z}));assert(!el('action').disabled);click('action');tick()}
function finishDoor(){let count=0,covered=0;const initial=saved(),checkpoint=JSON.stringify({location:initial.location,x:initial.x,z:initial.z,inside:initial.inside}),entering=space()==='city';do{tick();assert(++count<100,'Door transition did not complete');if(Number(el('doorway-cover').style.opacity)>.99){covered++;pagehide();const current=saved();assert.equal(JSON.stringify({location:current.location,x:current.x,z:current.z,inside:current.inside}),checkpoint,'Interrupted threshold overwrote the safe save');}}while(el('doorway-cover').style.opacity!=='0'||el('action').textContent==='Opening door…');assert(covered>0,'Scene switch was never covered');pagehide();assert.equal(saved().location,space());assert(Math.abs(player().rotation.y-(entering?Math.PI:0))<1e-8,'Heading lost through door');}
// Drive movement with the actual joystick event handlers. No test teleporting.
function stickEvent(type,dx=0,dy=0,pointerId=101){const r=el('joystick').getBoundingClientRect();el('joystick').dispatch(type,{pointerId,clientX:r.left+r.width/2+dx,clientY:r.top+r.height/2+dy})}
function walkTo(x,z){
 const start=player().position.clone();stickEvent('pointerdown');let iterations=0;
 while(Math.hypot(player().position.x-x,player().position.z-z)>.13&&iterations++<1400){const dx=x-player().position.x,dz=z-player().position.z,length=Math.hypot(dx,dz),camera=renderers[0].camera;const originX=space()==='city'?0:player().parent.position.x;
 // Derive yaw from the live camera and its look direction instead of reading game state.
 const direction=new T.Vector3();camera.getWorldDirection(direction);const yaw=Math.atan2(-direction.x,-direction.z);const sx=Math.cos(yaw)*dx-Math.sin(yaw)*dz,sy=Math.sin(yaw)*dx+Math.cos(yaw)*dz;
 const strength=Math.min(1,length/.4),radius=136*.39,raw=.16+.84*strength;stickEvent('pointermove',sx/length*radius*raw,sy/length*radius*raw);tick();
 }
 stickEvent('pointerup');tick();assert(iterations<1400,'Walk blocked '+JSON.stringify({from:[start.x,start.z],to:[x,z],at:[player().position.x,player().position.z],space:space()}));pagehide();
}
function route(points){for(const [x,z] of points)walkTo(x,z)}
await boot();assert.equal(doc.getElementById('loading'),null);
const expected={sex:'male',build:'athletic',face:'angular',hair:'locs',outfit:'native',accessory:'glasses',skin:'#643d2a',hairColor:'#38231c',shirt:'#278966',bottom:'#263858',shoes:'#e4d9bf'};
for(const [k,v] of Object.entries(expected))choose(k,v,['skin','hairColor','shirt','bottom','shoes'].includes(k)?'input':'change');el('nameinput').value='Courier QA';click('begin');click('intronext');click('goal-professional');click('intronext');click('home-studio');click('intronext');tick();
for(const [k,v] of Object.entries(expected))assert.equal(saved()[k],v);assert.equal(saved().home,'studio');assert.equal(saved().goal,'professional');assert.equal(space(),'home');
passed.push('Preserved creator selections and colours; introduction choices persist and start inside Home');
const localId=saved().localPlayerId,homeStart=player().position.clone();
nav('home');assert.equal(space(),'home');assert(player().position.distanceTo(homeStart)<.001);nav('phone');assert(el('sheet').classList.contains('phone-sheet'));click('phone-map');assert(el('phonebody').textContent.includes('Selecting a destination sets a waypoint'));click('map-dispatch');assert.equal(space(),'home');assert(player().position.distanceTo(homeStart)<.001);assert.equal(saved().waypoint,'dispatch');
action('exit-home');finishDoor();assert.equal(space(),'city');assert(Math.hypot(player().position.x-ENTRANCES.home.outside.x,player().position.z-ENTRANCES.home.outside.z)<.01);step('Exited Home through animated door to its matching street doorway');
// Release/cancellation/dead-zone and simultaneous camera input.
const rest=player().position.clone();stickEvent('pointerdown',2,2);frames(3);stickEvent('pointerup');assert(player().position.distanceTo(rest)<.001);
stickEvent('pointerdown',35,0);frames(3);stickEvent('pointercancel');const cancelled=player().position.clone();frames(4);assert(player().position.distanceTo(cancelled)<.001);
const c=renderers[0].domElement;stickEvent('pointerdown',40,0);const cameraBefore=renderers[0].camera.position.clone();c.dispatch('pointerdown',{pointerId:202,pointerType:'touch',clientX:innerWidth-200,clientY:220});c.dispatch('pointermove',{pointerId:202,pointerType:'touch',clientX:innerWidth-160,clientY:220});tick();c.dispatch('pointerup',{pointerId:202,clientX:innerWidth-160,clientY:220});assert(renderers[0].camera.position.distanceTo(cameraBefore)>.1);stickEvent('pointerup');const released=player().position.clone();frames(4);assert(player().position.distanceTo(released)<.001);
passed.push('Joystick dead zone and immediate release/cancel; independent right-side camera touch while movement pointer is active');
route([[-6.5,11.9],[-6.5,-10],[6.5,-10],[6.5,-18.1],[12,-18.1]]);action('enter-dispatch');finishDoor();assert.equal(space(),'dispatch');step('Walked street route with joystick, approached Dispatch and entered');
assert(!el('action').dataset.context.includes('pickup'));const noPay=saved().money;nav('jobs');click('job-rider');assert.equal(space(),'dispatch');assert.equal(saved().money,noPay);assert.equal(saved().delivery,null);
walkTo(PICKUP.x,PICKUP.z);action('pickup');assert.equal(saved().delivery.status,'carrying');assert.equal(saved().money,noPay);const parcelId=saved().delivery.id;step('Walked to parcel desk and collected a physical carried parcel without payment');
await boot();assert.equal(space(),'dispatch');assert.equal(saved().delivery.id,parcelId);assert.equal(saved().delivery.status,'carrying');assert.equal(saved().localPlayerId,localId);tick();assert(el('action').disabled,'Repeated pickup while carrying must be disabled');
walkTo(0,3.55);action('exit-dispatch');finishDoor();route([[6.5,-18.1],[6.5,-10],[18.5,-10],[18.5,20],[22,19.9]]);action('enter-shop');finishDoor();assert.equal(space(),'shop');step('Resumed saved parcel, left the matching workplace doorway and walked to the shop address');
walkTo(SHOP_COUNTER.x,SHOP_COUNTER.z);const pay=saved().delivery.pay;action('handover');assert.equal(saved().money,noPay+pay);assert.equal(saved().delivery.status,'return');assert.equal(saved().skills.rider,1);step('Reached the correct shop counter and handed over for one payment');
click('action');assert.equal(saved().money,noPay+pay);click('close');await boot();assert.equal(saved().money,noPay+pay);assert.equal(saved().delivery.status,'return');assert.equal(el('action').dataset.context,'shop');
walkTo(0,3.55);action('exit-shop');finishDoor();route([[18.5,20],[6.5,20],[-6.5,20],[-6.5,11.9],[-12,11.9]]);action('enter-home');finishDoor();assert.equal(space(),'home');assert.equal(saved().delivery.status,'complete');assert.equal(saved().completedDeliveries,1);step('Returned on foot and entered Home through its street entrance, completing the round');
passed.push('Complete required sequence via actual joystick and contextual handlers; proximity doors; save/reload while carrying; exact-once payment; return-home completion');
// Retained home activities now require proximity and use walkable collision space.
const groceries=saved().pantry;walkTo(1.7,1);walkTo(3.3,-2);action('cook');click('cook-start');click('cook-chop');click('cook-chop');click('cook-chop');click('cook-stir');frames(120);click('cook-stir');frames(100);click('cook-serve');click('close');assert.equal(saved().pantry,groceries-1);assert.equal(saved().skills.chef,1);
walkTo(3.2,.5);action('wash');click('finishactivity');assert.equal(saved().hygiene,100);
route([[1.7,0],[.3,-1.85]]);action('study');choose('studyfocus','trader');click('startstudy');click('finishactivity');assert.equal(saved().study,2);assert.equal(saved().skills.trader,2);
route([[0,0],[-.8,-1.4]]);action('sleep');frames(3);assert(Math.abs(player().rotation.x+Math.PI/2)<1e-10,'Sleeping rotation must remain horizontal');click('finishactivity');assert.equal(saved().energy,100);
route([[0,0],[-2.7,1.8]]);action('wardrobe');click('wardrobe-body');choose('sex','female');click('begin');tick();assert.equal(player().userData.appearance.sex,'female');assert.equal(space(),'home');
passed.push('Retained cooking, washing, selected study, resting pose and complete wardrobe reached on foot inside collision-enabled Home');
// Phone navigation, settings, tasks and safe save import/export.
nav('phone');click('phone-profile');assert(el('phonebody').textContent.includes(localId));click('phoneback');click('phone-tasks');const rewardBefore=saved().money;click('task-earn');assert.equal(saved().money,rewardBefore+500);click('task-earn');assert.equal(saved().money,rewardBefore+500);click('phoneback');click('phone-settings');choose('phonequality','battery');assert.equal(renderers[0].shadowMap.enabled,false);click('export');const exported=await (await nativeFetch(lastDownload.href)).json();assert.equal(exported.data.localPlayerId,localId);
const rawBefore=storage.get('lagos-street-v1');el('import').files=[{text:async()=>JSON.stringify({version:1,data:{...exported.data,inside:{x:100,z:0}}})}];await el('import').onchange({target:el('import')});assert.equal(storage.get('lagos-street-v1'),rawBefore);
el('import').files=[{text:async()=>JSON.stringify(exported)}];await el('import').onchange({target:el('import')});click('confirmimport');assert.equal(saved().localPlayerId,localId);assert.deepEqual(saved().inside,exported.data.inside);assert.equal(saved().location,exported.data.location);
passed.push('Phone grid/back/app screens, stable local ID, one-time task rewards, graphics setting, export and validated confirmed import');
await boot();assert.equal(space(),'home');assert.equal(el('quality').value,'battery');
// Focus and keyboard behavior remain usable on desktop; handlers only, not native events.
el('objective').focus();click('objective');let controls=el('sheet').querySelectorAll('button, input, select, [tabindex]').filter(e=>!e.disabled);controls.at(-1).focus();doc.dispatch('keydown',{key:'Tab'});assert.equal(doc.activeElement,controls[0]);doc.dispatch('keydown',{key:'Tab',shiftKey:true});assert.equal(doc.activeElement,controls.at(-1));doc.dispatch('keydown',{key:'Escape'});assert.equal(doc.activeElement,el('objective'));
const keyboardStart=player().position.clone();doc.dispatch('keydown',{key:'d'});frames(3);doc.dispatch('keyup',{key:'d'});const keyReleased=player().position.clone();frames(4);assert(player().position.distanceTo(keyReleased)<.001);assert(player().position.distanceTo(keyboardStart)>.1);
passed.push('Modal focus wrapping/restoration and direct desktop key movement with immediate release');
const viewportChecks=[];for(const [width,height] of [[390,844],[844,390],[320,568],[1280,900]]){globalThis.innerWidth=width;globalThis.innerHeight=height;for(const cb of events.resize??[])cb();tick();assert.equal(renderers[0].camera.aspect,width/height);assert(renderers[0].camera.projectionMatrix.elements.every(Number.isFinite));const projected=player().getWorldPosition(new T.Vector3()).project(renderers[0].camera);assert(Math.abs(projected.x)<1&&Math.abs(projected.y)<1);viewportChecks.push({width,height,playerInViewport:true});}
passed.push('Finite portrait/landscape camera matrices and in-frame player at four sizes (CPU projection, not rendered layout)');
// v0.6 acceptance: follow the route produced by the shipped navigator on foot.
function followGuidance(id){nav('map');click('map-'+id);frames(8);const path=globalThis.__navigationQa.navigate(ENTRANCES[id].outside);assert(path.length>1,'Missing walking route to '+id);for(const p of path.slice(1))walkTo(p.x,p.z);frames(8);assert(el('minimap-art').children.some(e=>e.tagName==='SVG'));assert(globalThis.__navigationQa.route().length);action('enter-'+id);finishDoor();assert.equal(space(),id)}
route([[0,0],[0,3.55]]);action('exit-home');finishDoor();
followGuidance('library');walkTo(SHOP_COUNTER.x,SHOP_COUNTER.z);const studyBefore=saved().study;action('venue-library');click('readbook');assert(saved().study>studyBefore);pagehide();await boot();assert.equal(space(),'library');assert.equal(saved().localPlayerId,localId);step('Followed live green route into Yaba Reading Room; studied and reloaded inside with progress intact');
walkTo(0,3.55);action('exit-library');finishDoor();followGuidance('hub');walkTo(SHOP_COUNTER.x,SHOP_COUNTER.z);action('venue-hub');const hubMoney=saved().money;click('sort-MAR');assert.equal(saved().money,hubMoney);click('sort-LAG');click('sort-YAB');click('sort-MAR');assert(saved().money>hubMoney);step('Walked to Yaba Works and completed the ordered records job for pay');
walkTo(0,3.55);action('exit-hub');finishDoor();followGuidance('arcade');walkTo(SHOP_COUNTER.x,SHOP_COUNTER.z);assert(!globalThis.__navigationQa.districts().includes('yaba'));const pantryBefore=saved().pantry;action('venue-arcade');click('buygroceries');assert.equal(saved().pantry,pantryBefore+3);click('close');step('Walked across the mainland bridge into the Island Trading Arcade and bought groceries; distant Yaba scenery unloaded');
walkTo(0,3.55);action('exit-arcade');finishDoor();followGuidance('islandfood');walkTo(SHOP_COUNTER.x,SHOP_COUNTER.z);action('venue-islandfood');const mealMoney=saved().money;click('marinaeat');assert.equal(saved().money,mealMoney-800);assert(saved().food>60);pagehide();await boot();assert.equal(space(),'islandfood');step('Reached Marina Kitchen, ate and resumed the saved Lagos Island room');
nav('phone');assert(el('sheet').classList.contains('phone-home-screen'));assert(!el('phonebody').textContent.includes('Government'));assert(!el('phonebody').textContent.includes('Soon'));assert(!el('sheet').textContent.includes('Street phone'));for(const id of ['jobs','profile','map','tasks','settings'])assert(!el('phone-'+id).disabled);click('phone-settings');click('export');const islandExport=await (await nativeFetch(lastDownload.href)).json();assert.equal(islandExport.data.location,'islandfood');const relocated={...islandExport,data:{...islandExport.data,location:'library',x:ENTRANCES.library.outside.x,z:ENTRANCES.library.outside.z,inside:{x:0,z:3.3}}};el('import').files=[{text:async()=>JSON.stringify(relocated)}];await el('import').onchange({target:el('import')});click('confirmimport');assert.equal(saved().location,'library');assert.deepEqual(saved().inside,{x:0,z:3.3});await boot();assert.equal(space(),'library');nav('phone');click('phone-settings');el('import').files=[{text:async()=>JSON.stringify(islandExport)}];await el('import').onchange({target:el('import')});click('confirmimport');await boot();assert.equal(space(),'islandfood');nav('phone');click('phone-settings');click('phonehome');assert(el('sheet').classList.contains('phone-home-screen'));click('phone-map');assert(el('phonebody').textContent.includes('Not accessible'));click('close');
walkTo(0,3.55);action('exit-islandfood');finishDoor();followGuidance('home');assert.equal(saved().completedDeliveries,1);assert.equal(saved().delivery.status,'complete');assert.equal(player().userData.appearance.sex,'female');step('Returned on foot to the original Home with avatar, completed delivery and progress preserved');
passed.push('Live-route joystick journey through Yaba and Lagos Island, four working venues, district unloading, public-room save/reload, working phone apps without unfinished icons, and home control');

// Older saves keep money, appearance and skills; new spatial fields get defaults.
const legacy={...exported.data};for(const key of ['location','inside','delivery','deliverySerial','completedDeliveries','waypoint'])delete legacy[key];storage.set('lagos-street-v1',JSON.stringify({version:1,data:legacy}));await boot();assert.equal(saved().money,legacy.money);assert.equal(saved().skills.rider,legacy.skills.rider);assert.equal(saved().sex,legacy.sex);assert.equal(saved().delivery,null);
storage.delete('lagos-street-v1');await boot();el('nameinput').value='Skip Tester';click('begin');click('skipintro');tick();assert.deepEqual(saved().traits,['industrious','curious']);assert.equal(space(),'home');assert.equal(saved().localPlayerId,localId);
passed.push('Version-1/v0.4 migration retains progress and look; skipped new story applies defaults without replacing local ID');
const report={date:'2026-10-23',status:'passed',checks:passed,acceptanceSequence:sequence,viewports:viewportChecks,scope:'Actual shipped game, real meshes and scene geometry with DOM/WebGLRenderer/timer/storage doubles. Joystick pointer events are synthetic. This is not real-browser, visual, native-touch, Android-performance or multiplayer verification.',userSaveTouched:false};
await writeFile(new URL('../qa/gameplay.json',import.meta.url),JSON.stringify(report,null,2));await writeFile(new URL('../qa/connected-delivery.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
