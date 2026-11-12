import {activeRide,RIDE_STOPS,RIDE_SERVICES} from './daily-life.js';
export function provisionsLine(s,event='browse'){
 if(event==='purchased')return 'Shopkeeper: Paid, thank you. Three grocery portions are in your home pantry. Would you like anything else?';
 if(event==='full')return 'Shopkeeper: Your pantry is full. Use some groceries before another bag.';
 if(event==='funds')return 'Shopkeeper: This bag is ₦500. You have ₦'+s.money.toLocaleString()+'. Nothing has been charged.';
 if(s.delivery?.status==='carrying')return 'Shopkeeper: You have parcel #'+s.delivery.id+' for us. Hand it over at this counter before browsing.';
 if(s.delivery?.status==='return')return 'Shopkeeper: Your delivery has been paid. Remember to return home to finish your round. You can still shop here.';
 return 'Shopkeeper: Rice, beans and everyday supplies. A ₦500 bag adds three portions to your home pantry. Review the price before paying.';
}
export function transportLine(s){
 const r=s.daily.ride;
 if(activeRide(s)){
  const name=RIDE_SERVICES[r.service||'neighbourhood'].name;
  if(r.status==='dispatching')return 'Transport attendant: Your '+name+' is on its way to '+RIDE_STOPS[r.pickup].name+'. You have already paid; do not book again.';
  if(r.status==='waiting')return 'Transport attendant: Your '+name+' is waiting outside at '+RIDE_STOPS[r.pickup].name+'. Walk to the marker to board.';
  if(r.status==='travelling')return 'Transport attendant: You are on the way to '+RIDE_STOPS[r.dropoff].name+'. The fare is settled.';
  return 'Transport attendant: The vehicle has stopped at '+RIDE_STOPS[r.dropoff].name+'. Get out when you are ready.';
 }
 if(r?.status==='cancelled')return 'Transport attendant: Your last fare was refunded in full. Choose a route if you need another ride.';
 if(r?.status==='complete'||r?.status==='ended')return 'Transport attendant: Your last trip is finished. A new journey has its own fare.';
 return 'Transport attendant: The yellow danfo serves Home, Dispatch and Provisions. Choose two stops and review the fare; boarding is outside at the marked curb.';
}
