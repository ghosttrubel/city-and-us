# Bounded visual correction — 31 October 2026

Candidate **0.8.1-visual.1 (10)**. The owner rejects the inherited visuals; earlier partial acceptance is superseded. This is a review candidate, not visual acceptance. No publication, purchase, new Site, multiplayer or election work.

## Evidence reviewed

All five latest iPhone images were inspected directly in reference/ (October 30 filenames at 03_54_09, 03_54_20, 03_54_30, 03_55_00 and 03_55_10). They show cropped portrait home framing, a seated bite followed by standing at 3/4 and 2/4 portions, and the seven-app Phone screen with low-contrast welcome text. Exact paths/hashes/findings: reference-evidence.json. The older October 26 image was not treated as latest evidence.

Also inspected the supplied home/city camera references IMG_0097–0099 and IMG_0101, character-preview references IMG_0088/0089, all three rejected Android defect screenshots, and the pack README/instructions. These remain reference-only, outside shipped assets.

## Changes

- Actual clothing topology: two everyday fits now use separate skinned shirt torso/sleeve panels instead of the anatomical body surface with a cloth material. Existing tee surface is removed to prevent overlapping patches. Sex-specific dimensions and blended normalised weights retain the rig and saved builds/colours. Cached original geometry keeps generation cost bounded. The catalogue count did not grow.
- Legacy skirt shell profiles/weights were adjusted and covered fabric stays removed. These are mitigations; proper seated drape and realistic cloth remain unresolved. See ASSET-LIMITS.md for exact replacement/modelling work. No claim that all clipping or the superhero-body limitation is solved.
- Environment/UI: cool grey/soft white/muted blue-teal/charcoal replace the dominant brown palette. Natural skin values and saved clothing colours remain. Floor, fabric, tile, paint and metal use separate materials; home lighting is cooler/less stacked. Mobile shadows remain off, with one inexpensive instanced contact-shade layer at home.
- Starter home: rounded mattress/pillows, a padded headboard, split sofa cushions/arms, rounded dining/work seats, softened tabletop, window/art/backsplash features. Existing station positions and collision/access routes are preserved. Saved finish IDs remain compatible with the revised coordinated palette.
- Mama T: raised striped canopy avoids head-height obstruction, a specific buka sign, food-display shelves/plates, work surface/front panel, wash-up detail and order/collection signage. Existing service/queue/departure lanes and exactly-once pay remain.
- Eating: Eat opens and enters one continuous seated meal; each completed portion updates food once. It stops when full, finished or cancelled. Stop eating / Stand up retains leftovers; incomplete bites do not award nutrition. Portion mound/spoon animate.
- Camera: removed the redundant portrait and overview clamps and city collision shortening of user zoom. Every tap changes distance; held pointer repeats smoothly and stops on cancellation/lifecycle/menu changes. Follow preserves chosen distance. Home overview, Follow and Inspect presets ease; world obstructions fade. Range extends beyond the room to city scale, with finite/near-plane/depth safeguards only.
- Wallpaper was implemented before the owner changed priority and is retained: six free original CSS designs, gallery/preview/apply/save. No other app placeholders. See PHONE-APPS.md.

## Validation boundaries

All twelve final suites passed, including npm run check. See automated-results.json and named logs for actual results. Tests run shipped game handlers, real rig geometry, camera projection and save logic with DOM/WebGL/media/storage doubles. They include every-tap/held zoom, input cancellation, continuous seated meals/full/cancel/reload, old save compatibility, ownership/customisation, portrait controls, home cooking and Mama T job pay/cancellation.

The final garment-specific check covers both sexes and all four builds in idle/walk/eat/cook with normalised weights, finite geometry and no duplicate original shirt surface. It does not certify visual fit.

review.html compares before/after software renders of current mesh/pose code. Each PNG is labelled SOFTWARE RENDER. Their lighting is simplified and omits live CSS, real WebGL shadows/material response and some transparency. The in-app browser reported no available browser; no actual browser or device screenshots of this candidate were obtained. Physical-device acceptance is pending in PHONE-RETEST.md.

## Android and protected files

The ordinary-account debug build succeeded after the tool-account compilation failure. The protected SDK failure remains archived in tool-account-android-build.log. Fresh artifact verification passed: **0.8.1-visual.1-debug, versionCode 10**, all **192** packaged source files match, 39 retained voice clips, retained debug signature, portrait configuration and permissions verified. APK: [city-and-us-device-test.apk](../../artifacts/android/city-and-us-device-test.apk), 8,356,281 bytes. SHA256: `32a9d7cc9dfa8556f2df3c4e8b18f77d99994b05645923ac9ca9a0252590ee07`.

The verifier derives versionName/versionCode from build.gradle and rejects stale extra bundled assets. Signing files and hosting identity are unchanged by hash; no keys were replaced. Source/checkpoint equality is recorded in checkpoint-verification.json. See HANDOFF.md for exact commands and next action. No physical-device acceptance or publication is claimed.

## Paused work

The owner explicitly made this bounded visual correction the priority. Incomplete language/voice-selection work, labelled audition page and partial generation are recoverable under checkpoints/2026-10-31-before-visual-correction/voice-progress and that checkpoint's dist. They are **not shipped** in this review candidate; the previous 39 bundled voice clips and text fallback remain. Owner will personally approve Nigerian wording/pronunciation when voice work resumes. Premium voice and wallpaper packs remain planned, with no fake purchase controls or essential dialogue locks.
