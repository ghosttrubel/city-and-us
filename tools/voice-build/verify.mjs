import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {LINES} from '../../dist/dialogue-lines.js';
const base=new URL('../../dist/assets/dialogue/',import.meta.url),m=JSON.parse(await readFile(new URL('manifest.json',base),'utf8'));
assert.equal(m.status,'generated');let bytes=0;
for(const [id,line] of Object.entries(LINES))for(const variant of line.speaker==='player'?['female','male']:[null]){
 const filename=id+(variant?'-'+variant:'')+'.wav',clip=m.clips.find(c=>c.file===filename);assert(clip,'Missing '+filename);assert.equal(clip.text,line.text);assert.equal(clip.speaker,line.speaker);
 const b=await readFile(new URL(filename,base));assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WAVE');assert.equal(b.readUInt16LE(20),1);assert.equal(b.readUInt16LE(22),1);assert.equal(b.readUInt16LE(34),16);assert.equal(b.readUInt32LE(24),24000);assert.equal(b.readUInt32LE(40)+44,b.length);assert.equal(b.readUInt32LE(4)+8,b.length);assert.equal(createHash('sha256').update(b).digest('hex'),clip.sha256);assert.equal((b.length-44)/48000,clip.durationSeconds);assert(clip.durationSeconds>.3&&clip.durationSeconds<15,'Unexpected duration '+filename);let peak=0,energy=0;for(let i=44;i<b.length;i+=2){const n=b.readInt16LE(i)/32768;peak=Math.max(peak,Math.abs(n));energy+=n*n;}assert(peak>.02&&peak<.95,'Silent/clipped '+filename);assert(energy>1,'Low waveform energy '+filename);bytes+=b.length;
}
assert.equal(bytes,m.totalBytes);console.log(JSON.stringify({status:'passed',clips:m.clips.length,bytes,seconds:m.totalDurationSeconds,checks:['script coverage','PCM16 mono 24kHz WAV headers','SHA-256','duration','non-silent waveform','peak below clipping'],limits:'No listening, pronunciation, browser autoplay or real-device audio validation.'},null,2));
