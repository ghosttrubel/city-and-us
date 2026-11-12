// Targeted offline batch: no changes to earlier dialogue clips or runtime TTS.
import {readFile,writeFile,mkdir,copyFile,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {KokoroTTS} from 'kokoro-js';
import {StyleTextToSpeech2Model,AutoTokenizer,env} from '@huggingface/transformers';
import {PLACE_LINES} from '../../dist/place-voice-lines.js';
import {modelDir,modelId,revision,modelSha256} from './download-model.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),out=path.resolve(here,'../../dist/assets/dialogue/places'),hash=b=>createHash('sha256').update(b).digest('hex');
await mkdir(out,{recursive:true});
const modelBytes=await readFile(path.join(modelDir,'onnx/model_quantized.onnx'));
if(hash(modelBytes)!==modelSha256)throw Error('Cached model does not match pinned checksum');
env.allowRemoteModels=false;env.cacheDir=path.join(here,'.cache');
const model=await StyleTextToSpeech2Model.from_pretrained(modelDir,{dtype:'q8',device:'cpu',local_files_only:true,session_options:{intraOpNumThreads:3,interOpNumThreads:1}});
const tokenizer=await AutoTokenizer.from_pretrained(modelDir,{local_files_only:true}),tts=new KokoroTTS(model,tokenizer);
function pcm(audio,rate){let peak=0;for(const n of audio)peak=Math.max(peak,Math.abs(n));if(!Number.isFinite(peak)||peak<.001)throw Error('Empty/non-finite voice');const gain=peak>.93?.93/peak:1,b=Buffer.alloc(44+audio.length*2);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(audio.length*2,40);for(let i=0;i<audio.length;i++)b.writeInt16LE(Math.round(Math.max(-1,Math.min(1,audio[i]*gain))*32767),44+i*2);return {b,peak};}
let old={};try{old=JSON.parse(await readFile(path.join(out,'manifest.json'),'utf8'));}catch{}
const clips=[];
async function writeManifest(data){const temporary=path.join(out,'manifest.json.tmp');await writeFile(temporary,JSON.stringify(data,null,2));await rename(temporary,path.join(out,'manifest.json'));}
const base={version:1,model:{id:modelId,revision,sha256:modelSha256,license:'Apache-2.0'},limitations:'Audible stock synthetic English voices reading original Nigerian English/Pidgin wording. Nigerian accent/pronunciation and device playback acceptance are pending. No cloned voice, paid service or runtime synthesis.',auditoryReview:false,devicePlayback:false};
for(const [id,line] of Object.entries(PLACE_LINES))for(const variant of line.speaker==='player'?['female','male']:[null]){
 const voice=variant==='female'?'af_bella':variant==='male'?'am_adam':({shop:'am_michael',parcel:'bm_george',ticket:'af_heart'})[line.speaker],file=id+(variant?'-'+variant:'')+'.wav';
 const previous=old.clips?.find(c=>c.file===file&&c.text===line.text&&c.voice===voice),existing=previous?await readFile(path.join(out,file)).catch(()=>null):null;
 if(existing&&hash(existing)===previous.sha256){clips.push(previous);console.log('Retained',file);continue;}
 const raw=await tts.generate(line.text,{voice,speed:.96}),rate=raw.sampling_rate||24000,{b,peak}=pcm(raw.audio,rate);await writeFile(path.join(out,file),b);
 clips.push({id,file,speaker:line.speaker,variant,text:line.text,voice,sampleRate:rate,seconds:raw.audio.length/rate,peak,bytes:b.length,sha256:hash(b)});
 await writeManifest({...base,status:'generating',clips:[...clips,...(old.clips||[]).filter(c=>!clips.some(done=>done.file===c.file))]});console.log('Generated',file);
}
await copyFile(path.join(here,'node_modules/kokoro-js/LICENSE'),path.join(out,'LICENSE-Kokoro-Apache-2.0.txt'));
await writeManifest({...base,status:'generated',created:new Date().toISOString(),clips,totalBytes:clips.reduce((n,c)=>n+c.bytes,0)});
await model.dispose();console.log('COMPLETE',clips.length,'clips');
