// Local threshold coordinates keep the two scenes continuous. The scene switch
// happens at the door plane while the avatar is walking, under a brief cover.
export function doorwaySequence(entrance,from,entering){
 const doorZ=entrance.z+.03,approach={x:entering?entrance.x:0,z:entering?doorZ+.9:3.4};
 const approachTime=Math.max(.2,Math.hypot(from.x-approach.x,from.z-approach.z)/2.3),openTime=.3,crossTime=.9,closeTime=.24;
 const duration=approachTime+openTime+crossTime+closeTime,heading=entering?Math.PI:0;
 function sample(elapsed){const time=Math.max(0,Math.min(duration,elapsed));let x,z,yaw=heading,moving=false,phase,door=0,switched=false,cover=0;
  if(time<approachTime){const p=time/approachTime;x=from.x+(approach.x-from.x)*p;z=from.z+(approach.z-from.z)*p;const dx=approach.x-from.x,dz=approach.z-from.z;yaw=Math.hypot(dx,dz)>.01?Math.atan2(dx,dz):heading;moving=true;phase='approach';}
  else if(time<approachTime+openTime){x=approach.x;z=approach.z;door=(time-approachTime)/openTime;phase='open';}
  else {const p=Math.min(1,(time-approachTime-openTime)/crossTime);switched=p>=.5;door=1;moving=p<1;phase=p<1?'cross':'close';
   // Ease only the cover, never stop the character at the loading point.
   cover=Math.max(0,Math.min(1,1.65-Math.abs(p-.5)/.1));
   x=switched?(entering?0:entrance.x):approach.x;
   z=entering?(switched?4.3-(p-.5)*2*.95:doorZ+.9*(1-p*2)):(switched?doorZ+(p-.5)*2*(entrance.outside.z-doorZ):3.4+p*2*.9);
   if(p===1)door=Math.max(0,1-(time-approachTime-openTime-crossTime)/closeTime);
  }
  return {x,z,heading:yaw,doorAngle:-door*Math.PI*.52,moving,switched,cover,phase,done:time>=duration};
 }
 return {sample,duration,approachTime,switchTime:approachTime+openTime+crossTime/2};
}
