import {renderOffline} from './catalogue-preview-runtime.mjs';
import * as T from '../dist/vendor/three.module.js';
import {buildStreet} from '../dist/street.js';
import {buildStreet as beforeStreet} from '../checkpoints/2026-10-26-home-before-street/dist/street.js';
for(const [name,build] of [['before',beforeStreet],['after',buildStreet]]){const world=build(),scene=new T.Scene();scene.add(world.city);const camera=new T.PerspectiveCamera(45,1000/650,.1,200);camera.position.set(0,10,23);camera.lookAt(9,1.4,12);await renderOffline(scene,camera,1000,650,'../../../qa/street-life/'+name+'.png');console.log(name+' software street render');}
