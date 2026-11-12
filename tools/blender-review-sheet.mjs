import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url),sharp=require('sharp'),root=new URL('../',import.meta.url),dir=new URL('qa/blender-outfit/',root);
const source=await readFile(new URL('reference/outfits/Female_Wardrobe_Collection/01_Casual_Streetwear/Denim_and_Everyday_Tops.png',root));
const meta=await sharp(source).metadata(),left=Math.floor(meta.width*2/3);
const crop=await sharp(source).extract({left,top:0,width:meta.width-left,height:meta.height}).resize(650,850,{fit:'contain',background:'#e5e9ee'}).png().toBuffer();
const tiles=[['ORIGINAL · RIGHTMOST COLUMN',crop],...['front','side','back','seated','recolour'].map(name=>[name==='back'?'BACK · INFERRED':name==='recolour'?'RECOLOUR · SAME OUTFIT':name.toUpperCase(),new URL('blender-'+name+'.png',dir)])];
const overlays=[{input:Buffer.from('<svg width="1950" height="90"><rect width="1950" height="90" fill="#e5e9ee"/><text x="24" y="35" font-family="Arial" font-size="28" fill="#20313f">Single outfit · exported Blender asset on the existing game character</text><text x="24" y="69" font-family="Arial" font-size="23" fill="#415362">Blender studio lighting · game-generated poses · these are not game screenshots</text></svg>'),left:0,top:0}];
for(const [i,[title,input]] of tiles.entries()){
 const x=(i%3)*650,y=90+Math.floor(i/3)*900;
 overlays.push({input:Buffer.from('<svg width="650" height="50"><rect width="650" height="50" fill="#e5e9ee"/><text x="15" y="34" font-family="Arial" font-size="23" fill="#20313f">'+title+'</text></svg>'),left:x,top:y});
 overlays.push({input:input instanceof URL?await readFile(input):input,left:x,top:y+50});
}
await writeFile(new URL('outfit-review-sheet.png',dir),await sharp({create:{width:1950,height:1890,channels:4,background:'#e5e9ee'}}).composite(overlays).png().toBuffer());
console.log('Labelled Blender/source comparison saved.');
