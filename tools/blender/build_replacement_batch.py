"""Batch 1: clarify approved clothing, author a scoop tank and fit a male tee/jeans."""
import bpy, bmesh, math, json
import numpy as np
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'art/blender/batch-01';OUT.mkdir(parents=True,exist_ok=True)
def linear(h):
    rgb=[int(h[i:i+2],16)/255 for i in (1,3,5)]
    return tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in rgb)+(1,)
def colour(mat,h):
    c=linear(h);mat.diffuse_color=c
    bsdf=mat.node_tree.nodes.get('Principled BSDF')
    mix=next((n for n in mat.node_tree.nodes if n.type=='MIX_RGB'),None)
    if mix:mix.inputs[2].default_value=c
    else:bsdf.inputs['Base Color'].default_value=c
def texture(mat,denim):
    tex=next(n for n in mat.node_tree.nodes if n.type=='TEX_IMAGE')
    size=512 if denim else 256
    y,x=np.mgrid[0:size,0:size];u=x/size;v=y/size
    rng=np.random.default_rng(423 if denim else 37)
    if denim:
        cloud=(np.sin(u*27+np.sin(v*19)*1.4)+np.sin(u*59-v*37)*.45+np.sin(u*113+v*73)*.22)/1.67
        front=np.exp(-((u-.5)/.19)**2)
        fade=front*(.19+.11*np.sin(v*math.pi)**2)
        grain=(rng.random((size,size))-.5)*.075
        weave=((x+2*y)%5==0)*.016-((x-y)%7==0)*.012
        values=.72+fade*.68+cloud*.045+grain*.4+weave
        values=np.where(v>.972,values*.69,values)
        values=np.where((v>.955)&(v<.965),values+.08,values)
        values=np.clip(values,.48,1.0)
    else:
        values=np.clip(.94+((x%4)==0)*.018+(rng.random((size,size))-.5)*.018,.9,.99)
    pixels=np.ones((size,size,4),dtype=np.float32);pixels[:,:,:3]=values[:,:,None]
    image=bpy.data.images.new(mat.name+'_NeutralDetail_Clear',width=size,height=size,alpha=True)
    image.pixels.foreach_set(pixels.ravel());image.pack();tex.image=image
def normals(obj):
    bm=bmesh.new();bm.from_mesh(obj.data)
    if obj.name=='Top_Knit':bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.000001)
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces)
    if obj.name=='Top_Knit':
        for face in bm.faces:
            centre=face.calc_center_median()
            if abs(centre.x)<.22 and .98<centre.z<1.54:
                outward=Vector((centre.x,centre.y,0))
                if face.normal.dot(outward)<0:face.normal_flip()
    bm.to_mesh(obj.data);bm.free()
    if obj.name=='Top_Knit' and obj.data.has_custom_normals:obj.data.normals_split_custom_set([(0,0,0)]*len(obj.data.loops))
    for p in obj.data.polygons:p.use_smooth=True
def save(name,sex,top):
    scene=bpy.context.scene
    scene['batch_sex']=sex;scene['batch_top']=top;scene['batch_asset']=name
    for obj in bpy.data.collections['EXPORT_Outfit'].objects:
        if obj.type=='MESH':
            obj['garmentSlot']='top' if obj.name.startswith('Top_') else 'bottom'
            obj.active_material['garmentSlot']=obj['garmentSlot']
    for obj in list(bpy.data.collections['EXPORT_Outfit'].objects):
        if obj.type=='MESH':
            bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj
            bpy.ops.object.vertex_group_limit_total(limit=4);bpy.ops.object.vertex_group_normalize_all(lock_active=False)
    bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(OUT/(name+'.blend')))
# Work from the approved source, keeping that original file intact.
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'art/blender/Square_Denim.blend'))
for name,h in [('Top_Knit','#24252a'),('Top_Binding','#28292d'),('Jeans_Denim','#42413e'),('Jeans_Stitch','#777267')]:
    mat=bpy.data.objects[name].active_material;colour(mat,h)
    mat.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.98 if name.startswith('Top') else .9
for name,denim in [('Top_Knit',False),('Jeans_Denim',True)]:texture(bpy.data.objects[name].active_material,denim)
stitch=bpy.data.objects['Jeans_Stitch']
bpy.ops.object.select_all(action='DESELECT');stitch.select_set(True);bpy.context.view_layer.objects.active=stitch
dec=stitch.modifiers.new('Mobile seam budget','DECIMATE');dec.ratio=.48
bpy.ops.object.modifier_apply(modifier=dec.name)
# Keep four normalized deform influences after simplification.
bpy.ops.object.vertex_group_limit_total(limit=4);bpy.ops.object.vertex_group_normalize_all(lock_active=False)
# Lift fine stitching clear of the denim surface to avoid z-fighting.
for vertex in stitch.data.vertices:
    p=vertex.co;centre=(.116 if p.x>=0 else -.116) if p.z<.8 else 0
    outward=Vector((p.x-centre,p.y,0))
    if outward.length>0:vertex.co+=outward.normalized()*.002
save('Square_Denim','female','square')
# Second supplied female design: scoop tank and light-blue wide jeans.
for name in ['Top_Knit','Top_Binding']:
    obj=bpy.data.objects[name];bm=bmesh.new();bm.from_mesh(obj.data)
    for side in [-1,1]:
        bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=.000001,
            plane_co=(side*.178,0,0),plane_no=(side,0,0),clear_outer=True,clear_inner=False)
    # Sloping armhole cuts leave narrow straps instead of capped shoulders.
    for side in [-1,1]:
        bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=.000001,
            plane_co=(side*.178,0,1.33),plane_no=(side,0,.35),clear_outer=True,clear_inner=False)
    bm.to_mesh(obj.data);bm.free()
    for vertex in obj.data.vertices:
        p=vertex.co
        if p.z<1.25:p.z-=.018*max(0,(1.25-p.z)/.125)
        # Curve the existing lower neckline into the supplied scoop.
        front=max(0,min(1,(-p.y+.065)/.08))
        band=math.exp(-((p.z-1.387)/.045)**2)
        p.z-=.026*max(0,1-(p.x/.108)**2)*band*front
    if name=='Top_Knit':
        for vertex in obj.data.vertices:
            p=vertex.co
            if 1.10<p.z<1.34:
                t=max(0,min(1,(p.z-1.10)/.24));rx=.145+t*.048
                ellipse=math.sqrt(max(.08,1-(p.x/rx)**2))
                depth=(.10+t*.032) if p.y<0 else (.083+t*.025)
                target=(-1 if p.y<0 else 1)*depth*ellipse
                amount=min(1,(1.34-p.z)/.05)*min(1,(p.z-1.10)/.025)*.9
                p.y=p.y*(1-amount)+target*amount
    colour(obj.active_material,'#e5dfd1');normals(obj)
jeans=bpy.data.objects['Jeans_Denim']
for v in jeans.data.vertices:
    if v.co.z<.75:
        side=1 if v.co.x>0 else -1
        v.co.x=side*max(.007,side*(side*.116+(v.co.x-side*.116)*1.035))
colour(jeans.active_material,'#64839a');normals(jeans)
save('Tank_Denim','female','tank')
# Male base uses the retained male body and rig, not a female torso substitution.
bpy.ops.wm.open_mainfile(filepath=str(OUT/'Square_Denim.blend'))
female_rig=next(o for o in bpy.data.collections['EXPORT_Outfit'].objects if o.type=='ARMATURE')
before=set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=str(ROOT/'dist/assets/characters/Superhero_Male_FullBody.glb'))
imported=set(bpy.data.objects)-before
male_rig=next(o for o in imported if o.type=='ARMATURE')
body=next(o for o in imported if o.type=='MESH' and o.name.startswith('SuperHero_Male'))
export=bpy.data.collections['EXPORT_Outfit']
for obj in list(export.objects):
    if obj.type=='MESH' and obj.name.startswith('Top_'):bpy.data.objects.remove(obj,do_unlink=True)
for obj in list(export.objects):
    if obj.type!='MESH':continue
    for v in obj.data.vertices:
        p=Vector((0,0,0))
        for g in v.groups:
            name=obj.vertex_groups[g.group].name
            if name in male_rig.data.bones and name in female_rig.data.bones:
                transform=male_rig.data.bones[name].matrix_local @ female_rig.data.bones[name].matrix_local.inverted()
                p+=(transform@v.co)*g.weight
        v.co=p
    obj.parent=male_rig;obj.matrix_parent_inverse=male_rig.matrix_world.inverted()
    for mod in obj.modifiers:
        if mod.type=='ARMATURE':mod.object=male_rig
    normals(obj)
export.objects.unlink(female_rig);bpy.data.objects.remove(female_rig,do_unlink=True)
for c in list(male_rig.users_collection):c.objects.unlink(male_rig)
export.objects.link(male_rig)
# Clip the original male surface with interpolated original skin weights.
def sample(v):
    return {'p':v.co.copy(),'n':v.normal.copy(),'w':{body.vertex_groups[g.group].name:g.weight for g in v.groups if g.weight>0}}
def mix(a,b,t):
    w={}
    for v,f in [(a,1-t),(b,t)]:
        for k,value in v['w'].items():w[k]=w.get(k,0)+value*f
    pairs=sorted(w.items(),key=lambda x:x[1],reverse=True)[:4];total=sum(v for k,v in pairs)
    return {'p':a['p'].lerp(b['p'],t),'n':a['n'].lerp(b['n'],t),'w':{k:v/total for k,v in pairs}}
def clip(poly,fn):
    out=[]
    for i,a in enumerate(poly):
        b=poly[(i+1)%len(poly)];da=fn(a['p']);db=fn(b['p'])
        if da>=0:out.append(a)
        if (da>=0)!=(db>=0):out.append(mix(a,b,da/(da-db)))
    return out
def neck(p):
    front=max(0,min(1,(-p.y+.06)/.12))
    if abs(p.x)>=.09:return 1
    bottom=1.565-(.035+front*.04)*math.sqrt(max(0,1-(p.x/.09)**2))
    return bottom-p.z
planes=[lambda p:p.z-.99,lambda p:1.575-p.z,lambda p:.405-p.x,lambda p:.405+p.x,neck]
body.data.calc_loop_triangles();points=[];faces=[]
for tri in body.data.loop_triangles:
    poly=[sample(body.data.vertices[i]) for i in tri.vertices]
    for fn in planes:
        poly=clip(poly,fn)
        if len(poly)<3:break
    for i in range(1,len(poly)-1):
        start=len(points)
        for v in [poly[0],poly[i],poly[i+1]]:
            v={'p':v['p'].copy(),'n':v['n'].copy(),'w':v['w']}
            v['p']+=v['n'].normalized()*.014
            if abs(v['p'].x)<.22 and v['p'].z<1.40:v['p'].x*=1.07
            points.append(v)
        faces.append((start,start+1,start+2))
mesh=bpy.data.meshes.new('Male_Relaxed_Tee_Continuous');mesh.from_pydata([p['p'] for p in points],[],faces);mesh.update()
top=bpy.data.objects.new('Top_Knit',mesh);export.objects.link(top);top.parent=male_rig
for name in {k for p in points for k in p['w']}:top.vertex_groups.new(name=name)
for i,p in enumerate(points):
    for k,w in p['w'].items():top.vertex_groups[k].add([i],w,'REPLACE')
uv=mesh.uv_layers.new(name='UVMap')
for loop in mesh.loops:
    p=mesh.vertices[loop.vertex_index].co;uv.data[loop.index].uv=(p.x*2+1,p.z*2)
mat=bpy.data.materials.get('Top_Knit').copy();mat.name='Top_Knit';colour(mat,'#e5c66b');mesh.materials.append(mat)
mod=top.modifiers.new('Existing skeleton','ARMATURE');mod.object=male_rig;normals(top)
# A separate narrow binding reuses boundary edges and existing weights.
bm=bmesh.new();bm.from_mesh(mesh);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00001);bm.to_mesh(mesh);bm.free();mesh.update()
# Relax torso relief into a soft tee surface, retaining the shoulder/sleeve fit.
for vertex in mesh.vertices:
    p=vertex.co
    if abs(p.x)<.225 and .99<p.z<1.505:
        ellipse=math.sqrt(max(.04,1-(p.x/.245)**2))
        target=(-.157 if p.y<-.005 else .125)*ellipse-.005
        fade=min(1,(1.505-p.z)/.055)*min(1,(.225-abs(p.x))/.035)
        p.y=p.y*(1-fade*.94)+target*fade*.94
bm=bmesh.new();bm.from_mesh(mesh)
inside=[v for v in bm.verts if not v.is_boundary]
for iteration in range(6):bmesh.ops.smooth_vert(bm,verts=inside,factor=.48,use_axis_x=True,use_axis_y=True,use_axis_z=True)
bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(mesh);bm.free();mesh.update();normals(top)
bm=bmesh.new();bm.from_mesh(mesh);bm.verts.ensure_lookup_table();edges=[e for e in bm.edges if e.is_boundary];bverts=[];bfaces=[];weights=[]
def top_sample(index):
    v=mesh.vertices[index]
    return {'w':{top.vertex_groups[g.group].name:g.weight for g in v.groups if g.weight>0}}
for edge in edges:
    a,b=edge.verts
    va=top_sample(a.index);vb=top_sample(b.index)
    offset=Vector((0,0,-.004))
    at=len(bverts)
    for p,w in [(a.co,va['w']),(b.co,vb['w']),(b.co+offset,vb['w']),(a.co+offset,va['w'])]:
        bverts.append(tuple(p));weights.append(w)
    bfaces.append((at,at+1,at+2,at+3))
bm.free()
binding_mesh=bpy.data.meshes.new('Male_Tee_Bound_Edges');binding_mesh.from_pydata(bverts,[],bfaces);binding_mesh.update()
binding=bpy.data.objects.new('Top_Binding',binding_mesh);export.objects.link(binding);binding.parent=male_rig
for name in top.vertex_groups:binding.vertex_groups.new(name=name.name)
for i,w in enumerate(weights):
    for name,value in w.items():binding.vertex_groups[name].add([i],value,'REPLACE')
bmat=bpy.data.materials.get('Top_Binding').copy();bmat.name='Top_Binding';colour(bmat,'#d9b85e');binding_mesh.materials.append(bmat)
binding_mesh.uv_layers.new(name='UVMap')
mod=binding.modifiers.new('Existing skeleton','ARMATURE');mod.object=male_rig;normals(binding)
colour(bpy.data.objects['Jeans_Denim'].active_material,'#66859c')
for obj in imported:
    if obj!=male_rig and obj.name in bpy.data.objects:
        obj.hide_render=True;obj.hide_select=True
        if obj.type=='MESH':obj.display_type='WIRE'
save('Male_Everyday','male','tee')
print('Three editable reference-based outfits saved',flush=True)
