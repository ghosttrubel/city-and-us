import fs from 'node:fs';
let s=fs.readFileSync('tools/verify-navigation.mjs','utf8');
s=s.replace("rig.update(camera,target,desired,.05);for(const entry","rig.reset();rig.update(camera,target,desired,.05,{overview:true,subject:target});for(const entry");
s=s.replace("'Avatar clips at shortened camera arm'","'Avatar clips in shipped overview mode: '+JSON.stringify({building:b.id,side,turn,y,x:point.x,z:point.y})");
fs.writeFileSync('tools/verify-navigation.mjs',s);
console.log('Camera sweep uses the shipped overview/cutaway mode and resets between independent target teleports.');
