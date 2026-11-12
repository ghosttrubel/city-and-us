import * as T from './vendor/three.module.js';
// Original low-poly bevelled furniture primitive. Shared geometry stays compact.
export function softBox(w,h,d,r=.06){
 r=Math.min(r,w/2,h/2,d/2);const g=new T.BoxGeometry(w,h,d,3,3,3),p=g.attributes.position,n=g.attributes.normal;
 const v=new T.Vector3(),core=new T.Vector3(),normal=new T.Vector3();
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);core.set(T.MathUtils.clamp(v.x,-w/2+r,w/2-r),T.MathUtils.clamp(v.y,-h/2+r,h/2-r),T.MathUtils.clamp(v.z,-d/2+r,d/2-r));normal.copy(v).sub(core).normalize();v.copy(core).addScaledVector(normal,r);p.setXYZ(i,v.x,v.y,v.z);n.setXYZ(i,normal.x,normal.y,normal.z);}return g;
}
