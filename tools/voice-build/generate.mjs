// Build-time only. Bundled WAV files require no online TTS or model on phones.
import {readFile,writeFile,mkdir,copyFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {KokoroTTS} from 'kokoro-js';
import {StyleTextToSpeech2Model,AutoTokenizer,env} from '@huggingface/transformers';
import {LINES} from '../../dist/dialogue-lines.js';
import {downloadModel,modelDir,modelId,revision} from './download-model.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),out=path.resolve(here,'../../dist/assets/dialogue');
await mkdir(out,{recursive:true});await downloadModel();env.allowRemoteModels=false;env.cacheDir=path.join(here,'.cache');
const model=await StyleTextToSpeech2Model.from_pretrained(modelDir,{dtype:'q8',device:'cpu',local_files_only:true,session_options:{intraOpNumThreads:1,interOpNumThreads:1}});
const tokenizer=await AutoTokenizer.from_pretrained(modelDir,{local_files_only:true});
const tts=new KokoroTTS(model,tokenizer);
const hash=b=>createHash('sha256').update(b).digest('hex');
const courier=new Set(['deliveryhello','handover','jollof','beans','wait','noextra','goodbye','handsfull']);
const maleNpc=new Set(['busy','busyreply']);
const npcVoice=id=>courier.has(id)?'bm_george':maleNpc.has(id)?'am_adam':'af_bella';
function pcm16(audio,sampleRate){
 let peak=0;for(const n of audio)peak=Math.max(peak,Math.abs(n));const gain=peak>.93?.93/peak:1;
 const b=Buffer.alloc(44+audio.length*2);b.write('RIFF',0);b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(sampleRate,24);b.writeUInt32LE(sampleRate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(audio.length*2,40);for(let i=0;i<audio.length;i++)b.writeInt16LE(Math.round(Math.max(-1,Math.min(1,audio[i]*gain))*32767),44+i*2);return {buffer:b,peak,gain};
}
const old=JSON.parse(await readFile(path.join(out,'manifest.json'),'utf8').catch(()=>'{}'));
const clips=[];
for(const [id,line] of Object.entries(LINES))for(const sex of line.speaker==='player'?['female','male']:[null]){
 const voice=sex==='female'?'af_heart':sex==='male'?'am_michael':npcVoice(id),file=id+(sex?'-'+sex:'')+'.wav';
 const prior=old.clips?.find(c=>c.file===file&&c.text===line.text&&c.voice===voice&&c.modelRevision===revision);
 const existing=prior?await readFile(path.join(out,file)).catch(()=>null):null;
 if(existing&&hash(existing)===prior.sha256){clips.push(prior);console.log('Retained',file);continue;}
 console.log('Generating',file,voice);const raw=await tts.generate(line.text,{voice,speed:.98});
 const sampleRate=raw.sampling_rate||24000,audio=raw.audio;const result=pcm16(audio,sampleRate);await writeFile(path.join(out,file),result.buffer);
 clips.push({id,file,speaker:line.speaker,variant:sex,text:line.text,voice,modelRevision:revision,sampleRate,channels:1,bitsPerSample:16,durationSeconds:audio.length/sampleRate,bytes:result.buffer.length,sha256:hash(result.buffer),sourcePeak:result.peak,normalisationGain:result.gain});
 await writeFile(path.join(out,'manifest.json'),JSON.stringify({version:1,status:'generating',clips},null,2)+'\n');
}
const modelBytes=await readFile(path.join(modelDir,'onnx/model_quantized.onnx'));
const voiceHashes={};for(const voice of new Set(clips.map(c=>c.voice)))voiceHashes[voice]=hash(await readFile(path.join(here,'node_modules/kokoro-js/voices',voice+'.bin')));
await copyFile(path.join(here,'node_modules/kokoro-js/LICENSE'),path.join(out,'LICENSE-Kokoro-Apache-2.0.txt'));
const manifest={version:1,status:'generated',created:new Date().toISOString(),generator:'kokoro-js 1.2.1; local CPU; original City & Us script',model:{id:modelId,revision,quantization:'q8',sha256:hash(modelBytes),license:'Apache-2.0',url:'https://huggingface.co/'+modelId+'/tree/'+revision},voiceHashes,clips,totalBytes:clips.reduce((n,c)=>n+c.bytes,0),totalDurationSeconds:clips.reduce((n,c)=>n+c.durationSeconds,0),verification:{pcmHeaders:true,sha256:true,auditoryReview:false,deviceAudio:false},limitations:'Synthetic stock English voices. Pidgin wording is scripted, but Nigerian/Pidgin accent and pronunciation have not been validated. No voice cloning, paid API, microphone recording, or runtime synthesis. Listening and phone audio acceptance are pending.'};
await writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
await model.dispose();console.log('COMPLETE',clips.length,'WAV files',manifest.totalBytes,'bytes');
