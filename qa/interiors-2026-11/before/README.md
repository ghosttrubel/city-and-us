# Current review — wardrobe batch 1 (1 November 2026)

**0.8.2-wardrobe.1 (11)** adds two female and two male everyday reference-based outfits as free, saved Full Outfits, with distinct garment geometry. It includes the Quick navigation zoom-hiding repair. Approved environment direction, customisation and existing gameplay are preserved. This batch has modelling limits and is awaiting owner/device review; other categories and features remain deferred.

[Batch handoff, exact reference selections, limitations and build status](qa/wardrobe-batch-1/HANDOFF.md) · [Labelled software pose comparisons](qa/wardrobe-batch-1/review.html). This newest status supersedes the historical notes below.

**APK status:** source candidate 11 is ready, but the tool-account build failed on SDK android-36/android.jar access. The existing APK is still code 10. Run `node tools/android-local-build.mjs --debug-only` in the ordinary Windows terminal; it also verifies the APK. No publication.

---

# Current update — 1 November 2026

The owner approves the current visual direction. The only new runtime change hides +/− zoom controls while Quick navigation is expanded and restores them when it closes, including navigation-driven closure. Existing tap/hold zoom and immediate cancellation on menu opening remain unchanged. The two-column portrait menu and existing minimum 44px touch targets are retained.

This is a source-only UI repair after build 0.8.1-visual.1 (10); the existing APK does not yet contain it. No publication or APK rebuild was requested for this focused pass. Recovery: checkpoints/2026-11-01-before-zoom-menu; the full previous source/APK checkpoint remains checkpoints/2026-10-31-visual-review-0.8.1.

Next: outfits using images the owner will supply. Do not begin replacement outfits or resume other feature work before those images arrive. Historical modelling limitations remain documented; approval of the direction does not remove them.

---

# Current priority — bounded visual correction (31 October 2026)

Review source **0.8.1-visual.1 (10)**: original skinned everyday shirt panels for female/male, cooler UI/environment, softer home furnishings and distinct Mama T buka details. Continuous seated eating and tap/hold zoom are retained and tested. Saves/customisation/signing/hosting identity are preserved. **Visual acceptance is pending; earlier partial acceptance is superseded.** Body, garment-contact and seated-skirt limits are explicit.

[Handoff and exact commands](qa/visual-correction/HANDOFF.md) · [Evidence/report](qa/visual-correction/REPORT.md) · [Labelled software comparisons](qa/visual-correction/review.html) · [Physical retest](qa/visual-correction/PHONE-RETEST.md) · [Remaining modelling work](qa/visual-correction/ASSET-LIMITS.md). Run `node tools/check-visual-correction.mjs` (includes `npm run check`) and review its logs. Automated checks/software renders are not device acceptance.

**Updated debug APK built and verified:** [Download build 0.8.1-visual.1 (10)](artifacts/android/city-and-us-device-test.apk). All 192 bundled files match the frozen source, the retained debug signature verifies, and signing files are unchanged. SHA256: `32a9d7cc9dfa8556f2df3c4e8b18f77d99994b05645923ac9ca9a0252590ee07`. Twelve automated suites passed, including `npm run check`; physical-device and visual acceptance remain pending. Do not publish. Future rebuilds use `node tools/android-local-build.mjs --debug-only` in the ordinary Windows terminal, then `node tools/verify-android.mjs --debug-only`; the tool account cannot compile against the protected SDK jar.

Further voice/Phone feature work is paused for this visual gate. The completed free Wallpaper flow is retained; unfinished language/voice-selection work is checkpointed outside the runtime. Owner will review future labelled voice samples personally; Nigerian authenticity remains unapproved. [Full Phone app audit and dependencies](qa/visual-correction/PHONE-APPS.md).

All dated notes below are historical and do not override this status.

---

# Portrait-first phone correction — 30 October 2026

Phones now start and play upright. This supersedes all landscape-only/portrait-pause guidance below. Build **0.7.1-portrait.1 (8)** completes the bounded home/Mama T’s correction: readable quick menu/activity controls, portrait camera and safe-area scrolling, garment seam/hem repairs, visible preparation/plates and separated service lanes. Saved stories and customisation remain compatible. The supplied Android screenshots are failed visual acceptance; the new build still needs the exact phone retest.

[Evidence and limits](qa/portrait-first/REPORT.md) · [Phone retest](qa/portrait-first/PHONE-RETEST.md). Run `npm run check`, `npm run check:portrait`, `npm run check:portrait-quality`, `npm run check:physical-home` and `node tools/verify-street-service.mjs --portrait`. Automated/CPU checks and offline previews are not device acceptance.

The updated debug APK was built and verified successfully in the ordinary Windows terminal. A fresh verification confirms all **187 bundled files match the current source and final repair checkpoint**: **no rebuild is needed**. [Download the APK](artifacts/android/city-and-us-device-test.apk) · [Comparison evidence](qa/portrait-first/apk-source-comparison.json). SHA256: `5d29c77b1e82269c4bb86bd0986e003edf3f50a1e9bcd6092626f033c5c990d5`. Confirm **0.7.1-portrait.1 (8)** at the top of Phone → Settings. Signing files were unchanged; physical-phone visual acceptance remains pending. For future source changes, build with `node tools/android-local-build.mjs --debug-only` in the ordinary terminal; the tool account lacks SDK compilation access.

---

# iPhone review repairs — 30 October 2026

Local repairs for conversation audio recovery/Exit, Bisi's blocked route, distinct Ayo branches, automatic visible plating after cooking, and compact text wrapping. Saves, character assets and touch bindings retained. Ayo's new follow-ups are subtitle-only. Automated checks and software food previews pass; physical-phone and browser layout/audio/touch verification remain pending.

[Findings and evidence](qa/phone-fixes/REPORT.md) · [Short phone retest](qa/phone-fixes/PHONE-RETEST.md). Run npm start and use the same origin with /?review=daily; do not reset saves. At the cooker, Finish & plate now completes the meal into your hand. Run npm run check and npm run check:phone-review.

Earlier Android update (before portrait): the debug APK was built/verified. The original signing password is recovered and stored for the ordinary Windows account. Release compilation passes there; the remaining offline lint dependency requires `node tools/android-local-build.mjs --release-only --online` in that terminal. Signed AAB verification is pending. [Signing evidence](qa/android-signing/REPORT.md).


---

# Current review — compact streets, food and dialogue (29 October 2026)

The current files preserve the previous game, characters, ownership and save keys. New work is implemented for review: corner HUD, collapsible objective, hidden-by-default diagnostics, compact meal cards/illustrations, visible plated portions, two-way voiced choices for Bisi and the food courier, busy Ayo responses, additive character gestures/facial approximations, bounded pedestrian routes, gradual lighting, street lamps and adjustable rain/ambience. Voice WAVs are bundled; no paid voice service is used. Physical-phone appearance, pronunciation, touch and performance still require acceptance.

[Milestone evidence and limits](qa/living-streets/REPORT.md) · [Exact phone journeys](qa/living-streets/PHONE-PLAYTEST.md) · [Android source/build guide](android/README.md) · [Store and Data Safety checklist](android/STORE-CHECKLIST.md). Android packaging is now authorised; older “deferred” statements below are historical. No APK/AAB was produced: compilation was blocked by denied access to installed SDK jars; see [Android status](qa/living-streets/ANDROID-STATUS.md). No publication or purchase is authorised/performed.

Run npm start; local review is http://localhost:3000/?review=daily. The Wi-Fi address observed during this session is http://10.222.147.116:3000/?review=daily (same network, server running). Voice audition: /assets/dialogue/review.html. Browser saves are origin-specific. Native Android uses bundled local assets and never this LAN address.

Run npm run check and npm run check:living-streets; existing mobile, physical-home, street-service, daily-life and destination checks remain. No real device verification is implied by these checks. Source checkpoint: checkpoints/2026-10-29-before-living-streets/.

---

﻿# City & Us — Connected destinations review

**Current review, 27 October:** Mainland (existing Surulere/Yaba), reused Victoria Island waterfront and connected Ajah/coast. Playable additions: Tide Courtyard Hotel booking/rest, Lagoon Pot physical takeaways, Lantern Yard beat activity and beach litter/recycling. Church, mosque, police and government-residence sites are mapped but closed. Historical orientation policy (superseded 30 October): portrait previously paused movement; current portrait gameplay is active with no notice. Nearby NPC labels have distance/overlap/occlusion limits and a saved hide setting. [Exact status/report](qa/connected-city/REPORT.md) · [Software previews](qa/connected-city/review.html). Live device/browser verification remains pending. Tutorial/interviews/economy are next; shared social/enforcement/ageing remain planned.

**Previous review, 26 October:** physical meals/leftovers, fridge/cupboard storage, two station-based recipes, compact activity UI, seated study, shower entry/exit and a larger safely migrated home. Home was completed/reported before the warmer street, nearby NPC conversations/selection and Mama T’s two-customer food-service shift. [Home report](qa/physical-home/REPORT.md) · [Street/job report and previews](qa/street-life/REPORT.md). Automated checks pass; new browser/device rendering, touch, audio and performance acceptance remain pending. Checkpoints and all ownership retained; no purchases.

**Owner-confirmed: the game works on iPhone 11.** Preserve that startup and control fix. This update addresses world blur with saved Low (1×), Balanced (1.25×) and Sharp (1.5×) resolution settings, separate from lighting. Mobile shadows stay off; DOM text and SVG UI stay at native browser resolution. Phone → Settings offers a 15-second walk measurement with frame timing/FPS comparisons. Try one step at a time; new physical-phone performance results remain pending owner comparison.

Phone URL: http://10.126.70.116:3000/?review=daily . [Instructions and evidence](qa/resolution/REPORT.md). The working iPhone checkpoint is checkpoints/2026-10-26-working-iphone-before-resolution/ (191 files). Existing saves and character assets are retained. Native Android packaging is deferred.

**26 October: the owner accepts the current appearance sufficiently to continue.** Character replacement and further fashion polish are deferred; the outstanding face, skin, hair, makeup and cloth issues remain in [ROADMAP.md](ROADMAP.md) and the [asset proposal](qa/fashion-review/ASSET-PLAN.md). The accepted appearance is recoverable in checkpoints/2026-10-26-before-daily-life/ (182 files with SHA-256 manifest). The earlier fashion and corrections checkpoints remain intact.

This milestone adds local solo food delivery, one ride-booking service and playable cooking. It reuses current locations and assets, preserves wardrobe purchases/named looks and furniture layouts, and connects needs, game-currency payments, objectives and saves. See [the completion and verification report](qa/daily-life/REPORT.md). Multiplayer, families, elections, police and the fictional financial-crime agency remain planned.

## Run and review

Open the full folder in VS Code and run `npm.cmd start` (or `npm start`). Open http://localhost:3000. No install is needed to play or run the regression checks.

For an isolated daily-life review, open http://localhost:3000/?review=daily. It starts in the furnished home and uses its own save and Player ID. Phone → Food orders meals; Phone → Ride books the single local service. Approach the preparation counter to unpack groceries/select a recipe, collect ingredients from storage, prepare, then use the cooker and plate. Mama T’s service job starts at its outdoor counter. Main story saves remain in the original slot.

For the furnished character/apartment review, open http://localhost:3000/?review=apartment, or Phone → Settings → Open character & apartment review. This uses its own local save and Player ID; your main story remains in the original `lagos-street-v1` storage slot. Return through Phone → Settings → Return to my story. Saves are origin-specific; export/import when changing between localhost and 127.0.0.1 or another host.

The review starts with Amara, a softer character wearing an ivory top, sage trousers and a bob adapted from the already included CC0 hair source. The face/brow/material treatment and idle/walk timing are opt-in through Character style → Soft natural. Existing saves retain their Original style and selected appearance. Male/female, builds, faces, colours, outfits, hair and accessories remain editable. The source skeleton and animation clips remain compatible.

Home now has a screened bedroom, kitchen storage and cooker, computer/work nook, cushioned living area, bathroom fittings and entry console. Approach objects and use Action: sleep, cook, wash, study, computer, wardrobe and sitting (requires a sofa). Activity poses use the existing rig. Cooking now requires chopping, heat control, stirring and serving; Pause preserves the pot. Other timed activities retain Finish and Cancel. Needs → Home & rent changes and saves apartment finishes. Needs → Whole apartment / Close follow switches between overview and close follow; wheel or +/− zooms. Needs → Home & rent → Furniture catalogue opens decorating. Eight original pieces can be purchased, positioned, rotated, moved and stored. Green/red placement feedback checks obstacles and access to installed activities. Layouts and finishes save with your story. Installed activity stations and the original sofa remain anchored.

## Wardrobe and shopping

Use Navigation → Boutique & Salon, follow the green route, enter the physical door and approach the counter. Browse eight categories, turn/zoom the character, test walking or activity poses, and preview before spending game currency. Confirm purchase, then equip; purchasing alone does not equip. Cancel preview restores the equipped look. Saved looks accept names, and the home wardrobe uses the same ownership and looks. Body, face and colours remain editable through the catalogue.

There are 35 fashion entries (including three outfit bundles and a bare-head option), with 11 hair presentations, native wear, separates, dresses, shoes and accessories. These are not 35 independent models: bob/long wig share an adapted CC0 source, bundles reuse separates, and no recolour is counted as a new entry. See [the item manifest](qa/wardrobe-home/catalogue.json) and ASSETS.md for exact contents and provenance. No purchases or service fees were incurred.

## Preserved play

Left joystick or WASD/arrows moves; drag the right side to turn the camera. E/Space or Action interacts. Home and map destinations guide walking rather than teleporting. Physical doors connect Home, Dispatch, provisions and the Yaba/Island interiors. The courier route remains Home → Dispatch parcel desk → provisions handover → Home, with payment once at handover and saved delivery progress.

The circular minimap shows local streets, entrances, facing and collision-checked green guidance; tap it for the optional larger map. Yaba has study/records work; The reused Victoria Island waterfront has groceries/trading, Lagoon Pot and Tide Courtyard Hotel; Ajah/coast is connected for club/beach activities. Ikeja and later international travel remain planned. Distant district scenery unloads. Phone shows working Jobs/Profile/Navigation/Tasks/Settings/Food/Ride screens. Other planned apps and phone customisation remain in ROADMAP.md without placeholder icons. Local Player IDs are not online accounts.

Traits, life goals, needs, skills, rent, groceries, task rewards, customisation, export/import and older version-1 stories remain. Review mode does not inspect or reset the main save. Export a backup before your own acceptance testing.

## Daily-life play

- Food: choose jollof or beans from Mama T’s and a Home, Dispatch or Provisions entrance. Confirm the meal price plus 150 delivery fee. Preparation leads to a physical courier collection and walk to that entrance. Meet the courier outside and use Action to receive; eat from Phone → Food or store the meal. Receipt alone does not restore food. Cancellation before receipt refunds fully, once.
- Ride: one local service connects the marked Home, Dispatch and Provisions stops. Review the fare, confirm, walk to the curb marker and board with Action when the vehicle arrives. The vehicle carries you along the existing road loop. Use Action to alight after it stops. Cancellation before boarding refunds fully; after boarding, End ride takes you to the next stop with the agreed fare retained.
- Cooking: bring one grocery to the home cooker. Chop three times; keep heat between 55 and 75, stir at least twice with a two-second gap, and simmer at least ten seconds before serving. Four seconds in the green band earns a better plate and chef skill; a practice plate still provides food. Meals can be stored/eaten from Food. Cancel during preparation returns the grocery; cancellation after heating uses it. Pause/Close preserves the pot without unattended burning.

Charges, refunds, handover, serving, eating and objective rewards guard against duplicate taps and stale confirmations. Delivery and travel advance while the game is visible, save periodically, and resume after reload without offline catch-up. Cooking advances only while its activity screen is open. Export/import includes all service and meal state. These are device-local solo safeguards, not a shared server ledger.

## Evidence and limits

Read qa/VALIDATION.md for actual results, qa/PLAYTEST-CITY-AND-US.md for owner review, and qa/reference-review/CITY-AND-US-REVIEW.md for media coverage. The new catalogue/pose software review is in qa/wardrobe-home/review.html. Historical correction comparisons are in qa/corrections/review.html; older qa/city-us-*-offline.png files describe the rejected build. Neither is a browser screenshot. Browser lighting/shadows, CSS, native touch and Android performance require separate testing. No visual approval is implied by CPU checks.

For this milestone run `npm run check` and `npm run check:daily-life`. The report distinguishes these automated checks from unavailable browser/device testing. Existing regression commands include `check:neighbourhood`, `check:navigation`, `check:life`, `check:gameplay`, `check:visuals`, `check:review`, `check:review-gameplay` `check:corrections` and `check:wardrobe-home` (each with `npm run`). These checks need no extra packages. The last two cover safe review saves, room reachability, finishes, overview framing, natural character/pose transforms and actual review action handlers using isolated test storage. Optional tools/review-preview.mjs needs sharp and @napi-rs/canvas; these are not runtime dependencies.

## Portable source and ownership

Serve the complete dist folder over HTTP on a static host. game.js integrates play/UI; daily-life.js owns service transactions/progression, daily-world.js reuses scene assets for courier/vehicle, and daily-ui.js provides Food/Ride/cooking screens; character.js and garments.js handle the retained rig and appearance; activity-pose.js adds original poses; interior.js and home-style.js provide the apartment and saved finish palette. camera.js, navigation.js, controls.js, neighbourhood.js, districts.js, life.js and street.js retain their respective camera, route, input, world and simulation responsibilities. server.mjs/server-core.mjs provide portable local HTTP startup. tools/source-assets and ASSETS.md retain editable sources and provenance.

Third-party MIT notices and CC0 provenance remain. No reference artwork, brands, music, meshes or footage were copied into the shipped game. No purchases, subscriptions, new Site or deployment were made. The existing Site identity is now recovered in .openai/hosting.json. The source helper could not connect to the Site Git host, so these changes are local only; never create another Site for this checkout. Android/Play Store is the planned first release, public web later. Costs must be discussed before paid commitments.
