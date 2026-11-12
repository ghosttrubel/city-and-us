# Character and cloth limits — 31 October 2026

The current presentation is **not accepted**. Earlier partial acceptance is withdrawn for this gate. Do not expand the catalogue.

## What changed in actual geometry

The retained Quaternius female and male superhero GLBs and their skinning were inspected. The original fitted top was the same anatomical body surface with a cloth material; this preserved breast/pectoral and abdominal shading and silhouette. The everyday streetwear/tee now removes that surface and uses the original skinned torso/sleeve panels in dist/everyday-clothes.js (976 triangles per top). Three nearest bind-pose samples blend normalised skin weights. Sex-specific dimensions, neck/hem/cuff topology, smoothing and draw geometry are real mesh changes. Geometry generation is cached per body; the existing bone rig, custom colours, builds and save/outfit IDs remain.

An attempted radial trouser reshaping caused knee fins in software comparisons and was removed. Existing trousers use a small allowance adjustment; they have **not** become fully authored loose trousers. The final software comparisons deliberately expose this limit.

Legacy day/evening dress profiles are narrower and the continuous hem has bounded left/right thigh influence. Covered leg fabric remains removed. This mitigates a rigid cone and some dark intersections; it does not supply real sewn panels, cloth contact or seated drape. The legacy dress still has inadequate seated coverage/drape and body-derived upper shaping. Never call this dress reference-quality or fully repaired.

## Exact modelling/replacement work still needed

- Author a female and male everyday outfit in an editable Blender source with joined shoulder/underarm topology, neckline thickness, proper trouser crotch/knee edge loops and UV seams. Paint elbow/shoulder/hip weights; create seated and arm-raised corrective shapes. Current separate tee panels reduce the anatomy imprint but still approximate shoulder/cuff joins and folds.
- Replace the superhero torso/body proportions if the owner rejects its muscular arms, narrow waist, brow/jaw and skin shading. Export a natural adult female and male base, preserve all four build choices, and provide an explicit bone map/retargeted idle, walk, sit, eat and cooking clips before swapping runtime bodies.
- Replace revolved skirt shells with panel topology, sewn overlap where appropriate, hem thickness and painted cloth weights. Add seated/knee-contact corrective shapes or a bounded cloth solution; the current pelvis/thigh averaging cannot supply a seated fabric envelope.
- Existing opaque hair shells/procedural braids cannot provide strand detail or a proper scalp hairline. Fit a small licensed hair-card set after body acceptance; do not expand colours/catalogue entries as a substitute.

Free candidate: MakeHuman/MPFB **core graphics** are CC0, per the [official licence](https://static.makehumancommunity.org/about/license.html). Additional community assets need their own licence check. The official [export guidance](https://static.makehumancommunity.org/mpfb/docs/exporting/index.html) recommends the GameEngine rig/materials and removal of helper/hidden geometry for external use. This is a verified candidate, **not an imported or game-tested replacement**. Retargeting and mobile optimisation remain required; do not hot-swap an untested body and break existing saves/wardrobe.

No assets were purchased or fetched into the game. Existing MIT/CC0/Apache notices remain. The new shirt and furniture topology, material maps and UI styling are original local source.
