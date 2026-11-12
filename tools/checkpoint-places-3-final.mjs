import {readdir,mkdir,readFile,writeFile,copyFile,stat} from 'node:fs/promises';
import path from 'node:path';import {createHash} from 'node:crypto';
const root=process.cwd(),cp=path.join(root,'checkpoints/2026-11-08-after-places-batch-3');
if(await stat(cp).catch(()=>null))throw Error('Refusing to overwrite an existing checkpoint');
await mkdir(cp,{recursive:true});const files=[];
async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){if(e.isDirectory()){if(!e.name.startsWith('.')&&!['node_modules','build','cache','models'].includes(e.name))await walk(path.join(dir,e.name));}else if(e.name!=='local.properties'&&!/\.(jks|keystore)$/.test(e.name))files.push(path.join(dir,e.name));}}
for(const e of await readdir(root,{withFileTypes:true}))if(e.isFile())files.push(path.join(root,e.name));
for(const d of ['dist','docs','tools','art','reference','city-and-us-references','android','qa/places-vehicles-2','qa/places-vehicles-3'])await walk(path.join(root,d));
files.push(path.join(root,'.openai/hosting.json'));const records=[],hash=b=>createHash('sha256').update(b).digest('hex');
for(const p of files){const rel=path.relative(root,p),dest=path.join(cp,rel);await mkdir(path.dirname(dest),{recursive:true});await copyFile(p,dest);const original=await readFile(p),digest=hash(original);if(hash(await readFile(dest))!==digest)throw Error('Copy mismatch '+rel);records.push({file:rel.replaceAll('\\','/'),sha256:digest,bytes:original.length});}
await writeFile(path.join(cp,'manifest.json'),JSON.stringify({scope:'After Batch 3: source, runtime assets, editable art and references. Excludes dependencies, hidden model/build caches, signing keys and browser saves.',files:records},null,2));
console.log('Final checkpoint verified:',records.length,'files.');
