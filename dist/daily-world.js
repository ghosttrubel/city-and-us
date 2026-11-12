import * as T from './vendor/three.module.js';
import {buildDanfo} from './danfo.js';
import {makeCharacter,disposeCharacter,animateCharacter} from './character.js';
import {RIDE_STOPS,ridePoint,courierPoint,activeRide,activeFood} from './daily-life.js';
import {streetGroundHeight} from './street.js';
export function createDailyWorld(city,vehicleTemplate,parcelTemplate,routes){
 const root=new T.Group();root.name='daily-fulfilment';city.add(root);const owned=[],markers=[];
 function label(text,colour){const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;const c=canvas.getContext('2d');c.fillStyle=colour;c.fillRect(0,0,256,64);c.fillStyle='#ffffff';c.font='bold 22px sans-serif';c.textAlign='center';c.fillText(text,128,41);const texture=new T.CanvasTexture(canvas),mat=new T.SpriteMaterial({map:texture,depthWrite:false});owned.push(texture,mat);const sprite=new T.Sprite(mat);sprite.scale.set(2.6,.65,1);return sprite;}
 for(const stop of Object.values(RIDE_STOPS)){const g=new T.Group(),geometry=new T.TorusGeometry(.48,.035,6,24),mat=new T.MeshBasicMaterial({color:'#e1b65e'}),ring=new T.Mesh(geometry,mat);owned.push(geometry,mat);ring.rotation.x=Math.PI/2;g.add(ring);const text=label(stop.name,'#315f50');text.position.y=1.1;g.add(text);g.position.set(stop.curb.x,.22,stop.curb.z);root.add(g);markers.push(g);}
 const car=new T.Group(),legacyCar=vehicleTemplate.clone(true),danfo=buildDanfo();car.add(legacyCar,danfo.root);car.name='booked-neighbourhood-ride';car.visible=false;root.add(car);const rideLabel=label('YOUR RIDE','#315f50');rideLabel.position.y=2.8;car.add(rideLabel);
 const deliveryLabel=label('FOOD DELIVERY','#875c35');deliveryLabel.position.y=2.8;let courier=null,courierAvatar=null,courierParcel=null,departing=0,talking=false;
 function removeCourier(){if(!courier)return;root.remove(courier);disposeCharacter(courierAvatar);courier=null;courierAvatar=null;}
 return {root,car,get courier(){return courier;},get actor(){return courierAvatar;},get package(){return courierParcel;},hold(value){talking=value;},depart(){departing=6;},update(s,dt,view,position){
  for(const marker of markers)marker.visible=view==='city'&&Math.hypot(marker.position.x-position.x,marker.position.z-position.z)<38;
  const isDanfo=s.daily.ride?.service==='danfo';legacyCar.visible=!isDanfo;danfo.root.visible=isDanfo;car.userData.service=isDanfo?'danfo':'neighbourhood';danfo.update(dt,s.daily.ride?.status,isDanfo&&activeRide(s)&&view==='city');
  const r=ridePoint(s);car.visible=!!r&&view==='city'&&Math.hypot(r.x-position.x,r.z-position.z)<65;if(r){car.position.set(r.x,streetGroundHeight(r.x,r.z),r.z);car.rotation.y=r.heading;}
  const p=courierPoint(s,routes);if(p&&s.daily.order.status==='arrived'){p.x+=.85;p.z+=.35;}if(p&&!courier){courier=new T.Group();courier.name='food-delivery-courier';courierAvatar=makeCharacter({sex:'male',characterStyle:'natural',hair:'fade',accessory:'none',outfit:'streetwear',shirt:'#b77c48',bottom:'#34463f'});courier.add(courierAvatar);const parcel=parcelTemplate.clone(true);courierParcel=parcel;parcel.visible=true;parcel.scale.setScalar(.7);parcel.position.set(0,1.25,.4);courier.add(parcel);courier.add(deliveryLabel);root.add(courier);}
  if(!activeFood(s)){if(departing>0&&courier){if(!talking)departing-=dt;courierParcel.visible=false;courier.visible=view==='city';animateCharacter(courierAvatar,dt,false);}else removeCourier();}if(p&&courier){courier.position.set(p.x,streetGroundHeight(p.x,p.z),p.z);courier.rotation.y=p.heading;courier.visible=view==='city'&&Math.hypot(p.x-position.x,p.z-position.z)<48;if(courier.visible)animateCharacter(courierAvatar,dt,s.daily.order.status!=='arrived');}
 },dispose(){removeCourier();const driver=danfo.root.getObjectByName('danfo-driver');if(driver)disposeCharacter(driver);root.removeFromParent();for(const resource of owned)resource.dispose();}};
}
