import assert from 'node:assert/strict';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const base='checkpoints/2026-11-12-shops-phone/before/';
const hash=async p=>createHash('sha256').update(await readFile(p)).digest('hex');
const protectedSources=['character.js','fashion-catalogue.js','wardrobe-state.js','wardrobe-garments.js','decor-state.js','home-life.js','road-vehicles.js','dispatch-bike.js','daily-life.js','food-service.js'];
const cashInstrumentation={
  "wardrobe-state.js": [
    [
      "s.money-=item.price;",
      "cashChange(s,-item.price,'purchase',{sku:'fashion-'+id,ref:'fashion-'+id});"
    ]
  ],
  "decor-state.js": [
    [
      "s.money-=item.price;",
      "cashChange(s,-item.price,'purchase',{sku:'furniture-'+itemId,ref:order});"
    ]
  ],
  "road-vehicles.js": [
    [
      "s.money-=RENTAL_PRICE;",
      "cashChange(s,-RENTAL_PRICE,'purchase',{sku:'rental',ref:'rental-'+(s.roadVehicles.serial+1)});"
    ]
  ],
  "daily-life.js": [
    [
      "s.money-=total;",
      "cashChange(s,-total,'purchase',{sku:'food-'+menu,ref:'food-'+(d.foodSerial+1)});"
    ],
    [
      "s.money+=o.total;",
      "cashChange(s,o.total,'refund',{ref:'food-'+o.id});"
    ],
    [
      "s.money-=quote.fare;",
      "cashChange(s,-quote.fare,'ride',{service,pickup,destination,ref:'ride-'+(d.rideSerial+1)});"
    ],
    [
      "s.money+=r.fare;",
      "cashChange(s,r.fare,'refund',{ref:'ride-'+r.id});"
    ]
  ],
  "food-service.js": [
    [
      "s.money+=pay;",
      "cashChange(s,pay,'wage',{type:'service',success:true,ref:'service-'+id});"
    ]
  ]
};
for(const f of protectedSources){let expected=await readFile(base+'dist/'+f,'utf8');if(cashInstrumentation[f]){expected="import {cashChange} from './bank.js';\n"+expected;for(const [before,after]of cashInstrumentation[f]){assert(expected.includes(before),f+' baseline cash mutation missing');expected=expected.replace(before,()=>after);}}assert.equal((await readFile('dist/'+f,'utf8')).replaceAll('\r\n','\n'),expected.replaceAll('\r\n','\n'),f+' changed beyond audited cash journaling');}

async function verifyTree(rel){for(const e of await readdir(base+rel,{withFileTypes:true})){const p=rel+'/'+e.name;if(e.isDirectory())await verifyTree(p);else assert.equal(await hash(p),await hash(base+p),p+' changed');}}
await verifyTree('dist/assets');
const original=JSON.parse(await readFile('checkpoints/2026-11-08-before-places-batch-3/manifest.json','utf8'));
for(const e of original.files)if(e.file==='.openai/hosting.json'||e.file.startsWith('reference/')||/license/i.test(e.file))assert.equal(await hash(e.file),e.sha256,e.file+' changed');
for(const f of ['README.md','ROADMAP.md'])assert((await readFile(f,'utf8')).includes(await readFile(base+f,'utf8')),'Historical '+f+' was removed');
const report={status:'passed',checks:['Character/outfit assets and sources are retained. State/permission sources match their baseline except the explicitly audited cash-journal calls.','Supplied reference collections, MIT licenses and existing hosting identity match the earlier manifest.','Full previous README and ROADMAP retained.'],limits:'No user browser saves were accessed. Save behavior is covered separately with isolated fixtures.'};
await writeFile('qa/shops-phone/preservation.json',JSON.stringify(report,null,2));console.log(report);
