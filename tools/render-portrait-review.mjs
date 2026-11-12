import {renderOffline} from './catalogue-preview-runtime.mjs';
import * as T from '../dist/vendor/three.module.js';
import {buildInterior} from '../dist/interior.js';
import {makeCharacter,animateCharacter} from '../dist/character.js';
import {homeMotion,carryMotion,aimHand,handPoint} from '../dist/home-motion.js';
import {createHomeProps} from '../dist/home-props.js';
import {createCameraRig} from '../dist/camera.js';
import {portraitCamera,portraitProjection} from '../dist/portrait-camera.js';
import {writeFile} from 'node:fs/promises';
const home=buildInterior('studio',true,'warm');home.room.position.x=0;home.room.visible=true;const scene=new T.Scene();scene.add(home.room);const person=makeCharacter({name:'Amara',sex:'female',characterStyle:'classic',hair:'braids',shirt:'#e58b55',bottom:'#324c64',outfit:'dress'});home.room.add(person);const s={daily:{meals:[{id:'cook-1',recipe:'home-jollof',phase:'carried',place:'hand',bites:0,opened:true}]},homeLife:{ingredients:{bag:{rice:0,tomato:0},fridge:{tomato:2},cupboard:{rice:2}},job:null}};const props=createHomeProps(scene,home),rig=createCameraRig();rig.register(home.room);const report=[];
for(const [name,kind,x,y,z,t,look,eye] of [
 ['cooked-at-stove','carry',5.2,.16,-3.9,0,[4.8,1.2,-4],[9,6,3]],
 ['visible-bite','eat',-2.2,.16,1.35,.8,[-2.2,1.2,.7],[1.8,4.7,7.2]],
 ['preparation','prepare',3.2,.16,-4.2,.6,[3.4,1.4,-4.6],[.5,5,1]]]){
 person.position.set(x,y,z);person.rotation.set(0,Math.PI,0);s.daily.meals[0].phase=kind==='carry'?'carried':'partly-eaten';s.daily.meals[0].place=kind==='carry'?'hand':'table';s.daily.meals[0].bites=kind==='eat'?2:0;
 if(kind==='carry'){animateCharacter(person,.01,false);carryMotion(person);}else homeMotion(person,kind,.016,t,0);home.activityTick(kind,t);props.update(s,person,'home',kind==='carry'?null:{kind,elapsed:t},null);home.refs.ingredients.visible=kind==='prepare';const camera=new T.PerspectiveCamera(48,390/844,.1,100);portraitProjection(camera,{width:390,height:844},true);const subject=person.position.clone().add(new T.Vector3(0,1.15,0)),framing=portraitCamera(subject,{angle:.9,distance:7,indoor:true});rig.reset();rig.update(camera,framing.target,framing.desired,1,{overview:true,subject});report.push(await renderOffline(scene,camera,390,844,'../../../qa/portrait-first/'+name+'.png'));console.log(name);
}
await writeFile(new URL('../qa/portrait-first/renders.json',import.meta.url),JSON.stringify({scope:'Portrait camera with current scene meshes/poses, offline software rendering. No HUD/CSS, browser or phone verification.',frames:report},null,2));
