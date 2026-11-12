import fs from 'node:fs';
let s=fs.readFileSync('dist/neighbourhood.js','utf8').replace("WATER=[{x:52,z:-7,w:30,d:105}]","WATER=[{x:60,z:-7,w:14,d:105}]");
fs.writeFileSync('dist/neighbourhood.js',s);
s=fs.readFileSync('dist/districts.js','utf8').replace("box(32,.12,.12,'#dfd9bc',52,1.3,z);for(let x=37;x<68;x+=3)","box(15,.12,.12,'#dfd9bc',60.5,1.3,z);for(let x=53;x<68;x+=3)");
fs.writeFileSync('dist/districts.js',s);
s=fs.readFileSync('tools/verify-navigation.mjs','utf8').replaceAll('walkableStreet(52,10)','walkableStreet(60,10)').replaceAll('walkableStreet(50,-40)','walkableStreet(60,-40)').replace('nav.route({x:52,z:10}','nav.route({x:60,z:10}').replace("districts=['yaba','island'].map(buildDistrict)","districts=['yaba','island','ajah'].map(buildDistrict)").replace('All seven open doorways','All current open doorways');
fs.writeFileSync('tools/verify-navigation.mjs',s);
console.log('Aligned water/map coastline with expanded mainland; navigation check now covers current districts.');
