import * as T from './vendor/three.module.js';
// Portrait follows the person at a readable scale, leaving top HUD and bottom
// touch/interaction space. Wide/tablet layouts retain their existing camera.
export function portraitCamera(subject,{angle=.2,distance=15,indoor=false}={}){
 const zoom=distance/(indoor?7:15);
 const direction=new T.Vector3(Math.sin(angle),indoor?.72:.64,Math.cos(angle)).normalize();
 const target=subject.clone(),arm=(indoor?6.6:8.4)*zoom;
 return {target,desired:target.clone().addScaledVector(direction,arm)};
}
export function portraitProjection(camera,{width,height},portrait){
 camera.aspect=width/height;camera.fov=portrait?48:40;camera.clearViewOffset();
 camera.setViewOffset(width,height,0,portrait?height*.075:height<500?0:25,width,height);camera.updateProjectionMatrix();
}
