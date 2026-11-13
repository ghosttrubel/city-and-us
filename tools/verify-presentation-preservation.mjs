import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const baseline=JSON.parse(await readFile('qa/presentation-phone-street/geometry-baseline.json','utf8'));
const normalize=(file,s)=>file==='street.js'?s.replace(/ function texture\(type\)\{[\s\S]*?(?= function mesh\()/,''):s.replace("import {cashChange} from './bank.js';\n",'').split('export function migrateNeighbourhood')[0];
for(const [file,hash]of Object.entries(baseline.hashes)){
 const source=(await readFile('dist/'+file,'utf8')).replaceAll('\r\n','\n');
 assert.equal(createHash('sha256').update(normalize(file,source)).digest('hex'),hash,file+' geometry/routes changed');
}
const street=await readFile('dist/street.js','utf8');assert(street.includes('canvas.width=canvas.height=512'));assert(street.includes('t.anisotropy=2'));assert(street.includes('mergeGeometries'));
console.log('PASS: street geometry, ground heights, routes and door definitions match the pre-presentation root commit; shared texture size/anisotropy/batching retained. Rendered finish/device performance pending.');
