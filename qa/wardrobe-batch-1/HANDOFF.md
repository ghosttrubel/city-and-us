# Wardrobe batch 1 — 1 November 2026

Review source: **0.8.2-wardrobe.1 (11)**. The owner approves the existing visual direction. Scope is only two female and two male everyday outfits from the supplied reference sheets, plus the already-authorised menu/zoom repair. No publication or paid assets/services.

## Implemented selections

All source images were inspected before modelling. Exact file hashes and image positions are in references.json.

| Wardrobe name / saved ID | Reference selection | Implemented shape |
| --- | --- | --- |
| Cropped tee & joggers / outfit-f-crop-joggers | Female_Wardrobe_Collection/01_Casual_Streetwear/Fitted_Tops_and_Baggy_Joggers.png — left cream tee/grey joggers | Short torso, short sleeves, high waistband, roomy legs, narrow ankle cuffs |
| Square neck & wide jeans / outfit-f-square-denim | Female_Wardrobe_Collection/01_Casual_Streetwear/Denim_and_Everyday_Tops.png — right dark long-sleeve top/jeans | Lower squared neckline with visible chest skin, long sleeves, wide open hems |
| Relaxed tee & baggy jeans / outfit-m-relaxed-denim | Male_Wardrobe_Collection/01_Casual/Everyday_Tops.png — bottom row second tee; Baggy_Trousers_Shorts.png — top row right jeans | Longer/wider torso, longer short sleeves, loose straight full-length legs |
| Camp shirt & cargo shorts / outfit-m-camp-cargo | Male_Wardrobe_Collection/01_Casual/Everyday_Tops.png — top right shirt; Baggy_Trousers_Shorts.png — bottom row third shorts | Open neckline, folded collar panels, placket/chest pocket, knee-length shorts with raised side pockets/flaps |

Paths above are relative to reference/outfits/. They are design references, not rigged models or texture maps. Reference sheets are not bundled in the APK. No other clothing categories, hairstyles or accessories were changed.

## Implementation and saves

New original skinned top/bottom panels live in dist/reference-outfits.js. Four geometry profiles change torso dimensions, neckline, sleeves, leg shape, hem and cargo details. The trousers join through a shared crotch boundary rather than overlapping a hip shell. Covered original cloth is removed to avoid dark patches; the open necklines retain the necessary exposed skin. The existing skeleton, animation clips, skin, body builds and environment remain.

Phone → Profile → Change my look → Owned → Full Outfits. Two new looks are listed for the selected female/male body. All four are free and added to existing valid saves during migration without equipping them or changing money, colours, owned items or named looks. Outfit IDs use the existing full-outfit slot, colour controls and saved-look flow. Changing body sex still fits the equipped panels to the retained rig; browsing shows that body's two new options. Existing footwear/hair/accessories are retained. Four generated catalogue thumbnails show the actual meshes.

The Quick navigation menu still hides zoom while expanded and restores it on closure. Continuous eating, tap/hold/release zoom and cancellation remain. Runtime source is frozen in source-manifest.json; do not quietly change it while an ordinary-account build is running.

## Evidence and limits

- Focused verification: node tools/verify-wardrobe-batch.mjs. Four outfits × four builds; normalised skin weights; independent geometry; covered old top/trouser groups removed; 24 sampled frames each of walking, sitting and eating; no non-finite/exploded vertices. Actual wardrobe handlers equip/reload, preserve custom colours and save named looks. The menu's visibility state is also checked. Results: checks.json.
- Regression: node tools/verify-visual-milestone.mjs passed: 52 camera-changing taps, held/released/cancelled zoom, movement zoom preservation, continuous eating/full/cancel/leftovers, Wallpaper/save compatibility. Test doubles do not establish real touch hit-testing.
- Required syntax: npm.cmd run check — final status below.
- review.html and the 16 pose PNGs are labelled SOFTWARE RENDERS, produced from runtime geometry. First review exposed an overlapping hip seam and missing exposed neckline skin; both were corrected and images regenerated. Final front/three-quarter standing/walk/sit/meal views were visually inspected. The eating view uses the game's dining-seat position, facing and hand targets.
- This is a stylised first batch, **not an exact reproduction or proof of zero clipping**. Separate sleeve/torso joins and approximate nearest-body weights can crease or reveal seams at raised shoulders/elbows. The upper torso remains somewhat boxy on the muscular retained base. Smooth lower-leg panels lack the reference denim/sweatshirt folds, weave, stitching, drawstrings and sewn cuff thickness. The open collar, placket and pocket flaps are coarse panels, not finished tailoring. Cargo pockets may protrude too stiffly while seated. Deep crotch/hip compression and contacts need physical review across angles.
- Exact improvements required for closer reference fidelity: an editable joined shoulder/underarm mesh, deliberate UV seams/material textures, hand-painted arm/hip weights, seated/arm-raised corrective shapes, and authored collar/placket/pocket thickness. The available procedural surface builder cannot infer those details or physically accurate cloth drape from a front-only PNG. These limits remain unfinished modelling work; do not call the sheets faithfully reproduced.
- No actual browser/phone captures or physical-device acceptance are claimed. Modest-device performance remains to be checked. Existing visual-direction approval does not automatically accept this batch.

## Build commands and status

Run from the project root in the ordinary Windows terminal:

```powershell
npm.cmd run check
node tools/verify-wardrobe-batch.mjs
node tools/verify-visual-milestone.mjs
node tools/render-wardrobe-batch.mjs
node tools/android-local-build.mjs --debug-only
node tools/verify-android.mjs --debug-only
```

The render command regenerates the four shipped thumbnails; run it before building, not during a frozen build. Expected output: artifacts/android/city-and-us-device-test.apk. Settings must show **Build 0.8.2-wardrobe.1 (11)**; native debug version is **0.8.2-wardrobe.1-debug**, code **11**. Build attempt/result will be recorded below. The prior APK (code 10) must not be described as containing these outfits or the menu repair.

Signing keys, hosting identity and MIT notice are unchanged (preservation.json). Do not regenerate keys, uninstall/reset saves, publish or create another Site. Use an in-place signed update.

## Recovery and next action

Before batch: checkpoints/2026-11-01-before-wardrobe-batch contains the runtime including the menu repair and original metadata. The older complete source/APK checkpoint remains checkpoints/2026-10-31-visual-review-0.8.1. Final batch source will be checkpointed as checkpoints/2026-11-01-wardrobe-batch-1; private keys remain at their original locations.

After the verified build is installed, open Full Outfits on each body and try both looks. Customise shirt/trouser colours, save a named look and reload. Turn through front/back/sides while walking, sitting and eating, especially broad/slim shoulders, crotch/knees and cargo pockets. Finish a continuous meal without standing between portions. Expand the menu: all items including Guide home must remain accessible and zoom hidden; close it and check tap/hold/release zoom. Record device/OS/build with screenshots. Review these four before expanding the batch. Other categories, hairstyles, accessories, voice and new features remain deferred.

Final focused checks: all four commands above completed with exit 0 (syntax, wardrobe batch, zoom/eating/save regression, software renders). See final-checks.json. Final checkpoint matches all 199 manifest entries (197 runtime files plus build.gradle and package.json). No runtime files changed after freezing.

## Final Android result

The tool-account build failed at compileDebugJavaWithJavac with AccessDeniedException on C:/Users/SeniorBaby/AppData/Local/Android/Sdk/platforms/android-36/android.jar. Evidence: debug-build.log and local-debug-status.json in this directory. All signing hashes remain unchanged. **No updated APK was produced.** The existing artifacts/android/city-and-us-device-test.apk remains build 10, SHA256 `32a9d7cc9dfa8556f2df3c4e8b18f77d99994b05645923ac9ca9a0252590ee07`, and does not contain this batch/menu fix.

Next action: in the owner’s ordinary Windows terminal at the project root, run `node tools/android-local-build.mjs --debug-only`. This includes artifact verification; if needed rerun `node tools/verify-android.mjs --debug-only`. Do not change the frozen source during that build. On success, record native code 11, Settings build ID, APK SHA256 and all 197 matching bundled files before installing in place. Then carry out the four-look phone retest above. Do not reset saves or replace keys.
