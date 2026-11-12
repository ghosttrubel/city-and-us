# Single-outfit Blender review — 4 November 2026

The selected rightmost charcoal square-neck crop/washed-black jeans is now an editable, rigged Blender asset and a game-review export. The earlier seed, original design images, original character/skeleton, normal wardrobe IDs and normal saved stories are retained.

## Files and commands

- Editable source: [Square_Denim.blend](../../art/blender/Square_Denim.blend).
- [Full editing/export workflow](../../art/blender/README.md).
- Game export: `dist/assets/garments/Square_Denim_Blender.glb`.
- [Labelled source/render comparison](outfit-review-sheet.png) and [all views](review.html).
- Local game: http://localhost:3000/?review=outfit .
- `npm run outfit:export` validates and stages the saved Blender source.
- `npm run outfit:render` samples the actual exported game asset/poses and makes Blender renders plus a comparison sheet.
- `npm run check:outfit` runs asset, motion/recolour and game-save regressions.

## Work completed

The existing fitted top and construction details were brought into Blender. The jeans were rebuilt with connected quad topology through the crotch and legs, fitted to the existing character, and weighted from the retained garment/rig. Raised details were refitted to the new surface; the upper waistband uses consistent pelvis weights. Inner folds stay on their corresponding leg. Pocket bindings follow jeans dye without adding a draw call.

Five material batches separate top knit, denim, top binding, stitching and metal hardware. Neutral detail textures remain separate from dye factors, allowing light and dark recolours. The actual game review provides independent top/jeans colour controls; materials are cloned per avatar.

Final asset: **1,257,716 bytes; 25,376 triangles; 15,350 vertices; 65 retained bones; five material batches**. SHA-256: `759c04a162f792b70d6f4510349fb5d0426fb5ac133b2d0230aeca835d443f97`. The local server serves identical bytes (HTTP 200).

## Verification

Passed:
- `npm run check`, including workflow script syntax.
- Actual GLB load, finite positions, normalized weights and four-view deformation checks.
- Idle/walk/seated across slim, average, athletic and broad builds; 12 sampled frames per pose. Maximum measured triangle edge: 0.2122 m.
- Independent recolouring, neutral detail-map range, unchanged metal hardware and no colour leakage between avatars.
- Real game-module journey with DOM/renderer doubles: review asset load, camera controls, return to movement, reload, normal wardrobe retention and main save/identity isolation.
- Original reference PNG identity and earlier review GLB preservation.

Evidence: `staging.json`, `verification.json`, `rig.log`, `recolour.log`, `game.log`, `check.log`, `served-asset.json` and `preservation.json`.

## Visual evidence and limits

The five pictures are **Blender studio renders of the exported asset on the existing game character in game-generated poses**, not live game screenshots. The source comparison is a labelled crop of the unchanged original PNG.

Front, side and back inspection show the cleaned trouser surface without the previous pinched triangles/crotch opening. The seated review has a continuous waistband/crotch surface. These views do not establish hidden collision clearance, all-animation fit or phone performance. The plain back is inferred under prior owner permission.

The fabric wash, fine creases, pocket construction and drape remain simpler than the reference. This is a first outfit candidate for visual review, not an exact-match or completed wardrobe-batch claim. There is no cloth simulation or authored seated corrective shape.

The in-app Browser is unavailable (empty browser list). Actual game WebGL screenshot, touch and phone-performance checks remain pending. The existing review capture button can produce source/front/side/back/seated game views when opened in a working browser.

No additional outfits, normal-play replacement, publication or APK rebuild. Existing third-party MIT and character licenses are preserved. Recovery: `checkpoints/2026-11-04-before-blender/`, plus the retained seed and pre-refit Blender source.
