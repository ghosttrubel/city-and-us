import * as T from './vendor/three.module.js';
import {placeMeshKit} from './place-mesh-kit.js';
import {streetGroundHeight} from './street.js';
// Green five-door hatchback: lower centre of owner's Everyday_Cars.png.
// Low-poly authored geometry; the reference PNG is never treated as a model.
export function createRoadVehicleWorld(city){
 const models=new Map();
 function make(v){const root=new T.Group();root.name='road-vehicle-'+v.id;city.add(root);const {box,cylinder,rod,batch}=placeMeshKit(root),green='#197a40',dark='#202d30',glass='#465c61';
 box(1.72,.65,3.7,green,0,.72,0,root,.19);box(1.56,.24,1.05,green,0,1.05,1.22,root,.1);
 // Sloping windscreen, short bonnet, tall hatch, five-door window divisions.
 box(1.42,.65,1.84,glass,0,1.36,-.3,root,.16);box(1.48,.12,1.65,green,0,1.72,-.4,root,.08);
 const wind=box(1.38,.72,.06,glass,0,1.35,.63,root,.04);wind.rotation.x=-.36;
 for(const x of [-.75,.75]){rod([x,1.02,.87],[x,1.7,.33],.045,green);rod([x,1.04,-1.3],[x,1.69,-1.12],.045,green);box(.045,.64,.06,dark,x,1.35,-.33);box(.05,.05,2,green,x,1.02,-.22);box(.12,.18,.28,green,x*1.15,1.18,.58,root,.05);for(const z of [.05,-.77])box(.035,.035,.17,dark,x*1.09,1.04,z);}
 box(1.28,.24,.06,dark,0,.58,1.88,root,.05);box(1.25,.06,.06,dark,0,.94,1.87);
 for(const x of [-.61,.61]){box(.43,.13,.08,'#e5ead9',x,.99,1.81,root,.04);box(.22,.23,.08,'#b22b31',x,1,-1.86,root,.04);}
 box(1.55,.11,.12,dark,0,.4,-1.83);batch(root);const wheels=[];
 for(const x of [-.86,.86])for(const z of [-1.18,1.23]){const wheel=new T.Group();root.add(wheel);wheel.position.set(x,.37,z);const tyre=cylinder(.35,.2,'#25292b',0,0,0,wheel,.35,16);tyre.rotation.z=Math.PI/2;const hub=cylinder(.23,.215,'#a7adb0',0,0,0,wheel,.23,12);hub.rotation.z=Math.PI/2;batch(wheel);wheels.push(wheel);}
 root.traverse(m=>{m.userData.noCameraFade=true;if(m.isMesh)m.castShadow=false;});return {root,wheels};}
 return {models,update(s,dt,view){for(const v of Object.values(s.roadVehicles.vehicles)){let m=models.get(v.id);if(!m){m=make(v);models.set(v.id,m);}m.root.visible=view==='city';m.root.position.set(v.x,streetGroundHeight(v.x,v.z),v.z);m.root.rotation.y=v.heading;for(const wheel of m.wheels)wheel.rotation.x+=v.speed*dt/.35;}}};
}
