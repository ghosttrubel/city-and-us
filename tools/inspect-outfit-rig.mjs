import './catalogue-preview-runtime.mjs';
import {GLTFLoader} from '../dist/vendor/addons/GLTFLoader.js';
import * as T from '../dist/vendor/three.module.js';
import {writeFile} from 'node:fs/promises';
const gltf=await new GLTFLoader().loadAsync(new URL('../dist/assets/characters/Superhero_Female_FullBody.glb',import.meta.url).href),body=gltf.scene.getObjectByName('Superhero_Female');body.updateWorldMatrix(true,false);const g=body.geometry,p=g.attributes.position,n=g.attributes.normal;
const report={count:p.count,index:g.index.count,bones:body.skeleton.bones.map((b,i)=>({i,name:b.name,position:b.getWorldPosition(new T.Vector3()).toArray()})),slices:[]};
for(const y of [.1,.3,.5,.7,.8,.9,1,1.1,1.15,1.2,1.3,1.35,1.4,1.45,1.5]){const points=[];for(let i=0;i<p.count;i++)if(Math.abs(p.getY(i)-y)<.018&&Math.abs(p.getX(i))<.24)points.push([p.getX(i),p.getY(i),p.getZ(i)]);report.slices.push({y,count:points.length,x:[Math.min(...points.map(p=>p[0])),Math.max(...points.map(p=>p[0]))],z:[Math.min(...points.map(p=>p[2])),Math.max(...points.map(p=>p[2]))]});}
for(const x of [.2,.3,.4,.5,.55,.6,.65]){const points=[];for(let i=0;i<p.count;i++)if(Math.abs(p.getX(i)-x)<.018)points.push([p.getX(i),p.getY(i),p.getZ(i)]);report.slices.push({x,count:points.length,y:[Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[1]))],z:[Math.min(...points.map(p=>p[2])),Math.max(...points.map(p=>p[2]))]});}
await writeFile(new URL('../qa/exact-outfit-review/rig-inspection.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
