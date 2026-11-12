import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import './game-test-harness.mjs';
import * as T from '../dist/vendor/three.module.js';
import {makeCharacter,animateCharacter,disposeCharacter,appearanceDefaults} from '../dist/character.js';
import {migrate,validSave} from '../dist/life.js';
import {buildStreet} from '../dist/street.js';
import {createNavigator} from '../dist/navigation.js';
import {moveColliding,STREET_BOUNDS} from '../dist/neighbourhood.js';
import * as S from '../dist/food-service.js';
import {surfaceMaterial} from '../dist/surface-materials.js';
const checks=[];
for(const sex of ['female','male'])for(const build of ['slim','broad'])for(const skirtModel of [undefined,'day','evening','ankara','iro']){
 const appearance={...appearanceDefaults,sex,build,outfit:'dress',shirt:'#e58b55',skirtModel};const m=makeCharacter(appearance);const skirt=[];m.traverse(o=>{if(o.userData.clothBase)skirt.push(o);});assert.equal(skirt.length,1,'Legacy/catalogue has exactly one continuous skirt');
 const garment=skirt[0],p=garment.geometry.attributes.position,hem=garment.userData.clothHem;const ring=[];for(let i=0;i<p.count;i++)if(Math.abs(p.getY(i)-hem)<.001)ring.push(i);
 for(let frame=0;frame<35;frame++){animateCharacter(m,.04,true);m.updateMatrixWorld(true);garment.skeleton.update();const box=new T.Box3();for(const i of ring){const v=new T.Vector3().fromBufferAttribute(p,i);garment.applyBoneTransform(i,v);assert(v.toArray().every(Number.isFinite));box.expandByPoint(v);}const span=box.getSize(new T.Vector3());assert(span.y<.18,'Walking must not pull a continuous hem into separate calf-height lobes');assert(span.x>.35&&span.x<1.1,'Hem remains a wearable size');}
 assert.equal(m.userData.appearance.shirt,appearance.shirt);disposeCharacter(m);
}
checks.push('Legacy orange dress and day/evening/Ankara/iro on both sexes and slim/broad builds: finite animated hem, bounded continuous silhouette and retained colours (CPU, not visual acceptance)');
const world=buildStreet(),nav=createNavigator(world.obstacles);for(const x of [11.6,12.7])for(let z=13.8;z<20.5;z+=.1)assert(nav.clear({x,z}),'Service lane blocked');
const seed={...appearanceDefaults,name:'Queue QA',location:'city',money:15000,food:80,energy:95,mood:50,time:480,day:1,x:12,z:13.3,rentDay:1,skills:{trader:0,rider:0,chef:0}},s=migrate(seed,seed,'LS-0123456789ABCDEF');assert(S.startService(s,'city',S.SERVICE_POINT,0).ok);
let minimum=Infinity;function tick(n){for(let i=0;i<n;i++){S.stepService(s,.05,'city',S.SERVICE_POINT);const active=s.foodService.customers.filter(c=>!['scheduled','gone'].includes(c.stage));if(active.length===2){const d=Math.hypot(active[0].x-active[1].x,active[0].z-active[1].z);minimum=Math.min(minimum,d);assert(d>=.94,'Customer queue and departure intersect');}}}
tick(190);let p={...S.SERVICE_POINT};const obstacles=[...world.obstacles,...s.foodService.customers.filter(c=>!['scheduled','gone'].includes(c.stage)).map(c=>({x:c.x,z:c.z,w:.62,d:.62}))];for(let i=0;i<100;i++)p=moveColliding(p,-.01,.05,obstacles,STREET_BOUNDS);for(const c of s.foodService.customers)assert(Math.hypot(p.x-c.x,p.z-c.z)>.6,'Player walks into customer');
S.cancelServiceOrder(s,S.frontCustomer(s).id);tick(220);S.cancelServiceOrder(s,S.frontCustomer(s).id);tick(250);assert(s.foodService.customers.every(c=>c.stage==='gone'));assert(validSave({version:1,data:s}));checks.push('Both service lanes clear; arriving/queuing/departing customers remain separated; player collision prevents entry; old save format valid');
const fabric=surfaceMaterial('#718a7b','fabric'),metal=surfaceMaterial('#758e83','metal'),tile=surfaceMaterial('#b4cdc3','tile');assert(fabric.roughness>metal.roughness);assert(metal.metalness>.5);assert(fabric.map&&tile.map&&fabric.map!==tile.map);
const css=await readFile(new URL('../dist/compact.css',import.meta.url),'utf8');assert(css.includes('.game-header #quick-menu button'));assert(css.includes('color:#173d34;background:#e3e9dc'));checks.push('Explicit quick-menu/button foregrounds and separate fabric/tile/metal materials; browser CSS contrast remains a device check');
await writeFile(new URL('../qa/portrait-first/quality-checks.json',import.meta.url),JSON.stringify({status:'passed',checks,minimumCustomerSeparation:minimum,scope:'CPU geometry/state/collision and CSS source checks. Does not override failed Android visual acceptance.'},null,2));console.log({status:'passed',checks,minimumCustomerSeparation:minimum});
