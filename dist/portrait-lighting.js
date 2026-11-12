import * as T from './vendor/three.module.js';
// Identical neutral rig in the editor, wardrobe and representative review.
export function lightPortrait(scene){scene.background=new T.Color('#d9d9d6');scene.add(new T.HemisphereLight('#ffffff','#888888',1.35));const key=new T.DirectionalLight('#ffffff',2.1);key.position.set(-3,5,4);scene.add(key);const fill=new T.DirectionalLight('#ffffff',.9);fill.position.set(3,3,-3);scene.add(fill);}
