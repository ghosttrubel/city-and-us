import * as T from './vendor/three.module.js';
import {animateActivity} from './activity-pose.js';
// Original procedural action cycles and two-bone IK; retained idle/walk clips
// supply the base rig only. These are not motion-captured activity assets.
export function aimHand(character,side,target){
 const rig=character.userData.rig,a=rig?.getObjectByName('upperarm_'+side),b=rig?.getObjectByName('lowerarm_'+side),c=rig?.getObjectByName('hand_'+side);if(!a||!b||!c)return;
 character.updateMatrixWorld(true);const A=a.getWorldPosition(new T.Vector3()),B=b.getWorldPosition(new T.Vector3()),C=c.getWorldPosition(new T.Vector3()),l1=A.distanceTo(B),l2=B.distanceTo(C),dir=target.clone().sub(A),d=Math.max(.02,Math.min(dir.length(),l1+l2-.005));dir.normalize();const along=(l1*l1-l2*l2+d*d)/(2*d),height=Math.sqrt(Math.max(0,l1*l1-along*along));
 const pole=new T.Vector3(side==='r'?-.5:.5,-.7,.15).applyQuaternion(character.getWorldQuaternion(new T.Quaternion()));pole.addScaledVector(dir,-pole.dot(dir)).normalize();const elbow=A.clone().addScaledVector(dir,along).addScaledVector(pole,height),end=A.clone().addScaledVector(dir,d);
 function aim(bone,child,point){character.updateMatrixWorld(true);const origin=bone.getWorldPosition(new T.Vector3()),current=child.getWorldPosition(new T.Vector3()).sub(origin).normalize(),desired=point.clone().sub(origin).normalize(),q=bone.getWorldQuaternion(new T.Quaternion());q.premultiply(new T.Quaternion().setFromUnitVectors(current,desired));bone.quaternion.copy(bone.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(q));}
 aim(a,b,elbow);aim(b,c,end);character.updateMatrixWorld(true);
}
export function handPoint(character,side='r'){character.updateMatrixWorld(true);return character.userData.rig.getObjectByName('hand_'+side).getWorldPosition(new T.Vector3());}
export function homeMotion(character,kind,dt,t,origin=150,station='prep'){
 animateActivity(character,['eat','open-meal','study','computer'].includes(kind)?['eat','open-meal'].includes(kind)?'study':kind:kind==='prepare'||kind==='stir'||kind==='plate'?'cook':kind,dt,t);
 const point=(x,y,z)=>new T.Vector3(origin+x,y,z);let right,left;
 if(kind==='open-meal'){right=point(-2.05,1.3+Math.sin(t*2)*.12,.65);left=point(-2.45,1.3,.65);}
 if(kind==='study'){right=point(-.06,1.27,-5.04+Math.sin(t*1.5)*.04);left=point(-.55,1.27,-5.12);}
 if(kind==='computer'){right=point(1.2,1.27+Math.max(0,Math.sin(t*9))*.045,-5.17);left=point(.82,1.27+Math.max(0,Math.sin(t*9+2))*.045,-5.23);}
 if(kind==='prepare'){right=point(3.35,1.48+Math.abs(Math.sin(t*7))*.2,-4.9);left=point(3.0,1.47,-4.98);}
 if(kind==='stir'||kind==='cook'){right=point(5.2+(kind==='stir'?Math.sin(t*3)*.16:.18),1.88,-4.95+(kind==='stir'?Math.cos(t*3)*.16:0));left=point(4.85,1.6,-4.88);}
 if(kind==='plate'){const x=station==='cook'?5.2:3.2;right=point(x+.05,1.45+Math.sin(t*2)*.1,-4.9);left=point(x-.25,1.43,-4.95);}
 if(kind==='eat'){const head=character.userData.rig.getObjectByName('Head').getWorldPosition(new T.Vector3()),f=Math.pow(Math.max(0,Math.sin(t/1.6*Math.PI)),2);head.add(new T.Vector3(0,-.12,-.17));right=point(-2.1,1.25,.55).lerp(head,f);left=point(-2.6,1.22,.65);}
 if(kind==='wash'){const base=character.getWorldPosition(new T.Vector3());right=base.clone().add(new T.Vector3(-.15,1.65+Math.sin(t*3)*.15,.15));left=base.clone().add(new T.Vector3(.22,1.25+Math.sin(t*3+2)*.22,.2));}
 if(right)aimHand(character,'r',right);if(left)aimHand(character,'l',left);
}
export function carryMotion(character){const p=character.getWorldPosition(new T.Vector3()),q=character.getWorldQuaternion(new T.Quaternion()),offset=new T.Vector3(-.38,1.05,.32).applyQuaternion(q);aimHand(character,'r',p.add(offset));}
