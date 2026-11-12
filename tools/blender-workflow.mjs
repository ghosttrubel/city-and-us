import {spawn} from 'node:child_process';
import {access,readdir,readFile,writeFile,unlink} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),command=process.argv[2]||'export';
async function findBlender(){
 if(process.env.BLENDER_BIN){await access(process.env.BLENDER_BIN);return process.env.BLENDER_BIN;}
 if(process.platform==='win32'){const base=path.join(process.env.ProgramFiles||'C:/Program Files','Blender Foundation');for(const folder of (await readdir(base)).sort().reverse()){const exe=path.join(base,folder,'blender.exe');try{await access(exe);return exe;}catch{}}}
 return process.platform==='darwin'?'/Applications/Blender.app/Contents/MacOS/Blender':'blender';
}
function run(exe,args){return new Promise((resolve,reject)=>{const p=spawn(exe,args,{cwd:root,windowsHide:true,stdio:'inherit'});p.once('error',reject);p.once('exit',code=>code===0?resolve():reject(Error(exe+' exited '+code)));});}
const blender=await findBlender(),source=path.join(root,'art/blender/Square_Denim.blend');
if(command==='init'){await run(blender,['--background','--factory-startup','--python-exit-code','1','--python',path.join(root,'tools/blender/build_outfit.py'),...(process.argv.includes('--rebuild')?['--','--rebuild']:[])]);}
else if(command!=='export'&&command!=='render')throw Error('Use init, export or render');
if(command!=='render'){
 await access(source);
 await run(blender,['--background',source,'--python-exit-code','1','--python',path.join(root,'tools/blender/export_outfit.py')]);
 const target=path.join(root,'dist/assets/garments/Square_Denim_Blender.glb'),previous=await readFile(target).catch(()=>null);
 try{
  await run(process.execPath,['tools/stage-blender-outfit.mjs']);
  await run(process.execPath,['tools/verify-exact-outfit.mjs']);
  await run(process.execPath,['tools/verify-blender-outfit.mjs']);
  await run(process.execPath,['tools/verify-exact-outfit-game.mjs']);
 }catch(e){if(previous)await writeFile(target,previous);else await unlink(target).catch(()=>{});throw e;}
}
if(command==='render'){
 await run(process.execPath,['tools/blender-review-snapshots.mjs']);
 await run(blender,['--background','--factory-startup','--python-exit-code','1','--python',path.join(root,'tools/blender/render_review.py')]);
 await run(process.execPath,['tools/blender-review-sheet.mjs']);
}
