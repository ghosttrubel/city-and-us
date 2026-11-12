import fs from 'node:fs';
let s=fs.readFileSync('dist/dispatch-bike-world.js','utf8');
s=s.replace("[side*.42,1.35,.68]","[side*.37,1.48,.43]").replace("[side*.35,1.36,.68]","[side*.35,1.48,.43]");
s=s.replace("new T.Vector3(x,1.36,.67)","new T.Vector3(x,1.48,.43)");
fs.writeFileSync('dist/dispatch-bike-world.js',s);
s=fs.readFileSync('dist/place-voice-lines.js','utf8').replace('Good afternoon. We have','Welcome. We have');
fs.writeFileSync('dist/place-voice-lines.js',s);
console.log('Adjusted handlebar contact; made shop greeting suitable for every game time.');
