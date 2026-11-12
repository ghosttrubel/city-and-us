import * as T from './vendor/three.module.js';
let serial=0;
// Small additive behaviour on the retained rig. Procedural facial approximation,
// not authored visemes or motion capture. Does not alter the saved appearance.
export function createBehaviour(model,body,eyes,headY,own){
 const rig=model.userData.rig,head=rig.getObjectByName('Head'),chest=rig.getObjectByName('spine_03'),arm=rig.getObjectByName('upperarm_r');
 const phase=(++serial*2.399963)%6.28;let clock=phase,nextBlink=2+phase,blink=0,speech=0,gesture=0,target=null,previousHead=new T.Quaternion(),previousChest=new T.Quaternion(),previousArm=new T.Quaternion(),lastHead=null,lastChest=null,lastArm=null;
 function morph(mesh,fn){if(!mesh?.geometry)return null;const geo=own(mesh.geometry.clone()),p=geo.attributes.position,values=new Float32Array(p.array);for(let i=0;i<p.count;i++)fn(values,i*3,p.getX(i),p.getY(i),p.getZ(i));geo.morphAttributes.position=[new T.BufferAttribute(values,3)];geo.morphTargetsRelative=false;mesh.geometry=geo;mesh.updateMorphTargets();return mesh;}
 const mouth=morph(body,(a,i,x,y,z)=>{const w=Math.max(0,1-Math.abs(x)/.055)*Math.max(0,1-Math.abs(y-(headY-.061))/.035)*(z>.045?1:0);a[i+1]-=.009*w;});
 let eyeCentre=headY+.005;if(eyes){eyes.geometry.computeBoundingBox();eyeCentre=eyes.geometry.boundingBox.getCenter(new T.Vector3()).y;}
 const eyelids=morph(eyes,(a,i,x,y,z)=>{a[i+1]=eyeCentre+(y-eyeCentre)*.05;});
 const q=new T.Quaternion(),v=new T.Vector3(),e=new T.Euler();
 // Mixer resets driven bones each frame; restore our previous offset only for
 // undriven bones before adding the new one (avoids accumulated deformation).
 function restore(b,last,base){if(b&&last&&b.quaternion.angleTo(last)<1e-6)b.quaternion.copy(base);}
 return {speak(on){speech=on?1:0;},greet(){gesture=1.5;},lookAt(value){target=value;},tick(dt,moving){clock+=dt;restore(head,lastHead,previousHead);restore(chest,lastChest,previousChest);restore(arm,lastArm,previousArm);if(head)previousHead.copy(head.quaternion);if(chest)previousChest.copy(chest.quaternion);if(arm)previousArm.copy(arm.quaternion);
  if(clock>=nextBlink){blink=.17;nextBlink=clock+3.1+(Math.sin(clock*1.71+phase)+1)*1.7;}blink=Math.max(0,blink-dt);if(eyelids)eyelids.morphTargetInfluences[0]=blink?Math.sin(blink/.17*Math.PI):0;if(mouth)mouth.morphTargetInfluences[0]=speech*(.22+.78*Math.abs(Math.sin(clock*14)*Math.sin(clock*5.3)));
  if(chest&&!moving)chest.rotation.x+=Math.sin(clock*1.6+phase)*.009;
  if(head){if(target){model.updateMatrixWorld(true);v.copy(typeof target==='function'?target():target);head.parent.worldToLocal(v);e.set(T.MathUtils.clamp(-v.y*.03,-.1,.1),T.MathUtils.clamp(Math.atan2(v.x,v.z),-.3,.3),0);q.setFromEuler(e);head.quaternion.multiply(q);}else if(!moving){head.rotation.y+=Math.sin(clock*.45+phase)*.045;head.rotation.z+=Math.sin(clock*.31+phase)*.018;}if(speech)head.rotation.x+=Math.sin(clock*4.2)*.02;lastHead=head.quaternion.clone();}
  gesture=Math.max(0,gesture-dt);if(arm&&!moving&&(speech||gesture)){arm.rotation.z+=(gesture?.2:.06)*(1+Math.sin(clock*4))*.5;arm.rotation.x-=gesture?.12:.035;}
  if(chest)lastChest=chest.quaternion.clone();if(arm)lastArm=arm.quaternion.clone();
 },get snapshot(){return {clock,speech,blink,gesture};}};
}
