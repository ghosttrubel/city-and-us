import {renderOffline} from './catalogue-preview-runtime.mjs';
import * as T from '../dist/vendor/three.module.js';
import {makeCharacter,disposeCharacter,animateCharacter,appearanceDefaults} from '../dist/character.js';
import {migrateWardrobe,previewFashion} from '../dist/wardrobe-state.js';
import {animateActivity} from '../dist/activity-pose.js';
const phase=process.argv[2]||'candidate';
for(const sex of ['female','male'])for(const look of ['casual','native'])for(const pose of ['idle','walk','sit']){
 let state={...appearanceDefaults,characterStyle:'natural',sex,hair:sex==='female'?'bob':'fade',outfit:'streetwear',shirt:'#e4ddd0',bottom:'#465a50',accessory:sex==='female'?'earrings':'none',skin:'#885037'};migrateWardrobe(state,{});state=previewFashion(state,look==='casual'?'outfit-casual':sex==='female'?'native-iro':'native-senator');
 const scene=new T.Scene(),model=makeCharacter(state);scene.add(model);model.rotation.y=.16;
 for(let j=0;j<12;j++)pose==='sit'?animateActivity(model,'sit',.05,.6):animateCharacter(model,.05,pose==='walk');
 const cam=new T.PerspectiveCamera(30,.75,.1,30);cam.position.set(0,1.25,5.7);cam.lookAt(0,1.25,0);
 await renderOffline(scene,cam,360,480,'../../../qa/fashion-review/'+phase+'-'+sex+'-'+look+'-'+pose+'.png');
 if(look==='casual'&&pose==='idle'){cam.aspect=1;cam.position.set(.02,2.16,1.4);cam.lookAt(0,2.16,0);await renderOffline(scene,cam,480,480,'../../../qa/fashion-review/'+phase+'-'+sex+'-face.png');}
 disposeCharacter(model);console.log(phase,sex,look,pose);
}
