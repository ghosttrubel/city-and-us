import {mkdir,writeFile,stat,rename,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createWriteStream} from 'node:fs';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const revision='1939ad2a8e416c0acfeecc08a694d14ef25f2231';
export const modelId='onnx-community/Kokoro-82M-v1.0-ONNX';
export const modelDir=path.join(path.dirname(fileURLToPath(import.meta.url)),'.model-'+revision);
export const modelSha256='fbae9257e1e05ffc727e951ef9b9c98418e6d79f1c9b6b13bd59f5c9028a1478';
export async function downloadModel(){
 for(const name of ['config.json','tokenizer.json','tokenizer_config.json','onnx/model_quantized.onnx']){
  const target=path.join(modelDir,name);if(await stat(target).catch(()=>null)){console.log('Cached',name);continue;}
  await mkdir(path.dirname(target),{recursive:true});console.log('Downloading',name);
  const response=await fetch('https://huggingface.co/'+modelId+'/resolve/'+revision+'/'+name);if(!response.ok)throw Error(name+': '+response.status);
  await pipeline(Readable.fromWeb(response.body),createWriteStream(target+'.partial'));await rename(target+'.partial',target);console.log('Downloaded',name,(await stat(target)).size);
 }
 const actual=createHash('sha256').update(await readFile(path.join(modelDir,'onnx/model_quantized.onnx'))).digest('hex');if(actual!==modelSha256)throw Error('Pinned model SHA-256 mismatch');
}
if(process.argv[1]===fileURLToPath(import.meta.url))await downloadModel();
