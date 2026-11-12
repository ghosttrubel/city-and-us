import {spawnSync} from 'node:child_process';
import {writeFileSync,mkdirSync} from 'node:fs';
const files=['verify-life','verify-shops-phone','verify-phone-media','verify-road-vehicles','verify-decor','verify-physical-home-state','verify-physical-home','verify-daily-life','verify-street-service','verify-mobile-lifecycle','verify-wardrobe-replacement'];
mkdirSync('qa/shops-phone',{recursive:true});const results=[];
for(const file of files){const r=spawnSync(process.execPath,['tools/'+file+'.mjs'],{encoding:'utf8',maxBuffer:12*1024*1024});writeFileSync('qa/shops-phone/'+file+'.log',(r.stdout||'')+(r.stderr||''));const result={suite:file,exitCode:r.status,error:r.error?.message};results.push(result);console.log(JSON.stringify(result));}
writeFileSync('qa/shops-phone/regressions.json',JSON.stringify(results,null,2));process.exitCode=results.some(r=>r.exitCode!==0)?1:0;
