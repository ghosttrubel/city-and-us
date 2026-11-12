import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {PLACE_LINES} from '../dist/place-voice-lines.js';
const dir=new URL('../dist/assets/dialogue/places/',import.meta.url),manifest=JSON.parse(await readFile(new URL('manifest.json',dir),'utf8'));
assert.equal(manifest.status,'generated','Voice generation is not complete');
const expected=[];
for(const [id,line] of Object.entries(PLACE_LINES))for(const variant of line.speaker==='player'?['female','male']:[null])expected.push({id,line,variant,file:id+(variant?'-'+variant:'')+'.wav'});
assert.equal(manifest.clips.length,expected.length);
let seconds=0,bytes=0;
for(const {id,line,variant,file} of expected){const c=manifest.clips.find(c=>c.file===file);assert(c,file+' missing');assert.equal(c.text,line.text);assert.equal(c.speaker,line.speaker);assert.equal(c.variant,variant);const data=await readFile(new URL(file,dir));
assert.equal(createHash('sha256').update(data).digest('hex'),c.sha256,file+' hash');assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.toString('ascii',8,12),'WAVE');assert.equal(data.readUInt16LE(20),1);assert.equal(data.readUInt16LE(22),1);assert.equal(data.readUInt16LE(34),16);assert.equal(data.readUInt32LE(24),24000);assert.equal(data.readUInt32LE(40),data.length-44);assert(c.seconds>0&&c.seconds<35);
let peak=0,nonzero=0;for(let at=44;at<data.length;at+=2){const n=Math.abs(data.readInt16LE(at));peak=Math.max(peak,n);if(n>20)nonzero++;}assert(peak>100&&peak<32767,file+' silent/clipped');assert(nonzero>(data.length-44)/2*.03,file+' nearly silent');seconds+=c.seconds;bytes+=data.length;
}
await readFile(new URL('LICENSE-Kokoro-Apache-2.0.txt',dir));
const report={status:'passed',lineCount:Object.keys(PLACE_LINES).length,clips:expected.length,seconds,bytes,scope:'Actual complete PCM recordings, script equality, model/clip hashes, licensing and audible waveform levels. Does not certify pronunciation or device playback.',listeningReview:false,devicePlayback:false,coverage:Object.fromEntries(['shop','parcel','ticket','player'].map(speaker=>[speaker,Object.entries(PLACE_LINES).filter(([,l])=>l.speaker===speaker).map(([id])=>id)]))};
await writeFile(new URL('../qa/places-vehicles-2/voice-assets.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
