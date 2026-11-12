"""Export garment only; reject invalid weights and over-budget assets."""
import bpy, json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
collection = bpy.data.collections.get('EXPORT_Outfit')
assert collection, 'Missing EXPORT_Outfit'
objects = list(collection.objects)
rigs = [o for o in objects if o.type == 'ARMATURE']
meshes = [o for o in objects if o.type == 'MESH']
assert len(rigs) == 1 and len(meshes) == 5, 'One retained rig and five batches required'
rig = rigs[0]
rig.data.pose_position = 'REST'
for bone in rig.pose.bones: bone.matrix_basis.identity()
triangles = 0
for obj in meshes:
    assert len(obj.data.materials) == 1
    assert obj.active_material.name in {'Top_Knit','Jeans_Denim','Top_Binding','Jeans_Stitch','Hardware'}
    assert any(m.type == 'ARMATURE' and m.object == rig for m in obj.modifiers)
    assert not any(m.type != 'ARMATURE' for m in obj.modifiers), 'Apply geometry modifiers first'
    obj.data.calc_loop_triangles()
    triangles += len(obj.data.loop_triangles)
    for v in obj.data.vertices:
        weights = [g.weight for g in v.groups if obj.vertex_groups[g.group].name in rig.data.bones and g.weight > 0]
        assert 1 <= len(weights) <= 4 and abs(sum(weights) - 1) < 1e-4, f'Invalid weights: {obj.name}/{v.index}'
assert triangles <= 35000, 'Outfit exceeds triangle budget'
bpy.ops.object.select_all(action='DESELECT')
for obj in objects:
    obj.hide_set(False)
    obj.select_set(True)
bpy.context.view_layer.objects.active = rig
# Export the neutral image unmultiplied; staging supplies the dye factor.
# Blender otherwise bakes MixRGB dye into the bitmap, preventing light recolours.
material_colours = {}
for obj in meshes:
    mat = obj.active_material
    if mat.name in ('Top_Knit', 'Jeans_Denim'):
        material_colours[mat.name] = list(mat.diffuse_color)
        bsdf = mat.node_tree.nodes.get('Principled BSDF')
        tex = next(n for n in mat.node_tree.nodes if n.type == 'TEX_IMAGE')
        mat.node_tree.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
out = ROOT / 'art/blender/Square_Denim_Export.glb'
bpy.ops.export_scene.gltf(filepath=str(out), export_format='GLB', use_selection=True,
    export_animations=False, export_skins=True, export_yup=True, export_extras=True,
    export_influence_nb=4, export_all_influences=False, export_apply=False,
    export_def_bones=False, export_leaf_bone=False, export_materials='EXPORT')
(ROOT / 'qa/blender-outfit/blender-export.json').write_text(json.dumps({
    'blender': bpy.app.version_string, 'materialColours': material_colours, 'triangles': triangles, 'meshes': len(meshes),
    'bones': [b.name for b in rig.data.bones], 'output': str(out.relative_to(ROOT)),
    'back': 'plain matching back inferred with owner permission',
    'source': 'rightmost column of Denim_and_Everyday_Tops.png'
}, indent=2))
print('Exported:', out)
