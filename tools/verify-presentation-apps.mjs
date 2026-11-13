import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createMoviesApp} from '../dist/movies.js';
import {MOVIES,movieAvailable,validMovieWatch} from '../dist/movie-catalogue.js';
import {createPhoneHome} from '../dist/phone-home.js';
import {migrateBank,validBank,localTransfer,localRobbery,cashChange,pruneCashOps} from '../dist/bank.js';
class Node {
 constructor(id){this.id=id;this.value='';this.currentTime=0;this.duration=16;this.paused=true;this.ended=false;this.hidden=false;}
 focus(){} setSelectionRange(){} removeAttribute(k){delete this[k]} load(){this.loads=(this.loads||0)+1} pause(){this.paused=true;this.onpause?.()} async play(){this.paused=false;this.onplaying?.()}async requestFullscreen(){this.fullscreen=true}
}
class Body{
 set innerHTML(html){this.html=html;this.nodes=new Map([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],new Node(m[1])]))}
 querySelector(id){return this.nodes.get(id.slice(1))||null}
}
let s={money:15000,skills:{rider:0},traits:[],time:490,day:2},writes=0,now=Date.parse('2026-11-14'),body=new Body(),app=createMoviesApp({body,state:s,save:()=>writes++,now:()=>now});
assert(body.html.includes('Lagoon Light'));body.querySelector('#movie-lagoon-light').onclick();body.querySelector('#movie-play').onclick();let video=body.querySelector('#movie-video');video.onloadedmetadata();await Promise.resolve();assert(!video.paused);video.currentTime=7;video.ontimeupdate();assert.equal(s.movieWatch['lagoon-light'].position,7);
const saved=writes;video.currentTime=8;video.ontimeupdate();assert.equal(writes,saved,'no frame-by-frame saves');app.pause();assert.equal(s.movieWatch['lagoon-light'].position,8);assert(video.paused);app.dispose();
body=new Body();app=createMoviesApp({body,state:JSON.parse(JSON.stringify(s)),save:()=>writes++,now:()=>now});body.querySelector('#movie-lagoon-light').onclick();assert(body.html.includes('Resume film'));body.querySelector('#movie-play').onclick();video=body.querySelector('#movie-video');video.onloadedmetadata();assert.equal(video.currentTime,8);video.onerror();assert.equal(body.querySelector('#movie-retry').hidden,false);body.querySelector('#movie-retry').onclick();assert(video.paused);assert.equal(video.src,undefined,'retry releases previous player');video=body.querySelector('#movie-video');video.onloadedmetadata();await body.querySelector('#movie-fullscreen').onclick();assert(video.fullscreen);video.currentTime=16;video.ended=true;video.onended();app.dispose();
assert(validMovieWatch(s.movieWatch));assert(!validMovieWatch({bad:{position:-1,completed:false}}));assert(!movieAvailable({...MOVIES[0],rightsEnd:'2025-01-01'}));assert(!movieAvailable({...MOVIES[0],available:false}));
const bytes=await readFile(new URL('../dist/'+MOVIES[0].url,import.meta.url));assert(bytes.length>100000);assert(bytes.includes(Buffer.from('avc1')));assert(bytes.indexOf(Buffer.from('moov'))<bytes.indexOf(Buffer.from('mdat')),'fast start video');
body=new Body();const names=Object.fromEntries(['inventory','jobs','food','ride','profile','map','tasks','settings','bank','movies','account','chat','wallpaper','fonts','shopping','camera','gallery','music'].map(id=>[id,id]));let opened;
app=createPhoneHome({body,names,icon:()=>'',state:s,open:id=>opened=id,status:()=> 'Saved'});assert.equal((body.html.match(/class="app"/g)||[]).length,12);body.querySelector('#apps-next').onclick();assert(body.querySelector('#phone-shopping'));body.querySelector('#category-media').onclick();body.querySelector('#phone-movies').onclick();assert.equal(opened,'movies');body.querySelector('#phone-search').value='music';body.querySelector('#phone-search').oninput();assert(body.querySelector('#phone-music'));assert(!body.querySelector('#phone-movies'));app.tick();
const b=migrateBank(s),total=s.money;localTransfer(s,'deposit',5000,'one');assert.equal(s.money+b.balance,total);assert.equal(localTransfer(s,'deposit',5000,'one'),false);assert.throws(()=>localTransfer(s,'withdraw',5001),/Insufficient/);assert.throws(()=>localTransfer(s,'deposit',-1),/positive/);
const loss=localRobbery(s,{at:10000000,eligible:true,random:()=>0,id:'robbery'});assert.equal(loss,500);assert.equal(b.balance,5000);s=JSON.parse(JSON.stringify(s));assert.equal(localRobbery(s,{at:10000001,eligible:true,random:()=>0,id:'robbery'}),null);assert.equal(localRobbery(s,{at:12000000,eligible:false,random:()=>0}),null);
cashChange(s,-100,'purchase',{sku:'x'});const retained=s.bank.ops[0];pruneCashOps(s,[],false);assert.equal(s.bank.ops.length,1);pruneCashOps(s,[retained]);assert.equal(s.bank.ops.length,0);
assert(validBank(s.bank));assert(!validBank({...s.bank,ops:[{}]}));
console.log('PASS: Movies catalogue/details/controls/fullscreen/error/retry/resume/throttle/expiry; actual fast-start MP4 container; phone pages/categories/search; bank conservation/confirmation helper/reload-safe robbery/ack pruning. DOM/media API doubles: browser playback/layout pending.');
