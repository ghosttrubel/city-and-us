// Run --receive in the owner's ordinary Windows terminal. The temporary RSA key
// encrypts the local handoff only; it is NOT an Android signing key and is never saved.
import {generateKeyPairSync,createHash,randomUUID,randomBytes,publicEncrypt,privateDecrypt,createCipheriv,createDecipheriv,constants} from 'node:crypto';
import {readFileSync,writeFileSync,existsSync,unlinkSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {releaseEnvironment} from './android-signing.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),dir=join(root,'.local-signing'),requestPath=join(dir,'owner-handoff-request.json'),responsePath=join(dir,'owner-handoff-response.json');
const hash=b=>createHash('sha256').update(b).digest('hex');
const ps=(code,options={})=>spawnSync('powershell.exe',['-NoProfile',...(!options.interactive?['-NonInteractive']:[]),'-Command',code],{cwd:root,windowsHide:true,encoding:'utf8',env:{...process.env,CITY_SIGNING_ROOT:root},...options});
function identity(){const result=ps("$i=[Security.Principal.WindowsIdentity]::GetCurrent(); @{name=$i.Name;sid=$i.User.Value;computer=$env:COMPUTERNAME}|ConvertTo-Json -Compress");if(result.status!==0)throw Error('Cannot identify the Windows account.');return JSON.parse(result.stdout);}
const protect=String.raw`
$ErrorActionPreference='Stop'
$cityRoot=$env:CITY_SIGNING_ROOT
$cityKey=Join-Path $cityRoot '.local-signing/city-and-us-upload.p12'
$cityPasswordFile=Join-Path $cityRoot '.local-signing/password.dpapi'
$cityPointer=[IntPtr]::Zero
$cityTemp=$null
try {
 if (!(Test-Path -LiteralPath $cityKey)) { throw 'Missing existing keystore' }
 $cityIdentity=[Security.Principal.WindowsIdentity]::GetCurrent()
 if ($cityIdentity.Name -match 'CodexSandbox') { throw 'Use your ordinary Windows account' }
 $cityBefore=(Get-FileHash -LiteralPath $cityKey -Algorithm SHA256).Hash
 CITY_READ_SECRET
 if ($citySecure.Length -eq 0) { throw 'Empty password' }
 $cityPointer=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($citySecure)
 $env:CITY_KEY_PASSWORD=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($cityPointer)
 $env:CITY_KEYSTORE=$cityKey
 $cityJava=if($env:JAVA_HOME){Join-Path $env:JAVA_HOME 'bin/java.exe'}else{'C:/Program Files/Android/Android Studio/jbr/bin/java.exe'}
 $cityValidator=Join-Path $cityRoot 'tools/android/SigningCheck.java'
 $cityResult=& $cityJava $cityValidator 2>$null
 if ($LASTEXITCODE -ne 0) { throw 'Original password or alias validation failed' }
 $cityCertificate=($cityResult|ConvertFrom-Json).certificateSHA256
 $cityEncrypted=ConvertFrom-SecureString -SecureString $citySecure -ErrorAction Stop
 $cityRoundTrip=ConvertTo-SecureString -String $cityEncrypted -ErrorAction Stop
 $cityRoundTrip.Dispose()
 if ((Get-FileHash -LiteralPath $cityKey -Algorithm SHA256).Hash -ne $cityBefore) { throw 'Keystore changed' }
 $cityTemp=$cityPasswordFile+'.new-'+[Guid]::NewGuid().ToString('N')
 [IO.File]::WriteAllText($cityTemp,$cityEncrypted,[Text.UTF8Encoding]::new($false))
 if (Test-Path -LiteralPath $cityPasswordFile) { [IO.File]::Copy($cityPasswordFile,$cityPasswordFile+'.previous-'+[Guid]::NewGuid().ToString('N'),$false) }
 Move-Item -LiteralPath $cityTemp -Destination $cityPasswordFile -Force
 $cityTemp=$null
 $cityMetadata=@{account=$cityIdentity.Name;sid=$cityIdentity.User.Value;computer=$env:COMPUTERNAME;alias='city-and-us-upload';certificateSHA256=$cityCertificate;createdUtc=[DateTime]::UtcNow.ToString('o')}
 [IO.File]::WriteAllText((Join-Path $cityRoot '.local-signing/password.context.json'),($cityMetadata|ConvertTo-Json),[Text.UTF8Encoding]::new($false))
 Write-Output 'Original password validated and stored for this Windows account. Existing keystore and alias preserved.'
} catch { [Console]::Error.WriteLine('Password recovery/storage failed. Use the ORIGINAL password and an ordinary Windows terminal; the keystore was not replaced.'); exit 2 }
finally { if($cityPointer -ne [IntPtr]::Zero){[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($cityPointer)};if($citySecure){$citySecure.Dispose()};$env:CITY_KEY_PASSWORD=$null;$env:CITY_KEYSTORE=$null;$cityEncrypted=$null;if($cityTemp -and (Test-Path -LiteralPath $cityTemp)){Remove-Item -LiteralPath $cityTemp} }
`;
function storeForOwner(password){const result=ps(protect.replace('CITY_READ_SECRET',"$citySecure=ConvertTo-SecureString -String ([Console]::In.ReadToEnd()) -AsPlainText -Force"),{input:password});if(result.status!==0)throw Error('Owner password validation/storage failed; existing keystore preserved.');console.log(result.stdout.trim());}
function buildRelease(){const child=spawnSync(process.execPath,['tools/android-local-build.mjs','--release-only'],{cwd:root,env:process.env,stdio:'inherit',windowsHide:true});if(child.status!==0)throw Error('Release build/verification did not complete. See artifacts/android/local-release-status.json.');}
async function main(){
 if(process.argv.includes('--wrap')){
  const expected=process.argv[process.argv.indexOf('--wrap')+1];if(!/^[a-f0-9]{64}$/i.test(expected||''))throw Error('Supply the public fingerprint shown by the owner receiver; never a password.');
  const request=JSON.parse(readFileSync(requestPath,'utf8')),fingerprint=hash(request.publicKey);
  if(fingerprint!==expected.toLowerCase()||Date.now()-request.created>900000||Date.now()<request.created||/CodexSandbox/i.test(request.recipient.name))throw Error('Recipient fingerprint, account or request expiry mismatch.');
  const before=hash(readFileSync(join(dir,'city-and-us-upload.p12'))),env=releaseEnvironment(root,{...process.env,CITY_KEYSTORE:join(dir,'city-and-us-upload.p12'),CITY_KEY_PASSWORD:''}),key=randomBytes(32),iv=randomBytes(12),aad=Buffer.from(request.id+fingerprint+request.recipient.sid),cipher=createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(aad);
  const plain=Buffer.from(env.CITY_KEY_PASSWORD,'utf8');delete env.CITY_KEY_PASSWORD;
  try {const ciphertext=Buffer.concat([cipher.update(plain),cipher.final()]),wrapped=publicEncrypt({key:request.publicKey,padding:constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},key);writeFileSync(responsePath,JSON.stringify({id:request.id,fingerprint,recipientSID:request.recipient.sid,iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),key:wrapped.toString('base64'),ciphertext:ciphertext.toString('base64')}),{flag:'wx'});} finally {plain.fill(0);key.fill(0);}
  if(hash(readFileSync(join(dir,'city-and-us-upload.p12')))!==before)throw Error('Keystore changed unexpectedly.');console.log('Encrypted password handoff prepared for the confirmed owner receiver. No signing key or password file changed.');return;
 }
 const recipient=identity();if(/CodexSandbox/i.test(recipient.name))throw Error('Run this receiver in your ordinary Windows account, not the sandbox.');
 if(process.argv.includes('--password')){const result=ps(protect.replace('CITY_READ_SECRET',"$citySecure=Read-Host 'Original keystore password (hidden)' -AsSecureString"),{interactive:true,stdio:'inherit'});if(result.status!==0)throw Error('Original password was not stored.');buildRelease();return;}
 if(existsSync(requestPath)||existsSync(responsePath))throw Error('A handoff file already exists. Finish/close the previous receiver before starting another.');
 const pair=generateKeyPairSync('rsa',{modulusLength:2048}),publicKey=pair.publicKey.export({type:'spki',format:'pem'}).toString(),fingerprint=hash(publicKey),id=randomUUID();
 writeFileSync(requestPath,JSON.stringify({version:1,id,created:Date.now(),recipient,publicKey}),{flag:'wx'});
 console.log('Receiving as '+recipient.name+'. Keep this terminal open.');console.log('Send ONLY this public recipient fingerprint to the assistant: '+fingerprint);console.log('Waiting up to 15 minutes for the encrypted handoff. No password will be displayed.');
 try {
  const deadline=Date.now()+900000;while(!existsSync(responsePath)){if(Date.now()>deadline)throw Error('Handoff timed out; original signing files unchanged.');await new Promise(resolve=>setTimeout(resolve,1000));}
  let response;for(let retry=0;retry<20;retry++){try{response=JSON.parse(readFileSync(responsePath,'utf8'));break;}catch{await new Promise(resolve=>setTimeout(resolve,100));}}
  if(!response||response.id!==id||response.fingerprint!==fingerprint||response.recipientSID!==recipient.sid)throw Error('Encrypted handoff recipient mismatch.');
  const key=privateDecrypt({key:pair.privateKey,padding:constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},Buffer.from(response.key,'base64')),decipher=createDecipheriv('aes-256-gcm',key,Buffer.from(response.iv,'base64'));decipher.setAAD(Buffer.from(id+fingerprint+recipient.sid));decipher.setAuthTag(Buffer.from(response.tag,'base64'));
  let plain;try{plain=Buffer.concat([decipher.update(Buffer.from(response.ciphertext,'base64')),decipher.final()]);storeForOwner(plain);}finally{key.fill(0);plain?.fill(0);}
  unlinkSync(responsePath);
 } finally {if(existsSync(requestPath)&&JSON.parse(readFileSync(requestPath,'utf8')).id===id)unlinkSync(requestPath);}
 buildRelease();
}
main().catch(()=>{console.error('Signing recovery could not finish. Use the ordinary Windows terminal, retain the original keystore/password backup, and check the documented recovery steps. No replacement signing keys were generated.');process.exitCode=1;});
