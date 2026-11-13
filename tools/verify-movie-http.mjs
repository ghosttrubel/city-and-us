import assert from 'node:assert/strict';
import {once} from 'node:events';
import {readFile} from 'node:fs/promises';
import {createGameServer} from '../server-core.mjs';
const server=createGameServer();server.listen(0,'127.0.0.1');await once(server,'listening');
try {
 const url='http://127.0.0.1:'+server.address().port+'/assets/movies/lagoon-light.mp4',bytes=await readFile('dist/assets/movies/lagoon-light.mp4');
 let response=await fetch(url,{method:'HEAD'});assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'video/mp4');assert.equal(Number(response.headers.get('content-length')),bytes.length);
 response=await fetch(url,{headers:{Range:'bytes=1000-1999'}});assert.equal(response.status,206);assert.equal(response.headers.get('content-range'),'bytes 1000-1999/'+bytes.length);assert.deepEqual(Buffer.from(await response.arrayBuffer()),bytes.subarray(1000,2000));
 response=await fetch(url,{headers:{Range:'bytes=-128'}});assert.equal(response.status,206);assert.deepEqual(Buffer.from(await response.arrayBuffer()),bytes.subarray(-128));
 response=await fetch(url,{headers:{Range:'bytes=999999999-'}});assert.equal(response.status,416);
 console.log('PASS: actual HTTP sample video MIME, length, seek range, suffix range and invalid range. Player/device playback remains separate.');
} finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve))}
