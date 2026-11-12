# Blender → game: one outfit

Selected design: **rightmost charcoal square-neck long-sleeve cropped top and washed-black wide-leg jeans** in `reference/outfits/Female_Wardrobe_Collection/01_Casual_Streetwear/Denim_and_Everyday_Tops.png`. Original PNGs are unchanged. The plain matching back is inferred under the previously recorded owner permission.

## Edit and export

Open `art/blender/Square_Denim.blend` in Blender. It contains:
- `EXPORT_Outfit`: the retained 65-bone rig and five garment meshes.
- `REFERENCE_Existing_Character`: the original fitting body and packed design sheet.
- `WORKFLOW_README`: concise editing instructions.

The garment seed is the previous project-authored fitted candidate, preserved at `art/blender/Square_Denim_Seed.glb`. The fitted top, square neckline, connected shoulders/sleeves, cropped hem and construction details carry forward from that candidate. The Blender pass rebuilds the jeans with connected quad topology through the crotch and legs, refits seam details, stabilises waistband weights, prevents cross-leg weight transfer, separates dye from neutral weave/wash textures and tones down stitching contrast. Pocket bindings follow the jeans colour.

Keep the existing rig names, hierarchy, joint positions and rest pose. Edit garment vertices/UVs/weights. Apply mesh modifiers before export; keep one material per mesh, at most four normalized influences per vertex, and the existing material names.

Tested authoring tools: Blender 5.2.3 LTS and Node 24.18.0 (Node 24 supports the compressed-source validation).

From the project folder:

```sh
npm run outfit:export
npm run outfit:render
npm run check
npm start
```

`outfit:export` opens the saved source in background Blender, exports only the garment/rig, normalizes bone ordering to the existing game rig, stages `dist/assets/garments/Square_Denim_Blender.glb`, and runs rig, recolour, pose and game-save checks. On a failed staging/test command it restores the previous staged GLB. It does not save over the editable Blender source. The earlier review GLB remains intact.

Blender is found under Program Files on Windows, the standard app location on macOS, or PATH on Linux. Set `BLENDER_BIN` to an alternative executable path if needed. There are no absolute machine paths embedded in the source workflow. The optional authoring dependencies (`sharp` 0.35.5 and `@napi-rs/canvas` 1.0.13) are pinned in package.json. On a fresh machine, run `npm install` once before authoring checks. The game still needs no Blender or npm packages.

`npm run outfit:init` creates the source only if missing. `npm run outfit:init -- --rebuild` deliberately rebuilds it from the preserved seed and overwrites that source; do not use this after manual artist edits unless you intend to discard them.

## Materials and game review

| Blender material | Game control |
| --- | --- |
| Top_Knit | Top colour, neutral knit detail |
| Top_Binding | Top colour |
| Jeans_Denim | Jeans colour, neutral wash detail |
| Jeans_Stitch | Separate fixed muted stitch material |
| Hardware | Separate metal material |

Dye factors stay separate from texture pixels. Each avatar owns its material instances. The two colour controls in the outfit review change that preview only; they do not alter saved looks or another avatar. Reference colours restores the charcoal selection.

Open **http://localhost:3000/?review=outfit**. The actual game loads the Blender-exported GLB in the existing boutique. Open “Single outfit review · source & capture” for front/side/back/seated views, colour controls and the actual WebGL capture download. “Walk normally” returns control. The existing normal wardrobe IDs, equipped items, owned items, named looks, balances and main save slot are retained. Promotion to normal play waits for visual review of this one outfit.

## Evidence and limits

The images in `qa/blender-outfit/blender-*.png` are **Blender studio renders of the exported asset on the game character in game-generated poses**, not game screenshots. Geometry/skin deformation is sampled from the actual game modules and GLB; lighting is Blender's. They do not certify mobile rendering or performance.

The in-app browser is unavailable in this session, so live game screenshot verification remains pending. The existing source-and-four-view capture button remains available for that review. No additional outfits, normal wardrobe replacement, publication or APK rebuild.

The reference supplies no body dimensions or back view. Fabric drape, wash placement, proportions and seated waist/contact need visual judgment. There is no cloth simulation or authored seated corrective shape. A rig/geometry pass is not evidence of an exact visual match.

Retained character licensing: `dist/assets/characters/License_Standard.txt`; animation licensing: `dist/assets/characters/License_Animations.txt`. Existing third-party MIT notice is unchanged. Recovery checkpoint: `checkpoints/2026-11-04-before-blender/`.

Exporter settings follow Blender's [official glTF export API](https://docs.blender.org/api/5.0/bpy.ops.export_scene.html), with installed-operator execution checked in Blender 5.2.3.
