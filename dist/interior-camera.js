import * as T from './vendor/three.module.js';
// Fit the actual room envelope in screen space. A fixed distance wastes most of
// a landscape viewport and reacts badly to portrait aspect ratios.
export function apartmentCamera(camera,subject,{wide=false,angle=.22,zoom=1,origin=150}={}){
 const target=wide?new T.Vector3(origin,1.15,0):subject.clone();
 const direction=new T.Vector3(Math.sin(angle),wide?1.12:.57,Math.cos(angle)).normalize();
 let arm;
 if(wide){
  const probe=new T.PerspectiveCamera(camera.fov,camera.aspect,.1,300);let low=6,high=100;
  for(let i=0;i<18;i++){const d=(low+high)/2;probe.position.copy(target).addScaledVector(direction,d);probe.lookAt(target);probe.updateMatrixWorld();let fits=true;
   for(const x of [-7.15,7.15])for(const y of [.05,3.7])for(const z of [-6.65,4.65]){const p=new T.Vector3(origin+x,y,z).project(probe);if(Math.abs(p.x)>.95||Math.abs(p.y)>.85)fits=false;}
   if(fits)high=d;else low=d;
  }arm=high*zoom;
 }else{arm=Math.max(5.3,1.9/(Math.tan(camera.fov*Math.PI/360)*Math.max(.78,camera.aspect)))*zoom;}
 return {target,desired:target.clone().addScaledVector(direction,arm)};
}
