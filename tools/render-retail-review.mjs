// Diagnostic renders of shipped meshes. Not browser screenshots or visual acceptance.
import {renderOffline} from './catalogue-preview-runtime.mjs';
import * as T from '../dist/vendor/three.module.js';
import {buildDistrictInterior,buildFashionInterior,buildInterior} from '../dist/interior.js';
for(const kind of ['hair-salon','showroom','boutique','home']){const v=kind==='boutique'?buildFashionInterior():kind==='home'?buildInterior('studio',false):buildDistrictInterior(kind);v.room.position.x=0;v.room.visible=true;v.tick?.(.016,true);for(const m of v.room.children)if(m.isMesh&&m.position.x>4.9&&m.geometry.parameters?.height===3.5)m.visible=false;const scene=new T.Scene();scene.add(v.room);const camera=new T.PerspectiveCamera(48,900/720,.1,100);camera.position.set(8.5,8.3,12);camera.lookAt(0,1.1,-.4);await renderOffline(scene,camera,900,720,'../../../qa/shops-phone/'+kind+'-diagnostic.png');console.log(kind+' diagnostic rendered');}
