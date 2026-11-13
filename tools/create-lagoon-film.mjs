// Original City & Us sample film. No external artwork, footage or music.
// Run: node tools/create-lagoon-film.mjs
// Requires the project's sharp package and either ffmpeg, or VLC + Python.
import sharp from 'sharp';
import {mkdir,writeFile,readFile,mkdtemp,unlink,rmdir,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn,execFile} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url)),out=join(root,'dist/assets/movies');
const width=640,height=360,fps=24,seconds=16,count=fps*seconds;
const cmd=(exe,args,timeout=60000)=>new Promise((resolve,reject)=>execFile(exe,args,{windowsHide:true,timeout,maxBuffer:2000000},(err,stdout,stderr)=>err?reject(Error(exe+': '+stderr+' '+err.message)):resolve({stdout,stderr})));
export function sceneSvg(t=4,poster=false){
 const skyTop='#101e39',sunX=435+Math.sin(t*.07)*7,sunY=115-t*.5;
 const cloud=(x,y,s)=>'<path d="M '+x+' '+y+' q '+(20*s)+' '+(-12*s)+' '+(40*s)+' 0 q '+(22*s)+' '+(-25*s)+' '+(47*s)+' 0 h '+(34*s)+'" fill="none" stroke="#b4bec0" stroke-opacity=".14" stroke-width="'+(5*s)+'" stroke-linecap="round"/>';
 const buildings=Array.from({length:19},(_,i)=>{const x=i*39-25-(t*1.6)%39,h=35+(i*37%76),w=22+i%3*4;return '<g><rect x="'+x+'" y="'+(228-h)+'" width="'+w+'" height="'+h+'" fill="'+(['#2b5364','#345d69','#294657'][i%3])+'"/>'+Array.from({length:Math.floor(h/16)},(_,r)=>Array.from({length:2},(_,c)=>'<rect x="'+(x+5+c*10)+'" y="'+(234-h+r*15)+'" width="4" height="5" fill="'+((i+r+c)%4?'#89a39f':'#ffd18d')+'" opacity=".7"/>').join('')).join('')+'</g>'}).join('');
 const waves=Array.from({length:24},(_,i)=>{const x=(i*67+t*(4+i%4))%760-90,y=254+(i*31)%88,len=14+(i*11)%70;return '<path d="M '+x+' '+y+' q '+len/2+' '+Math.sin(t+i)*2+' '+len+' 0" stroke="'+(i%3?'#6dafa5':'#f5be79')+'" stroke-opacity="'+(.12+(i%3)*.06)+'" stroke-width="'+(1+i%2)+'" fill="none"/>'}).join('');
 const boat=80+t*18,bob=Math.sin(t*1.6)*1.5;
 const birds=Array.from({length:3},(_,i)=>{const x=110+i*25+t*5,y=92+i%2*8+Math.sin(t+i)*3;return '<path d="M '+x+' '+y+' q 5 '+(-4-Math.sin(t*3+i)*2)+' 10 0 q 5 -4 10 0" fill="none" stroke="#afc4c5" stroke-opacity=".7" stroke-width="1.4"/>'}).join('');
 const opacity=poster?1:Math.min(1,Math.max(0,(t-1)/2))*Math.min(1,Math.max(0,(16-t)/2));
 return '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="'+skyTop+'"/><stop offset=".66" stop-color="#526677"/><stop offset="1" stop-color="#d99070"/></linearGradient><linearGradient id="water" x2="0" y2="1"><stop stop-color="#3c8a8c"/><stop offset="1" stop-color="#102c47"/></linearGradient><radialGradient id="glow"><stop stop-color="#ffc789" stop-opacity=".25"/><stop offset="1" stop-color="#ffc789" stop-opacity="0"/></radialGradient></defs><rect width="640" height="360" fill="url(#sky)"/><circle cx="'+sunX+'" cy="'+sunY+'" r="102" fill="url(#glow)"/><circle cx="'+sunX+'" cy="'+sunY+'" r="32" fill="#f8be83"/>'+cloud(40+t,62,1)+cloud(280-t*.7,44,.8)+birds+'<path d="M0 220 Q90 190 160 218 T320 211 T480 220 T640 210 V260H0" fill="#283a50"/>'+buildings+'<path d="M0 236 H640 V360H0Z" fill="url(#water)"/><path d="M0 235H640" stroke="#efb992" stroke-width="2" opacity=".6"/><g fill="none" stroke="#172f44"><path d="M355 229V164 M570 229V153" stroke-width="5"/><path d="M288 227H640" stroke-width="9"/><path d="M290 224L355 164L463 224L570 153L640 224" stroke-width="1.5"/><path d="M355 170 Q455 237 570 159" stroke-width="2"/></g>'+waves+'<g transform="translate('+boat+' '+(282+bob)+')"><ellipse cx="33" cy="15" rx="49" ry="3" fill="#071d31" opacity=".4"/><path d="M0 0H81L68 11H14Z" fill="#182a3a"/><path d="M7 0H76" stroke="#efb780" stroke-width="3"/><rect x="25" y="-14" width="28" height="14" rx="3" fill="#537c86"/><rect x="30" y="-11" width="18" height="7" fill="#cad7cf"/><path d="M40-14V-26L52-19H40" fill="#df9175" stroke="#a4c5bb" stroke-width="1"/></g><g opacity="'+opacity+'" font-family="Arial,sans-serif"><text x="36" y="43" font-size="10" letter-spacing="4" fill="#d5e5dd">AN ORIGINAL CITY &amp; US SHORT</text><text x="34" y="177" font-size="47" font-weight="700" letter-spacing="-2" fill="#f4eee0">Lagoon Light</text><text x="37" y="200" font-size="12" letter-spacing="2" fill="#d7d7cd">A QUIET MOMENT BY THE WATER</text></g><path d="M0 348 Q110 322 200 351 L235 360 H0Z M640 326 Q576 315 507 360 H640Z" fill="#112436"/><g stroke="#244758" stroke-width="3"><path d="M20 360V309 M16 332L0 321 M20 322L36 308 M610 360V306 M610 325L591 311 M610 319L630 301"/></g></svg>';
}
const four=s=>Buffer.from(s,'ascii'),u32=n=>{const b=Buffer.alloc(4);b.writeUInt32LE(n>>>0);return b};
function chunk(id,data){return Buffer.concat([four(id),u32(data.length),data,...(data.length%2?[Buffer.alloc(1)]:[])])}
function list(id,data){return chunk('LIST',Buffer.concat([four(id),data]))}
function avi(frames){
 const max=Math.max(...frames.map(f=>f.length)),header=Buffer.alloc(56);
 [Math.round(1e6/fps),max*fps,0,16,count,0,1,max,width,height,0,0,0,0].forEach((n,i)=>header.writeUInt32LE(n>>>0,i*4));
 const sh=Buffer.alloc(56);sh.write('vids',0);sh.write('MJPG',4);sh.writeUInt32LE(1,20);sh.writeUInt32LE(fps,24);sh.writeUInt32LE(count,32);sh.writeUInt32LE(max,36);sh.writeUInt32LE(0xffffffff,40);sh.writeInt16LE(width,52);sh.writeInt16LE(height,54);
 const sf=Buffer.alloc(40);sf.writeUInt32LE(40,0);sf.writeInt32LE(width,4);sf.writeInt32LE(height,8);sf.writeUInt16LE(1,12);sf.writeUInt16LE(24,14);sf.write('MJPG',16);sf.writeUInt32LE(width*height*3,20);
 const hdrl=list('hdrl',Buffer.concat([chunk('avih',header),list('strl',Buffer.concat([chunk('strh',sh),chunk('strf',sf)]))]));
 let offset=4;const entries=frames.map(frame=>{const index=Buffer.concat([four('00dc'),u32(16),u32(offset),u32(frame.length)]);offset+=8+frame.length+(frame.length%2);return index});
 return chunk('RIFF',Buffer.concat([four('AVI '),hdrl,list('movi',Buffer.concat(frames.map(f=>chunk('00dc',f)))),chunk('idx1',Buffer.concat(entries))]));
}
function score(){
 const rate=22050,n=rate*seconds,pcm=Buffer.alloc(n*2),notes=[146.83,174.61,220,261.63,196,174.61,164.81,130.81];
 for(let i=0;i<n;i++){const t=i/rate,index=Math.min(7,Math.floor(t/2)),f=notes[index],phase=t%2,env=Math.sin(Math.PI*Math.min(1,phase/2))**2,fade=Math.min(1,t,seconds-t);const pad=(Math.sin(2*Math.PI*f*t)+.35*Math.sin(2*Math.PI*f*1.5*t)+.2*Math.sin(2*Math.PI*f*2*t))*.12*env;const sparkle=Math.sin(2*Math.PI*880*t)*Math.exp(-(t%.5)*18)*.025;pcm.writeInt16LE(Math.round(Math.max(-1,Math.min(1,(pad+sparkle)*fade))*32767),i*2)}
 const fmt=Buffer.alloc(16);fmt.writeUInt16LE(1,0);fmt.writeUInt16LE(1,2);fmt.writeUInt32LE(rate,4);fmt.writeUInt32LE(rate*2,8);fmt.writeUInt16LE(2,12);fmt.writeUInt16LE(16,14);
 return chunk('RIFF',Buffer.concat([four('WAVE'),chunk('fmt ',fmt),chunk('data',pcm)]));
}

function inspectMovie(bytes){
 const boxes=(start,end)=>{const found=[];for(let p=start;p+8<=end;){let size=bytes.readUInt32BE(p);const type=bytes.toString('ascii',p+4,p+8);if(!size)size=end-p;if(size<8||p+size>end)throw Error('Invalid MP4 box');found.push({type,start:p+8,end:p+size,size});p+=size;}return found};
 const top=boxes(0,bytes.length),moov=top.find(b=>b.type==='moov');if(!moov)throw Error('MP4 metadata missing');
 const children=boxes(moov.start,moov.end),mvhd=children.find(b=>b.type==='mvhd'),tracks=[];
 for(const trak of children.filter(b=>b.type==='trak')){
  const mdia=boxes(trak.start,trak.end).find(b=>b.type==='mdia'),mc=boxes(mdia.start,mdia.end),mdhd=mc.find(b=>b.type==='mdhd'),hdlr=mc.find(b=>b.type==='hdlr'),minf=mc.find(b=>b.type==='minf'),stbl=boxes(minf.start,minf.end).find(b=>b.type==='stbl'),sc=boxes(stbl.start,stbl.end),stsd=sc.find(b=>b.type==='stsd'),stsz=sc.find(b=>b.type==='stsz');
  const handler=bytes.toString('ascii',hdlr.start+8,hdlr.start+12),timescale=bytes.readUInt32BE(mdhd.start+12),duration=bytes.readUInt32BE(mdhd.start+16);
  tracks.push({handler,codec:bytes.toString('ascii',stsd.start+12,stsd.start+16),durationSeconds:duration/timescale,samples:bytes.readUInt32BE(stsz.start+8),...(handler==='vide'?{width:bytes.readUInt16BE(stsd.start+40),height:bytes.readUInt16BE(stsd.start+42)}:{})});
 }
 return {durationSeconds:bytes.readUInt32BE(mvhd.start+16)/bytes.readUInt32BE(mvhd.start+12),fastStart:top.indexOf(moov)<top.findIndex(b=>b.type==='mdat'),tracks};
}

await mkdir(out,{recursive:true});
const scratch=await mkdtemp(join(tmpdir(),'city-lagoon-')),input=join(scratch,'frames.avi'),sound=join(scratch,'score.wav'),output=join(out,'lagoon-light.mp4');
try{
 const frames=[];for(let i=0;i<count;i++){frames.push(await sharp(Buffer.from(sceneSvg(i/fps))).jpeg({quality:82}).toBuffer());if(i%96===0)console.log('Rendered original frame '+i+'/'+count);}
 await writeFile(input,avi(frames));await writeFile(sound,score());
 await writeFile(join(out,'lagoon-light-poster.svg'),sceneSvg(4,true));await sharp(Buffer.from(sceneSvg(4,true))).webp({quality:88}).toFile(join(out,'lagoon-light-poster.webp'));
 if(process.env.FFMPEG){await cmd(process.env.FFMPEG,['-y','-i',input,'-i',sound,'-c:v','libx264','-profile:v','baseline','-pix_fmt','yuv420p','-crf','25','-c:a','aac','-b:a','64k','-movflags','+faststart','-shortest',output],120000);}
 else{
  const python=process.env.PYTHON||'C:/Program Files/Blender Foundation/Blender 5.2/5.2/python/bin/python.exe';
  await cmd(python,[join(root,'tools/create-lagoon-film.py'),'encode',input,sound,output],90000);
 }
 const bytes=await readFile(output);if(bytes.length<10000||!bytes.includes(Buffer.from('avc1')))throw Error('Output is missing H.264 video');
 const inspected=inspectMovie(bytes);
 const report={...inspected,title:'Lagoon Light',kind:'Original animated sample, not a commercial catalogue film',width,height,sourceFps:fps,sourceDurationSeconds:seconds,sourceFrames:count,videoCodec:'H.264',audio:'Original synthesized score',bytes:bytes.length,createdBy:'tools/create-lagoon-film.mjs',rights:'Original project asset; no borrowed footage, artwork, brands or music.'};
 await writeFile(join(out,'lagoon-light-metadata.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
}finally{for(const p of [input,sound])await unlink(p).catch(()=>{});await rmdir(scratch).catch(()=>{});}
