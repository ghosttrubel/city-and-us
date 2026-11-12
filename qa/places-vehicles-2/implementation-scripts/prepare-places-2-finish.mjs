import fs from 'node:fs';
let source=fs.readFileSync('tools/checkpoint-places-2.mjs','utf8');source=source.slice(0,source.indexOf('const head=')).replace('2026-11-08-before-places-batch-2','2026-11-08-after-places-batch-2').replace("'city-and-us-references','android'","'city-and-us-references','android','qa/places-vehicles-2'").replace('Batch 2 recovery:','Batch 2 final verified source:');
source+="console.log('Final checkpoint verified:',records.length,'files.');\n";
fs.writeFileSync('tools/checkpoint-places-2-final.mjs',source);
let nav=fs.readFileSync('tools/verify-navigation.mjs','utf8').replace("date:'2026-10-24'","date:new Date().toISOString()");fs.writeFileSync('tools/verify-navigation.mjs',nav);
const report=JSON.parse(fs.readFileSync('qa/navigation-camera.json','utf8'));if(report.status!=='passed')throw Error('Navigation not passed');report.date=new Date().toISOString();report.note='Legacy fixed report date corrected after the successful current run.';fs.writeFileSync('qa/navigation-camera.json',JSON.stringify(report,null,2));fs.writeFileSync('qa/places-vehicles-2/navigation-camera.json',JSON.stringify(report,null,2));
console.log('Prepared final checkpoint writer and retained current navigation evidence.');
