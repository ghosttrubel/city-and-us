import * as T from './vendor/three.module.js';
// Bounds are inflated for the camera near plane and the avatar's full silhouette.
// Batching stays local to each occluder so a cutaway never erases the city.
export function createCameraRig(){
 const ray=new T.Ray(),delta=new T.Vector3(),hit=new T.Vector3(),expanded=new T.Box3();
 const entries=[],focus=new T.Vector3();let arm=null;
 function register(root){
  root.updateMatrixWorld(true);
  root.traverse(mesh=>{if(!mesh.isMesh||mesh.isSkinnedMesh||mesh.userData.noCameraFade)return;
   const box=new T.Box3().setFromObject(mesh);if(box.max.y<.55)return;
   // Independent materials allow restoration without changing a neighbouring wall.
   const originals=Array.isArray(mesh.material)?mesh.material:[mesh.material];
   const materials=originals.map(m=>m.clone());mesh.material=Array.isArray(mesh.material)?materials:materials[0];
   entries.push({mesh,root,box,materials,base:materials.map(m=>({opacity:m.opacity,transparent:m.transparent,depthWrite:m.depthWrite})),alpha:1,cut:false,cast:mesh.castShadow});
  });
 }
 function visible(e){if(e.mesh.userData.dynamicCamera){e.mesh.updateWorldMatrix(true,false);e.box.setFromObject(e.mesh)}let o=e.mesh;while(o){if(!o.visible)return false;o=o.parent}return true}
 function intersection(a,b,box,padding=0){delta.subVectors(b,a);const length=delta.length();if(length<.001)return null;ray.set(a,delta.multiplyScalar(1/length));expanded.copy(box).expandByScalar(padding);if(expanded.containsPoint(a))return 0;const p=ray.intersectBox(expanded,hit);return p&&p.distanceTo(a)<=length?p.distanceTo(a):null}
 function update(camera,target,desired,dt,{overview=false,subject=target}={}){
  if(arm===null)focus.copy(target);else focus.lerp(target,1-Math.exp(-dt*9));const full=desired.distanceTo(target);let safe=full;
  for(const e of entries)if(!overview&&visible(e)){const d=intersection(focus,desired,e.box,.24);if(d!==null)safe=Math.min(safe,Math.max(4.4,d-.35))}
  // Inward collision correction is immediate; outward recovery is eased.
  arm=arm===null?safe:T.MathUtils.lerp(arm,safe,1-Math.exp(-dt*9));
  camera.position.copy(desired).sub(target).setLength(arm).add(focus);camera.lookAt(focus);
  let changed=false;
  for(const e of entries){
   const active=visible(e);let cut=false;
   if(active){for(const y of [-.85,0,.95]){const p=subject.clone();p.y+=y;if(intersection(camera.position,p,e.box,.36)!==null){cut=true;break}}}
   e.cut=cut;
   // Cut immediately on obstruction (including a doorway), restore smoothly.
   const next=cut?.045:Math.min(1,e.alpha+dt*2.8);
   if(next!==e.alpha){changed=true;e.alpha=next;e.materials.forEach((m,i)=>{const b=e.base[i];m.opacity=b.opacity*next;m.transparent=next<1||b.transparent;m.depthWrite=next===1&&b.depthWrite;m.needsUpdate=true});e.mesh.castShadow=next>.95&&e.cast}
  }
  camera.updateMatrixWorld();return changed;
 }
 return {register,update,entries,unregister(root){for(let i=entries.length-1;i>=0;i--)if(entries[i].root===root){entries[i].materials.forEach(m=>m.dispose());entries.splice(i,1)}},reset(){arm=null}};
}
