// Render-buffer resolution only. DOM text/SVG UI and lighting are independent.
export const RESOLUTIONS=Object.freeze({low:{label:'Low',ratio:1},balanced:{label:'Balanced',ratio:1.25},sharp:{label:'Sharp',ratio:1.5}});
export const validResolution=value=>Object.hasOwn(RESOLUTIONS,value);
export function resolutionConfig(value,{width,height,dpr=1,mobile=false}={}){
 const id=validResolution(value)?value:'low',preset=RESOLUTIONS[id];
 const w=Math.max(1,width||1),h=Math.max(1,height||1),budget=mobile?2000000:4000000;
 const ratio=Math.min(preset.ratio,Math.max(.5,Number(dpr)||1),Math.sqrt(budget/(w*h)));
 return {id,label:preset.label,requested:preset.ratio,ratio,width:w,height:h,budget,capped:ratio<preset.ratio-.001,key:[id,w,h,ratio.toFixed(4)].join(':')};
}
function summary(samples){if(!samples.length)return null;const sorted=[...samples].sort((a,b)=>a-b),sum=samples.reduce((a,b)=>a+b,0);return {fps:1000*samples.length/sum,meanMs:sum/samples.length,p95Ms:sorted[Math.ceil(sorted.length*.95)-1],slowPercent:samples.filter(v=>v>33.4).length/samples.length*100,frames:samples.length,seconds:sum/1000};}
export function createFrameMeter(){
 let config=null,last=null,lastScene=null,recent=[],run=null,message='Choose a resolution, then measure the same walk.',results={};
 function cancel(reason){if(run)message='Comparison stopped: '+reason;run=null;last=null;recent=[];}
 return {
  configure(next){if(config?.key!==next.key){cancel('resolution or viewport changed. Start again when ready.');config={...next};}},
  suspend(){cancel('game paused. Start again after returning.');},
  start(now,scene){if(!config)return false;run={config:{...config},scene,warmUntil:now+2000,end:now+17000,samples:[]};last=null;recent=[];message='Warm-up: 2 seconds, then a 15-second walk.';return true;},
  frame(now,scene,eligible=true){
   if(!eligible){cancel('a menu or preview opened. Close it and repeat the same walk.');return;}
   if(lastScene!==scene){if(run&&run.scene!==scene)cancel('location changed. Compare in the same location.');last=null;recent=[];lastScene=scene;}
   const before=last;last=now;if(before===null)return;const ms=now-before;if(!(ms>0))return;
   recent.push(ms);if(recent.length>120)recent.shift();
   if(run){if(before>=run.warmUntil&&run.samples.length<4096)run.samples.push(ms);if(now>=run.end){const result=summary(run.samples);if(result)results[run.config.id]={...result,config:run.config,scene:run.scene,date:new Date().toISOString()};message=result?'Comparison recorded. Repeat the same route at the next resolution.':'No active frames recorded. Try again.';run=null;}}
  },
  snapshot(now){return {config:config?{...config}:null,live:summary(recent),running:!!run,warming:!!run&&now<run.warmUntil,remaining:run?Math.max(0,Math.ceil((run.end-now)/1000)):0,message,results:structuredClone(results)};}
 };
}
