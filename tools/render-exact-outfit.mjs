// Diagnostic software renders only; not the requested live-game screenshots.
import {renderOffline} from './catalogue-preview-runtime.mjs';
import * as T from '../dist/vendor/three.module.js';
import {makeCharacter,animateCharacter,disposeCharacter} from '../dist/character.js';
import {animateActivity} from '../dist/activity-pose.js';
import {loadSquareDenimAsset} from '../dist/square-denim-outfit.js';
import {writeFile} from 'node:fs/promises';
await loadSquareDenimAsset();
const scene=new T.Scene(),m=makeCharacter({sex:'female',characterStyle:'natural',hair:'bun',accessory:'none',outfitReview:'square-denim-v2',wardrobe:{equipped:{full:'outfit-f-square-denim'}}});scene.add(m);
const rows=[];for(const [name,yaw,pose] of [['front',0,'idle'],['side',Math.PI/2,'idle'],['back',Math.PI,'idle'],['seated',.65,'sit']]){m.rotation.set(0,yaw,0);m.position.y=pose==='sit'?.63:0;for(let i=0;i<12;i++)animateCharacter(m,.05,false);if(pose==='sit')animateActivity(m,'sit',.016,1);const camera=new T.PerspectiveCamera(31,620/840,.1,40);camera.position.set(0,1.35,5.15);camera.lookAt(0,1.2,0);rows.push(await renderOffline(scene,camera,620,840,'../../../qa/exact-outfit-review/diagnostic-'+name+'.png'));console.log(name);}
const meshes=[];m.traverse(o=>{if(o.userData.exactOutfitCandidate)meshes.push({name:o.name,vertices:o.geometry.attributes.position.count,triangles:(o.geometry.index?.count||o.geometry.attributes.position.count)/3});});await writeFile(new URL('../qa/exact-outfit-review/mesh-report.json',import.meta.url),JSON.stringify({scope:'Diagnostic software render of game geometry; not actual browser/game screenshot evidence.',meshes,rows},null,2));disposeCharacter(m);
