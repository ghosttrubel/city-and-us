# Blender replacement batch 1 — 4 November 2026

The charcoal outfit's visual direction is approved. Its clarity refinements and the added tank/tee outfits await the owner's actual in-game screenshot review. This batch implements three outfit cards and six independently selectable garments. Remaining designs stay planned and unavailable to wear.

## Implemented catalogue

| Outfit ID | Top ID | Bottom ID |
| --- | --- | --- |
| outfit-f-square-denim | top-f-square-charcoal | bottom-f-washed-black |
| outfit-f-tank-denim | top-f-scoop-tank | bottom-f-blue-wide |
| outfit-m-relaxed-denim | top-m-relaxed-tee | bottom-m-blue-baggy |

Female tops and bottoms can be mixed across both female outfits. Male pieces use the retained male skeleton. Every active card uses its own cropped reference thumbnail. No sheet is displayed as a single clothing item.

The 75 original PNG sheets are indexed as 470 individual design records, with four additional outfit bundles. Six design records and three bundles are implemented. 438 individual crops use isolated source components; 32 use individual regions for touching designs or designs made of disconnected parts. These region crops remain subject to edge review before later modelling batches. Original source hashes and crop bounds are in [the manifest](../../art/reference-catalogue/manifest.json); [browse the planning inventory](../../art/reference-catalogue/index.html).

## Migration and preservation

Rejected full outfits, tops, bottoms, dresses and headwear are excluded from active shops, wardrobe cards and NPC garment rendering. Old IDs remain readable for importing older saves. The current character renderer selects implemented Blender garments only; body, hair, footwear and other customisation remain available.

Wardrobe version 2 stores an exact copy of the old wardrobe in wardrobe.legacy. Old equipped garments and saved-look equipment receive valid replacements, free of charge. Old paid entitlements remain in that archive. Active ownership, saved-look names and colours, money, identity, progress, furniture and other non-wardrobe state are retained. Re-import/reload is idempotent. Changing body type selects compatible garments without deleting ownership or named looks.

The original approved Square_Denim.blend is byte-for-byte unchanged. All 75 source-image hashes are checked. Earlier assets and source remain intact. A pre-change checkpoint is at checkpoints/2026-11-04-before-wardrobe-replacement. Tools used simulated storage for save tests; they did not access the owner's browser saves. Approved environment, boutique geometry and input controls were not edited. Third-party licenses remain intact.

## Assets and mobile budget

| Garment asset | Triangles | Garment material batches | Rig bones |
| --- | ---: | ---: | ---: |
| Square_Denim | 18,839 | 5 | 65 |
| Tank_Denim | 16,471 | 5 | 65 |
| Male_Everyday | 16,663 | 5 | 65 |

Each GLB is about 1 MB, below the 2 MiB limit. Each avatar shares immutable garment geometry and has independent dye materials. Neutral 256px knit and 512px denim textures support light and dark colours; jeans stitching follows the bottom dye, while hardware stays unchanged. No new per-frame fabric simulation or shader was added. These are asset-budget checks, not measured Android frame rates.

## Verification

PASS: npm run wardrobe:export (including rig, migration, geometry and shipped-game save-isolation checks) and npm run check. Additional outfit/recolour and fashion-preview regression checks passed. See export-workflow.log, npm-check.log, outfit-check.log and fashion-review.log. The checks cover all retired items for both bodies, save round-trips, body changes, mixed tops/bottoms, original hashes, 60 build/combination/pose cases, surface orientation, independent dyes, shared geometry and five material batches. The shipped-game journey uses DOM/WebGLRenderer/storage doubles to verify review controls and main-story save isolation. It does not validate browser pixels or touch hardware.

Repeat with npm run wardrobe:export, npm run check:wardrobe-replacement, npm run check:outfit and npm run check. [Editable source instructions](../../art/blender/batch-01/README.md).

## Actual visual review — pending

Automated browser capture is explicitly pending. The owner will provide screenshots from a normal laptop browser. Do not retry the unavailable in-app Browser.

Open http://localhost:3000/?review=outfit for the actual game in a separate review save. Open Quick menu → Review for front, side, back, seated and source-comparison capture. The panel is closed by default and closing it restores normal controls. The plain back is inferred. Other batch garments can be selected in the wardrobe. http://localhost:3000/fashion-review.html provides a separate live character study with image saving and no story-save access.

[Reference and software geometry comparison](review.html). These diagnostic PNGs are not game screenshots. Actual boutique/street lighting, fine clipping, visual fidelity and mobile frame rate remain for in-game/device review. No publication or APK rebuild was performed.
