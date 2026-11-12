import assert from 'node:assert/strict';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const base='checkpoints/2026-11-12-shops-phone/before/';
const hash=async p=>createHash('sha256').update(await readFile(p)).digest('hex');
const protectedSources=['character.js','fashion-catalogue.js','wardrobe-state.js','wardrobe-garments.js','decor-state.js','home-life.js','road-vehicles.js','dispatch-bike.js','daily-life.js','food-service.js'];
for(const f of protectedSources)assert.equal(await hash('dist/'+f),await hash(base+'dist/'+f),f+' changed');
async function verifyTree(rel){for(const e of await readdir(base+rel,{withFileTypes:true})){const p=rel+'/'+e.name;if(e.isDirectory())await verifyTree(p);else assert.equal(await hash(p),await hash(base+p),p+' changed');}}
await verifyTree('dist/assets');
const original=JSON.parse(await readFile('checkpoints/2026-11-08-before-places-batch-3/manifest.json','utf8'));
for(const e of original.files)if(e.file==='.openai/hosting.json'||e.file.startsWith('reference/')||/license/i.test(e.file))assert.equal(await hash(e.file),e.sha256,e.file+' changed');
for(const f of ['README.md','ROADMAP.md'])assert((await readFile(f,'utf8')).includes(await readFile(base+f,'utf8')),'Historical '+f+' was removed');
const report={status:'passed',checks:['Character/outfit sources, prior assets, ownership and rental permission implementations are byte-for-byte retained.','Supplied reference collections, MIT licenses and existing hosting identity match the earlier manifest.','Full previous README and ROADMAP retained.'],limits:'No user browser saves were accessed. Save behavior is covered separately with isolated fixtures.'};
await writeFile('qa/shops-phone/preservation.json',JSON.stringify(report,null,2));console.log(report);
