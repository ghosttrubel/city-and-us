// Portable build runner: node tools/android-build.mjs [--release] [--offline]
import {existsSync,readdirSync,mkdirSync,writeFileSync,readFileSync,copyFileSync,cpSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {releaseEnvironment} from './android-signing.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),android=join(root,'android');
const executable=name=>name+(process.platform==='win32'?'.exe':'');
const javaHome=process.env.JAVA_HOME||'C:/Program Files/Android/Android Studio/jbr';
const sdk=process.env.ANDROID_HOME||process.env.ANDROID_SDK_ROOT||join(process.env.LOCALAPPDATA||'','Android/Sdk');
if(!existsSync(join(sdk,'platforms/android-36/android.jar')))throw Error('Android SDK platform 36 required. Set ANDROID_HOME.');
const gradleRoot=process.env.GRADLE_HOME||(()=>{const base=join(process.env.USERPROFILE||process.env.HOME||'','.gradle/wrapper/dists/gradle-9.1.0-all');if(!existsSync(base))throw Error('Install Gradle 9.1.0 or set GRADLE_HOME.');return readdirSync(base).map(p=>join(base,p,'gradle-9.1.0')).find(existsSync);})();
let env={...process.env,JAVA_HOME:javaHome,ANDROID_HOME:sdk,ANDROID_USER_HOME:join(root,'.local-signing/android-user'),GRADLE_USER_HOME:join(android,'.gradle-user')};
mkdirSync(env.ANDROID_USER_HOME,{recursive:true});mkdirSync(env.GRADLE_USER_HOME,{recursive:true});
const secrets=join(root,'.local-signing');mkdirSync(secrets,{recursive:true});
const releaseOnly=process.argv.includes('--release-only'),release=releaseOnly||process.argv.includes('--release');
const offlineCache=join(android,'.dependency-cache');
if(process.argv.includes('--reuse-cache')&&!existsSync(join(offlineCache,'.complete'))){const from=join(process.env.USERPROFILE||process.env.HOME||'','.gradle/caches/modules-2');if(!existsSync(from))throw Error('No installed Gradle dependency cache found.');mkdirSync(offlineCache,{recursive:true});cpSync(from,join(offlineCache,'modules-2'),{recursive:true,filter:p=>!p.endsWith('.lock')&&!p.endsWith('gc.properties')});writeFileSync(join(offlineCache,'.complete'),'Local dependency snapshot, no signing material.');}
if(existsSync(join(offlineCache,'.complete')))env.GRADLE_RO_DEP_CACHE=offlineCache;

if(release)env=releaseEnvironment(root,env);
writeFileSync(join(android,'local.properties'),'sdk.dir='+sdk.replaceAll('\\','/')+'\n');
const cli=join(gradleRoot,'lib/gradle-gradle-cli-main-9.1.0.jar');
const args=['-classpath',cli,'org.gradle.launcher.GradleMain','--no-daemon','--console=plain','--max-workers=2',...(process.argv.includes('--offline')?['--offline','-PcityOfflineTools=true']:[]),...(process.argv.includes('--wrapper-only')?[]:[...(releaseOnly?[]:['assembleDebug']),...(release?['bundleRelease']:[])]),'wrapper','--gradle-version','9.1.0','--no-validate-url'];
const result=spawnSync(join(javaHome,'bin/'+executable('java')),args,{cwd:android,env,stdio:'inherit',windowsHide:true});if(result.status!==0)process.exit(result.status||1);
if(process.argv.includes('--wrapper-only')){console.log('Portable Gradle wrapper prepared.');process.exit(0);}
const output=join(root,'artifacts/android');mkdirSync(output,{recursive:true});if(!releaseOnly)copyFileSync(join(android,'app/build/outputs/apk/debug/app-debug.apk'),join(output,'city-and-us-device-test.apk'));if(release)copyFileSync(join(android,'app/build/outputs/bundle/release/app-release.aab'),join(output,'city-and-us-release.aab'));console.log('Android artifacts copied to artifacts/android. Device verification remains separate.');
