// Local mesh inspection only. These are explicitly NOT in-game screenshots.
import {renderOffline} from './catalogue-preview-runtime.mjs';
import * as T from '../dist/vendor/three.module.js';
import {buildFashionInterior} from '../dist/interior.js';
const v=buildFashionInterior();v.room.visible=true;v.tick(.016,true);v.room.position.x=0;v.room.updateMatrixWorld(true);const scene=new T.Scene();scene.add(v.room);let index=0;
for(const [eye,target] of [[[8,8,11],[0,1,0]],[[0,4.3,7],[2.2,1.2,-1.5]],[[1,4,5],[-3,1,-1]]]){const camera=new T.PerspectiveCamera(49,1000/760,.1,80);camera.position.set(...eye);camera.lookAt(...target);await renderOffline(scene,camera,1000,760,'../../../qa/interiors-2026-11/mesh-inspection-'+(++index)+'.png');console.log('Offline fixture inspection '+index);}
