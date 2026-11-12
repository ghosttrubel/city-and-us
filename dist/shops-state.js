import {FASHION} from './fashion-catalogue.js';
import {purchaseFashion,equipFashion} from './wardrobe-state.js';
export const SERVICE_POINT={x:2.5,z:-1.55};
export function salonQuote(state,id){const item=FASHION[id];if(!item||item.category!=='Hair')return null;return {id,price:state.wardrobe.owned.includes(id)?0:item.price,name:item.name};}
export function completeSalon(state,quote,location,position){
 if(location!=='hair-salon'||Math.hypot(position.x-SERVICE_POINT.x,position.z-SERVICE_POINT.z)>1.3)return {ok:false,message:'Return to the stylist. No payment taken.'};
 const current=salonQuote(state,quote?.id);if(!current||current.price!==quote.price)return {ok:false,message:'Please review the current service price.'};
 const result=purchaseFashion(state,current.id);if(!result.ok)return result;
 equipFashion(state,current.id);return {ok:true,message:current.name+' is finished. '+(result.charged?'Paid NGN '+result.charged+'.':'Your owned style was applied free.')+' Check your look in the mirror.'};
}
