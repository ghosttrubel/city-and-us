import {renderOffline} from './catalogue-preview-runtime.mjs';
import * as T from '../dist/vendor/three.module.js';
import {buildInterior} from '../dist/interior.js';
import {makeCharacter,animateCharacter} from '../dist/character.js';
import {homeMotion,carryMotion,handPoint} from '../dist/home-motion.js';
import {createHomeProps} from '../dist/home-props.js';
import {createCameraRig} from '../dist/camera.js';
import {writeFile} from 'node:fs/promises';
const home=buildInterior('studio',true,'warm');home.room.position.x=0;home.room.visible=true;const scene=new T.Scene();scene.add(home.room);const person=makeCharacter({name:'Amara',sex:'female',characterStyle:'natural',hair:'bob',shirt:'#ede1cb',bottom:'#52665e',outfit:'streetwear'});home.room.add(person);const state={daily:{meals:[{id:'food-1',recipe:'jollof',phase:'carried',place:'hand',bites:0,opened:false}]},homeLife:{ingredients:{bag:{rice:0,tomato:0},fridge:{tomato:2},cupboard:{rice:2}},job:null}};const props=createHomeProps(scene,home),rig=createCameraRig();rig.register(home.room);const report=[];
for(const [name,kind,x,y,z,t,look,eye] of [
 ['carry','carry',0,.16,3,0,[0,1.2,2.5],[5,6,10]],
 ['eat','eat',-2.2,.16,1.35,.8,[-2.2,1.2,.7],[1.8,4.7,7.2]],
 ['prepare','prepare',3.2,.16,-4.2,.6,[3.4,1.4,-4.6],[.5,5,1]],
 ['study','study',-.3,.16,-4.65,1,[-.3,1.4,-5.1],[3,4.5,.1]],
 ['shower','wash',5.5,.16,2.8,3,[5.4,1.3,2.6],[1.5,5.7,8]],
 ['overview','idle',0,.16,.5,0,[0,1,-1],[8,14,16]]]){
 person.position.set(x,y,z);person.rotation.set(0,kind==='wash'?0:Math.PI,0);state.daily.meals[0].phase=kind==='carry'?'carried':'partly-eaten';state.daily.meals[0].place=kind==='carry'?'hand':'table';state.daily.meals[0].opened=kind!=='carry';state.daily.meals[0].bites=2;
 if(kind==='carry'||kind==='idle'){animateCharacter(person,.01,false);if(kind==='carry')carryMotion(person);}else homeMotion(person,kind,.016,t,0);
 home.activityTick(kind,t);props.update(state,person,'home',kind==='carry'?null:{kind,elapsed:t},null);home.refs.ingredients.visible=kind==='prepare';const camera=new T.PerspectiveCamera(40,900/620,.1,100);rig.update(camera,new T.Vector3(...look),new T.Vector3(...eye),1,{overview:true,subject:person.position.clone().add(new T.Vector3(0,1.1,0))});report.push(await renderOffline(scene,camera,900,620,'../../../qa/physical-home/'+name+'.png'));console.log(name);
}
await writeFile(new URL('../qa/physical-home/renders.json',import.meta.url),JSON.stringify({scope:'Software renders of shipped meshes/poses; not browser screenshots or device rendering.',frames:report},null,2));
