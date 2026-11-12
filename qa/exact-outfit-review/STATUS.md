# Superseding update — 4 November 2026

Blender is installed. The editable Blender source, neutral recolour materials and validated export workflow are documented in [the Blender workflow](../../art/blender/README.md). The isolated game review now loads Square_Denim_Blender.glb. The older candidate below is preserved; this historical report no longer describes the current exporter. Live game captures remain pending because the Browser connection is unavailable.

---

# One outfit — model candidate built, live visual evidence pending

Owner resumed correction on 2 November 2026. The required designs are the supplied images. The rejected wardrobe is not visually accepted. No batch replacement, new Site, publication or APK rebuild occurred. Existing environment, boutique/interior work, menu/zoom controls and normal story saves are retained.

## Source inventory and selected design

reference/outfits contains **75 PNG images and four text files; no supplied GLB, GLTF, FBX, OBJ, BLEND or other 3D asset**. The complete file inventory and checked tools are in inventory.json.

Original file: reference/outfits/Female_Wardrobe_Collection/01_Casual_Streetwear/Denim_and_Everyday_Tops.png.

Selection: **rightmost column**, charcoal fitted square-neck long-sleeve cropped top and washed-black wide-leg jeans. The blue denim and other two tops are not this selection.

The exact original PNG is copied byte-for-byte to dist/assets/outfit-references/Denim_and_Everyday_Tops.png and used directly as this item's catalogue reference picture. SHA-256 matches 0e598a28b8c15e1b7ebe283005b540612c6d6577daa5e86af441babdc399aadb. The card identifies the rightmost column and links to the isolated prototype review. It does not present the reference as a screenshot of the current garment. Other catalogue entries await their own batches.

The owner explicitly authorised a **plain matching back, clearly marked inferred**, because the supplied sheet only shows fronts.

## Inspected tools and actual modelling

No Blender executable was found in PATH, the checked Program Files/Local Programs directories, or project tool directories. Available tools include Node, the existing Three.js geometry/skinning code, GLTFLoader, geometry merging/welding, and local canvas/Sharp diagnostic tooling. No tool or asset purchase/download was made.

The rejected ref-square uses lowered circular torso rings, separate sleeve rings, generic leg surfaces, automatic nearest-body weights and repeated fabric. The candidate instead has independent fitted garment surfaces with connected shoulder/arm topology, a clipped rounded-square neckline, bound edges, explicit waist/cuff/hem cuts, authored wide-leg reshaping and separate construction details. Skinning is transferred from the compatible retained CC0 body topology, with detail weights taken from the garment surface and constrained to the correct leg.

Portable source: dist/square-denim-outfit.js. Exporter: tools/export-square-denim.mjs. Actual asset: **dist/assets/garments/Square_Denim_Review.glb** (approximately 1.22 MB), with five material batches, 15,753 vertices and 26,630 garment triangles in the measured candidate. Small original fabric/denim maps are embedded. The original outfit picture is NOT a character texture or a plane on the body. The retained rig license is included beside the GLB; existing MIT/third-party notices are preserved.

The GLB is loaded only for the outfit review. Normal play keeps the rejected old implementation until approval. No entry, source reference, thumbnail or owned/equipped ID was deleted.

## Visible construction and limits

| Source feature | Candidate construction / outstanding evidence |
| --- | --- |
| Fitted charcoal top; squared neckline with rounded corners | Separate fitted cloth, explicit neckline cut and binding; continuous shoulders/sleeves. Actual rendered fidelity still requires live review. |
| Close long sleeves and narrow cuffs | Full-length mesh to the wrist, bound cuffs and small elbow folds. Fine crease positions remain simplified. |
| Cropped stitched lower edge | Cut hem and bound edge. The sheet has no body measurements; the small gap above the jeans is a fitted interpretation to review. |
| Washed black wide-leg jeans | Independent widened leg mesh with pooling/crease displacement and charcoal wash/weave texture. Fine fade distribution and fabric grain are recreated, not pixel-identical to the PNG. |
| Waistband, belt loops, metal button, fly | Separate skinned construction geometry and stitching; upper waist follows the retained avatar. |
| Curved front pockets and coin-pocket detail | Surface-projected pocket mouths/stitches; coin pocket is on the reference's front-left image side. Internal pocket bags are not visible or simulated. |
| Long wide hems and side/inseams | Raised seam geometry bound to the corresponding trouser leg; hem folds are simplified. |
| Back | Plain matching construction, inferred with owner permission; no invented decorative back-pocket design. |
| Seated fit | Existing sitting pose plus garment skin weights; detached seam defects were repaired. Upper-jeans weights were biased toward the pelvis to reduce waist lifting. The latest software diagnostic still shows an uneven seated waist and conspicuous seam lines that need refinement. Geometry checks pass, but contact, compression folds and hidden clipping are not visually certified. No cloth simulation or authored seated corrective shapes are claimed. |

Remaining fidelity work, if required after the first actual captures: refine the garment UV wash/crease painting against the source, sculpt the hem/elbow folds, and author seated corrective shapes with collision/contact checks on the retained rig. A mesh/UV editor such as Blender can edit the delivered GLB; the game itself needs no Blender installation. A supplied back design would replace the inferred back. Do not describe these limits as an exact match.

## Actual game review and capture

Run npm start from the checkout, then open:

http://localhost:3000/?review=outfit

This is the actual running game, starting in the existing boutique with the candidate on its player. It uses city-and-us-exact-outfit-review-v1 and city-and-us-exact-outfit-review-player-id; the normal story, daily review and interior review are separate.

Open “Single outfit review · source & capture” at the top. Front, Side, Back and Seated buttons set the real player/rig pose and game camera. “Walk normally” restores control and the original position. “Download source + four game views” reads the game's WebGL canvas directly and places those four captures beside the unchanged source PNG. It exports only after the user invokes it; no screenshots are fabricated or uploaded. The resulting filename is square-denim-actual-game-four-views.png.

**Actual screenshots have NOT been captured in this session.** The Browser skill reports iab unavailable and an empty browser list. The capture feature and WebGL pixels have not been live-browser tested. Diagnostic PNGs in this folder are software mesh renders, not actual in-game screenshots and not acceptance evidence. The requested visual gate therefore remains open. Do not ask for approval as though the four actual captures were already delivered.

## Verification

- npm run check: source syntax, including the two new modules.
- tools/verify-exact-outfit.mjs: original PNG identity, actual exported GLB loading, five skinned batches, normalized valid weights, finite geometry and bounded edges in front/side/back/seated poses; old ownership/equipment/named looks preserved. Geometry checks do not establish visual match.
- tools/verify-exact-outfit-game.mjs: shipped game with DOM/renderer/storage doubles; normal story stays on the old appearance, the isolated review loads the actual GLB, four view controls work, walking restores position, reload works, main save/identity remain byte-identical.
- tools/verify-boutique-journey.mjs: existing boutique entry, preview/cancel, duplicate-charge protection, equip/look/reload, stylist/fitting routes, exit and interior-review save isolation.

Final logs and JSON reports are in this folder. No real user save was opened or changed by tests. Phone FPS, touch usability, GLB appearance under real lighting and screenshot download still require live browser/device checks.

## Replacement and migration gate

First obtain actual front/side/back/seated evidence and owner approval of this one outfit. Only then promote the replacement behind the stable outfit-f-square-denim ID. Preserve owned IDs, equipped slot IDs, named looks, receipts, balances and customisation. If later designs require different IDs, add a versioned alias migration, test old imports/reloads/duplicate IDs and keep rollback source; never remove owned entries or delete files blindly. No batch promotion/migration was performed now.

All accessible-interior tasks remain separate in ../interiors-2026-11/CHECKLIST.md. This wardrobe pass did not alter their geometry or staff implementation.
