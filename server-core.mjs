import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';

const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.glb':'model/gltf-binary','.gltf':'model/gltf+json','.bin':'application/octet-stream','.webp':'image/webp','.png':'image/png','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.wav':'audio/wav','.mp3':'audio/mpeg','.mp4':'video/mp4'};
export function createGameServer(directory='dist'){
 const root=resolve(directory);
 return http.createServer(async(req,res)=>{
  try{
   const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),p=resolve(root,'.'+pathname);
   if(p!==root&&!p.startsWith(root+sep)){res.writeHead(403).end();return}
   const file=p===root?resolve(root,'index.html'):p,data=await readFile(file);
   res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');
   res.setHeader('X-Content-Type-Options','nosniff');
   res.setHeader('Cache-Control','no-cache');
   res.setHeader('Accept-Ranges','bytes');
   const range=req.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
   if(range&&req.method!=='HEAD'){
    const start=range[1]?Number(range[1]):Math.max(0,data.length-Number(range[2])),end=range[1]?(range[2]?Math.min(Number(range[2]),data.length-1):data.length-1):data.length-1;
    if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>end||start>=data.length){res.writeHead(416,{'Content-Range':'bytes */'+data.length}).end();return;}
    res.writeHead(206,{'Content-Range':'bytes '+start+'-'+end+'/'+data.length,'Content-Length':end-start+1});res.end(data.subarray(start,end+1));return;
   }
   res.setHeader('Content-Length',data.length);res.end(req.method==='HEAD'?undefined:data);
  }catch{res.writeHead(404,{'Content-Type':'text/plain'}).end('Not found')}
 });
}
