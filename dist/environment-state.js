import {migratePhone,validPhone} from './phone-personal.js';
import {validPhoneAppearance} from './phone-wallpaper.js';
// Extends the existing day/minute clock. Never advances offline wall time.
export const CROWD_LIMIT={battery:2,phone:4,balanced:6};
export function migrateEnvironment(s,data){s.phoneAppearance={wallpaper:data?.phoneAppearance?.wallpaper||'lagoon'};migratePhone(s,data);s.weather=data?.weather?structuredClone(data.weather):{kind:'clear',mode:'auto',nextAt:s.day*1440+s.time+180,seed:7321};s.effects={rain:'light',ambience:.25,...data?.effects};s.dialogue={volume:.8,muted:false,subtitles:true,textOnly:false,...data?.dialogue};}
export function validEnvironment(s){const w=s.weather,d=s.dialogue,e=s.effects;return validPhone(s)&&validPhoneAppearance(s.phoneAppearance)&&(w===undefined||w&&['clear','rain'].includes(w.kind)&&['auto','clear','rain'].includes(w.mode)&&Number.isFinite(w.nextAt)&&w.nextAt>=0&&Number.isSafeInteger(w.seed)&&w.seed>=0&&w.seed<=4294967295)&&(e===undefined||e&&['off','light','full'].includes(e.rain)&&Number.isFinite(e.ambience)&&e.ambience>=0&&e.ambience<=1)&&(d===undefined||d&&Number.isFinite(d.volume)&&d.volume>=0&&d.volume<=1&&['muted','subtitles','textOnly'].every(k=>typeof d[k]==='boolean'));}
export function advanceWeather(s){if(!s.weather)return;const w=s.weather,now=s.day*1440+s.time;if(w.mode!=='auto'){w.kind=w.mode;w.nextAt=now+180;return;}let iterations=0;while(now>=w.nextAt&&iterations++<128){w.seed=(Math.imul(w.seed,1664525)+1013904223)>>>0;w.kind=w.seed%4===0?'rain':'clear';w.nextAt+=120+w.seed%180;}if(now>=w.nextAt)w.nextAt=now+180;}
export const LIGHT_KEYS=[
 {at:0,name:'Night',sky:'#172939',sun:'#9db9db',power:.28,ambient:.68,lamps:1},
 {at:300,name:'Morning',sky:'#263c50',sun:'#dc9a7b',power:.5,ambient:.8,lamps:1},
 {at:420,name:'Morning',sky:'#d1b493',sun:'#ffd29a',power:2.2,ambient:1.35,lamps:0},
 {at:720,name:'Afternoon',sky:'#91b7bb',sun:'#fff1d4',power:3.2,ambient:1.7,lamps:0},
 {at:1020,name:'Evening',sky:'#c59782',sun:'#ffb26d',power:2,ambient:1.25,lamps:0},
 {at:1140,name:'Evening',sky:'#45455d',sun:'#d29daa',power:.5,ambient:.8,lamps:1},
 {at:1260,name:'Night',sky:'#172939',sun:'#9db9db',power:.28,ambient:.68,lamps:1},
 {at:1440,name:'Night',sky:'#172939',sun:'#9db9db',power:.28,ambient:.68,lamps:1}
];
export function lightPhase(time){const t=((time%1440)+1440)%1440;let i=0;while(i<LIGHT_KEYS.length-2&&t>=LIGHT_KEYS[i+1].at)i++;const a=LIGHT_KEYS[i],b=LIGHT_KEYS[i+1],f=(t-a.at)/(b.at-a.at);return {a,b,f:f*f*(3-2*f),name:t<360||t>=1200?'Night':t<720?'Morning':t<1020?'Afternoon':'Evening'};}
