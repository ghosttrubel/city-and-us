# Wardrobe, Shopping and Home Decorating — 25 October 2026

The owner's accepted corrections were preserved. This milestone continues the existing source, characters, controls, doors, routes, activities and version-1 save keys. It does not restart the earlier visual milestone or add districts, government, families or multiplayer.

## Play

Open http://localhost:3000 with the existing local server running (npm start from the project folder if needed). This is a local playable link, not a published internet deployment. No new Site was created: the checkout has no hosting identity manifest to safely reuse.

Use Navigation → Boutique & Salon, follow the route, cross its door and approach the counter. Preview an item; rotate/zoom the character or choose a walking/activity pose; buy with confirmation; equip; open Saved looks and name the equipped look. Cancel preview restores the real equipped appearance. Return home to the wardrobe for the same inventory and looks. Body, face and colour customisation remains available. The focused test also changes body type/sex after purchase, then reapplies a named look and confirms that the new body settings remain intact.

At home: Needs → Home & rent → Furniture catalogue. Shop, select a piece, confirm its game-currency price, tap the apartment floor or use the position controls, rotate and Place. Green/red outlines and text explain placement validity. My furniture selects owned pieces for moving or storing. Closing/cancelling before Place leaves the saved layout unchanged. Existing finishes still save from Home & rent.

## Delivered contents and limits

| Category | Entries | Actual contents |
| --- | ---: | --- |
| Hair | 12 | Braids, locs, afro, close crop, bob, twin updo, cornrows, high puff, twist crown, long sweep wig, pixie, bare head |
| Full Outfits | 3 | Casual essentials, varsity, tracksuit bundles |
| Tops | 3 | Tee, blazer, wrap blouse |
| Bottoms | 3 | Slim trousers, wide trousers, shorts |
| Dresses | 2 | Pleated day dress, long evening dress |
| Native Wear | 4 | Ankara, agbada, senator, iro & buba |
| Shoes | 3 | Trainers, ankle boots, loafers |
| Accessories | 5 | Hoops, glasses, chain, gele, fila |
| Furniture | 8 | Side table, coffee table, bookcase, woven cabinet, floor lamp, palm planter, stripe rug, indigo runner |

**35 fashion entries and eight furniture entries**, with 43 actual mesh thumbnails. Fashion includes 16 free starter entries and 19 game-currency purchases. This is not a claim of 35 independently authored models: the three outfit bundles reuse components, bald has no geometry, and bob/long wig adapt the same retained CC0 source. Recolours are not counted. See catalogue.json and ../../ASSETS.md for IDs, prices and provenance. No external assets, subscriptions or services were bought; existing Quaternius CC0 and Three.js MIT notices remain intact. All new geometry/patterns are local original source.

Installed bed, cooker, bathroom, desk, wardrobe and legacy sofa remain anchored; the eight new catalogue pieces are movable. Existing sofa purchasing/sitting remains functional. New furniture collection capacity is 40 pieces; saved looks capacity is 24. Rugs can layer over the installed floor textile. Clothes use the retained skeleton and procedural garment weights, without simulated cloth. Dresses include covered underlayers to prevent unintended exposure. The broad native robe and seated hems are stylised and need live visual review. No claim of production-ready cloth or physical-device performance is made.

## What was reviewed

The project README/ROADMAP and the four updated owner notes were read before implementation. The earlier complete reference review remains in ../reference-review/CITY-AND-US-REVIEW.md: seven videos reviewed through 170 sampled frames and 41 supplied stills across the accumulated work, not an audio playback claim.

For this milestone, reopened appearance-flow-reference-only.png, decoration-shop.jpg and home-furnishing.jpg, plus recording 1001988127-clean sheets 1 and 2. Relevant catalogue frames: approximately 00:41.90 (item price/wearing state), 00:45.15 (category cards), 01:01.40 (hair catalogue/owned state), 01:04.40 (focused shoe preview) and 01:07.90 (wig preview and wear action). The 01:11–01:14 frames connect the wardrobe back to the physical home. These are sampled reference frames; no reference artwork, brand or audio was copied into the game. The previously documented navigation-reference limitation remains: no clear complete example of the requested always-visible circular street-route behaviour was established, so the written requirement governs the preserved navigator.

Opened and inspected software renders from the actual new meshes: all catalogue thumbnails, broad female/male garment standing/walking/sitting sheets, hairstyle poses, representative cooking/washing/study/sleep sheets, and close/whole-apartment furnished examples. The fit pass exposed and corrected seated long-skirt deformation, robe chest coverage, collar trim crossing the shoulders and cropped/tiny product previews and gaps inside the high-puff silhouette. The apartment review caught new rugs being hidden below the old floor textile; their layer height was corrected. These are software previews with simplified lighting, not browser screenshots or a visual-acceptance claim. See review.html and the images in this folder.

## Automated evidence

The focused journey uses the actual shipped game modules, scene meshes, joystick handlers and UI handlers with isolated DOM, WebGLRenderer, timer and storage doubles. It is not a live browser. No user browser save was read or replaced.

The journey started with ₦15,000, bought cornrows for ₦850, a coffee table for ₦1,200 and a lamp for ₦850, and reloaded at **₦12,100**. Repeated confirmation callbacks charged once. Cornrows remained owned/equipped; “Bode afternoon” remained saved. The table remained placed at x=1.5, z=0.1, rotated 180°; the lamp remained owned in storage; warm finishes survived. Cooking, washing, study, sleep, wardrobe and the matching exit remained reachable using collision-aware walking routes. Moving/storing furniture updates camera cutaway registrations so old pieces do not leave stale camera obstacles. See journey.json and verify-wardrobe-home.mjs.log.

Relevant checks: npm run check; existing life, neighbourhood, navigation, review, review-gameplay, corrections, visuals and gameplay suites; new decor state and wardrobe/home journey checks. Results are in regressions.json and the per-suite logs. The fashion matrix exercises 35 entries × two character types × four builds = **280 combinations**, with idle, walking, sitting, cooking, washing, study and sleeping = **1,960 pose samples**. It checks finite skinning, hair/headwear attachment, visibility, materials, frustum/cutaway handling, transactions, ownership, looks and save roundtrips. See fashion.json. Geometry checks do not certify clipping-free live appearance.

The furniture state checks cover insufficient funds, once-only charging, collision/door/activity obstruction, walking access, rotation, storage, repositioning and save roundtrips. Every catalogue piece has usable placement space in the furnished apartment. HTTP checks returned 200 for the game, relevant modules and all 43 product thumbnails; see http.json. The accepted checkpoint's **97 files** all matched their SHA-256 hashes; see checkpoint-verification.json. Prior character assets and third-party notices were retained.

## Live browser/device evidence and remaining review

**No live rendering or device test was available.** The supported browser tool reported zero sessions, including the final availability check. There is no genuine browser screenshot, native-touch test, Android frame-rate result or live CSS verification in this report. Responsive portrait/landscape styles and touch/mouse controls are implemented; automated projections/events are separate evidence. The owner can proceed with the local playable link, but this new milestone's live visual acceptance remains pending.

Remaining review: portrait/landscape catalogue readability and scrolling; touch rotation/zoom and placement; actual WebGL lighting/culling; skirt/sleeve fit in all combinations; modest-Android frame rate and memory after repeated catalogue use. Existing phone customisation, playable mini-games and physical ride/food fulfilment remain separate unfinished roadmap items, with no nonfunctional icons added. The prior accepted correction milestone stays closed unless a concrete new defect is reported.
