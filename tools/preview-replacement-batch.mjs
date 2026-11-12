// Geometry diagnostics only: not game screenshots.
import {renderOffline} from './catalogue-preview-runtime.mjs';
import {FASHION} from '../dist/fashion-catalogue.js';
import {makeCharacter,animateCharacter,disposeCharacter} from '../dist/character.js';
import * as T from '../dist/vendor/three.module.js';
const initial={skin:'#885037',characterStyle:'natural',accessory:'none',shoes:'#323234'};
for(const [name,sex,full,eq] of [['square','female','outfit-f-square-denim'],['tank','female','outfit-f-tank-denim'],['male','male','outfit-m-relaxed-denim'],['mixed','female',null,{top:'top-f-scoop-tank',bottom:'bottom-f-washed-black'}]]){
 const item=FASHION[full||'outfit-f-tank-denim'],m=makeCharacter({...initial,sex,build:'average',hair:sex==='male'?'fade':'bun',shirt:item.colour,bottom:eq?'#42413e':item.bottomColour,wardrobe:{equipped:eq||{full}}}),scene=new T.Scene();scene.add(m);animateCharacter(m,.1,false);const camera=new T.PerspectiveCamera(32,420/620,.1,20);camera.position.set(.1,1.3,5.2);camera.lookAt(0,1.2,0);await renderOffline(scene,camera,420,620,'../../../qa/wardrobe-replacement/'+name+'-offline.png');disposeCharacter(m);
}