import {spawn} from 'node:child_process';
import {access,readdir,readFile,writeFile,copyFile,unlink} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),command=process.argv[2]||'export',names=['Square_Denim','Tank_Denim','Male_Everyday'];
async function blender(){if(process.env.BLENDER_BIN){await access(process.env.BLENDER_BIN);return process.env.BLENDER_BIN;}if(process.platform==='win32'){const base=path.join(process.env.ProgramFiles||'C:/Program Files','Blender Foundation');for(const d of (await readdir(base)).sort().reverse()){const exe=path.join(base,d,'blender.exe');try{await access(exe);return exe;}catch{}}}return process.platform==='darwin'?'/Applications/Blender.app/Contents/MacOS/Blender':'blender';}
function run(exe,args){return new Promise((resolve,reject)=>{const p=spawn(exe,args,{cwd:root,windowsHide:true,stdio:'inherit'});p.once('error',reject);p.once('exit',code=>code===0?resolve():reject(Error(exe+' exited '+code)));});}
if(!['export','catalogue','init'].includes(command))throw Error('Use export, catalogue or init');
if(command==='init'){for(const n of names){let exists=false;try{await access(path.join(root,'art/blender/batch-01',n+'.blend'));exists=true;}catch{}if(exists&&!process.argv.includes('--rebuild'))throw Error('Editable batch sources exist. Export them normally; use init --rebuild only to deliberately regenerate them.');}await run(await blender(),['--background','--factory-startup','--python-exit-code','1','--python','tools/blender/build_replacement_batch.py']);}
const targets=names.map(n=>'dist/assets/garments/Batch01_'+n+'.glb'),backups=await Promise.all(targets.map(t=>readFile(path.join(root,t)).catch(()=>null)));
try{
 if(command!=='catalogue'){await run(await blender(),['--background','--factory-startup','--python-exit-code','1','--python','tools/blender/export_replacement_batch.py']);for(const n of names)await run(process.execPath,['tools/stage-replacement-garment.mjs',n]);}
 let hasCatalogue=true;try{await access(path.join(root,'art/reference-catalogue/manifest.json'));}catch{hasCatalogue=false;}
 if(command==='catalogue'||command==='init'||!hasCatalogue)await run(process.execPath,['tools/separate-outfit-references.mjs']);
 const file=path.join(root,'art/reference-catalogue/manifest.json'),manifest=JSON.parse(await readFile(file,'utf8'));
 for(const item of [...manifest.designs,...manifest.bundles].filter(i=>i.batch===1))await copyFile(path.join(root,'art/reference-catalogue',item.thumbnail),path.join(root,'dist/assets/catalogue',item.id+'.webp'));
 await run(process.execPath,['tools/verify-wardrobe-replacement.mjs']);
 await run(process.execPath,['tools/verify-exact-outfit-game.mjs']);
 for(const item of [...manifest.designs,...manifest.bundles].filter(i=>i.batch===1)){item.status='implemented';item.visualReview='pending user screenshots';}
 await writeFile(file,JSON.stringify(manifest,null,2));
 const htmlFile=path.join(root,'art/reference-catalogue/index.html');let html=await readFile(htmlFile,'utf8');for(const item of [...manifest.designs,...manifest.bundles].filter(i=>i.batch===1))html=html.replace('<small>'+item.id+'</small><small>planned</small>','<small>'+item.id+'</small><small>Implemented · visual review pending</small>');await writeFile(htmlFile,html);
 console.log('Batch 1 export, reference separation and regression checks passed. Browser visual capture remains pending.');
}catch(error){for(let i=0;i<targets.length;i++){if(backups[i])await writeFile(path.join(root,targets[i]),backups[i]);else await unlink(path.join(root,targets[i])).catch(()=>{});}throw error;}
