import {renderOffline} from './catalogue-preview-runtime.mjs';
import * as T from '../dist/vendor/three.module.js';
import {makeCharacter,disposeCharacter,appearanceDefaults} from '../dist/character.js';
import {FASHION_ITEMS} from '../dist/fashion-catalogue.js';
import {migrateWardrobe,previewFashion} from '../dist/wardrobe-state.js';
const base={...appearanceDefaults,sex:'female',build:'average',characterStyle:'natural',money:100000,stats:{purchases:0}};migrateWardrobe(base,{});
const requested=new Set(process.argv.slice(2));
for(const item of FASHION_ITEMS.filter(i=>!requested.size||requested.has(i.id))){const s=new T.Scene(),m=makeCharacter(previewFashion(base,item.id));m.rotation.y=.27;s.add(m);const head=item.category==='Hair'||item.category==='Accessories',cam=new T.PerspectiveCamera(30,1,.1,30);const shoes=item.category==='Shoes';cam.position.set(shoes?.3:0,head?2.25:shoes?.35:1.22,head?2.05:shoes?1.9:5.2);cam.lookAt(0,head?2.22:shoes?.2:1.22,0);await renderOffline(s,cam,224,224,item.id+'.png');disposeCharacter(m);console.log(item.id);}
import {FURNITURE_ITEMS} from '../dist/furniture-catalogue.js';import {makeFurniture,disposeFurniture} from '../dist/furniture-meshes.js';for(const item of FURNITURE_ITEMS.filter(i=>!requested.size||requested.has(i.id))){const s=new T.Scene(),m=makeFurniture(item.id);s.add(m);const cam=new T.PerspectiveCamera(32,1,.1,30),size=Math.max(item.h,item.w,item.d);cam.position.set(size*1.4,size*1.3,size*2.2);cam.lookAt(0,item.h*.4,0);await renderOffline(s,cam,224,224,'furniture-'+item.id+'.png');disposeFurniture(m);console.log(item.id);}
