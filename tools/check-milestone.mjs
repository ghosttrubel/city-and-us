import {spawnSync} from 'node:child_process';
import {writeFileSync,mkdirSync} from 'node:fs';
const scripts=['check','check:mobile','check:physical-home','check:street-service','check:living-streets','check:daily-life','check:destinations'];
const results=[];mkdirSync('qa/living-streets',{recursive:true});
for(const name of scripts){console.log('Running '+name);const r=spawnSync(process.execPath,[process.env.npm_execpath||'C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js','run',name],{encoding:'utf8',windowsHide:true,maxBuffer:10*1024*1024});writeFileSync('qa/living-streets/'+name.replaceAll(':','-')+'.log',(r.stdout||'')+(r.stderr||''));results.push({name,exit:r.status});console.log(r.stdout||'');if(r.status!==0)console.log(r.stderr||r.error);writeFileSync('qa/living-streets/check-results.json',JSON.stringify({date:new Date().toISOString(),results},null,2));}
if(results.some(r=>r.exit!==0))process.exitCode=1;
