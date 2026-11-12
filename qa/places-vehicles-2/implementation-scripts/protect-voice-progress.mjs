import fs from 'node:fs';
const p='tools/voice-build/generate-places.mjs';let s=fs.readFileSync(p,'utf8');
s=s.replace('readFile,writeFile,mkdir,copyFile','readFile,writeFile,mkdir,copyFile,rename');
s=s.replace("const old=JSON.parse(await readFile(path.join(out,'manifest.json'),'utf8').catch(()=>'{}')),clips=[];","let old={};try{old=JSON.parse(await readFile(path.join(out,'manifest.json'),'utf8'));}catch{}\nconst clips=[];\nasync function writeManifest(data){const temporary=path.join(out,'manifest.json.tmp');await writeFile(temporary,JSON.stringify(data,null,2));await rename(temporary,path.join(out,'manifest.json'));}");
s=s.replace("await writeFile(path.join(out,'manifest.json'),JSON.stringify({...base,status:'generating',clips},null,2));","await writeManifest({...base,status:'generating',clips});");
s=s.replace("await writeFile(path.join(out,'manifest.json'),JSON.stringify({...base,status:'generated',created:new Date().toISOString(),clips,totalBytes:clips.reduce((n,c)=>n+c.bytes,0)},null,2));","await writeManifest({...base,status:'generated',created:new Date().toISOString(),clips,totalBytes:clips.reduce((n,c)=>n+c.bytes,0)});");
fs.writeFileSync(p,s);console.log('Voice manifest updates use atomic replacement on subsequent runs.');
