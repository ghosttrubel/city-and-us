// Original procedural collection; no downloaded assets or paid purchases.
export const FURNITURE_CATEGORIES=['Tables','Storage','Lighting','Decor'];
export const FURNITURE_ITEMS=[
 {id:'round-table',name:'Oro side table',category:'Tables',price:600,w:.55,d:.55,h:.55,detail:'Round walnut top · brass foot'},
 {id:'coffee-table',name:'Sunday coffee table',category:'Tables',price:1200,w:1.05,d:.55,h:.42,detail:'Rounded oak top · lower shelf'},
 {id:'bookcase',name:'Bode bookcase',category:'Storage',price:1900,w:.85,d:.35,h:1.55,detail:'Open shelves · books and ceramics'},
 {id:'cabinet',name:'Palm woven cabinet',category:'Storage',price:1600,w:.9,d:.4,h:.75,detail:'Woven doors · raised timber legs'},
 {id:'floor-lamp',name:'Evening floor lamp',category:'Lighting',price:850,w:.38,d:.38,h:1.65,detail:'Warm linen shade · brass stem'},
 {id:'plant',name:'Courtyard palm',category:'Decor',price:500,w:.48,d:.48,h:1.25,detail:'Terracotta pot · sculpted foliage'},
 {id:'rug',name:'Market stripe rug',category:'Decor',price:750,w:1.4,d:.9,h:.012,flat:true,detail:'Woven cream, clay and forest stripes'},
 {id:'runner',name:'Indigo runner',category:'Decor',price:650,w:.65,d:1.7,h:.012,flat:true,detail:'Narrow woven runner · indigo border'}
].map(item=>Object.freeze({...item,license:'Original project geometry'}));
export const FURNITURE=Object.freeze(Object.assign(Object.create(null),Object.fromEntries(FURNITURE_ITEMS.map(i=>[i.id,i]))));
