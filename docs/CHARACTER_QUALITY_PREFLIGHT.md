# Female and male quality samples — capability gate, 4 November 2026

Status: reference inspection and sample selection complete; new samples and isolated review scene NOT implemented. The owner authorises exactly one female and one male playable Blender sample, but explicitly asks for an early obstacle report if the available workflow cannot deliver the reference quality. This gate stops further substitute modelling; it is not a request for additional permission.

## Inspected polish references

- reference/character-style/ChatGPT Image Nov 4, 2026, 01_58_05 PM.png — 162 × 350; refined stylised face, styled updo, fitted embellished bodice and satin skirt.
- reference/character-style/ChatGPT Image Nov 4, 2026, 01_58_21 PM.png — 512 × 512; polished fashion-game faces, shaped flowing hair, clean garment silhouettes, distinct leather/cloth/metal surfaces.

Both pictures depict women. Apply their finish and detail level to the male sample while retaining male anatomy. These are the character-polish targets; actual clothes come only from the outfit sheets below. Preserve a range of skin tones and body types, rather than copying the reference skin colour or one body shape.

## Selected supplied outfits

Positions are counted from the top left. These are planning selections only; no catalogue availability or ownership is added.

| Sample | Exact source file | Sheet position and design | Existing individual reference IDs |
| --- | --- | --- | --- |
| Female — ivory tailored suit | reference/outfits/Female_Wardrobe_Collection/02_Corporate_Executive/Executive_Wear.png | Left column: row 1 ivory double-breasted blazer with gold buttons; row 2 matching wide-leg trousers | ref-female-executive-wear-r1c1; ref-female-executive-wear-r2c1 |
| Male — charcoal pinstripe suit | reference/outfits/Male_Wardrobe_Collection/02_Corporate_Executive/Executive.png | Left column: row 1 charcoal double-breasted pinstripe blazer; row 2 matching trousers | ref-male-executive-r1c1; ref-male-executive-r2c1 |

Female source SHA-256: d3ce1fd3ec42bb6208008605392c1b02c9609d782dcc777cdb11daf2f4c38111

Male source SHA-256: 058b6a5429de670ef7130c8942538e2658539e1053b7145a3480dd7ee236f8ee

Keep tops and bottoms separate, with their own cropped thumbnails and IDs. Do not treat an entire sheet as one wearable item. The style images do not authorise replacing the chosen clothing design with their dresses or skirts.

## Specific obstacle

Blender is installed and can author/export the required geometry. The obstacle is the quality of the available assets and the automated authoring workflow, not the absence of Blender or a need for cloth physics.

The available character sources are the existing Quaternius superhero bases and basic hair meshes. Existing female/male diagnostic renders show the gap in face anatomy, hair silhouette and garment tailoring; these are offline software diagnostics, not live-game evidence. The current Blender builder derives garment surfaces from the existing body and simple generated geometry, then adds procedural knit/denim colour textures. It does not provide newly sculpted fashion-quality heads/hair, tailored suit construction or fitted body variants. No dedicated 3D asset-generation tool is exposed in this session. Scripted edits are possible, but I cannot reliably deliver the requested visual standard through another procedural approximation pass.

A credible next asset step is skilled Blender character/garment authoring (or suitable licensed editable bases followed by that authoring): refined female/male heads and hair; separate tailored jackets/trousers with lapels, openings, pockets and seam structure; UVs and authored/baked normal and roughness detail; neutral colour textures and dye masks. Fit and skin those assets to the retained skeleton, with body-type fitting and seated/walking deformation checked. Blender is capable of this work; installing it alone does not supply these assets or guarantee the reference finish.

## Preserved acceptance scope

- Exactly two playable samples in a separate review scene, with no normal-save reads/writes or catalogue promotion. Preserve the existing game, environment, controls, original files and ownership.
- Skin-tone, body-type and player colour controls must remain functional. Check dark and light skin, all existing body types, and independent jacket/trouser recolouring without erasing fabric detail.
- Capture close-up faces, full outfits, walking and seated views of each actual in-game sample; label references and renders accurately. Nothing here is a completed sample or live comparison.
- Use mobile-conscious meshes, shared textures, restrained material/draw-call counts and baked surface detail; measure on target phones before claiming performance acceptance.
- No runtime cloth physics. Skeleton-driven deformation must be described as such. No additional collection items, places or vehicles.
- Automated browser capture remains pending. The owner will supply normal-browser screenshots; do not retry the disconnected in-app Browser.

Current preserved assets and their material setup remain documented in [GARMENT_HANDOFF.md](GARMENT_HANDOFF.md). No Blender assets or runtime files were changed by this capability assessment.
