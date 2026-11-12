// Walkable grid shared by the small map, city map and ground guidance.
// Every edge (including shortcuts and endpoint connectors) is collision checked.
import {blocked,STREET_BOUNDS,PLAYER_RADIUS,ENTRANCES,DESTINATIONS,BUILDINGS,KIOSKS,ROADS,WATER,CONNECTIONS} from './neighbourhood.js';
export function createNavigator(obstacles,bounds=STREET_BOUNDS,walkable=()=>true){
 const streets=bounds===STREET_BOUNDS,weights=new Map();
 function weight(p){if(!streets)return 1;const k=Math.round(p.x*2)+','+Math.round(p.z*2);if(weights.has(k))return weights.get(k);let cost=4.5;for(const r of ROADS){if(Math.abs(p.x-r.x)<=r.w/2+2.6&&Math.abs(p.z-r.z)<=r.d/2+2.6){cost=Math.min(cost,Math.abs(p.x-r.x)<=r.w/2&&Math.abs(p.z-r.z)<=r.d/2?1.35:1);}}weights.set(k,cost);return cost;}
 function travel(a,b){const length=Math.hypot(b.x-a.x,b.z-a.z),n=Math.max(1,Math.ceil(length/.5));let sum=0;for(let i=0;i<n;i++){const p=(i+.5)/n;sum+=weight({x:a.x+(b.x-a.x)*p,z:a.z+(b.z-a.z)*p});}return length*sum/n;}
 const cache=new Map(),key=(x,z)=>x+','+z;
 const clear=p=>walkable(p.x,p.z)&&!blocked(p.x,p.z,obstacles,bounds,PLAYER_RADIUS+.12);
 function segment(a,b){const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.18));for(let i=0;i<=n;i++)if(!clear({x:a.x+(b.x-a.x)*i/n,z:a.z+(b.z-a.z)*i/n}))return false;return true}
 function cell(x,z){const k=key(x,z);if(!cache.has(k))cache.set(k,clear({x,z}));return cache.get(k)}
 function anchor(p){let best=null,d=Infinity;for(let x=Math.round(p.x)-2;x<=Math.round(p.x)+2;x++)for(let z=Math.round(p.z)-2;z<=Math.round(p.z)+2;z++){const n=Math.hypot(x-p.x,z-p.z);if(n<d&&cell(x,z)&&segment(p,{x,z})){best={x,z};d=n}}return best}
 function route(start,end){
  if(!clear(start)||!clear(end))return [];if(!streets&&segment(start,end))return [{...start},{...end}];
  const a=anchor(start),b=anchor(end);if(!a||!b)return [];
  const heap=[],cost=new Map(),parents=new Map(),points=new Map(),closed=new Set();
  function push(v){heap.push(v);let i=heap.length-1;while(i){const p=(i-1)>>1;if(heap[p].f<=v.f)break;heap[i]=heap[p];i=p}heap[i]=v}
  function pop(){const first=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(last.f<=heap[c].f)break;heap[i]=heap[c];i=c}heap[i]=last}return first}
  const ak=key(a.x,a.z),bk=key(b.x,b.z);cost.set(ak,0);points.set(ak,a);push({...a,k:ak,f:0});
  while(heap.length){const p=pop();if(closed.has(p.k))continue;if(p.x===b.x&&p.z===b.z){const path=[end];let k=p.k;while(k){path.push(points.get(k));k=parents.get(k)}path.push(start);path.reverse();const total=[0];for(let n=1;n<path.length;n++)total.push(total[n-1]+travel(path[n-1],path[n]));const result=[path[0]];let i=0;while(i<path.length-1){let j=path.length-1;while(j>i+1&&((streets&&Math.abs(path[j].x-path[i].x)>.15&&Math.abs(path[j].z-path[i].z)>.15)||!segment(path[i],path[j])||travel(path[i],path[j])>(total[j]-total[i])*1.025))j--;result.push(path[j]);i=j}return result}
   closed.add(p.k);
   for(const [dx,dz] of (streets?[[1,0],[-1,0],[0,1],[0,-1]]:[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]])){const x=p.x+dx,z=p.z+dz,k=key(x,z)+(streets?','+dx+','+dz:'');if(closed.has(k)||!cell(x,z)||!segment(p,{x,z}))continue;const turn=streets&&p.dx!==undefined&&(p.dx!==dx||p.dz!==dz)?2:0;const g=cost.get(p.k)+travel(p,{x,z})+turn;if(g>=(cost.get(k)??Infinity))continue;cost.set(k,g);parents.set(k,p.k);points.set(k,{x,z});push({x,z,k,dx,dz,f:g+Math.hypot(b.x-x,b.z-z)})}
  }return [];
 }
 return {route,segment,clear};
}
export function routeLength(path){return path.slice(1).reduce((n,p,i)=>n+Math.hypot(p.x-path[i].x,p.z-path[i].z),0)}
export function navigationMarkup(position,facing,path=[],compact=true){
 const span=compact?40:240,cx=compact?position.x:80,cz=compact?position.z:-36;
 const rect=(b,cls,pad=0)=>`<rect x="${b.x-b.w/2-pad}" y="${b.z-b.d/2-pad}" width="${b.w+pad*2}" height="${b.d+pad*2}" rx=".5" class="${cls}"/>`;
 const near=b=>!compact||Math.abs(b.x-cx)<span/2+b.w/2&&Math.abs(b.z-cz)<span/2+b.d/2;
 const entries=Object.values(DESTINATIONS),symbols={home:'H',dispatch:'D',shop:'S',library:'L',hub:'C',arcade:'A',islandfood:'F',salon:'B','hair-salon':'T',showroom:'U','island-house':'H',club:'C',beach:'↟'};
 const doors=entries.filter(e=>!compact||Math.hypot(e.x-cx,e.z-cz)<span*.65).map(e=>`<g class="map-entrance"><circle cx="${e.outside.x}" cy="${e.outside.z}" r="${compact?.8:2.5}" class="map-door"/>${compact?'':`<text class="map-pin" x="${e.outside.x}" y="${e.outside.z+1.2}">${e.planned?'P':symbols[e.id]||'•'}</text>`}</g>`).join('');
 const roads=ROADS.filter(near);
 const route=path.length?`<polyline points="${path.map(p=>p.x+','+p.z).join(' ')}" class="map-route-casing"/><polyline points="${path.map(p=>p.x+','+p.z).join(' ')}" class="map-route"/><circle cx="${path.at(-1).x}" cy="${path.at(-1).z}" r="1.6" class="map-waypoint"/>`:'';
 const svg=`<svg class="neighbourhood-map ${compact?'mini-map':''}" viewBox="${cx-span/2} ${cz-span/2} ${span} ${span}" role="img" aria-label="${compact?'Nearby streets':'City street and building map'}. Green route follows streets to the entrance. Arrow shows your facing direction."><rect x="${cx-span/2}" y="${cz-span/2}" width="${span}" height="${span}" fill="#d4dfcb"/>${WATER.filter(near).map(w=>rect(w,'map-water')).join('')}${CONNECTIONS.filter(near).map(c=>rect(c,'map-link')).join('')}${roads.map(r=>rect(r,'map-pavement',2.5)).join('')}${roads.map(r=>rect(r,'map-road')).join('')}${roads.map(r=>`<path d="M${r.w>r.d?r.x-r.w/2:r.x} ${r.w>r.d?r.z:r.z-r.d/2} L${r.w>r.d?r.x+r.w/2:r.x} ${r.w>r.d?r.z:r.z+r.d/2}" class="map-lane"/>`).join('')}${[...BUILDINGS,...KIOSKS].filter(near).map(b=>rect(b,'map-building-shadow',.6)+rect(b,'map-building')+rect({...b,w:Math.max(.5,b.w-1),d:Math.max(.5,b.d-1)},'map-roof')).join('')}${compact?'': '<text class="map-district" x="-31" y="-103">YABA</text><text class="map-district" x="-31" y="35">SURULERE</text><text class="map-district" x="75" y="-42">VICTORIA ISLAND</text><text class="map-district" x="151" y="-42">AJAH / COAST</text>'}${route}${doors}<circle cx="${position.x}" cy="${position.z}" r="2.5" class="map-position-halo"/><g transform="translate(${position.x} ${position.z}) rotate(${-facing*180/Math.PI})"><path d="M0 2.4 L-1.5 -1.5 L0 -.7 L1.5 -1.5 Z" class="map-player"/></g></svg>`;
 return svg+(compact?'':'<p class="map-legend">H Home · D Dispatch · S Shop<br>L Library · C Career hub · A Arcade · F Food · B Boutique · T Hair Salon · U Furniture · P Planned (closed)</p>');
}

// Reuse the remaining route while on it; only search again after deviation.
// This keeps the minimap responsive without running A* on every walking step.
export function remainingRoute(path,position,nav){
 if(path.length<2)return [];let closest=Infinity,index=0;
 for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((position.x-a.x)*dx+(position.z-a.z)*dz)/(dx*dx+dz*dz||1))),d=Math.hypot(position.x-a.x-dx*t,position.z-a.z-dz*t);if(d<closest){closest=d;index=i;}}
 if(closest>1.2||!nav.segment(position,path[index]))return [];
 const tail=path.slice(index).map(p=>({...p}));if(tail.length>1&&Math.hypot(position.x-tail[0].x,position.z-tail[0].z)<.25)tail.shift();return [{x:position.x,z:position.z},...tail];
}
