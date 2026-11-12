// Run from the owner's normal local terminal. Never elevates or changes permissions.
import {spawn} from 'node:child_process';
import {mkdirSync,createWriteStream,writeFileSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname,join} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const out=join(root,'artifacts/android'); mkdirSync(out,{recursive:true});
const hash=p=>createHash('sha256').update(readFileSync(join(root,p))).digest('hex');
const signing=['.local-signing/city-and-us-upload.p12','.local-signing/password.dpapi','.local-signing/android-user/debug.keystore'];
// This recovery flow requires the prepared key and will never generate a replacement.
const before=signing.map(hash);
const debugOnly=process.argv.includes('--debug-only'),releaseOnly=process.argv.includes('--release-only'),networkArgs=process.argv.includes('--online')?[]:['--offline'];
if(debugOnly&&releaseOnly)throw Error('Choose debug-only or release-only.');
const steps=debugOnly?[['debug-build',['tools/android-build.mjs',...networkArgs]],['debug-verification',['tools/verify-android.mjs','--debug-only']]]:releaseOnly?[['release-build',['tools/android-build.mjs',...networkArgs,'--release-only']],['release-verification',['tools/verify-android.mjs','--release-only']]]:[
 ['debug-build',['tools/android-build.mjs',...networkArgs]],
 ['debug-verification',['tools/verify-android.mjs','--debug-only']],
 ['release-build',['tools/android-build.mjs',...networkArgs,'--release']],
 ['release-verification',['tools/verify-android.mjs']]
];
const results=[];
for(const [name,args] of steps){
 console.log('Starting '+name+'.');
 const log=createWriteStream(join(out,name+'.log'));
 const child=spawn(process.execPath,args,{cwd:root,env:process.env,windowsHide:true,stdio:['ignore','pipe','pipe']});
 child.stdout.on('data',b=>{process.stdout.write(b);log.write(b);});
 child.stderr.on('data',b=>{process.stderr.write(b);log.write(b);});
 const code=await new Promise(resolve=>{child.on('error',e=>{console.error(e.message);log.write(e.message);resolve(1);});child.on('close',c=>resolve(c??1));});
 await new Promise(resolve=>log.end(resolve));
 const keyPreserved=signing.every((p,i)=>hash(p)===before[i]);
 results.push({step:name,exit:code,signingUnchanged:keyPreserved});
 writeFileSync(join(out,debugOnly?'local-debug-status.json':releaseOnly?'local-release-status.json':'local-build-status.json'),JSON.stringify({date:new Date().toISOString(),results,deviceVerified:false},null,2));
 if(!keyPreserved)throw Error('Signing files changed unexpectedly. Stop and inspect private backups.');
 if(code!==0){console.error('Stopped at '+name+'. See artifacts/android/'+name+'.log.');process.exit(code);}
 if(name==='debug-verification')console.log('Debug APK verified: artifacts/android/city-and-us-device-test.apk');
}
console.log((debugOnly?'Debug APK verified.':releaseOnly?'Signed AAB verified; existing debug APK retained.':'APK and signed AAB verified.')+' Physical phone testing is still required.');
