"""Clean pants topology in Blender; preserve the original rig and design details."""
import bpy, math, json
from mathutils import Vector
from mathutils.kdtree import KDTree
from mathutils.bvhtree import BVHTree
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
if bpy.context.scene.get('square_denim_refinement') == 1:
    raise RuntimeError('Refinement already applied; edit the source directly.')
old=bpy.data.objects['Jeans_Denim']
rig=bpy.data.objects['Lagos_Existing_Rig']
print('JEANS MATRIX',list(map(list,old.matrix_world)),flush=True)
# glTF importer stores mesh coordinates in Blender's Z-up authoring space.
verts=[];faces=[]
def add(x,y,z):
    verts.append((x,-z,y));return len(verts)-1
N=64
# Bottom pelvis loop is split into two leg openings via a shared curved crotch.
hip_y=.865; hip_rx=.214; hip_rz=.13; hip_cz=-.03
pelvis=[]
rows=[(.865,.214,.130,-.03),(.90,.210,.132,-.033),(.94,.200,.132,-.035),
      (.98,.185,.128,-.034),(1.02,.169,.117,-.025),(1.055,.154,.105,-.010),(1.08,.146,.098,-.002),(1.105,.140,.094,.002)]
for y,rx,rz,cz in rows:
    ring=[add(math.sin(i*2*math.pi/N)*rx,y,cz+math.cos(i*2*math.pi/N)*rz) for i in range(N)]
    if pelvis:
        lower=pelvis[-1]
        for i in range(N):faces.append((lower[i],lower[(i+1)%N],ring[(i+1)%N],ring[i]))
    pelvis.append(ring)
# Seam from back centre to front centre, descending into a rounded crotch.
crotch=[pelvis[0][N//2]]
for j in range(1,N//2):
    t=j/(N//2)
    crotch.append(add(0,hip_y-.092*math.sin(t*math.pi),hip_cz-hip_rz*math.cos(t*math.pi)))
crotch.append(pelvis[0][0])
def circle(side,y,t):
    center=side*.116
    center_z=-.079+(y-.09)/.75*.052
    # Broad low pooling folds, a small knee crease, and restrained vertical drape.
    low=math.exp(-((y-.16)/.080)**2)
    knee=math.exp(-((y-.50)/.065)**2)
    fold=.008*math.sin((y-.09)*62+t*1.6)*low+.0027*math.sin(y*58-t*2)*knee
    drape=.0018*math.cos(t*4+.5)*math.sin((y-.09)/.7*math.pi)
    rx=.105+.006*math.exp(-((y-.20)/.11)**2)
    return center+math.sin(t)*min(.108,rx+fold+drape), center_z+math.cos(t)*(.108+fold+drape)
for side in [1,-1]:
    top=[]
    for i in range(N):
        if side==1:
            top.append(pelvis[0][i] if i<=N//2 else crotch[i-N//2])
        else:
            top.append(crotch[N//2-i] if i<N//2 else pelvis[0][i])
    rings=[]
    ys=[.09,.098,.112,.126,.144,.164,.187,.212,.242,.28,.32,.37,.42,.47,.51,.55,.59,.63,.67,.71,.75]
    for y in ys:
        ring=[]
        for i in range(N):
            t=i*2*math.pi/N
            x,z=circle(side,y,t)
            ring.append(add(x,y,z))
        if rings:
            prev=rings[-1]
            for i in range(N):faces.append((prev[i],prev[(i+1)%N],ring[(i+1)%N],ring[i]))
        rings.append(ring)
    # Two transition loops ease a circular leg into the shared crotch opening.
    prev=rings[-1]
    for f in [.33,.66,1.0]:
        ring=[]
        for i in range(N):
            a=Vector(verts[rings[-1][i]]);b=Vector(verts[top[i]])
            if f==1:idx=top[i]
            else:
                v=a.lerp(b,f);verts.append(tuple(v));idx=len(verts)-1
            ring.append(idx)
        for i in range(N):faces.append((prev[i],prev[(i+1)%N],ring[(i+1)%N],ring[i]))
        prev=ring
mesh=bpy.data.meshes.new('Jeans_Clean_Connected_Quads')
mesh.from_pydata(verts,[],faces);mesh.update()
obj=bpy.data.objects.new('Jeans_Denim_New',mesh)
bpy.data.collections['EXPORT_Outfit'].objects.link(obj)
obj.matrix_world=old.matrix_world.copy()
obj.parent=old.parent
obj.matrix_parent_inverse=old.matrix_parent_inverse.copy()
mesh.materials.append(old.active_material)
# Cylindrical denim UVs, split per leg below the hip, with seam-wrap correction.
uv=mesh.uv_layers.new(name='Denim_UV')
for polygon in mesh.polygons:
    coordinates=[Vector(verts[i]) for i in polygon.vertices]
    cx=sum(v.x for v in coordinates)/len(coordinates)
    zheight=sum(v.z for v in coordinates)/len(coordinates)
    is_leg=zheight<.865
    side=1 if cx>=0 else -1
    us=[]
    for v in coordinates:
        center=side*.116 if is_leg else 0
        cz=-.079+(v.z-.09)/.75*.052 if is_leg else -.03
        us.append(math.atan2(v.x-center,-v.y-cz)/(2*math.pi)+.5)
    if max(us)-min(us)>.5:us=[u+1 if u<.5 else u for u in us]
    for li,u,v in zip(polygon.loop_indices,us,coordinates):uv.data[li].uv=(u,(v.z-.09)/(1.105-.09))
    polygon.use_smooth=True
# Transfer from the retained garment weights, never invent a replacement skeleton.
groups={g.name:obj.vertex_groups.new(name=g.name) for g in old.vertex_groups}
trees={}
for side in [-1,0,1]:
    candidates=[v for v in old.data.vertices if side==0 or v.co.x*side>0]
    tree=KDTree(len(candidates))
    for v in candidates:tree.insert(v.co,v.index)
    tree.balance();trees[side]=tree
def weights_at(point):
    if point.z>=1.015:return {'pelvis':1}
    side=(1 if point.x>=0 else -1) if point.z<.84 else 0
    influences={}
    for co,index,distance in trees[side].find_n(point,4):
        for group in old.data.vertices[index].groups:
            name=old.vertex_groups[group.group].name
            influences[name]=influences.get(name,0)+group.weight/max(distance*distance,1e-8)
    result=sorted(influences.items(),key=lambda x:x[1],reverse=True)[:4]
    total=sum(w for name,w in result)
    return {name:w/total for name,w in result}
for v in mesh.vertices:
    for name,weight in weights_at(v.co).items():groups[name].add([v.index],weight,'REPLACE')
mod=obj.modifiers.new('Existing skeleton','ARMATURE');mod.object=rig
obj['outfit']='square-denim-v2';obj['source']='Rightmost outfit; clean Blender-authored trouser topology'
# Remove doubled original trousers after a checkpoint; original seed stays on disk.
old_name=old.name;bpy.data.objects.remove(old,do_unlink=True);obj.name=old_name
# Fit old construction details to the new surface. Top bindings remain untouched.
tree=BVHTree.FromPolygons([v.co for v in mesh.vertices],[list(p.vertices) for p in mesh.polygons])
for detail_name in ['Jeans_Stitch','Top_Binding','Hardware']:
    detail=bpy.data.objects[detail_name]
    for v in detail.data.vertices:
        if detail_name=='Top_Binding' and v.co.z>1.12:continue
        nearest,normal,face,distance=tree.find_nearest(v.co)
        if nearest is not None and distance<.065:
            # Projection retains the detail silhouette and prevents buried seams.
            v.co=nearest+normal*.0015
        if v.co.z>=1.015:
            for group in detail.vertex_groups:group.remove([v.index])
            pelvis=detail.vertex_groups.get('pelvis') or detail.vertex_groups.new(name='pelvis')
            pelvis.add([v.index],1,'REPLACE')
    detail.data.update()
# Keep garment normals consistent across all connected quads.
bpy.ops.object.select_all(action='DESELECT')
obj.select_set(True);bpy.context.view_layer.objects.active=obj
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT')
bpy.context.scene['square_denim_refinement']=1
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'art/blender/Square_Denim.blend'))
print('Clean trousers:',len(mesh.vertices),'vertices',len(mesh.polygons),'quads',flush=True)

exec(compile((ROOT/'tools/blender/finish_details.py').read_text(), str(ROOT/'tools/blender/finish_details.py'), 'exec'))
