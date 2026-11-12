import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {appearanceDefaults} from '../dist/character.js';
import {migrate,applyStory,advanceLife,completeActivity,activityBlock,shiftPay,validSave,DEFAULT_STORY,HOMES,goalProgress} from '../dist/life.js';
import {buildInterior} from '../dist/interior.js';
import * as T from '../dist/vendor/three.module.js';
const initial={...appearanceDefaults,name:'Tester',money:15000,food:85,energy:95,mood:80,time:480,day:1,x:0,z:6,skills:{trader:0,rider:0,chef:0},job:'Your story starts here',furniture:false,rentDay:1,studyFocus:'trader'};
const fresh=()=>migrate({...initial,name:''},initial,'LS-1234567890ABCDEF');
const groups=[];
let s=fresh();applyStory(s,{traits:['hearty','easygoing'],goal:'scholar',home:'loft'});assert.equal(s.home,'loft');assert.equal(s.onboarded,true);applyStory(s,DEFAULT_STORY);assert.equal(s.home,'loft');
const normal=fresh();applyStory(normal);advanceLife(normal,120);advanceLife(s,120);assert(s.food>normal.food);assert(s.mood>normal.mood);
assert.equal(shiftPay(normal,1600,true),1760);assert.equal(shiftPay(normal,400,false),400);assert.equal(shiftPay(s,1600,true),1600);
groups.push('Trait choices affect successful pay and needs drain; a completed introduction cannot overwrite choices');
s=fresh();applyStory(s,{traits:['curious','industrious'],goal:'scholar',home:'loft'});assert(completeActivity(s,'study'));assert.equal(s.study,3);assert.equal(s.skills.trader,3);assert.equal(goalProgress(s),3);
const pantry=s.pantry;assert(completeActivity(s,'cook'));assert.equal(s.pantry,pantry-1);assert.equal(s.skills.chef,1);s.pantry=0;const before=structuredClone(s);assert(activityBlock(s,'cook'));assert.equal(completeActivity(s,'cook'),false);assert.deepEqual(s,before);
s.energy=0;assert.equal(completeActivity(s,'study'),false);assert(completeActivity(s,'sleep'));assert.equal(s.energy,100);assert(completeActivity(s,'wash'));assert.equal(s.hygiene,100);
s.time=1400;const day=s.day;advanceLife(s,120);assert.equal(s.day,day+1);assert.equal(s.time,80);
groups.push('Home/Curious study bonuses, cooking skill/grocery use, low-resource rejection, sleep/wash restoration and midnight rollover');
const legacy={...initial,money:8200,skills:{trader:4,rider:2,chef:1}};s=migrate(legacy,initial,'LS-1234567890ABCDEF');assert.equal(s.money,8200);assert.equal(s.skills.trader,4);assert.equal(s.onboarded,true);assert.equal(s.home,'studio');assert.equal(s.hygiene,85);assert.deepEqual(s.traits,DEFAULT_STORY.traits);
assert(validSave({version:1,data:legacy}));assert(validSave({version:1,data:s}));
for(const patch of [{traits:['curious','curious']},{home:'invalid'},{goal:'invalid'},{pantry:-1},{hygiene:101},{study:1.5},{money:Infinity},{rentDay:9},{skills:{trader:NaN,rider:0,chef:0}},{stats:{washed:-1}},{claimedTasks:['fake']},{graphics:'ultra'},{studyFocus:'fake'}])assert.equal(validSave({version:1,data:{...s,...patch}}),false,JSON.stringify(patch));
groups.push('Version-1 migration retains progress/appearance and rejects malformed imported simulation fields');
for(const id of Object.keys(HOMES)){
 const interior=buildInterior(id,true);interior.room.visible=true;interior.room.updateMatrixWorld(true);let triangles=0;
 interior.room.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(const value of p.array)assert(Number.isFinite(value));triangles+=(o.geometry.index?.count??p.count)/3});assert(triangles<10000);
 for(const object of interior.room.children.filter(o=>o.userData.activity)){
  // Group centres can lie in empty space between a desk and its chair. Aim at
  // actual fixture meshes, as a user does, and require an accessible hit.
  const targets=[];object.traverse(m=>{if(m.isMesh&&m.visible)targets.push(new T.Box3().setFromObject(m).getCenter(new T.Vector3()));});
  assert(targets.some(target=>{const origin=target.clone().add(new T.Vector3(0,12,0));return interior.pick(new T.Raycaster(origin,target.clone().sub(origin).normalize()))===object.userData.activity;}),'Activity fixture is selectable: '+object.userData.activity);
 }
 interior.activityTick('wash',1);interior.activityTick('cook',1);interior.activityTick(null,2);interior.setHome('studio');
}
groups.push('All three original interiors have finite geometry, a bounded triangle count and ray-pickable activity objects (CPU only)');
const report={date:'2026-10-23',status:'passed',checks:groups,scope:'Pure simulation and CPU scene checks. No rendered browser or device-performance claim.'};
await writeFile(new URL('../qa/life.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
