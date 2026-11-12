export const HOME_BOUNDS={minX:-6.6,maxX:6.6,minZ:-6.1,maxZ:4.1};
export const HOME_STATIONS={
 sleep:{x:-4.7,z:-3.6,stand:{x:-2.6,z:-2.5}},wardrobe:{x:-5.8,z:1.1,stand:{x:-4.5,z:1.1}},
 study:{x:-.3,z:-5.4,stand:{x:-.3,z:-3.8}},computer:{x:1,z:-5.4,stand:{x:1,z:-3.8}},
 prep:{x:3.2,z:-5.1,stand:{x:3.2,z:-3.9}},cook:{x:5.2,z:-5.1,stand:{x:5.2,z:-3.9}},
 fridge:{x:6.1,z:-2.5,stand:{x:4.8,z:-2.5}},cupboard:{x:6.1,z:-.5,stand:{x:4.8,z:-.5}},
 table:{x:-2.2,z:.4,stand:{x:-2.2,z:2.15}},wash:{x:5.5,z:2.8,stand:{x:4.8,z:.8}},
 sit:{x:.4,z:1.9,stand:{x:.4,z:.7}}
};
export const HOME_FIXED_COLLIDERS=[{x:-4.7,z:-3.6,w:3,d:3.6},{x:-5.8,z:1.1,w:1.4,d:1},{x:-2.65,z:-5.45,w:.12,d:1.7},{x:.3,z:-5.45,w:2.7,d:.9},{x:-.3,z:-4.65,w:.55,d:.55},{x:1,z:-4.65,w:.55,d:.55},{x:4.3,z:-5.1,w:4,d:1.1},{x:6.1,z:-2.5,w:.9,d:1},{x:6.1,z:-.5,w:.9,d:1},{x:-2.2,z:.4,w:1.6,d:1},{x:-2.2,z:1.35,w:.6,d:.55},{x:3.75,z:2.8,w:.12,d:2.7},{x:5.4,z:4.05,w:3.2,d:.12}];
export const HOME_SOFA_COLLIDER={x:.4,z:2.2,w:2.5,d:1.1};
export const HOME_ACCESS=[{x:0,z:3.3},{x:0,z:3.9},...Object.values(HOME_STATIONS).map(s=>s.stand)];
export const HOME_ACTIVITY_SPACE=[{x:0,z:3.55,w:1.8,d:1.1},...Object.values(HOME_STATIONS).map(s=>({x:s.stand.x,z:s.stand.z,w:.9,d:.9})),{x:5.2,z:2,w:1.4,d:2.4}];
