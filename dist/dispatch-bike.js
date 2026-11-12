import {BIKE_RACK} from './street-layout-state.js';
import {rideActive,createRoadVehicle,validRoadVehicle,enterRoadVehicle,exitRoadVehicle,stepRoadVehicle,roadClear,vehicleBox,vehicleObstacles} from './road-vehicles.js';
export function migrateBike(s,data){
 s.dispatchBike=data?.dispatchBike?structuredClone(data.dispatchBike):{...createRoadVehicle('dispatch-bike','bike',BIKE_RACK,{type:'permission',active:true,grantedTo:s.localPlayerId,job:'parcel'}),deliveryId:0};
 Object.assign(s.dispatchBike,{id:'dispatch-bike',profile:'bike',speed:0});
 s.dispatchBike.access??={type:'permission',active:true,grantedTo:s.localPlayerId,job:'parcel'};return s;
}
export const bikeMounted=s=>s.dispatchBike?.mode==='mounted';
export function validBike(s){const b=s.dispatchBike;if(b===undefined)return true;const copy={...b,profile:'bike',access:b.access||{type:'permission',active:true}};return validRoadVehicle(copy)&&Number.isInteger(b.deliveryId)&&b.deliveryId>=0&&b.deliveryId<=s.deliverySerial&&(b.mode!=='mounted'||s.location==='city'&&!rideActive(s)&&b.deliveryId===s.delivery?.id);}
export const mountBike=(s,location,p,obstacles=[])=>enterRoadVehicle(s,s.dispatchBike,location,p,obstacles);
export const dismountBike=(s,obstacles)=>exitRoadVehicle(s,s.dispatchBike,obstacles);
export const stepBike=(s,input,dt,obstacles)=>stepRoadVehicle(s,s.dispatchBike,input,dt,vehicleObstacles(s,obstacles,s.dispatchBike));
export const bikeClear=(x,z,heading,obstacles)=>roadClear({profile:'bike'},x,z,heading,obstacles);
export const bikeObstacle=s=>s.dispatchBike?.mode==='parked'?[vehicleBox(s.dispatchBike)]:[];
