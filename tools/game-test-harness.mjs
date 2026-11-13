import {createNavigator} from '../dist/navigation.js';
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
 doc=new Element('document');parse(html,doc);doc.body=findAll(doc,e=>e.tagName==='BODY')[0];
 doc.createElement=tag=>new Element(tag);doc.getElementById=id=>findAll(doc,e=>e.id===id)[0]??null;
 globalThis.document=doc;globalThis.self=globalThis;
 const viewport=globalThis.CityRuntime?.size?.()||{width:1280,height:900};globalThis.innerWidth=viewport.width;globalThis.innerHeight=viewport.height;globalThis.devicePixelRatio=1;
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
 if(url==='https://yhervptejlpgallfinro.supabase.co/rest/v1/rpc/game_connection')return new Response(JSON.stringify({version:1,server_time:'2026-11-13T00:00:00Z'}));
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
let reviewSearch='';
let source=await readFile(new URL('../dist/game.js',import.meta.url),'utf8');
source=source.replace(/from '(\.\/[^']+)'/g,(_,path)=>'from '+JSON.stringify(path==='./vendor/three.module.js'?shim:new URL(path,new URL('../dist/game.js',import.meta.url)).href));
source+='\nglobalThis.__onlineQa=()=>({auth:cloudAuth,sync:accountSync,state,save});globalThis.__decorQa=()=>cameraRig.entries.filter(e=>e.root===homeDecor.layer);globalThis.__roomQa=()=>({obstacles:interior.getColliders(),bounds:interior.bounds});globalThis.__navigationQa={navigator,route:()=>activeRoute.map(p=>({x:p.x,z:p.z})),navigate:p=>walkingNavigator.route(player.position,p),districts:()=>[...loadedDistricts.keys()],cameraEntries:()=>cameraRig.entries,routeDots:()=>routeDots.count};';
async function boot({search=reviewSearch}={}){
 reviewSearch=search;
 raf=[];timers.clear();events={};renderers=[];resetDom(html);globalThis.location.search=reviewSearch;
 await import('data:text/javascript,'+encodeURIComponent(source+'\n//# sourceURL=game-logic-qa-'+(++bootNumber)+'.js'));
 for(let i=0;i<50;i++)await Promise.resolve();
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
function saved(){return JSON.parse(storage.get(reviewSearch.includes('places')?'city-and-us-places-review-v1':reviewSearch.includes('daily')?'city-and-us-daily-review-v1':reviewSearch.includes('apartment')?'city-and-us-apartment-review-v1':'lagos-street-v1')).data}
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

source+='\nglobalThis.__dailyQa=()=>({car:dailyWorld.car,courier:dailyWorld.courier,context:currentContext,target:serviceTarget()});';
export {boot,tick,frames,el,click,choose,saved,pagehide,player,nav,action,finishDoor,walkTo,route,space};
export function settleDialogue(){let n=0;while(globalThis.__livingQa().dialogue.line&&n++<1800)tick();assert(n<1800,'Dialogue did not settle');frames(36);}


export function lifecycle(type){for(const cb of events[type]??[])cb();}
export function worldRenderer(){return renderers[0];}

source+='\nglobalThis.__homeQa=()=>({controller:homePlay,room:interior,player}); globalThis.__streetQa=()=>streetLife; globalThis.__serviceQa=()=>servicePlay;globalThis.__destinationsQa=()=>({controller:destinationPlay,rooms:interiors,loaded:[...loadedDistricts.keys()],state,names:publicNames});';


source+='\nglobalThis.__livingQa=()=>({dialogue,environment,handover,state});';

export const saveSlot=key=>storage.get(key);

source+='\nglobalThis.__cameraQa=()=>({distance,houseView,look:look.clone(),camera,zoom:zoomControl});';

export {stickEvent};
source+='\nglobalThis.__bikeQa=()=>({world:dispatchBikeWorld,voice:placeVoice,obstacles});';
