import bpy,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
folder=ROOT/'art/blender/batch-01'
for name in ['Square_Denim','Tank_Denim','Male_Everyday']:
    bpy.ops.wm.open_mainfile(filepath=str(folder/(name+'.blend')))
    objects=list(bpy.data.collections['EXPORT_Outfit'].objects)
    meshes=[o for o in objects if o.type=='MESH'];rig=next(o for o in objects if o.type=='ARMATURE')
    assert len(meshes)==5
    rig.data.pose_position='REST'
    for bone in rig.pose.bones:bone.matrix_basis.identity()
    active={o.active_material for o in meshes}
    for mat in bpy.data.materials:
        if mat not in active and mat.name in {o.name for o in meshes}:mat.name='Reference_'+mat.name
    colours={};triangles=0
    for obj in meshes:
        mat=obj.active_material;mat.name=obj.name
        assert len(obj.data.materials)==1
        obj.data.calc_loop_triangles();triangles+=len(obj.data.loop_triangles)
        for v in obj.data.vertices:
            weights=[g.weight for g in v.groups if obj.vertex_groups[g.group].name in rig.data.bones and g.weight>0]
            assert 0<len(weights)<=4 and abs(sum(weights)-1)<1e-4,(obj.name,v.index)
        if obj.name in ['Top_Knit','Jeans_Denim']:
            colours[obj.name]=list(mat.diffuse_color)
            bsdf=mat.node_tree.nodes.get('Principled BSDF');tex=next(n for n in mat.node_tree.nodes if n.type=='TEX_IMAGE')
            mat.node_tree.links.new(tex.outputs['Color'],bsdf.inputs['Base Color'])
    assert triangles<30000,triangles
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:obj.hide_set(False);obj.select_set(True)
    bpy.context.view_layer.objects.active=rig
    bpy.ops.export_scene.gltf(filepath=str(folder/(name+'.glb')),export_format='GLB',use_selection=True,
        export_animations=False,export_skins=True,export_yup=True,export_extras=True,
        export_influence_nb=4,export_all_influences=False,export_apply=False,export_leaf_bone=False)
    (folder/(name+'.json')).write_text(json.dumps({'name':name,'sex':bpy.context.scene['batch_sex'],'profile':bpy.context.scene['batch_top'],'materialColours':colours,'triangles':triangles},indent=2))
    print('EXPORTED',name,triangles,flush=True)
