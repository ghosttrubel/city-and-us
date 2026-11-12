import * as T from './vendor/three.module.js';
import {placeMeshKit} from './place-mesh-kit.js';
// Retained footprints and door coordinates; references are single-view design guides.
export function buildPlaceFacade(kind,w,d,h){
 const root=new T.Group();root.name=kind+'-reference-facade';const k=placeMeshKit(root),{box,cylinder,oval,label,batch}=k;
 const shop=kind==='shop',paint=shop?'#315e45':'#d8a422',ink='#303b40',cream='#ece4d1',front=d/2;
 const height=shop?3.05:3.35,jamb=(w-1.45)/2;
 for(const side of [-1,1])box(jamb,height,d,paint,side*(w+1.45)/4,height/2,0);
 box(1.45,height-2.65,d,paint,0,(height+2.65)/2,0);box(1.45,2.65,d-.75,paint,0,1.325,-.375);
 box(w+.18,.2,d+.18,cream,0,height+.05,0);
 for(const side of [-1,1]){box((w-1.45)/2,.18,.5,cream,side*(w+1.45)/4,.09,front+.12);box(.17,2.65,.2,paint,side*.82,1.35,front+.1);}
 if(shop){
  box(w,.4,.2,paint,0,2.88,front+.08);
  for(const side of [-1,1]){
   box(.95,1.85,.07,'#243d32',side*1.42,1.25,front+.055);
   for(let row=0;row<4;row++){box(.86,.035,.12,cream,side*1.42,.55+row*.43,front+.12);for(let i=0;i<4;i++)box(.15,.25,.08,['#d7aa39','#b95636','#497947','#4b82a3'][i],side*1.42-.3+i*.2,.7+row*.43,front+.15);}
   box(.8,.43,.55,'#b38a55',side*1.47,.36,front+.12);for(let i=0;i<6;i++)oval(side*1.47+(i%3-1)*.21,.63,front+.1+(Math.floor(i/3)-.5)*.2,.095,.09,.08,side<0?'#cfb03c':'#649342');
  }
  const awning=box(w+.28,.085,.8,'#386a4d',0,2.6,front+.3);awning.rotation.x=.12;
  for(let x=-w/2;x<w/2;x+=.14)box(.035,.045,.8,'#527a58',x,2.65,front+.3);
  label('PROVISIONS',0,2.96,front+.2,3,.32,paint);
 }else{
  // Low terminal wings and a raised ticket-office centre, yellow / charcoal.
  box(w+.34,.24,d+.25,ink,0,3.5,0);
  box(w*.56,1.9,d*.78,paint,-w*.18,4.42,-d*.08);
  box(w*.58,.22,d*.8,ink,-w*.18,5.43,-d*.08);
  box(w*.56,.1,d*.78,paint,-w*.18,5.59,-d*.08);
  box(w*.49,.89,.08,'#33505a',-w*.18,4.55,d*.31+.05);
  for(let x=-w*.4;x<w*.08;x+=.55)box(.045,.91,.11,ink,x,4.55,d*.31+.09);
  for(const side of [-1,1]){
   box(2.4,2.1,.08,'#33505a',side*2.4,1.4,front+.06);
   for(let dx=-.9;dx<=1;dx+=.6)box(.055,2.12,.12,ink,side*2.4+dx,1.4,front+.12);
   box(2.4,.07,.13,ink,side*2.4,1.5,front+.12);
   // Upper glazing belongs only to the raised office, keeping the wings low.
   box(.2,3.4,.24,paint,side*(w/2-.1),1.8,front+.12);
  }
  box(w+.45,.2,1.08,ink,0,2.94,front+.34);
  label('DISPATCH & LOCAL RIDES',0,3.33,front+.15,6.6,.42,ink);
 }
 batch(root);return root;
}
