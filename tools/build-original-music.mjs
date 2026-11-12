import {writeFile,mkdir} from 'node:fs/promises';
// Original algorithmic compositions made for this project; no sampled recordings.
const rate=16000,seconds=24,count=rate*seconds;
await mkdir(new URL('../dist/assets/music/',import.meta.url),{recursive:true});
for(const [name,notes,root]of [['courtyard',[0,7,12,4,9,7,4,2,0,4,7,11,9,7,2,4],220],['lagoon',[0,3,7,10,12,7,3,5,0,7,10,14,12,10,7,3],196]]){
 const data=new Float64Array(count);
 function tone(time,freq,length,gain){for(let i=0;i<length*rate&&Math.floor(time*rate)+i<count;i++){const t=i/rate,env=Math.min(1,t/.012)*Math.exp(-t*3/length);data[Math.floor(time*rate)+i]+=gain*env*(Math.sin(2*Math.PI*freq*t)+.22*Math.sin(4*Math.PI*freq*t)+.06*Math.sin(6*Math.PI*freq*t));}}
 for(let beat=0;beat<48;beat++){const t=beat*.5;const note=notes[beat%notes.length];tone(t,root*2**(note/12),.65,.18);if(beat%4===0){tone(t,root/2*2**([0,5,7,0][Math.floor(beat/4)%4]/12),1.7,.22);tone(t,root*2**(note/12),1.8,.07);}if(name==='lagoon'&&beat%2){for(let i=0;i<1600;i++){const n=((Math.imul(i+beat*391,16807)>>>0)%997)/498.5-1;data[Math.floor(t*rate)+i]+=n*Math.exp(-i/170)*.07;}}}
 const wav=Buffer.alloc(44+count*2);wav.write('RIFF');wav.writeUInt32LE(36+count*2,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(count*2,40);
 for(let i=0;i<count;i++){const fade=Math.min(1,i/(rate*.04),(count-i)/(rate*.3));wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,data[i]*fade))*.8*32767),44+i*2);}
 await writeFile(new URL('../dist/assets/music/'+name+'.wav',import.meta.url),wav);
}
console.log('Two original 24-second music loops generated.');
