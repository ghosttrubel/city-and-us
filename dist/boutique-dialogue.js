const memories=new WeakMap();
const money=n=>'₦'+n.toLocaleString('en-NG');
// Conversation memory lives with this loaded story, never in another save slot.
// Ownership, balance and prices are read live; dialogue does not transact.
export function boutiqueConversation(state){
 if(memories.has(state))return memories.get(state);
 let stage='greeting',item=null,category='Hair',role='attendant',turn=0,reason='';
 const api={event(next,selected=null,detail=''){stage=next;if(selected)item=selected;else if(next==='browsing')item=null;reason=detail;turn++;},category(value){category=value;},role(value){role=value;},get item(){return item;},get stage(){return stage;},line(){
 const hair=(item?.category||category)==='Hair',name=role==='stylist'?'Stylist':'Shop attendant',owned=item&&state.wardrobe.owned.includes(item.id),equipped=item&&state.wardrobe.equipped[item.slot]===item.id;
 let text;
 if(stage==='greeting')text=role==='stylist'?'I’m helping this client. You can preview our hairstyles and check the price here.':hair?'Good afternoon. Which hairstyle would you like to try? You can check the look before you pay.':'Welcome. Take your time; select something and we can check the fit.';
 else if(stage==='browsing'||!item)text=hair?'Take your time with the styles. Choose one and I’ll tell you the price.':'Have a look through the collection. The fitting area is ready when you are.';
 else if(stage==='cancelled')text='No wahala. Your previous look is back. We have not charged you for that preview.';
 else if(stage==='unavailable')text=reason||'That option is not available here.';
 else if(stage==='equipped')text=equipped?(hair?item.name+' is applied. You can check it in the mirror.':item.name+' is on. Check the standing and seated views before choosing another item.'):'Your saved look is ready. Choose another item when you like.';
 else if(stage==='purchased')text=owned?item.name+' is paid for and in your collection. Select Equip when you are ready; buying it has not changed your look.':'Please select the item again to check availability.';
 else if(stage==='confirm'||stage==='funds')text=owned?'You already own '+item.name+'. No need to pay again.':state.money<item.price?'This '+(hair?'style':'item')+' is '+money(item.price)+'. You have '+money(state.money)+'; you need '+money(item.price-state.money)+' more. No money has been taken.':item.name+' costs '+money(item.price)+'. Shall we go ahead? You will have '+money(state.money-item.price)+' left. It stays in your collection; equip it after purchase.';
 else if(owned)text=equipped?'You are already wearing '+item.name+'. We can look at another option.':'You already own '+item.name+'. You can equip it without paying again.';
 else text=(turn%2?'Let’s check ':'You selected ')+item.name+'. '+(hair?'The listed style is ':'The price is ')+money(item.price)+'. This is a preview; your saved look has not changed.';
 return {speaker:name,text};
 }};memories.set(state,api);return api;
}
