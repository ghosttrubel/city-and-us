import * as T from './vendor/three.module.js';
import {animateCharacter} from './character.js';

// Original lightweight pose layer on the retained humanoid rig. Idle/walk clips
// are not rewritten. Each frame starts from the mixer; cancellation resets it.
export function animateActivity(character,id,dt,time=0){
 const rotation=character.quaternion.clone();if(id==='sleep')character.rotation.set(0,0,0);
 animateCharacter(character,dt,false);character.quaternion.copy(rotation);
 const rig=character.userData.rig;
 if(!rig)return;if(id==='sleep')rig.position.y=0;
 const turn=character.quaternion;
 function aim(name,childName,direction){
  const bone=rig.getObjectByName(name),child=rig.getObjectByName(childName);
  if(!bone||!child)return;
  character.updateMatrixWorld(true);
  const origin=bone.getWorldPosition(new T.Vector3());
  const current=child.getWorldPosition(new T.Vector3()).sub(origin).normalize();
  const desired=new T.Vector3(...direction).normalize().applyQuaternion(turn);
  const world=bone.getWorldQuaternion(new T.Quaternion());
  world.premultiply(new T.Quaternion().setFromUnitVectors(current,desired));
  bone.quaternion.copy(bone.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(world));
 }
 const seated=['sit','study','computer'].includes(id),working=['cook','wash','study','computer'].includes(id);
 if(seated){
  rig.position.y-=.63/character.scale.y;
  for(const side of ['l','r']){aim('thigh_'+side,'calf_'+side,[0,-.12,1]);aim('calf_'+side,'foot_'+side,[0,-1,0]);}
 }
 for(const [side,sign] of [['l',1],['r',-1]]){
  const rhythm=Math.sin(time*3+(side==='l'?0:1.3))*.07;
  aim('upperarm_'+side,'lowerarm_'+side,[sign*.12,seated&&working?-.55:-1,seated&&working?.8:working?.5:.04]);
  aim('lowerarm_'+side,'hand_'+side,working?[sign*.08,(id==='wash'?-.6:seated?.2:-.08)+rhythm,1]:seated?[0,-.3,1]:[0,-1,.06]);
 }
 character.updateMatrixWorld(true);
}
