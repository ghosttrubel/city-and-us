// Signing credentials stay in child-process memory. Never create or rotate keys.
import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
export const UPLOAD_ALIAS='city-and-us-upload';
export function releaseEnvironment(root,env=process.env,run=spawnSync){
 const result={...env},key=env.CITY_KEYSTORE||join(root,'.local-signing/city-and-us-upload.p12');
 if(!existsSync(key))throw Error('Existing upload keystore missing. Restore its backup; replacement signing keys will not be generated.');
 if(!result.CITY_KEY_PASSWORD){
  const file=join(root,'.local-signing/password.dpapi');
  if(!existsSync(file))throw Error('Signing password unavailable. In your ordinary Windows terminal run: node tools/android-signing-repair.mjs');
  const code=`$ErrorActionPreference='Stop'; [Console]::OutputEncoding=[Text.UTF8Encoding]::new($false); try { $s=ConvertTo-SecureString -String ([Console]::In.ReadToEnd()) -ErrorAction Stop; $p=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($s); try { [Console]::Out.Write([Runtime.InteropServices.Marshal]::PtrToStringBSTR($p)) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($p); $s.Dispose() } } catch { exit 3 }`;
  const child=run('powershell.exe',['-NoProfile','-NonInteractive','-Command',code],{input:readFileSync(file,'utf8').trim(),encoding:'utf8',windowsHide:true,env});
  if(child.status!==0||!child.stdout)throw Error('Signing password cannot be decrypted in this Windows context. Keystore unchanged. Run node tools/android-signing-repair.mjs in your ordinary Windows terminal and supply the ORIGINAL password if prompted.');
  result.CITY_KEY_PASSWORD=child.stdout;
 }
 result.CITY_KEYSTORE=key;
 return result;
}
