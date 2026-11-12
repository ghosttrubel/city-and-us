import * as T from '../dist/vendor/three.module.js';
import {buildInterior as current} from '../dist/interior.js';
import {buildInterior as baseline} from '../checkpoints/2026-11-12-shops-phone/before/dist/interior.js';
for(const [name,build]of [['before',baseline],['after',current]]){const v=build('studio',true);v.room.visible=true;v.room.updateMatrixWorld(true);const object=v.room.children.find(o=>o.userData.activity==='study'),target=new T.Box3().setFromObject(object).getCenter(new T.Vector3()),origin=target.clone().add(new T.Vector3(0,12,9));console.log(name,JSON.stringify({target:target.toArray(),result:v.pick(new T.Raycaster(origin,target.clone().sub(origin).normalize()))}));}
