import * as T from './vendor/three.module.js';
import {softBox} from './soft-geometry.js';
import {mergeGeometries} from './vendor/addons/BufferGeometryUtils.js';
// Small authored primitives, shared materials and per-fixture batches for mobile cutaways.
export function placeMeshKit(root){
 const materials=new Map();
 function material(color,metal=0){const key=color+'|'+metal;if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness:metal?.38:.82,metalness:metal}));return materials.get(key);}
 function mesh(geometry,color,x,y,z,parent=root,metal=0){const m=new T.Mesh(geometry,material(color,metal));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
 function box(w,h,d,c,x,y,z,p=root,r=0){return mesh(r?softBox(w,h,d,r):new T.BoxGeometry(w,h,d),c,x,y,z,p);}
 function cylinder(r,h,c,x,y,z,p=root,r2=r,n=12){return mesh(new T.CylinderGeometry(r2,r,h,n),c,x,y,z,p);}
 function oval(x,y,z,sx,sy,sz,c,p=root){const m=mesh(new T.SphereGeometry(1,10,6),c,x,y,z,p);m.scale.set(sx,sy,sz);return m;}
 function rod(a,b,r,c,p=root){const v=new T.Vector3(...a),delta=new T.Vector3(...b).sub(v),m=mesh(new T.CylinderGeometry(r,r,delta.length(),8),c,...v.addScaledVector(delta,.5).toArray(),p);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m;}
 function label(text,x,y,z,w=2.4,h=.35,c='#243e32',p=root){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const ctx=canvas.getContext('2d');ctx.fillStyle=c;ctx.fillRect(0,0,512,96);ctx.fillStyle='#fff7e9';ctx.textAlign='center';ctx.font='600 32px Arial';ctx.fillText(text,256,60,490);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture}));m.position.set(x,y,z);p.add(m);return m;}
 function batch(parent){const buckets=new Map();for(const m of [...parent.children]){if(!m.isMesh||m.material.map||m.userData.noBatch)continue;m.updateMatrix();const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();g.applyMatrix4(m.matrix);const key=m.material.uuid+'|'+(m.userData.product||'');const bucket=buckets.get(key)||{material:m.material,product:m.userData.product,geos:[]};bucket.geos.push(g);buckets.set(key,bucket);parent.remove(m);m.geometry.dispose();}
 for(const {material:mat,product,geos} of buckets.values()){const m=new T.Mesh(mergeGeometries(geos),mat);if(product)m.userData.product=product;m.castShadow=m.receiveShadow=true;parent.add(m);geos.forEach(g=>g.dispose());}}
 function group(name,x=0,z=0){const g=new T.Group();g.name=name;g.position.set(x,0,z);root.add(g);return g;}
 return {box,cylinder,oval,rod,label,mesh,batch,group,material};
}
