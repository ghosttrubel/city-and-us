// Original City & Us starter collection. Prices are game currency only.
export const FASHION_CATEGORIES=['Hair','Full Outfits','Tops','Bottoms','Dresses','Native Wear','Shoes','Accessories'];
const item=(id,name,category,slot,price,model,detail,extra={})=>Object.freeze({id,name,category,slot,price,model,detail,license:'Original project geometry / retained CC0 base',...extra});
export const FASHION_ITEMS=[
 item('hair-braids','Beaded long braids','Hair','hair',0,'braids','Long individual braids with gold cuffs.'),
 item('hair-locs','Shoulder locs','Hair','hair',0,'locs','Thicker, softly curved locs.'),
 item('hair-afro','Rounded afro','Hair','hair',0,'afro','Full rounded textured crown.'),
 item('hair-fade','Close crop','Hair','hair',0,'fade','Fitted Quaternius CC0 short cut.'),
 item('hair-bob','Soft bob wig','Hair','hair',0,'bob','Shaped jaw-length CC0 hair adaptation.'),
 item('hair-bun','Twin updo','Hair','hair',0,'bun','Quaternius CC0 gathered twin buns.'),
 item('hair-cornrows','Swept cornrows','Hair','hair',850,'cornrows','Raised scalp-following rows and a nape finish.'),
 item('hair-puff','High puff','Hair','hair',900,'puff','Sculpted high afro puff with a gathered base.'),
 item('hair-crown','Twist crown','Hair','hair',1100,'crown','Wrapped twists gathered into a high updo.'),
 item('hair-wig','Long sweep wig','Hair','hair',1300,'wig','Shoulder-length adaptation of the retained CC0 hair.'),
 item('hair-pixie','Textured pixie','Hair','hair',700,'pixie','Short sculpted crop with a swept raised fringe.'),
 item('hair-bald','Clean shaven','Hair','hair',0,'bald','No hair geometry; preserved bald option.',{geometry:false}),
 item('outfit-casual','Everyday essentials','Full Outfits','full',0,'casual','Tee, slim trousers and your selected footwear.',{bundle:true,top:'tee',bottom:'slim',outfit:'streetwear'}),
 item('outfit-f-crop-joggers','Cropped tee & joggers','Full Outfits','full',0,'ref-crop','Short fitted tee, raised waist and roomy cuffed legs.',{bundle:true,sex:'female',top:'ref-crop',bottom:'ref-joggers',outfit:'streetwear',reviewBatch:1}),
 item('outfit-f-square-denim','Square neck & wide jeans','Full Outfits','full',0,'ref-square','Square neckline, long sleeves and open wide-leg hems.',{bundle:true,sex:'female',top:'ref-square',bottom:'ref-wide',outfit:'streetwear',reviewBatch:1}),
 item('outfit-m-relaxed-denim','Relaxed tee & baggy jeans','Full Outfits','full',0,'ref-relaxed','Longer roomy tee, wider sleeves and loose straight legs.',{bundle:true,sex:'male',top:'ref-relaxed',bottom:'ref-baggy',outfit:'streetwear',reviewBatch:1}),
 item('outfit-m-camp-cargo','Camp shirt & cargo shorts','Full Outfits','full',0,'ref-camp','Open collar, placket, chest pocket and knee-length cargo shorts.',{bundle:true,sex:'male',top:'ref-camp',bottom:'ref-cargo',outfit:'streetwear',reviewBatch:1}),
 item('outfit-varsity','Weekend varsity','Full Outfits','full',0,'varsity','Long-sleeved jacket with zip and pocket seams.',{bundle:true,top:'varsity',bottom:'slim',outfit:'jacket'}),
 item('outfit-track','Track club set','Full Outfits','full',1900,'tracksuit','Raised zip collar, panelled sport jacket and cuffed joggers.',{bundle:true,top:'track',bottom:'joggers',outfit:'jacket',colour:'#506e65'}),
 item('top-tee','Soft cotton tee','Tops','top',0,'tee','Short sleeves and a clean bound neckline.'),
 item('top-blazer','Workday blazer','Tops','top',1450,'blazer','Structured shoulders and folded lapels.',{colour:'#45566c'}),
 item('top-wrap','Wrap blouse','Tops','top',1100,'wrap','Roomier sleeves, crossing front and tied waist.',{colour:'#bf856c'}),
 item('bottom-slim','Everyday trousers','Bottoms','bottom',0,'slim','Fitted full-length trousers.'),
 item('bottom-wide','Wide-leg trousers','Bottoms','bottom',1250,'wide','A wider leg silhouette with a full-length hem.',{colour:'#786753'}),
 item('bottom-shorts','Court shorts','Bottoms','bottom',650,'shorts','Above-knee sport cut with a waistband.',{colour:'#425d60'}),
 item('dress-day','Pleated day dress','Dresses','dress',0,'day','Knee-length pleated skirt and fitted bodice.',{colour:'#708775'}),
 item('dress-evening','Evening column','Dresses','dress',2300,'evening','Long flared evening skirt and boat neckline.',{colour:'#58436b'}),
 item('native-ankara','Ankara celebration','Native Wear','full',1800,'ankara','Original geometric print on a flared midi silhouette.',{top:'wrap',bottom:'slim',skirt:'ankara',outfit:'dress',pattern:true,colour:'#bb7545'}),
 item('native-agbada','Agbada occasion set','Native Wear','full',2500,'agbada','Broad draped sleeves and an embroidered outer robe.',{top:'agbada',bottom:'slim',skirt:'agbada',outfit:'native',colour:'#d3c7aa'}),
 item('native-senator','Senator tailored set','Native Wear','full',1650,'senator','Long tailored tunic, narrow collar and straight trousers.',{top:'senator',bottom:'slim',skirt:'senator',outfit:'native',colour:'#49666a'}),
 item('native-iro','Iro & buba','Native Wear','full',1950,'iro','Loose buba and a straight wrap-style skirt.',{top:'buba',bottom:'slim',skirt:'iro',outfit:'dress',pattern:true,colour:'#94675c'}),
 item('shoe-trainers','Everyday trainers','Shoes','shoes',0,'trainers','Rounded trainers with soles and laces.'),
 item('shoe-boots','City ankle boots','Shoes','shoes',1100,'boots','Higher ankle shafts, robust soles and back tabs.',{colour:'#584737'}),
 item('shoe-loafers','Penny loafers','Shoes','shoes',850,'loafers','Low-profile vamp, raised apron and broad penny strap.',{colour:'#533e35'}),
 item('accessory-hoops','Gold hoops','Accessories','accessory',0,'earrings','Rigid hoops attached to the animated head.'),
 item('accessory-glasses','Round frames','Accessories','accessory',0,'glasses','Round frames with bridge and temples.'),
 item('accessory-chain','Fine chain','Accessories','accessory',0,'chain','Neck chain fitted to the upper body.'),
 item('headwrap-gele','Pleated gele','Accessories','headwear',950,'gele','Original folded fan headwrap; hair is tucked beneath.',{colour:'#be8959'}),
 item('cap-fila','Tilted fila','Accessories','headwear',700,'fila','Shaped cap with a tilted crown and woven band.',{colour:'#627b64'})
];
export const FASHION=Object.freeze(Object.assign(Object.create(null),Object.fromEntries(FASHION_ITEMS.map(x=>[x.id,x]))));
export const FASHION_SLOTS=['hair','full','top','bottom','dress','shoes','accessory','headwear'];
export const LOOK_FIELDS=['shirt','hair','hairColor','outfit','bottom','shoes','accessory'];
export function resolvedFashion(input){
 const a={...input},eq=input.wardrobe?.equipped||{},full=FASHION[eq.full],top=FASHION[eq.top],bottom=FASHION[eq.bottom],dress=FASHION[eq.dress];
 if(FASHION[eq.hair])a.hair=FASHION[eq.hair].model;
 if(full){a.outfit=full.outfit||'streetwear';a.topModel=full.top;a.bottomModel=full.bottom;a.skirtModel=full.skirt;a.print=!!full.pattern;}
 if(top){a.topModel=top.model;a.outfit=['varsity','blazer','track','senator'].includes(top.model)?'jacket':'streetwear';}
 if(bottom){a.bottomModel=bottom.model;if(!full&&!top&&!dress){a.outfit='streetwear';a.topModel='tee';}}
 if(dress){a.outfit='dress';a.topModel='dress';a.bottomModel='slim';a.skirtModel=dress.model;}
 if(FASHION[eq.shoes])a.shoeModel=FASHION[eq.shoes].model;
 if(FASHION[eq.accessory])a.accessory=FASHION[eq.accessory].model;
 if(FASHION[eq.headwear]){a.headwear=FASHION[eq.headwear].model;a.headwearColour=FASHION[eq.headwear].colour;a.hair='bald';}
 return a;
}
