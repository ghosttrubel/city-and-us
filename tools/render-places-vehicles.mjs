// Diagnostic mesh renders only. These are NOT browser/game screenshots.
import {renderOffline} from './catalogue-preview-runtime.mjs';
import * as T from '../dist/vendor/three.module.js';
import {buildVenueInterior} from '../dist/interior.js';
import {buildDanfo} from '../dist/danfo.js';
import {buildPlaceFacade} from '../dist/place-facades.js';
for(const kind of ['shop','dispatch']){
 const v=buildVenueInterior(kind);v.room.position.x=0;v.room.visible=true;v.tick(.016,true);
 // The live game uses its camera cutaway system; this static diagnostic hides the near wall.
 for(const m of v.room.children)if(m.isMesh&&m.position.x>4.9&&m.geometry.parameters?.height===3.5)m.visible=false;
 const scene=new T.Scene();scene.add(v.room);const camera=new T.PerspectiveCamera(48,1000/760,.1,100);camera.position.set(8.5,8.3,12);camera.lookAt(0,1.1,-.4);
 await renderOffline(scene,camera,1000,760,'../../../qa/places-vehicles/'+kind+'-offline.png');console.log(kind+' offline diagnostic');
}
const van=buildDanfo();van.update(0,'waiting',false);const scene=new T.Scene();scene.add(van.root);const camera=new T.PerspectiveCamera(40,1000/760,.1,100);camera.position.set(6,3.8,6.8);camera.lookAt(0,1.15,0);await renderOffline(scene,camera,1000,760,'../../../qa/places-vehicles/danfo-offline.png');
for(const kind of ['shop','dispatch']){const scene=new T.Scene(),g=buildPlaceFacade(kind,kind==='shop'?4:8,kind==='shop'?3:7,kind==='shop'?3:6.2);scene.add(g);const camera=new T.PerspectiveCamera(40,1000/760,.1,100);camera.position.set(kind==='shop'?7:12,kind==='shop'?5:8,kind==='shop'?9:16);camera.lookAt(0,kind==='shop'?1.3:2.2,0);await renderOffline(scene,camera,1000,760,'../../../qa/places-vehicles/'+kind+'-facade-offline.png');}
