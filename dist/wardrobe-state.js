import {cashChange} from './bank.js';
import {FASHION,FASHION_ITEMS,FASHION_SLOTS,LOOK_FIELDS,starterOutfit,wearable} from './fashion-catalogue.js';
const own=(o,k)=>Object.hasOwn(o,k);
export function normalizeEquipment(eq,sex,{keepBody=false}={}){
 const result={},starter=FASHION[starterOutfit(sex)];
 for(const [slot,id] of Object.entries(eq||{})){
  if(wearable(id,keepBody?undefined:sex)){result[slot]=id;continue;}
  if(slot==='full'||slot==='dress')result.full=starter.id;
  else if(slot==='top'||slot==='bottom')result[slot]=starter.parts[slot];
 }
 if(result.full){delete result.top;delete result.bottom;delete result.dress;}
 return result;
}
export function migrateWardrobe(s,data){
 const previous=data?.wardrobe;
 if(previous&&validWardrobe(previous)){
  s.wardrobe=structuredClone(previous);
  if(previous.version===1){s.wardrobe.legacy=structuredClone(previous);s.wardrobe.version=2;}
  const starter=FASHION[starterOutfit(s.sex)],owned=new Set();
  for(const id of previous.owned){const item=FASHION[id];if(!item.retired)owned.add(id);else if(item.slot==='top'||item.slot==='bottom')owned.add(starter.parts[item.slot]);else if(item.slot==='full'||item.slot==='dress')owned.add(starter.id);}
  for(const item of FASHION_ITEMS)if(item.price===0)owned.add(item.id);
  for(const id of [...owned])for(const part of Object.values(FASHION[id]?.parts||{}))owned.add(part);
  s.wardrobe.owned=[...owned];s.wardrobe.equipped=normalizeEquipment(previous.equipped,s.sex);
  s.wardrobe.looks=previous.looks.map(l=>({...structuredClone(l),equipped:normalizeEquipment(l.equipped,s.sex,{keepBody:true})}));
  return s;
 }
 s.wardrobe={version:2,owned:FASHION_ITEMS.filter(i=>i.price===0).map(i=>i.id),equipped:{full:starterOutfit(s.sex)},looks:[],serial:0};return s;
}
function validEquipment(eq,owned){return eq&&typeof eq==='object'&&!Array.isArray(eq)&&Object.entries(eq).every(([slot,id])=>FASHION_SLOTS.includes(slot)&&typeof id==='string'&&own(FASHION,id)&&FASHION[id].slot===slot&&owned.includes(id))&&!(eq.full&&(eq.top||eq.bottom||eq.dress))&&!(eq.dress&&(eq.top||eq.bottom));}
export function validWardrobe(w){
 if(!w||![1,2].includes(w.version)||!Array.isArray(w.owned)||w.owned.length>1000||new Set(w.owned).size!==w.owned.length||!w.owned.every(id=>typeof id==='string'&&own(FASHION,id))||!validEquipment(w.equipped,w.owned)||!Number.isSafeInteger(w.serial)||w.serial<0||w.serial>1e9||!Array.isArray(w.looks)||w.looks.length>24)return false;
 if(w.version===2&&(w.owned.some(id=>FASHION[id].retired)||w.legacy!==undefined&&(!w.legacy||w.legacy.version!==1||!validWardrobe(w.legacy))))return false;
 const ids=new Set();return w.looks.every(l=>{if(!l||typeof l.id!=='string'||!/^look-[0-9]{1,10}$/.test(l.id)||ids.has(l.id)||Number(l.id.slice(5))>w.serial||typeof l.name!=='string'||!l.name.trim()||l.name.length>32||!validEquipment(l.equipped,w.owned)||!l.appearance||typeof l.appearance!=='object')return false;ids.add(l.id);return Object.entries(l.appearance).every(([key,value])=>LOOK_FIELDS.includes(key)&&typeof value==='string'&&value.length<=32)&&Object.entries({hair:['bob','locs','braids','fade','afro','bun','bald'],outfit:['streetwear','jacket','native','dress'],accessory:['none','earrings','glasses','chain']}).every(([k,values])=>l.appearance[k]===undefined||values.includes(l.appearance[k]))&&['skin','shirt','bottom','shoes','hairColor'].every(k=>l.appearance[k]===undefined||/^#[0-9a-f]{6}$/i.test(l.appearance[k]));});
}
export function purchaseFashion(s,id){const item=FASHION[id];if(!item||!wearable(id,s.sex))return {ok:false,message:'This item is unavailable.'};if(s.wardrobe.owned.includes(id))return {ok:true,charged:0,message:'Already owned.'};if(s.money<item.price)return {ok:false,message:'Not enough money. You need ₦'+(item.price-s.money).toLocaleString()+' more.'};cashChange(s,-item.price,'purchase',{sku:'fashion-'+id,ref:'fashion-'+id});s.wardrobe.owned.push(id);for(const part of Object.values(item.parts||{}))if(!s.wardrobe.owned.includes(part))s.wardrobe.owned.push(part);s.stats.purchases++;return {ok:true,charged:item.price,message:item.name+' is now yours.'};}
export function equipFashion(s,id,{colours=true}={}){const item=FASHION[id];if(!item||!wearable(id,s.sex)||!s.wardrobe.owned.includes(id))return false;const eq=s.wardrobe.equipped;if(['top','bottom'].includes(item.slot)&&FASHION[eq.full]?.parts){Object.assign(eq,FASHION[eq.full].parts);for(const part of Object.values(FASHION[eq.full]?.parts||{}))if(!s.wardrobe.owned.includes(part))s.wardrobe.owned.push(part);}if(item.slot==='full'){delete eq.top;delete eq.bottom;delete eq.dress;}if(item.slot==='dress'){delete eq.top;delete eq.bottom;delete eq.full;}if(['top','bottom'].includes(item.slot)){delete eq.full;delete eq.dress;}eq[item.slot]=id;if(colours&&item.colour){const field=item.slot==='bottom'?'bottom':item.slot==='shoes'?'shoes':item.slot==='headwear'?null:'shirt';if(field)s[field]=item.colour;if(item.bottomColour)s.bottom=item.bottomColour;}return true;}
export function unequipFashion(s,slot){if(!FASHION_SLOTS.includes(slot))return false;delete s.wardrobe.equipped[slot];return true;}
export function previewFashion(s,id){const draft=structuredClone(s);if(!wearable(id,s.sex))return draft;if(!draft.wardrobe.owned.includes(id))draft.wardrobe.owned.push(id);equipFashion(draft,id);return draft;}
export function saveLook(s,name){name=String(name||'').trim().slice(0,32);if(!name)return {ok:false,message:'Give this look a name.'};const existing=s.wardrobe.looks.find(l=>l.name.toLowerCase()===name.toLowerCase());if(!existing&&s.wardrobe.looks.length>=24)return {ok:false,message:'You can keep 24 looks. Delete one first.'};const look={id:existing?.id||'look-'+(++s.wardrobe.serial),name,equipped:{...s.wardrobe.equipped},appearance:Object.fromEntries(LOOK_FIELDS.filter(k=>s[k]!==undefined).map(k=>[k,s[k]]))};if(existing)s.wardrobe.looks[s.wardrobe.looks.indexOf(existing)]=look;else s.wardrobe.looks.push(look);return {ok:true,message:'Look saved.',id:look.id};}
export function wearLook(s,id){const look=s.wardrobe.looks.find(l=>l.id===id);if(!look||!validEquipment(look.equipped,s.wardrobe.owned))return false;Object.assign(s,look.appearance);s.wardrobe.equipped=normalizeEquipment(look.equipped,s.sex);return true;}
export function deleteLook(s,id){s.wardrobe.looks=s.wardrobe.looks.filter(l=>l.id!==id);}
