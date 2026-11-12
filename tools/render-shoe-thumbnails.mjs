import {renderOffline} from './catalogue-preview-runtime.mjs';
import * as T from '../dist/vendor/three.module.js';
import {makeCharacter,disposeCharacter,appearanceDefaults} from '../dist/character.js';
import {FASHION_ITEMS} from '../dist/fashion-catalogue.js';
import {migrateWardrobe,previewFashion} from '../dist/wardrobe-state.js';
const base={...appearanceDefaults,sex:'female',build:'average',characterStyle:'natural',money:100000,stats:{purchases:0}};migrateWardrobe(base,{});
for(const item of FASHION_ITEMS.filter(i=>i.category==='Shoes')){const s=new T.Scene(),m=makeCharacter(previewFashion(base,item.id));m.rotation.y=.27;s.add(m);const head=item.category==='Hair'||item.category==='Accessories',cam=new T.PerspectiveCamera(30,1,.1,30);const shoes=item.category==='Shoes';cam.position.set(shoes?.3:0,head?2.25:shoes?.35:1.22,head?2.05:shoes?1.9:5.2);cam.lookAt(0,head?2.22:shoes?.2:1.22,0);await renderOffline(s,cam,224,224,item.id+'.png');disposeCharacter(m);console.log(item.id);}