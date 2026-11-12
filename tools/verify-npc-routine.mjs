import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import * as T from '../dist/vendor/three.module.js';
import {boot} from './game-test-harness.mjs';
import {makeCharacter} from '../dist/character.js';
import {createStreetLife} from '../dist/street-life.js';
await boot({search:'?review=daily'});
// Isolated actor fixture on the actual street navigation mesh; no user saves.
const navigator=globalThis.__navigationQa.navigator,person=makeCharacter({sex:'female',hair:'bun'}),observer=new T.Group();observer.position.set(-7,.17,26);
const controller=createStreetLife({city:new T.Group(),npcs:[person],navigator,player:()=>observer,location:()=>'city',stopInput(){},toast(){},graphics:()=>'battery'}),bisi=controller.people[0];
const visited=new Set();let idleGesture=false;
for(let i=0;i<1800;i++){const previous=person.position.clone();controller.tick(.05,true);assert(navigator.clear(person.position),'Bisi stays outside static obstacles');assert(navigator.segment(previous,person.position),'Every movement segment stays clear');assert(Math.hypot(person.position.x-previous.x,person.position.z-previous.z)<=.043,'Bounded walking speed, no teleport');for(let n=0;n<2;n++)if(i>80&&bisi.wait>0&&Math.hypot(person.position.x-bisi.stops[n].x,person.position.z-bisi.stops[n].z)<.13)visited.add(n);if(bisi.activity==='idle'&&person.userData.behaviour.snapshot.gesture>0)idleGesture=true;}
assert.equal(visited.size,2,'Both endpoints reached');assert(idleGesture,'Routine idle gesture');
while(!bisi.path[bisi.node])controller.tick(.05,true);const goal=bisi.path[bisi.node],dir=new T.Vector3(goal.x-person.position.x,0,goal.z-person.position.z).normalize();observer.position.copy(person.position).addScaledVector(dir,.86);const stopped=person.position.clone();controller.tick(.05,true);assert.equal(bisi.activity,'yielding');assert(person.position.distanceTo(stopped)<.001,'Do not walk into a person');observer.position.set(-7,.17,26);controller.tick(.05,true);assert.equal(bisi.activity,'walking');
const report={status:'passed',scope:'Real NPC controller and rig with isolated observer on shipped street navigation; not phone rendering or touch.',checks:['Both Bisi stops reachable, full out-and-back routine','Every step collision-clear and speed-bounded','Idle gestures at routine stops','Yield before entering another person, resume when clear']};await writeFile(new URL('../qa/phone-fixes/npc-results.json',import.meta.url),JSON.stringify(report,null,2));console.log(report);
