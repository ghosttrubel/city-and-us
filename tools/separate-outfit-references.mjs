import {isolateDesigns} from './reference-crops.mjs';
import {readFile,writeFile as writeRaw,mkdir,rename} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url),sharp=require('sharp'),root=new URL('../',import.meta.url);
// Avoid needless rewrites and tolerate brief sync-client file locks.
async function writeFile(file,data){const bytes=Buffer.from(data),old=await readFile(file).catch(()=>null);if(old?.equals(bytes))return;for(let attempt=0;;attempt++){try{const target=new URL(file),temporary=new URL(target.href+'.pending');await writeRaw(temporary,bytes);await rename(temporary,target);return;}catch(error){if(attempt>=5||!['EBUSY','EPERM','UNKNOWN'].includes(error.code))throw error;await new Promise(resolve=>setTimeout(resolve,250*(attempt+1)));}}}
const sheets=JSON.parse(await readFile(new URL('qa/wardrobe-replacement/sheet-index.json',root),'utf8'));
const four=new Set([0,1,4,16,35,44,45,51,66,68]);
const cuts={4:[.5,.5,.5,.65],6:[.67,.67,.67],7:[.43,.43,.43],8:[.34,.34,.34],11:[.54,.47,.5],12:[.5,.5,.43],14:[.56,.37,.35],15:[.45,.45,.5],16:[.38,.38,.38,.38],17:[.5,.5,.62],18:[.48,.48,.48],20:[.39,.35,.5],21:[.30,.60,.38],22:[.42,.42,.62],23:[.64,.64,.64],24:[.4,.4,.4],25:[.6,.6,.46],27:[.6,.48,.5],28:[.65,.65,.65],29:[.47,.47,.5],30:[.35,.35,.5],47:[.55,.55,.55],48:[.55,.55,.55],51:[.43,.43,.43,.43],54:[.44,.44,.44],55:[.55,.55,.55],57:[.4,.4,.4],61:[.55,.55,.55],62:[.8,.8,.4],63:[.43,.43,.5]};
const names={
7:['Ivory scoop-neck tank','Yellow cropped polo','Charcoal square-neck crop','Light-blue wide-leg jeans','Blue cargo jeans','Washed-black wide-leg jeans'],
8:['Ivory fitted crop tee','Rose square-neck tank','Lilac fitted crop tee','Grey cuffed joggers','Rose cuffed joggers','Charcoal cuffed joggers'],
44:['Grey baggy joggers','Charcoal baggy joggers','Sage drawstring trousers','Light-blue baggy jeans','Washed-black baggy jeans','Blue cargo jeans','Sand cargo shorts','Black sport shorts'],
45:['Black fitted tee','Ivory ribbed vest','Sage polo','Blue camp shirt','Charcoal relaxed tee','Butter-yellow relaxed tee','Burgundy sports jersey','Blue striped polo']
};
const active={
'7:0:2':{id:'top-f-square-charcoal',status:'implemented',name:'Charcoal square-neck crop'},
'7:1:2':{id:'bottom-f-washed-black',status:'implemented',name:'Washed-black wide jeans'},
'7:0:0':{id:'top-f-scoop-tank',status:'implemented',name:'Ivory scoop-neck tank'},
'7:1:0':{id:'bottom-f-blue-wide',status:'implemented',name:'Light-blue wide jeans'},
'45:1:1':{id:'top-m-relaxed-tee',status:'implemented',name:'Butter-yellow relaxed tee'},
'44:0:3':{id:'bottom-m-blue-baggy',status:'implemented',name:'Light-blue baggy jeans'}
};
// Registry marks these as staged until the actual GLBs pass validation.
const out=new URL('art/reference-catalogue/',root);await mkdir(new URL('crops/',out),{recursive:true});
const designs=[],sources=[];
for(const [index,file] of sheets.entries()){
 const data=await readFile(new URL(file,root)),meta=await sharp(data).metadata(),cols=four.has(index)?4:3;
 const sex=file.includes('Female_')?'female':file.includes('Male_')?'male':'family';
 const title=path.basename(file,'.png').replaceAll('_',' '),slug=(sex+'-'+path.basename(file,'.png')).toLowerCase().replaceAll('_','-');
 const regions=[];for(let row=0;row<2;row++)for(let col=0;col<cols;col++){const cut=index===7&&col<2?.35:cuts[index]?.[col]||.5,x=Math.round(col/cols*meta.width),end=Math.round((col+1)/cols*meta.width),y=row?Math.round((index===7?.36:cut)*meta.height):0;regions.push({x,y,width:end-x,height:(row?meta.height:Math.round(cut*meta.height))-y});}
 const isolated=await isolateDesigns(data,regions);
 sources.push({file,sha256:createHash('sha256').update(data).digest('hex'),width:meta.width,height:meta.height,designs:cols*2});
 for(let row=0;row<2;row++)for(let col=0;col<cols;col++){
  const cut=index===7&&col<2?.35:cuts[index]?.[col]||.5,x0=Math.round(col/cols*meta.width),x1=Math.round((col+1)/cols*meta.width);
  const y0=row?Math.round((index===7?.36:cut)*meta.height):0,y1=row?meta.height:Math.round(cut*meta.height);
  const key=index+':'+row+':'+col,selected=active[key],id=selected?.id||'ref-'+slug+'-r'+(row+1)+'c'+(col+1);
  const isolatedCrop=isolated?.[row*cols+col];
  let crop=isolatedCrop?sharp(isolatedCrop.image):sharp(data).extract({left:x0,top:y0,width:x1-x0,height:y1-y0}).ensureAlpha();
  // The long sleeves overlap the vertical bounds of the jeans; masks remove
  // neighbouring garments without painting or changing any source design.
  if(!isolatedCrop&&index===7&&col===2){
   const w=x1-x0,h=y1-y0;
   const svg=row?'<svg width="'+w+'" height="'+h+'"><path fill="white" d="M 88 0 H 350 V 64 H '+w+' V '+h+' H 0 V 64 H 88 Z"/></svg>':'<svg width="'+w+'" height="'+h+'"><path fill="white" fill-rule="evenodd" d="M0 0H'+w+'V'+h+'H0Z M90 369H350V'+h+'H90Z"/></svg>';
   crop=crop.composite([{input:Buffer.from(svg),blend:'dest-in'}]);
  }
  if(!isolatedCrop&&index===45&&row===1&&col===1){const mask='<svg width="384" height="512"><path fill="white" fill-rule="evenodd" d="M0 0H384V512H0Z M0 170H9V253L34 278L0 297Z M384 208H378V250L363 272L384 294Z"/></svg>';crop=crop.composite([{input:Buffer.from(mask),blend:'dest-in'}]);}
  const thumbnail='crops/'+id+'.webp';await writeFile(new URL(thumbnail,out),await sharp(await crop.toBuffer()).resize(320,400,{fit:'contain',background:'#e7e8e9'}).webp({quality:86}).toBuffer());
  designs.push({id,name:selected?.name||names[index]?.[row*cols+col]||title+' · '+(row?'lower':'upper')+' '+(col+1),sex,source:file,sourceSha256:sources.at(-1).sha256,position:{row:row+1,column:col+1},crop:isolatedCrop?.rect||{x:x0,y:y0,width:x1-x0,height:y1-y0},cropMethod:isolatedCrop?'isolated source component':'reviewed region; overlapping edges may need refinement',thumbnail,status:'planned',batch:selected?1:null});
 }
}
const bundles=[
{id:'outfit-f-tank-denim',name:'Ivory tank & light-blue wide jeans',sourceIndex:7,column:0,parts:['top-f-scoop-tank','bottom-f-blue-wide']},
{id:'ref-f-polo-cargo',name:'Yellow polo & blue cargo jeans',sourceIndex:7,column:1,parts:['ref-female-denim-and-everyday-tops-r1c2','ref-female-denim-and-everyday-tops-r2c2']},
{id:'outfit-f-square-denim',name:'Charcoal square-neck & washed-black jeans',sourceIndex:7,column:2,parts:['top-f-square-charcoal','bottom-f-washed-black']},
{id:'outfit-m-relaxed-denim',name:'Relaxed tee & baggy jeans',parts:['top-m-relaxed-tee','bottom-m-blue-baggy']}
];
for(const b of bundles){
 if(b.sourceIndex!==undefined){const data=await readFile(new URL(sheets[b.sourceIndex],root)),m=await sharp(data).metadata();await writeFile(new URL('crops/'+b.id+'.webp',out),await sharp(data).extract({left:Math.round(m.width*b.column/3),top:0,width:Math.round(m.width/3),height:m.height}).resize(320,400,{fit:'contain',background:'#e7e8e9'}).webp({quality:88}).toBuffer());}
 else {const images=await Promise.all(b.parts.map(id=>readFile(new URL('crops/'+id+'.webp',out))));const tiles=await Promise.all(images.map(im=>sharp(im).resize(320,200,{fit:'contain',background:'#e7e8e9'}).toBuffer()));await writeFile(new URL('crops/'+b.id+'.webp',out),await sharp({create:{width:320,height:400,channels:4,background:'#e7e8e9'}}).composite(tiles.map((input,i)=>({input,left:0,top:i*200}))).webp({quality:88}).toBuffer());}
 b.thumbnail='crops/'+b.id+'.webp';b.status='planned';b.batch=b.id.startsWith('outfit-')?1:null;
}
await writeFile(new URL('manifest.json',out),JSON.stringify({version:1,scope:'Each source design is separately identified. Planned entries are not player-facing or wearable. Batch status is set only after GLB checks.',sources,designs,bundles},null,2));
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
await writeFile(new URL('index.html',out),'<!doctype html><meta charset="utf-8"><title>Supplied design inventory</title><style>body{font:16px system-ui;background:#eef0f2}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px}article{background:white;padding:10px}img{width:100%}small{display:block;overflow-wrap:anywhere}</style><h1>Individual supplied designs</h1><p>Planning inventory. Only designs with validated 3D garments enter the game catalogue.</p><main>'+[...bundles,...designs].map(d=>'<article><img loading="lazy" src="'+d.thumbnail+'"><b>'+esc(d.name)+'</b><small>'+d.id+'</small><small>'+d.status+'</small></article>').join('')+'</main>');
console.log(sources.length+' original sheets preserved; '+designs.length+' individual designs; '+bundles.length+' separately pictured outfit entries.');
