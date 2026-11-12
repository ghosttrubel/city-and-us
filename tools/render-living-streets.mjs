import {renderOffline} from './catalogue-preview-runtime.mjs';
import * as T from '../dist/vendor/three.module.js';
import {buildInterior} from '../dist/interior.js';
import {makeCharacter,animateCharacter} from '../dist/character.js';
import {homeMotion,carryMotion,aimHand,handPoint} from '../dist/home-motion.js';
import {createHomeProps} from '../dist/home-props.js';
import {createCameraRig} from '../dist/camera.js';
import {writeFile} from 'node:fs/promises';
const home=buildInterior('studio',true,'warm');home.room.position.x=0;home.room.visible=true;const scene=new T.Scene();scene.add(home.room);const person=makeCharacter({name:'Amara',sex:'female',characterStyle:'natural',hair:'bob',shirt:'#ede1cb',bottom:'#52665e',outfit:'streetwear'});home.room.add(person);const s={daily:{meals:[{id:'cook-1',recipe:'home-jollof',phase:'carried',place:'hand',bites:0,opened:true}]},homeLife:{ingredients:{bag:{rice:0,tomato:0},fridge:{tomato:2},cupboard:{rice:2}},job:null}};const props=createHomeProps(scene,home),rig=createCameraRig();rig.register(home.room);const report=[];
for(const [name,kind,x,y,z,t,look,eye] of [
 ['plated-carry','carry',0,.16,3,0,[0,1.2,2.5],[5,6,10]],
 ['visible-bite','eat',-2.2,.16,1.35,.8,[-2.2,1.2,.7],[1.8,4.7,7.2]],
 ['preparation','prepare',3.2,.16,-4.2,.6,[3.4,1.4,-4.6],[.5,5,1]]]){
 person.position.set(x,y,z);person.rotation.set(0,Math.PI,0);s.daily.meals[0].phase=kind==='carry'?'carried':'partly-eaten';s.daily.meals[0].place=kind==='carry'?'hand':'table';s.daily.meals[0].bites=kind==='eat'?2:0;
 if(kind==='carry'){animateCharacter(person,.01,false);carryMotion(person);}else homeMotion(person,kind,.016,t,0);home.activityTick(kind,t);props.update(s,person,'home',kind==='carry'?null:{kind,elapsed:t},null);home.refs.ingredients.visible=kind==='prepare';const camera=new T.PerspectiveCamera(40,720/480,.1,100);rig.update(camera,new T.Vector3(...look),new T.Vector3(...eye),1,{overview:true,subject:person.position.clone().add(new T.Vector3(0,1.1,0))});report.push(await renderOffline(scene,camera,720,480,'../../../qa/living-streets/'+name+'.png'));console.log(name);
}
const handScene=new T.Scene(),npc=makeCharacter({sex:'male',hair:'fade',accessory:'none',outfit:'streetwear',shirt:'#b77c48',bottom:'#34463f'});handScene.add(person,npc);person.position.set(-.525,0,0);person.rotation.set(0,Math.PI/2,0);npc.position.set(.525,0,0);npc.rotation.y=-Math.PI/2;animateCharacter(person,.2,false);animateCharacter(npc,.3,false);const midpoint=new T.Vector3(0,1.55,0);aimHand(person,'r',midpoint);aimHand(npc,'r',midpoint);const bag=new T.Mesh(new T.BoxGeometry(.42,.26,.32),new T.MeshStandardMaterial({color:'#d9bb83'}));bag.position.copy(midpoint).add(new T.Vector3(0,-.18,0));handScene.add(bag);const cam=new T.PerspectiveCamera(40,720/480,.1,100);cam.position.set(3.2,2.9,5);cam.lookAt(0,1.1,0);report.push(await renderOffline(handScene,cam,720,480,'../../../qa/living-streets/handover-pose.png'));await writeFile(new URL('../qa/living-streets/renders.json',import.meta.url),JSON.stringify({scope:'Software renders of retained game meshes and procedural poses. No CSS, browser WebGL, audio, touch or phone acceptance.',frames:report},null,2));
