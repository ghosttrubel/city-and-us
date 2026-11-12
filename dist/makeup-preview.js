import * as T from './vendor/three.module.js';
// A bounded UV-pigment study for the retained Quaternius face atlas.
// No floating face geometry. Original albedo detail and normal map stay in use.
const pixels=new WeakMap();
const clamp=n=>Math.max(0,Math.min(1,Number(n)||0));
export function makeupValues(value={}){return {brows:clamp(value.brows),liner:clamp(value.liner),lipstick:clamp(value.lipstick),blush:clamp(value.blush),lipColour:/^#[a-f0-9]{6}$/i.test(value.lipColour)?value.lipColour:'#963f51'};}
function sourcePixels(texture){if(pixels.has(texture))return pixels.get(texture);const image=texture.image;let data;if(image.pixels)data=image.pixels;else{const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);data=ctx.getImageData(0,0,image.width,image.height).data;}const out={data,w:image.width,h:image.height};pixels.set(texture,out);return out;}
const linear=v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);
const srgb=v=>Math.round(255*(v<=.0031308?v*12.92:1.055*Math.pow(v,1/2.4)-.055));
const feather=(distance,edge=.15)=>clamp((1-distance)/edge);
export function previewMakeupTexture(texture,skinColour,sex,value){
 const m=makeupValues(value);if(!m.liner&&!m.lipstick&&!m.blush)return null;
 const {data,w,h}=sourcePixels(texture),out=new Uint8Array(data.length),skin=new T.Color(skinColour),lip=new T.Color(m.lipColour),cheek=new T.Color('#b85258'),ink=new T.Color('#251b20');
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const px=x/w*512,py=y/h*512,i=(y*w+x)*4,uvx=px-94,lipY=sex==='female'?135.5:137,lipWidth=sex==='female'?16:17;
  const lipMask=feather(Math.sqrt((uvx/lipWidth)**2+((py-lipY)/(sex==='female'?6:4))**2),.3)*m.lipstick;
  let blush=0,liner=0;
  for(const side of [-1,1]){const cx=94+side*43;blush=Math.max(blush,Math.exp(-(((px-cx)/17)**2+((py-114)/11)**2))*m.blush*.5);const ex=sex==='female'?94+side*24:95+side*24;const ey=91,rx=sex==='female'?13:11,ry=6;const ring=Math.sqrt(((px-ex)/rx)**2+((py-ey)/ry)**2);if(py<ey+1)liner=Math.max(liner,clamp(1-Math.abs(ring-1)/.20)*m.liner*.7);}
  const detail=.60+.40*(data[i]+data[i+1]+data[i+2])/765;
  for(const [j,key]of ['r','g','b'].entries()){let c=linear(data[i+j]/255)*skin[key];c=c*(1-blush)+cheek[key]*detail*blush;c=c*(1-lipMask)+lip[key]*detail*lipMask;c=c*(1-liner)+ink[key]*detail*liner;out[i+j]=srgb(clamp(c));}out[i+3]=data[i+3];
 }
 const map=new T.DataTexture(out,w,h);map.colorSpace=T.SRGBColorSpace;map.flipY=texture.flipY;map.magFilter=T.LinearFilter;map.minFilter=T.LinearMipmapLinearFilter;map.generateMipmaps=true;map.needsUpdate=true;return map;
}
