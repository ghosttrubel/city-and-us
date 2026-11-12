import {renderOffline} from './catalogue-preview-runtime.mjs';
import * as T from '../dist/vendor/three.module.js';
import {makeCharacter,animateCharacter,disposeCharacter} from '../dist/character.js';
import {homeMotion} from '../dist/home-motion.js';
import {animateActivity} from '../dist/activity-pose.js';
import {FASHION_ITEMS} from '../dist/fashion-catalogue.js';
import {createRequire} from 'node:module';
import {writeFile,readFile,mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url),sharp=require('sharp'),out=new URL('../qa/wardrobe-batch-1/',import.meta.url);await mkdir(out,{recursive:true});
const records=[];
for(const item of FASHION_ITEMS.filter(i=>i.reviewBatch===1))for(const pose of ['idle','walk','sit','eat']){
 const scene=new T.Scene(),m=makeCharacter({sex:item.sex,characterStyle:'natural',hair:item.sex==='female'?'bob':'fade',accessory:'none',shirt:item.sex==='female'?'#c1cbd2':'#7d9cac',bottom:'#3e5263',wardrobe:{equipped:{full:item.id}}});scene.add(m);m.rotation.y=pose==='eat'?.85:.3;
 for(let i=0;i<16;i++)animateCharacter(m,.05,pose==='walk');if(pose==='eat'){m.position.set(-2.2,.16,1.35);m.rotation.y=Math.PI;homeMotion(m,'eat',.01,.8,0);}if(pose==='sit'){animateActivity(m,'sit',.01,.8);m.position.y=.63;}
 const camera=new T.PerspectiveCamera(32,360/560,.1,100);camera.position.set(.2,1.55,5.7);camera.lookAt(0,1.25,0);if(pose==='eat'){camera.position.set(.2,1.6,-4.3);camera.lookAt(-2.2,1.0,1.35);}
 const file=item.id+'-'+pose+'.png';await renderOffline(scene,camera,360,560,'../../../qa/wardrobe-batch-1/'+file);
 if(pose==='idle')await sharp(await readFile(new URL(file,out))).resize(180,280).png().toFile(new URL('../dist/assets/catalogue/'+item.id+'.png',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'));
 const label=Buffer.from('<svg width="360" height="44"><rect width="360" height="44" fill="#172b36"/><text x="8" y="17" font-family="Arial" font-size="12" fill="white">SOFTWARE RENDER · NOT DEVICE CAPTURE</text><text x="8" y="34" font-family="Arial" font-size="11" fill="white">'+item.name.replaceAll('&','&amp;')+' · '+pose+'</text></svg>');
 await writeFile(new URL(file,out),await sharp(await readFile(new URL(file,out))).composite([{input:label,gravity:'south'}]).png().toBuffer());records.push({item:item.id,pose,file});console.log(file);disposeCharacter(m);
}
await writeFile(new URL('renders.json',out),JSON.stringify({build:'0.8.2-wardrobe.1 (11)',scope:'Software render of runtime geometry/poses. Simplified lighting; not live WebGL or physical-device acceptance.',records},null,2));
await writeFile(new URL('review.html',out),'<!doctype html><meta name="viewport" content="width=device-width"><title>Wardrobe batch 1</title><style>body{font:16px system-ui;background:#e5edf1;color:#243b49;margin:20px}section{display:flex;flex-wrap:wrap;gap:10px}img{width:280px;max-width:100%}h2{margin-top:35px}</style><h1>Wardrobe batch 1 · build 11</h1><p>SOFTWARE RENDERS from runtime meshes. Not device screenshots. Fit and fabric folds remain approximations; see HANDOFF.md.</p>'+FASHION_ITEMS.filter(i=>i.reviewBatch===1).map(i=>'<h2>'+i.name+'</h2><section>'+records.filter(r=>r.item===i.id).map(r=>'<img src="'+r.file+'" alt="'+i.name+' '+r.pose+' software render">').join('')+'</section>').join(''));
