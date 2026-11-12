"""Create an editable outfit on the retained rig; never overwrite artist work silently."""
import bpy, json, math, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'art/blender'
TARGET = ART / 'Square_Denim.blend'
if TARGET.exists() and '--rebuild' not in sys.argv:
    raise RuntimeError('Editable source exists. Use export or explicitly pass --rebuild.')
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(ART / 'Square_Denim_Seed.glb'))
rig = next(o for o in bpy.context.scene.objects if o.type == 'ARMATURE')
rig.name = 'Lagos_Existing_Rig'
rig.show_in_front = True
print('IMPORTED', [(o.name, o.type, len(o.data.polygons) if o.type == 'MESH' else 0) for o in bpy.context.scene.objects], flush=True)
garments = sorted([o for o in bpy.context.scene.objects if o.type == 'MESH' and o.name.startswith('square-denim-')], key=lambda o: o.name)
assert len(garments) == 5
names = ['Top_Knit', 'Jeans_Denim', 'Top_Binding', 'Jeans_Stitch', 'Hardware']
collection = bpy.data.collections.new('EXPORT_Outfit')
bpy.context.scene.collection.children.link(collection)
for obj in [rig] + garments:
    for old in list(obj.users_collection): old.objects.unlink(obj)
    collection.objects.link(obj)
for obj, name in zip(garments, names):
    obj.name = name
    mat = obj.active_material
    mat.name = name
    mat['recolourSlot'] = {'Top_Knit':'shirt', 'Top_Binding':'shirt', 'Jeans_Denim':'bottom', 'Jeans_Stitch':'stitch'}.get(name, 'hardware')
    obj['outfit'] = 'square-denim-v2'
    obj['source'] = 'Denim_and_Everyday_Tops.png / rightmost column'
    for p in obj.data.polygons: p.use_smooth = True
    if name == 'Jeans_Stitch':
        mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value = (.045, .043, .038, 1)
    if name in ('Top_Knit', 'Jeans_Denim'):
        # Neutral detail textures allow light and dark dyes while keeping wash.
        bsdf = mat.node_tree.nodes.get('Principled BSDF')
        tex = next(n for n in mat.node_tree.nodes if n.type == 'TEX_IMAGE')
        import numpy as np
        pixels = np.array(tex.image.pixels[:], dtype=np.float32).reshape((-1, 4))
        luminance = pixels[:, :3].mean(axis=1)
        peak = float(np.percentile(luminance, 99.5))
        neutral = np.clip(luminance / max(peak, 1e-6), .25, 1)
        pixels[:, :3] = neutral[:, None]
        tex.image.pixels[:] = pixels.ravel()
        tex.image.name = name + '_NeutralDetail'
        tex.image.pack()
        colour = (.018, .019, .021, 1) if name == 'Top_Knit' else (.032, .032, .031, 1)
        mix = mat.node_tree.nodes.new('ShaderNodeMixRGB')
        mix.blend_type = 'MULTIPLY'
        mix.inputs[0].default_value = 1
        mix.inputs[2].default_value = colour
        mat.node_tree.links.new(tex.outputs['Color'], mix.inputs[1])
        mat.node_tree.links.new(mix.outputs[0], bsdf.inputs['Base Color'])
        mat.diffuse_color = colour
before = set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=str(ROOT / 'dist/assets/characters/Superhero_Female_FullBody.glb'))
reference = bpy.data.collections.new('REFERENCE_Existing_Character')
bpy.context.scene.collection.children.link(reference)
for obj in set(bpy.data.objects) - before:
    for old in list(obj.users_collection): old.objects.unlink(obj)
    reference.objects.link(obj)
    obj.hide_select = True
    if obj.type == 'MESH': obj.display_type = 'WIRE'
    obj.hide_render = True
image = bpy.data.images.load(str(ROOT / 'reference/outfits/Female_Wardrobe_Collection/01_Casual_Streetwear/Denim_and_Everyday_Tops.png'))
image.pack()
ref = bpy.data.objects.new('SOURCE_Rightmost_outfit_plain_back_inferred', None)
reference.objects.link(ref)
ref.empty_display_type = 'IMAGE'
ref.data = image
ref.empty_display_size = 2.5
ref.location = (2, 0, 1)
ref.rotation_euler = (math.pi / 2, 0, 0)
ref.hide_render = True
ref.hide_select = True
notes = bpy.data.texts.new('WORKFLOW_README')
notes.write('Edit EXPORT_Outfit meshes. Keep existing bone names, hierarchy and rest pose.\n'
            'Top_Knit/Top_Binding = shirt; Jeans_Denim = bottom. Neutral maps preserve wash.\n'
            'Run npm run outfit:export to validate and stage the review GLB.\n'
            'Rightmost charcoal square-neck crop and washed-black wide jeans; back inferred.\n'
            'Seed retains project-authored fitted surfaces and skin weights. Visual review pending.\n')
bpy.context.scene.unit_settings.system = 'METRIC'
bpy.context.scene.unit_settings.scale_length = 1
bpy.ops.object.select_all(action='DESELECT')
for obj in garments: obj.select_set(True)
bpy.context.view_layer.objects.active = garments[0]
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(TARGET))
print('Editable outfit saved:', TARGET)

exec(compile((ROOT/'tools/blender/refine_outfit.py').read_text(), str(ROOT/'tools/blender/refine_outfit.py'), 'exec'))
