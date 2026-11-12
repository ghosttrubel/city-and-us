# Garment handoff — visual workflow on hold

Owner instruction: stop runtime cloth work and further cosmetic changes or garment approximations. Settle visual fidelity to the supplied outfit images and the visual asset workflow before continuing. No runtime cloth prototype or solver was implemented; the last cloth task was a read-only feasibility assessment.

## Current assets

Editable sources are in art/blender/batch-01; active exports are in dist/assets/garments.

| Design / fit | Blender source | Active game export | Triangles |
| --- | --- | --- | ---: |
| Charcoal square-neck crop + washed-black jeans / female | Square_Denim.blend | Batch01_Square_Denim.glb | 18,839 |
| Ivory tank + light-blue wide jeans / female | Tank_Denim.blend | Batch01_Tank_Denim.glb | 16,471 |
| Butter-yellow relaxed tee + blue baggy jeans / male | Male_Everyday.blend | Batch01_Male_Everyday.glb | 16,663 |

All retain the existing 65-bone character skeleton, five material batches and separate selectable top/bottom parts. The original approved source art/blender/Square_Denim.blend remains intact. These are current fitted approximations; exact visual fidelity to the references has not been established. Plain backs were inferred.

## Texture and material setup

- Top_Knit: neutral 256×256 procedural knit base-colour texture, multiplied by the player's top colour.
- Top_Binding: solid material following the top colour.
- Jeans_Denim: neutral 512×512 procedural weave/wash base-colour texture, multiplied by the player's bottom colour.
- Jeans_Stitch: bottom colour blended 12% toward #c8c1b1 for contrast.
- Hardware: fixed metallic colour, unaffected by garment recolouring.

The GLBs embed textures. Fabrics are nonmetallic, with roughness 0.98 for top materials and 0.9 for denim/stitching; hardware uses metallic 0.65 / roughness 0.45. No garment normal or roughness texture maps are currently exported. The maps are generated fabric detail, not textures faithfully extracted or baked from the supplied outfit images. Reference crops are used for catalogue cards and comparison.

The runtime in dist/wardrobe-garments.js shares garment geometry and clones materials for independent player dyes. Garments follow skeleton bones; there is no runtime fabric draping or body-collision solver. Do not describe bone animation or legacy procedural sway as simulated cloth.

## Saved workflow and next decision

Original images remain in reference/outfits. Individual designs, crop bounds and original hashes are in art/reference-catalogue/manifest.json. Catalogue IDs/default palettes are in dist/fashion-catalogue.js. Migration and legacy ownership archives remain in dist/wardrobe-state.js; no browser saves or player colours were changed for this handoff.

Existing authoring/export tools: tools/blender/build_replacement_batch.py, tools/blender/export_replacement_batch.py, tools/stage-replacement-garment.mjs and tools/replacement-workflow.mjs. npm run wardrobe:export exports edited Blender files; it does not add cloth physics. Do not rerun builders, generate more approximations or expand the wardrobe until the visual asset workflow is settled.

The next decision is how to obtain/model garments and author materials that faithfully reproduce the supplied silhouettes, construction and surface detail. No new visual workflow is selected in this handoff. Keep original designs, editable sources, recolouring and saves intact. Automated visual capture remains pending; software diagnostic renders are not in-game screenshots.

A scoped checkpoint of the current garment sources, exports and related runtime/tool files is saved at checkpoints/2026-11-04-visual-workflow-hold-132740. The manifest there records copied files and SHA-256 hashes. Existing environment, interior palettes and controls remain untouched.
