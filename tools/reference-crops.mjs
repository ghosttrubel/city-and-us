// Preserve source pixels while isolating disconnected transparent-background designs.
import {createRequire} from 'node:module';
const sharp=createRequire(import.meta.url)('sharp');
export async function isolateDesigns(bytes,regions){
 const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true}),w=info.width,h=info.height,N=w*h,labels=new Uint16Array(N),stack=new Uint32Array(N),components=[];let label=0;
 for(let seed=0;seed<N;seed++){
  if(labels[seed]||data[seed*4+3]<64)continue;if(++label>65000)return null;
  let sp=1,count=0,x0=w,y0=h,x1=0,y1=0;stack[0]=seed;labels[seed]=label;
  function push(i){if(!labels[i]&&data[i*4+3]>=64){labels[i]=label;stack[sp++]=i;}}
  while(sp){const p=stack[--sp],x=p%w,y=Math.floor(p/w);count++;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);if(x>0)push(p-1);if(x<w-1)push(p+1);if(y>0)push(p-w);if(y<h-1)push(p+w);}
  if(count>1000)components.push({label,count,x:x0,y:y0,width:x1-x0+1,height:y1-y0+1});
 }
 // Touching/overlapping designs require the manually reviewed region masks.
 if(components.length!==regions.length)return null;
 const pairs=[];for(let i=0;i<regions.length;i++)for(let j=0;j<components.length;j++){const r=regions[i],c=components[j],intersection=Math.max(0,Math.min(r.x+r.width,c.x+c.width)-Math.max(r.x,c.x))*Math.max(0,Math.min(r.y+r.height,c.y+c.height)-Math.max(r.y,c.y));pairs.push({i,j,score:intersection/(c.width*c.height)});}
 pairs.sort((a,b)=>b.score-a.score);const used=new Set(),assigned=new Map();for(const pair of pairs)if(!assigned.has(pair.i)&&!used.has(pair.j)){assigned.set(pair.i,pair.j);used.add(pair.j);}
 const major=new Set(components.map(c=>c.label)),output=[];
 for(let i=0;i<regions.length;i++){const c=components[assigned.get(i)],rgba=Buffer.alloc(c.width*c.height*4);for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const original=(y+c.y)*w+x+c.x,at=(y*c.width+x)*4;data.copy(rgba,at,original*4,original*4+4);if(major.has(labels[original])&&labels[original]!==c.label)rgba[at+3]=0;}output.push({rect:{x:c.x,y:c.y,width:c.width,height:c.height},image:await sharp(rgba,{raw:{width:c.width,height:c.height,channels:4}}).png().toBuffer()});}
 return output;
}
