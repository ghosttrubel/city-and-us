// Optional editing tool: npm install --no-save sharp
import sharp from 'sharp';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const source=new URL('./source-assets/',import.meta.url),dest=new URL('../dist/assets/characters/',import.meta.url);await mkdir(dest,{recursive:true});
for(const sex of ['female','male']){
 const diffuse=sex==='female'?'T_Superhero_Female_Dark_BaseColor.png':'T_Superhero_Male_Dark.png',normal=sex==='female'?'T_Superhero_Female_Normal.png':'T_Superhero_Male_Normal.png';
 await writeFile(new URL(sex+'-skin.webp',dest),await sharp(await readFile(new URL(diffuse,source))).resize(512,512).greyscale().normalise().modulate({brightness:1.3}).webp({quality:90}).toBuffer());
 await writeFile(new URL(sex+'-normal.webp',dest),await sharp(await readFile(new URL(normal,source))).resize(512,512).webp({quality:93}).toBuffer());
}
await writeFile(new URL('T_Eye_Brown.webp',dest),await sharp(await readFile(new URL('T_Eye_Brown.png',source))).resize(512,512,{fit:'inside'}).webp({quality:88}).toBuffer());
console.log('Rebuilt compact local eye, skin and normal textures.');
