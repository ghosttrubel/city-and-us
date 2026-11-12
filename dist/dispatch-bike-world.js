import * as T from './vendor/three.module.js';
import {placeMeshKit} from './place-mesh-kit.js';
import {animateActivity} from './activity-pose.js';
import {aimHand} from './home-motion.js';
import {streetGroundHeight} from './street.js';
export function createDispatchBike(city){
 const root=new T.Group();root.name='dispatch-work-bike';city.add(root);const k=placeMeshKit(root),{box,cylinder,oval,rod,batch}=k,red='#b91d27',black='#242a30',metal='#879498';
 // Top-left red motorcycle with cargo box from Delivery_And_Dispatch_Rides.png.
 for(const side of [-1,1]){rod([side*.16,.52,-.6],[side*.22,.92,.3],.045,black);rod([side*.22,.92,.3],[side*.18,.6,.75],.045,black);}
 box(.42,.4,.48,metal,0,.63,.08,root,.05);for(let y=.47;y<.84;y+=.07)box(.45,.024,.5,black,0,y,.08);
 oval(0,1.03,.28,.27,.24,.38,red);box(.44,.15,.8,black,0,1.02,-.35,root,.07);
 for(const side of [-1,1]){rod([side*.2,.5,-.85],[side*.2,.94,-.4],.045,metal);rod([side*.18,.41,.94],[side*.18,1.27,.6],.035,metal);rod([side*.2,1.3,.58],[side*.37,1.48,.43],.035,black);rod([side*.35,1.48,.43],[side*.43,1.69,.67],.015,black);oval(side*.43,1.72,.67,.1,.065,.035,black);}
 box(.33,.35,.14,red,0,1.19,.83,root,.06);box(.23,.25,.035,'#eee9d2',0,1.2,.92,root,.04);
 for(const x of [-.23,.23])oval(x,1.08,.88,.055,.045,.04,'#db9435');
 box(.16,.13,.05,'#a52c2c',0,.8,-1.15);rod([-.23,.5,-1],[.23,.5,-1],.035,black);
 const pipe=cylinder(.06,.7,metal,.28,.49,-.47);pipe.rotation.x=Math.PI/2;
 const mudguard=box(.33,.1,.65,red,0,.78,.9,root,.05);mudguard.rotation.x=.07;
 box(.6,.055,.58,metal,0,1.08,-.87);box(.73,.67,.65,red,0,1.48,-.86,root,.04);
 for(const x of [-.37,.37])for(const z of [-1.19,-.53])box(.035,.65,.035,black,x,1.48,z);
 box(.77,.045,.69,black,0,1.79,-.86);box(.08,.18,.025,metal,0,1.64,-.515);
 rod([-.15,.6,-.17],[-.3,.17,-.32],.025,black);
 batch(root);const wheels=[];
 for(const z of [-.84,.9]){const wheel=new T.Group();wheel.position.set(0,.38,z);root.add(wheel);wheels.push(wheel);const tyre=cylinder(.36,.18,black,0,0,0,wheel,.36,20);tyre.rotation.z=Math.PI/2;const hub=cylinder(.24,.19,metal,0,0,0,wheel,.24,14);hub.rotation.z=Math.PI/2;for(let i=0;i<6;i++){const a=i*Math.PI/3;rod([0,0,0],[0,Math.sin(a)*.28,Math.cos(a)*.28],.018,black,wheel);}batch(wheel);}
 root.traverse(m=>{m.userData.noCameraFade=true;if(m.isMesh)m.castShadow=false;});
 return {root,update(s,dt,view,player){const b=s.dispatchBike;root.visible=view==='city';root.position.set(b.x,streetGroundHeight(b.x,b.z),b.z);root.rotation.y=b.heading;for(const w of wheels)w.rotation.x+=b.speed*dt/.36;if(b.mode==='mounted'&&view==='city'){player.position.set(b.x,root.position.y+.57,b.z);player.rotation.set(0,b.heading,0);player.visible=true;animateActivity(player,'sit',dt,0);root.updateMatrixWorld(true);for(const [side,x] of [['l',.37],['r',-.37]])aimHand(player,side,root.localToWorld(new T.Vector3(x,1.48,.43)));}},wheels};
}
