"""Render exported game mesh snapshots, explicitly separate from game screenshots."""
import bpy, json, math
from pathlib import Path
from mathutils import Vector
ROOT = Path(__file__).resolve().parents[2]
QA = ROOT / 'qa/blender-outfit'
def aim(obj, target): obj.rotation_euler = (Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
for name in ['front','side','back','seated','recolour']:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    data = json.loads((QA / (name+'-snapshot.json')).read_text())
    mats = {}
    for m in data['materials']:
        mat=bpy.data.materials.new(m['name']);mat.use_nodes=True
        bsdf=mat.node_tree.nodes.get('Principled BSDF')
        bsdf.inputs['Base Color'].default_value=(*m['color'],1)
        bsdf.inputs['Roughness'].default_value=m['roughness']
        bsdf.inputs['Metallic'].default_value=m['metalness']
        if m['map']:
            tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(QA/m['map']),check_existing=True)
            uv=mat.node_tree.nodes.new('ShaderNodeTexCoord')
            mapping=mat.node_tree.nodes.new('ShaderNodeVectorMath');mapping.operation='MULTIPLY'
            mapping.inputs[1].default_value=(m['repeat'][0],m['repeat'][1],1)
            mat.node_tree.links.new(uv.outputs['UV'],mapping.inputs[0])
            mat.node_tree.links.new(mapping.outputs['Vector'],tex.inputs['Vector'])
            mix=mat.node_tree.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
            mix.inputs[2].default_value=(*m['color'],1)
            mat.node_tree.links.new(tex.outputs['Color'],mix.inputs[1]);mat.node_tree.links.new(mix.outputs[0],bsdf.inputs['Base Color'])
        mats[m['id']]=mat
    for item in data['meshes']:
        mesh=bpy.data.meshes.new(item['name']);mesh.from_pydata(item['verts'],[],item['faces']);mesh.update()
        obj=bpy.data.objects.new(item['name'],mesh);bpy.context.collection.objects.link(obj)
        for id in item['materials']:mesh.materials.append(mats[id])
        uv=mesh.uv_layers.new(name='UVMap')
        for p,idx in zip(mesh.polygons,item['faceMaterials']):
            p.material_index=idx;p.use_smooth=True
            material_data=next(m for m in data['materials'] if m['id']==item['materials'][idx])
            for li in p.loop_indices:
                u,v=item['uvs'][mesh.loops[li].vertex_index]
                uv.data[li].uv=(u,v if material_data['flipY'] else 1-v)
        mesh.normals_split_custom_set_from_vertices(item['normals'])
    bpy.ops.mesh.primitive_plane_add(size=200)
    ground=bpy.context.object;ground.name='Studio floor (render only)'
    mat=bpy.data.materials.new('Floor');mat.diffuse_color=(.20,.24,.28,1);ground.data.materials.append(mat)
    bpy.ops.object.camera_add(location=(0,-5.3,1.55))
    camera=bpy.context.object;camera.data.type='ORTHO';camera.data.ortho_scale=2.85;aim(camera,(0,0,1.25));bpy.context.scene.camera=camera
    for loc,energy,size in [((-3,-4,5),500,4),((3,-2,3),250,3),((1,3,4),600,3)]:
        bpy.ops.object.light_add(type='AREA',location=loc);light=bpy.context.object;light.data.energy=energy;light.data.shape='DISK';light.data.size=size;aim(light,(0,0,1.2))
    scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=16;scene.cycles.device='CPU';scene.cycles.use_denoising=True;scene.render.threads_mode='FIXED';scene.render.threads=4
    scene.world=bpy.data.worlds.new('Studio');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.32,.36,.42,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.45
    scene.render.resolution_x=650;scene.render.resolution_y=850;scene.render.resolution_percentage=100
    scene.view_settings.view_transform='AgX'
    scene.render.image_settings.file_format='PNG';scene.render.filepath=str(QA/('blender-'+name+'.png'))
    print('Rendering '+name, flush=True)
    bpy.ops.render.render(write_still=True)
print('Blender renders complete; not game screenshots')
