import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import * as T from '../dist/vendor/three.module.js';
import {buildStreet,streetGroundHeight} from '../dist/street.js';
import {BUILDINGS,ENTRANCES,STREET_BOUNDS,blocked,moveColliding,walkableStreet} from '../dist/neighbourhood.js';
import {createNavigator,navigationMarkup,routeLength,remainingRoute} from '../dist/navigation.js';
import {createCameraRig} from '../dist/camera.js';
import {buildDistrict,buildConnections,expansionObstacles} from '../dist/districts.js';
import {buildDistrictInterior} from '../dist/interior.js';
const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}}),measureText:t=>({width:t.length*8})},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
globalThis.document={createElement:()=>({width:512,height:512,getContext:()=>ctx})};
const street=buildStreet(),obstacles=[...street.obstacles,...expansionObstacles],nav=createNavigator(obstacles),checks=[];
let routes=0,samples=0,maxNodes=0;
for(const a of Object.values(ENTRANCES))for(const b of Object.values(ENTRANCES)){
 const path=nav.route(a.outside,b.outside);assert(path.length>=2,a.id+' -> '+b.id+' has no route');assert.deepEqual(path[0],a.outside);assert.deepEqual(path.at(-1),b.outside);maxNodes=Math.max(maxNodes,path.length);
 let p={...a.outside};for(let i=1;i<path.length;i++){const end=path[i];assert(nav.segment(path[i-1],end));const len=Math.hypot(p.x-end.x,p.z-end.z),steps=Math.max(1,Math.ceil(len/.1)),dx=(end.x-p.x)/steps,dz=(end.z-p.z)/steps;for(let j=0;j<steps;j++){p=moveColliding(p,dx,dz,obstacles,STREET_BOUNDS);assert(!blocked(p.x,p.z,obstacles,STREET_BOUNDS));samples++}assert(Math.hypot(p.x-end.x,p.z-end.z)<.001,'Route blocked '+JSON.stringify({from:a.id,to:b.id,segment:path[i-1],end,at:p,path}))}
 assert(Number.isFinite(routeLength(path)));routes++;
}
assert(!walkableStreet(60,10));assert(!walkableStreet(60,-40));assert(nav.route({x:60,z:10},ENTRANCES.home.outside).length===0);
const bridge=nav.route(ENTRANCES.library.outside,ENTRANCES.arcade.outside);assert(bridge.some(p=>p.x<36)&&bridge.some(p=>p.x>68));
const reroute=nav.route({x:20,z:21},ENTRANCES.dispatch.outside);assert(reroute.length);assert(nav.segment(reroute[0],reroute[1]));
checks.push('All '+routes+' entrance pairs walked through collision, '+samples+' movement steps; water excluded and deviation recalculates');
const svg=navigationMarkup({x:0,z:0},Math.PI/2,bridge);assert(svg.includes('map-route'));assert(svg.includes('rotate(-90)'));assert(!svg.includes('NaN'));
const homeRoute=nav.route(ENTRANCES.home.outside,ENTRANCES.dispatch.outside);assert(homeRoute.length<=9,'Street route has unnecessary staircase turns');for(let i=2;i<homeRoute.length-1;i++)assert(Math.abs(homeRoute[i].x-homeRoute[i-1].x)<.01||Math.abs(homeRoute[i].z-homeRoute[i-1].z)<.01,'Diagonal street shortcut');const kept=remainingRoute(homeRoute,{x:-6,z:6},nav);assert(kept.length&&kept.length<=homeRoute.length);assert.equal(remainingRoute(homeRoute,{x:0,z:6},nav).length,0,'Deviation must trigger search');
checks.push('Circular and expanded map use actual footprints, roads, entrances, route and facing');
const rig=createCameraRig();rig.register(street.city);const districts=['yaba','island','ajah'].map(buildDistrict);for(const d of districts)rig.register(d.root);
// Physical door apertures must be clear at body/head height after opening.
street.city.updateMatrixWorld(true);districts.forEach(d=>d.root.updateMatrixWorld(true));const apertureRay=new T.Raycaster();for(const e of Object.values(ENTRANCES)){const owner=e.district==='surulere'?street:districts.find(d=>d.doors[e.id]),hinge=owner.doors[e.id];hinge.rotation.y=-Math.PI*.52;(owner.city||owner.root).updateMatrixWorld(true);for(const dx of [-.25,0,.25])for(const y of [.7,1.2,2.2]){apertureRay.set(new T.Vector3(e.x+dx,y,e.z+.03),new T.Vector3(0,0,-1));apertureRay.far=.5;assert.equal(apertureRay.intersectObject(owner.city||owner.root,true).length,0,e.id+' doorway is blocked by facade/sign');}hinge.rotation.y=0;}checks.push('All current open doorways have actual body/head-width recesses; no facade or sign blocks threshold');
const connections=buildConnections();connections.root.updateMatrixWorld(true);const floorRay=new T.Raycaster();for(const [x,z] of [[0,-80],[6.5,-80],[0,-60],[-8,-60],[97,-10],[103,-10],[123,18],[52,-10],[52,-5]]){floorRay.set(new T.Vector3(x,3,z),new T.Vector3(0,-1,0));const hit=floorRay.intersectObjects([...districts.map(d=>d.root),connections.root],true)[0];assert(hit,'Missing district floor');assert(Math.abs(hit.point.y-streetGroundHeight(x,z))<.025,'Foot height differs from district surface at '+[x,z]+': '+hit.point.y+' vs '+streetGroundHeight(x,z))}checks.push('District road, pavement, waterfront and bridge heights match actual CPU ray intersections');
const camera=new T.PerspectiveCamera(40,390/844,.1,200);let cuts=0,sweeps=0;
for(const b of BUILDINGS)for(const side of [-1,1])for(let turn=0;turn<8;turn++){
 const target=new T.Vector3(b.x+side*(b.w/2+1.1),1.25,b.z),angle=turn*Math.PI/4,desired=target.clone().add(new T.Vector3(Math.sin(angle)*15,8.7,Math.cos(angle)*15));
 rig.reset();rig.update(camera,target,desired,.05,{overview:true,subject:target});for(const entry of rig.entries)if(entry.cut){assert(entry.alpha<=.05);assert(!entry.mesh.material.depthWrite);cuts++}
 const ray=new T.Raycaster(camera.position,target.clone().sub(camera.position).normalize(),0,camera.position.distanceTo(target)-.05);
 for(const hit of ray.intersectObjects([street.city,...districts.map(d=>d.root)],true)){if(hit.object.userData.noCameraFade)continue;const m=hit.object.material;if(!Array.isArray(m))assert(m.opacity<.1||hit.point.y<.55,'Opaque mesh still hides centre: '+hit.object.id)}
 for(const y of [0,2.45]){const point=new T.Vector3(target.x,y,target.z).project(camera);assert(Math.abs(point.x)<.92&&Math.abs(point.y)<.95,'Avatar clips in shipped overview mode: '+JSON.stringify({building:b.id,side,turn,y,x:point.x,z:point.y}))}
 sweeps++;
}
assert(cuts>0);for(let i=0;i<20;i++)rig.update(camera,new T.Vector3(-90,1,80),new T.Vector3(-90,9,95),.05);assert(rig.entries.every(e=>e.alpha===1));
checks.push(sweeps+' camera turns beside real buildings: intersecting geometry cut, player head/feet in frame, all opacity restored when clear');
for(const id of ['library','hub','arcade','islandfood']){const room=buildDistrictInterior(id);assert(!blocked(2.5,-1.55,room.getColliders(),room.bounds));assert(!blocked(0,3.55,room.getColliders(),room.bounds));}
for(const d of districts){const before=rig.entries.length;rig.unregister(d.root);assert(rig.entries.length<before);d.dispose();}
checks.push('Public-room counters/exits clear; camera entries released when districts unload');
const report={date:new Date().toISOString(),status:'passed',routes,movementSamples:samples,maxRouteNodes:maxNodes,cameraSweeps:sweeps,checks,scope:'CPU geometry/pathfinding only. Does not verify browser pixels, CSS, real touch or Android speed.'};await writeFile(new URL('../qa/navigation-camera.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
