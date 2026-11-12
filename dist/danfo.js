import * as T from './vendor/three.module.js';
import {placeMeshKit} from './place-mesh-kit.js';
import {makeCharacter} from './character.js';
import {animateActivity} from './activity-pose.js';
// Top-left vehicle in Lagos_Street_Transport.png. Rear and cabin are inferred.
export function buildDanfo(){
 const root=new T.Group();root.name='reference-yellow-danfo';const shell=new T.Group();root.add(shell);
 const {box,cylinder,rod,batch,material}=placeMeshKit(shell),yellow='#edb82b',rubber='#262d30',metal='#929b9d',glass='#48616d';
 box(1.82,.12,4.3,rubber,0,.48,0);
 // Separate side panels leave a real aperture behind the sliding passenger door.
 box(.11,.65,4.24,yellow,-.88,1.13,0,shell,.035);
 box(.11,.65,2.09,yellow,.88,1.13,-1.075,shell,.035);
 box(.11,.65,1.29,yellow,.88,1.13,1.475,shell,.035);
 for(const z of [-2.06,2.06])box(1.76,.65,.12,yellow,0,1.13,z,shell,.04);
 box(1.88,.18,4.25,yellow,0,2.48,-.08,shell,.08);
 box(1.78,.44,.14,yellow,0,1.65,2.06,shell,.04);
 // Wheel wells stay open below the waist rather than covering the tyres with a box.
 for(const side of [-1,1]){
  box(.09,.34,side<0?1.65:.7,yellow,side*.92,.66,side<0?-.03:-.6);
  box(.09,.34,.35,yellow,side*.92,.66,1.94);
  box(.09,.34,.35,yellow,side*.92,.66,-1.94);
  for(const z of [-1.94,-1.03,-.08,.88])box(.09,.91,.075,yellow,side*.91,1.97,z);
  for(const z of [-1.51,-.56,.4]){if(side===1&&z===.4)continue;box(.045,.72,.81,rubber,side*.931,2.01,z,shell,.025);box(.048,.62,.72,glass,side*.948,2.025,z,shell,.02);}
  for(const [length,z] of (side<0?[[4.2,0]]:[[2.09,-1.075],[1.29,1.475]])){box(.04,.105,length,rubber,side*.952,1.2,z);box(.04,.065,length,rubber,side*.952,1.04,z);}
  rod([side*.91,1.99,1.5],[side*1.08,2.0,1.72],.022,rubber);
  box(.12,.29,.19,rubber,side*1.1,2.02,1.72,shell,.04);
  box(.025,.06,.2,rubber,side*.96,1.53,.79);
 }
 // Angled split windscreen and cab-side glass.
 const wind=box(1.7,.78,.08,rubber,0,2.04,1.86,shell,.04);wind.rotation.x=-.21;
 const pane=box(1.55,.64,.085,glass,0,2.055,1.905,shell,.035);pane.rotation.x=-.21;
 const pillar=box(.045,.77,.09,metal,0,2.045,1.93);pillar.rotation.x=-.21;
 for(const side of [-1,1]){
  const post=box(.07,.92,.07,yellow,side*.86,2.02,1.86);post.rotation.x=-.21;
  box(.045,.67,.8,glass,side*.932,2.02,1.35,shell,.035);
  rod([side*.55,1.7,1.99],[side*.23,2.03,1.99],.016,rubber);
 }
 box(1.68,.73,.08,rubber,0,2,-2.13,shell,.04);box(1.52,.59,.09,glass,0,2.02,-2.17,shell,.03);
 box(1.2,.32,.045,rubber,0,.91,2.16,shell,.025);
 for(let y=.8;y<=1.06;y+=.075)box(1.15,.025,.055,metal,0,y,2.19);
 for(const side of [-1,1]){
  box(.33,.29,.09,rubber,side*.71,1.03,2.14,shell,.025);
  box(.26,.22,.1,'#eee7c8',side*.71,1.04,2.2,shell,.03);
  box(.16,.15,.09,'#d4842c',side*.76,.72,2.18,shell,.025);
  box(.19,.34,.08,'#ae4434',side*.73,.99,-2.19,shell,.025);
 }
 for(const z of [-2.24,2.24])box(1.96,.2,.15,rubber,0,.52,z,shell,.045);
 box(.4,.13,.02,'#e8dfb9',0,.6,2.33);
 // Passenger door is a separate sliding assembly; it opens only while stopped.
 const door=new T.Group();door.name='danfo-passenger-door';door.position.set(1,0,.4);root.add(door);
 box(.06,.69,.85,yellow,0,1.17,0,door,.025);box(.065,.76,.85,rubber,0,1.99,0,door,.025);box(.07,.63,.73,glass,0,2,0,door,.025);
 box(.08,.105,.85,rubber,0,1.2,0,door);box(.08,.065,.85,rubber,0,1.04,0,door);box(.085,.05,.17,rubber,.01,1.52,.26,door);
 box(.32,.08,.85,metal,1.03,.47,.4);
 // Seat backs remain visible when the door slides open.
 for(const z of [-1.3,-.43,.6])for(const x of [-.43,.43]){box(.55,.12,.58,rubber,x,.95,z,shell,.05);box(.55,.61,.1,rubber,x,1.27,z-.25,shell,.05);}
 const steering=new T.Mesh(new T.TorusGeometry(.16,.025,6,16),material(rubber));steering.position.set(-.43,1.46,1.45);steering.rotation.x=-.5;shell.add(steering);
 batch(shell);batch(door);
 const wheels=[];
 for(const x of [-.97,.97])for(const z of [-1.34,1.33]){
  const wheel=new T.Group();wheel.position.set(x,.43,z);root.add(wheel);wheels.push(wheel);
  const tyre=cylinder(.41,.19,rubber,0,0,0,wheel,.41,20);tyre.rotation.z=Math.PI/2;
  const hub=cylinder(.22,.205,metal,0,0,0,wheel,.22,12);hub.rotation.z=Math.PI/2;
  for(let i=0;i<6;i++){const a=i*Math.PI/3,bolt=cylinder(.025,.215,rubber,0,Math.sin(a)*.13,Math.cos(a)*.13,wheel,.025,6);bolt.rotation.z=Math.PI/2;}
  batch(wheel);
 }
 let driver=null;
 root.userData.noCameraFade=true;root.traverse(m=>{m.userData.noCameraFade=true;if(m.isMesh)m.castShadow=false;});
 return {root,door,wheels,update(dt,status,active){
  door.position.z=['waiting','arrived'].includes(status)?-.7:.4;
  door.position.x=['waiting','arrived'].includes(status)?1.1:1;
  if(['dispatching','travelling'].includes(status))for(const wheel of wheels)wheel.rotation.x+=dt*5/.41;
  if(active&&!driver){driver=makeCharacter({sex:'male',skin:'#6b422c',hair:'fade',shirt:'#ac9164',bottom:'#303d40',accessory:'none'});driver.name='danfo-driver';driver.scale.setScalar(.72);driver.position.set(-.43,.75,1.15);root.add(driver);driver.traverse(m=>{if(m.isMesh)m.castShadow=false;m.userData.noCameraFade=true;});}
  if(driver&&active)animateActivity(driver,'sit',dt,0);
 }};
}
