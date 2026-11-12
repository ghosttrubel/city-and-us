import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const manifest=JSON.parse(await readFile(new URL('../dist/assets/dialogue/places/manifest.json',import.meta.url),'utf8'));
assert.equal(manifest.status,'generated');
const base='http://localhost:3000',checks=[];
for(const path of ['/?review=places','/places-voice-review.html','/game.js','/dispatch-bike.js','/dispatch-bike-world.js','/place-voice.js','/ride-roads.js']){
 const r=await fetch(base+path);assert.equal(r.status,200,path);const text=await r.text();assert(text.length>100);checks.push(path);
}
for(const clip of manifest.clips){const r=await fetch(base+'/assets/dialogue/places/'+clip.file,{headers:{Range:'bytes=0-43'}});assert.equal(r.status,206,clip.file);assert.equal(r.headers.get('content-type'),'audio/wav');const b=Buffer.from(await r.arrayBuffer());assert.equal(b.length,44);assert.equal(b.toString('ascii',0,4),'RIFF');}
await writeFile(new URL('../qa/places-vehicles-2/http-review.json',import.meta.url),JSON.stringify({status:'passed',url:base+'/?review=places',listening:base+'/places-voice-review.html',pages:checks,recordings:manifest.clips.length,scope:'Local HTTP responses, audio MIME types and byte-range delivery; not browser autoplay or listening verification.'},null,2));console.log('Review pages, game modules and '+manifest.clips.length+' ranged audio responses passed.');
