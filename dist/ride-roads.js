// Directed local street lanes, separate pickup lay-bys and the Provisions access road.
export const PICKUP_STOPS=Object.freeze({
 home:{name:'Home stop',entrance:'home',point:{x:4.1,z:14},curb:{x:6.9,z:14}},
 dispatch:{name:'Dispatch stop',entrance:'dispatch',point:{x:4.1,z:-32},curb:{x:6.9,z:-32}},
 shop:{name:'Provisions stop',entrance:'shop',point:{x:32,z:22.5},curb:{x:32,z:19.5}}
});
export const RIDE_START={x:1.8,z:-42};
// Preserve the agreed fares independently of the new road distances.
export const FARE_DISTANCE={home:14,dispatch:-18,shop:23};
const nodes=[[1.8,-42],[1.8,-35],[4.1,-32],[1.8,-29],[1.8,11],[4.1,14],[1.8,17],[1.8,22.5],[1.8,42],[-1.8,42],[-1.8,25.5],[-1.8,-42],[32,22.5],[40,22.5],[40,25.5]].map(([x,z])=>({x,z}));
const edges=[[0,1],[1,2],[2,3],[1,3],[3,4],[4,5],[5,6],[4,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,0],[7,12],[12,13],[13,14],[14,10]];
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function localRoadPath(from,to){
 let start=nodes.findIndex(n=>distance(n,from)<.01),end=nodes.findIndex(n=>distance(n,to)<.01);
 if(end<0)throw Error('Unknown local road destination');
 const points=[{x:from.x,z:from.z}],push=p=>{if(distance(points.at(-1),p)>.001)points.push({...p});};
 if(start<0){let best=Infinity;for(const [a,b] of edges){const p=nodes[a],q=nodes[b],dx=q.x-p.x,dz=q.z-p.z,t=Math.max(0,Math.min(1,((from.x-p.x)*dx+(from.z-p.z)*dz)/(dx*dx+dz*dz))),d=distance(from,{x:p.x+t*dx,z:p.z+t*dz});if(d<best){best=d;start=b;}}push(nodes[start]);}
 const cost=nodes.map(()=>Infinity),previous=[],visited=new Set();cost[start]=0;
 while(visited.size<nodes.length){let u=-1;for(let i=0;i<nodes.length;i++)if(!visited.has(i)&&(u<0||cost[i]<cost[u]))u=i;if(u<0||!Number.isFinite(cost[u])||u===end)break;visited.add(u);for(const [a,b] of edges)if(a===u){const c=cost[u]+distance(nodes[a],nodes[b]);if(c<cost[b]){cost[b]=c;previous[b]=u;}}}
 const ids=[];for(let u=end;u!==start;u=previous[u]){if(u===undefined)throw Error('Disconnected ride route');ids.push(u);}ids.reverse().forEach(i=>push(nodes[i]));push(to);if(points.length<2)points.push({...to});return points;
}
