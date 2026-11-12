"""Historical one-time repair for the first refit vertex layout.
Not part of normal export; do not run on an artist-edited source. New init
constrains inner folds before weight transfer in refine_outfit.py.
"""
import bpy
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
obj=bpy.data.objects['Jeans_Denim']
count=0
for v in obj.data.vertices:
    side=1 if 543<=v.index<2015 else -1 if 2015<=v.index<3487 else 0
    if not side or v.co.z>=.84:continue
    if v.co.x*side<.006:v.co.x=side*.006;count+=1
    weights={}
    for group in v.groups:
        name=obj.vertex_groups[group.group].name
        if name.endswith('_l') or name.endswith('_r'):name=name[:-2]+('_l' if side==1 else '_r')
        weights[name]=weights.get(name,0)+group.weight
    for group in obj.vertex_groups:group.remove([v.index])
    for name,weight in weights.items():
        g=obj.vertex_groups.get(name) or obj.vertex_groups.new(name=name)
        g.add([v.index],weight,'REPLACE')
obj.data.update()
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'art/blender/Square_Denim.blend'))
print('Kept folds and weights on their own leg; clamped vertices:',count,flush=True)
