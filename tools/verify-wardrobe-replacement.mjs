import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {FASHION,FASHION_ITEMS,RETIRED_FASHION,resolvedFashion,starterOutfit} from '../dist/fashion-catalogue.js';
import {migrateWardrobe,normalizeEquipment,validWardrobe,purchaseFashion,equipFashion,saveLook,wearLook} from '../dist/wardrobe-state.js';
import {migrate,validSave} from '../dist/life.js';
import {renderOffline} from './catalogue-preview-runtime.mjs';
import {makeCharacter,animateCharacter,disposeCharacter} from '../dist/character.js';
import {animateActivity} from '../dist/activity-pose.js';
import * as T from '../dist/vendor/three.module.js';
const root=new URL('../',import.meta.url),passed=[];
const initial={name:'Migration QA',sex:'female',build:'broad',face:'soft',characterStyle:'natural',skin:'#885037',shirt:'#9867b4',bottom:'#345678',shoes:'#efe8da',hairColor:'#241b19',hair:'braids',outfit:'native',accessory:'earrings',money:43872,food:80,energy:80,mood:80,time:480,day:4,x:0,z:6,rentDay:2,skills:{trader:4,rider:2,chef:3}};
for(const sex of ['female','male'])for(const retired of RETIRED_FASHION){
 const old=migrate({...initial,sex},initial,'LS-0123456789ABCDEF');old.stats.purchases=17;
 old.wardrobe={version:1,owned:[retired.id,'hair-braids','shoe-boots'],equipped:{[retired.slot]:retired.id,hair:'hair-braids',shoes:'shoe-boots'},looks:[{id:'look-3',name:'My saved look',equipped:{[retired.slot]:retired.id},appearance:{shirt:'#aa1122',bottom:'#abcdef',hair:'braids',outfit:'native'}}],serial:3};
 assert(validSave({version:1,data:old}),'Legacy import rejected: '+retired.id);
 const snapshot=structuredClone(old),converted=migrate(old,initial,old.localPlayerId),{wardrobe,...rest}=converted,{wardrobe:prior,...oldRest}=snapshot;
 assert.deepEqual(rest,oldRest,'Non-wardrobe state changed');assert.deepEqual(old,snapshot,'Input save mutated');assert.deepEqual(wardrobe.legacy,prior,'Legacy ownership lost');
 assert(validSave({version:1,data:converted}),'Migrated save invalid: '+retired.id);
 assert(!wardrobe.owned.some(id=>FASHION[id].retired));assert(!Object.values(wardrobe.equipped).some(id=>FASHION[id].retired));
 assert.deepEqual(wardrobe.looks[0].appearance,prior.looks[0].appearance);assert.equal(wardrobe.looks[0].name,'My saved look');
 assert(!purchaseFashion(converted,retired.id).ok);assert(!equipFashion(converted,retired.id));
 assert.deepEqual(migrate(JSON.parse(JSON.stringify(converted)),initial,converted.localPlayerId),converted,'Migration must be idempotent');
 assert(wearLook(converted,'look-3'));assert.equal(converted.shirt,'#aa1122');
}
passed.push('Every retired item migrates for both bodies; original wardrobe archive, money, identity, progress and customisation retained; exported saves reload idempotently');
console.log(passed.at(-1));
const state=migrate(initial,initial,'LS-0123456789ABCDEF');equipFashion(state,'outfit-f-square-denim');equipFashion(state,'top-f-scoop-tank');assert.deepEqual(state.wardrobe.equipped,{top:'top-f-scoop-tank',bottom:'bottom-f-washed-black'});assert.equal(state.bottom,'#42413e');equipFashion(state,'bottom-f-blue-wide');assert.equal(state.wardrobe.equipped.top,'top-f-scoop-tank');saveLook(state,'Mixed');assert(validWardrobe(state.wardrobe));assert(!equipFashion(state,'top-m-relaxed-tee'));passed.push('Full outfits split into independently selectable parts; swapping one preserves the other; cross-body equip is refused');
console.log(passed.at(-1));
const changedBody=structuredClone(state);changedBody.sex='male';changedBody.wardrobe.equipped=normalizeEquipment(changedBody.wardrobe.equipped,'male');assert.equal(changedBody.wardrobe.equipped.top,'top-m-relaxed-tee');assert.equal(changedBody.shirt,state.shirt);assert.deepEqual(changedBody.wardrobe.looks,state.wardrobe.looks);assert.deepEqual(changedBody.wardrobe.owned,state.wardrobe.owned);assert(wearLook(changedBody,changedBody.wardrobe.looks[0].id));assert.equal(changedBody.wardrobe.equipped.bottom,'bottom-m-blue-baggy');
const manifest=JSON.parse(await readFile(new URL('art/reference-catalogue/manifest.json',root)));
assert.equal(new Set([...manifest.designs,...manifest.bundles].map(i=>i.id)).size,manifest.designs.length+manifest.bundles.length);
for(const source of manifest.sources){assert.equal(createHash('sha256').update(await readFile(new URL(source.file,root))).digest('hex'),source.sha256,'Original reference changed');}
for(const i of FASHION_ITEMS.filter(i=>i.implemented)){const source=[...manifest.designs,...manifest.bundles].find(d=>d.id===i.id);assert(source);assert(!i.referenceImage);assert((await readFile(new URL('dist/'+i.thumbnail,root))).equals(await readFile(new URL('art/reference-catalogue/'+source.thumbnail,root))),'Thumbnail differs: '+i.id);}
passed.push('Unique cropped item IDs; source reference hashes preserved; active thumbnails match their own crops');
console.log(passed.at(-1));
const parts=model=>{const p=[];model.traverse(o=>{if(o.userData.wardrobeGarment)p.push(o)});return p;};let poses=0,maxEdge=0;
for(const sex of ['female','male'])for(const build of ['slim','average','athletic','broad']){
 const pairs=sex==='female'?[['square','square'],['tank','tank'],['square','tank'],['tank','square']]:[['male','male']];
 for(const [top,bottom] of pairs){
  const topItem=FASHION_ITEMS.find(i=>i.slot==='top'&&i.model===top),bottomItem=FASHION_ITEMS.find(i=>i.slot==='bottom'&&i.model===bottom);
  const args={...initial,sex,build,shirt:topItem.colour,bottom:bottomItem.colour,wardrobe:{equipped:{top:topItem.id,bottom:bottomItem.id}}},a=makeCharacter(args),b=makeCharacter(args),ap=parts(a),bp=parts(b);assert.equal(ap.length,5);const knit=ap.find(m=>m.name==='Top_Knit'),kp=knit.geometry.attributes.position,ki=knit.geometry.index;for(let q=0;q<ki.count;q+=3){const v=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(kp,ki.getX(q+k))),centre=v[0].clone().add(v[1]).add(v[2]).divideScalar(3);if(Math.abs(centre.x)<.08&&centre.y>1.13&&centre.y<1.32&&centre.z>.06)assert(v[1].sub(v[0]).cross(v[2].sub(v[0])).z>=-1e-10,'Inverted front fabric triangle: '+top);}
  const topBinding=ap.find(m=>m.name==='Top_Binding');topBinding.geometry.computeBoundingBox();if(top==='square')assert(topBinding.geometry.boundingBox.min.y>1.12,'Jeans pocket trim must not remain in the top');if(top==='tank')assert(topBinding.geometry.boundingBox.min.y>1.10,'Tank binding contains jeans trim');
  for(let i=0;i<ap.length;i++){assert.equal(ap[i].geometry,bp[i].geometry,'Geometry must be shared');assert.notEqual(ap[i].material,bp[i].material,'Dye must be independent');}
  const old=bp[0].material.color.getHex();ap[0].material.color.set('#ff2288');assert.equal(bp[0].material.color.getHex(),old);ap[0].material.color.copy(bp[0].material.color);
  for(const pose of ['idle','walk','sit']){for(let frame=0;frame<4;frame++){animateCharacter(a,.1,pose==='walk');if(pose==='sit')animateActivity(a,'sit',.1,1);a.updateMatrixWorld(true);for(const mesh of ap){mesh.skeleton.update();const p=mesh.geometry.attributes.position,index=mesh.geometry.index,points=[];for(let v=0;v<p.count;v++){const q=new T.Vector3().fromBufferAttribute(p,v);mesh.applyBoneTransform(v,q);assert(q.toArray().every(Number.isFinite));points.push(q);}for(let v=0;v<index.count;v+=3){const x=points[index.getX(v)],y=points[index.getX(v+1)],z=points[index.getX(v+2)],edge=Math.max(x.distanceTo(y),y.distanceTo(z),z.distanceTo(x));maxEdge=Math.max(maxEdge,edge);assert(edge<.5,sex+'/'+build+'/'+top+'/'+pose+' exploded edge '+edge);}}}poses++;}
  disposeCharacter(a);assert(bp[0].geometry.attributes.position.count>0);disposeCharacter(b);
 }
}
passed.push('All body builds and female mix combinations animate in idle, walking and seated poses without invalid or exploded vertices; geometry shared and dyes independent');
console.log(passed.at(-1));
for(const [name,sex,full,eq] of [['square','female','outfit-f-square-denim'],['tank','female','outfit-f-tank-denim'],['male','male','outfit-m-relaxed-denim'],['mixed','female',null,{top:'top-f-scoop-tank',bottom:'bottom-f-washed-black'}]]){
 const item=FASHION[full||'outfit-f-tank-denim'],m=makeCharacter({...initial,sex,build:'average',hair:sex==='male'?'fade':'bun',shirt:item.colour,bottom:eq?'#42413e':item.bottomColour,wardrobe:{equipped:eq||{full}}}),scene=new T.Scene();scene.add(m);animateCharacter(m,.1,false);const camera=new T.PerspectiveCamera(32,420/620,.1,20);camera.position.set(.1,1.3,5.2);camera.lookAt(0,1.2,0);await renderOffline(scene,camera,420,620,'../../../qa/wardrobe-replacement/'+name+'-offline.png');disposeCharacter(m);
}
const report={status:'passed',scope:'CPU geometry, save and asset checks. Software diagnostic images are NOT browser captures. Visual acceptance and phone frame-rate testing pending.',poses,maxEdge,passed};await writeFile(new URL('qa/wardrobe-replacement/verification.json',root),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
