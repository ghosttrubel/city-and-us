import {renderOffline} from './catalogue-preview-runtime.mjs';
import * as T from '../dist/vendor/three.module.js';
import {makeCharacter,disposeCharacter,appearanceDefaults,animateCharacter} from '../dist/character.js';
import {migrateWardrobe,previewFashion} from '../dist/wardrobe-state.js';
const phase=process.argv.includes('--before')?'before':'after';
for(const item of ['dress-day','dress-evening'])for(const pose of ['idle','walk']){
 const state={...appearanceDefaults,characterStyle:'natural',sex:'female',build:'average',money:10000,stats:{purchases:0}};migrateWardrobe(state,{});
 const scene=new T.Scene(),m=makeCharacter(previewFashion(state,item));scene.add(m);m.rotation.y=.45;
 for(let i=0;i<11;i++)animateCharacter(m,.05,pose==='walk');
 const camera=new T.PerspectiveCamera(32,300/460,.1,30);camera.position.set(0,1.25,5.4);camera.lookAt(0,1.25,0);
 await renderOffline(scene,camera,300,460,'../../../qa/portrait-first/'+phase+'-'+item+'-'+pose+'.png');disposeCharacter(m);console.log(phase,item,pose);
}
