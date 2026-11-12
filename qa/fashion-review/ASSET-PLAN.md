# Character and fashion asset decision — 26 October 2026

The existing assets do not meet the requested natural-character quality. The small collection is a review study, not visual acceptance. Do not expand the catalogue until this gate is passed.

## Inspected limitations

- Both runtime bodies are Quaternius Superhero meshes. Their muscular proportions, strong brow/jaw silhouette and painted angular skin shading remain visible. The current morphs and bone-only clips cannot supply soft facial expressions. The source colour maps contain painted highlights rather than detailed skin suitable for close portraits. Swatches preserve the existing diffuse and normal detail; they cannot create missing skin detail.
- Bob, short cuts and buns are opaque mesh shells. Braids, locs and cornrows are solid procedural tubes. Head attachment is maintained, but none supplies convincing strand texture, scalp parting or fine hairlines. More spheres or tubes will not fix that.
- Most clothing is a cut/inflated body surface; skirt/tunic extensions are surfaces of revolution. The narrower iro and senator profiles reduce bulk but do not create sewn panels, a real wrapper overlap or fabric-specific drape. Seated cloth still follows approximate weights. The other gowns and agbada are unresolved.
- The face-pigment study paints the retained UV atlas, retains albedo detail and uses the original normal map. It is only in the isolated study, not purchasable or saved makeup. Lash meshes, expressive faces, face-specific makeup masks and final tone calibration need replacement-asset work.
- The current accessory slot allows one of earrings/glasses/chain, plus independent headwear and shoes. Headwear hides/tucks hair. The notice now states that before purchase and before trying hair under a hat. Independent jewellery slots and hair-specific fit rules remain unfinished.

## Free alternatives checked against primary sources

| Candidate | Use and licence | Fit for this task |
| --- | --- | --- |
| MakeHuman / MPFB core body, natural skin packs, brows/lashes | Core graphical assets are CC0. Community packs have individual licences. [Core licence](https://www.makehumancommunity.org/about/license.html), [official asset packs](https://static.makehumancommunity.org/assets/assetpacks.html) | Recommended: generate one adult male and one adult female with natural proportions; retain body parameters in editable source. Natural male/female skins and brow/lash packs provide a better base for close portraits. This is a proposed asset choice, not a downloaded or tested replacement. |
| Blender Studio Rain and Snow | Free character rigs under CC-BY; attribution required. [Rain v1](https://studio.blender.org/characters/rain/v1/), [Snow v2](https://studio.blender.org/characters/snow/v2/) | Alternative expressive stylised art base. These are Blender production rigs, not drop-in mobile game characters: simplification, material baking, rig export and body-customisation work would be larger. Their default identities are not the requested customisable Nigerian cast. |

MPFB's documented GameEngine materials and rig are the appropriate export starting point, rather than its render-only layered skin shader. See [export guidance](https://download.makehumancommunity.org/mpfb/docs/exporting/index.html) and [material guidance](https://www.makehumancommunity.org/mpfb/docs/materials/index.html). The [Blender extension](https://extensions.blender.org/add-ons/mpfb/) provides body parameters and automatic rigging. These sources establish capability and asset terms, not visual acceptance of an exported model.

## Smallest practical next asset milestone

1. Author exactly two adult characters with MPFB core assets and licensed natural skin maps. Keep editable Blender/project sources; export an optimised GLB with skin, eyes, brows and lashes. Start with one shared 1K skin atlas per character and measure memory before increasing it. These are proposed budgets, not measured device results.
2. Retarget the existing idle/walk and activity bone motions to the exported rig using an explicit bone map and preserved bind transforms. Retain old save IDs, body options, ownership and wardrobe item IDs; introduce versioned appearance assets rather than resetting stories. Check all four existing body builds before swapping runtime defaults.
3. Author/finalise only three hair assets per character, using fitted scalp meshes and textured strands/cards with bounded transparency. Fit a casual look and native/formal look per character using separately UV-mapped garment panels and painted weights. Include a sewn wrapper overlap, buba sleeve construction and proper senator tunic/trousers; do not claim recolours as designs.
4. Fit a coordinated jewellery/shoe selection and UV masks for lipstick, blush and liner. Add lashes only when they follow each eyelid. Verify dark, medium and light complexions, side views, movement and removal.
5. Capture the same neutral-light front/side/face/full-body views beside the supplied 1001988093 00:16.155 frame and wardrobe interaction frames. Verify real browser and a modest Android phone. Obtain visual acceptance before adding catalogue entries.

No asset was bought, no service was subscribed to and no new Site was created. No external replacement asset was integrated. This proposal has zero asset purchase cost; art/export/retargeting work remains. Any later paid option requires discussion first. Preserve the existing MIT and CC0 notices.
