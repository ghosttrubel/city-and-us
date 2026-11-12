"""Keep pocket bindings in the jeans dye channel without an extra draw call."""
import bpy, bmesh
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
binding=bpy.data.objects['Top_Binding']
jeans=bpy.data.objects['Jeans_Denim']
trim=binding.copy();trim.data=binding.data.copy();trim.name='Pocket_Bindings'
bpy.data.collections['EXPORT_Outfit'].objects.link(trim)
for obj,keep_low in [(trim,True),(binding,False)]:
    bm=bmesh.new();bm.from_mesh(obj.data)
    remove=[v for v in bm.verts if (v.co.z>=1.12 if keep_low else v.co.z<1.12)]
    bmesh.ops.delete(bm,geom=remove,context='VERTS')
    bm.to_mesh(obj.data);bm.free();obj.data.update()
assert len(trim.data.vertices)>0
trim.data.materials.clear();trim.data.materials.append(jeans.active_material)
for poly in trim.data.polygons:poly.material_index=0
if trim.data.uv_layers.active:trim.data.uv_layers.active.name='Denim_UV'
bpy.ops.object.select_all(action='DESELECT')
jeans.select_set(True);trim.select_set(True);bpy.context.view_layer.objects.active=jeans
bpy.ops.object.join()
assert len(jeans.data.materials)==1
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'art/blender/Square_Denim.blend'))
print('Pocket piping now follows jeans colour; five material batches retained',flush=True)
