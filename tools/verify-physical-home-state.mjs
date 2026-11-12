import assert from 'node:assert/strict';
import {migrate,validSave} from '../dist/life.js';
import {appearanceDefaults} from '../dist/character.js';
import * as H from '../dist/home-life.js';
import {HOME_STATIONS,HOME_BOUNDS,HOME_FIXED_COLLIDERS,HOME_SOFA_COLLIDER} from '../dist/home-layout.js';
import {createNavigator} from '../dist/navigation.js';
const seed={...appearanceDefaults,name:'Home safeguards',location:'home',money:15000,food:10,energy:95,mood:20,time:480,day:1,x:0,z:6,rentDay:1,skills:{trader:0,rider:0,chef:0},furniture:true};
const fresh=()=>migrate(seed,seed,'LS-0123456789ABCDEF'),p=id=>HOME_STATIONS[id].stand;
const reload=s=>{assert(validSave({version:1,data:s}));return migrate(JSON.parse(JSON.stringify(s)),seed,s.localPlayerId);};
const nav=createNavigator([...HOME_FIXED_COLLIDERS,HOME_SOFA_COLLIDER],HOME_BOUNDS);
for(const [id,station] of Object.entries(HOME_STATIONS)){assert(nav.clear(station.stand),'Blocked '+id);assert(nav.route({x:0,z:3.3},station.stand).length,'No furnished-home route to '+id);}
for(const afterPrep of [false,true]){let s=fresh();assert(H.unpackGroceries(s,'jollof',0).ok);assert(!H.unpackGroceries(s,'jollof',0).ok);assert(H.beginRecipe(s,'jollof',0,'home',p('prep')).ok);for(const key of ['rice','tomato']){assert(H.collectIngredient(s,1,key,'bag','home',p('prep')).ok);assert(!H.collectIngredient(s,1,key,'bag','home',p('prep')).ok);}s=reload(s);if(afterPrep){assert(H.prepareRecipe(s,1,0,'home',p('prep')).ok);assert(!H.prepareRecipe(s,1,0,'home',p('prep')).ok);}assert(H.cancelRecipe(s,1).ok);const snap=JSON.stringify(s);assert(!H.cancelRecipe(s,1).ok);assert.equal(JSON.stringify(s),snap);assert.equal(s.homeLife.ingredients.bag.rice,afterPrep?0:1);reload(s);}
let s=fresh();s.daily.foodSerial=2;H.newMeal(s,'food-1','jollof',{carry:true});assert(!H.carryMeal(s,'food-1','home',p('table')).ok);assert(!H.placeMeal(s,'food-1','city',p('table')).ok);assert(H.placeMeal(s,'food-1','home',p('table')).ok);assert(!H.biteMeal(s,'food-1',0,'home',p('table')).ok);assert(H.openMeal(s,'food-1','home',p('table')).ok);assert(!H.openMeal(s,'food-1','home',p('table')).ok);
for(let bite=0;bite<4;bite++){assert(H.biteMeal(s,'food-1',bite,'home',p('table')).ok);const food=s.food;assert(!H.biteMeal(s,'food-1',bite,'home',p('table')).ok);assert.equal(s.food,food);s=reload(s);}assert.equal(s.daily.stats.eaten,1);assert.equal(s.food,75);assert(!H.discardMeal(s,'food-1').ok);
H.newMeal(s,'food-2','beans',{carry:true});const food=s.food;assert(H.discardMeal(s,'food-2').ok);assert.equal(s.food,food);assert(!H.carryMeal(s,'food-2','home',p('table')).ok);reload(s);
assert(!H.validPhysicalMeal({phase:'stored',place:'hand',bites:0,opened:false}));
console.log('Home state safeguards passed: furnished navigation, interrupted recipe refunds/consumption, stale taps, reloads, bite rewards, deliberate discard and meal consistency. No browser/device rendering tested.');
