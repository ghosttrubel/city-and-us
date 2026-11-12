// Same meshes rendered offline, not browser/game screenshots.
import {renderOffline} from './catalogue-preview-runtime.mjs';
import * as T from '../dist/vendor/three.module.js';
import {createDispatchBike} from '../dist/dispatch-bike-world.js';
import {buildStreet} from '../dist/street.js';
import {makeCharacter,appearanceDefaults} from '../dist/character.js';
const scene=new T.Scene(),bike=createDispatchBike(scene),player=makeCharacter({...appearanceDefaults,name:'Bike pose'});scene.add(player);
const state={dispatchBike:{mode:'mounted',x:0,z:0,heading:0,speed:0}};bike.update(state,.016,'city',player);
const camera=new T.PerspectiveCamera(42,1000/760,.1,300);camera.position.set(4,2.9,4.8);camera.lookAt(0,1,0);
await renderOffline(scene,camera,1000,760,'../../../qa/places-vehicles-2/bike-rider-offline.png');
player.visible=false;camera.position.set(3.5,2.2,4);camera.lookAt(0,.95,0);
await renderOffline(scene,camera,1000,760,'../../../qa/places-vehicles-2/bike-offline.png');
const street=buildStreet(),overview=new T.Scene();overview.add(street.city);camera.position.set(83,95,104);camera.lookAt(7,0,0);
await renderOffline(overview,camera,1000,760,'../../../qa/places-vehicles-2/street-offline.png');
console.log('Offline bike/rider and expanded street diagnostics saved. Not live screenshots.');
