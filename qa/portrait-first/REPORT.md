# Portrait-first and bounded home/Mama T’s correction

Build identifier: **0.7.1-portrait.1 (8)**; Android version name **0.7.1-portrait.1-debug**. Source changes are local; no publication or new venue/features. Current APK build/verification status is recorded below separately from source validation.

## Failed visual evidence and diagnosis

Read reference/city-and-us-quality-references/README.md and inspected all three Android defect images, both requested home compositions, both character-preview examples and the phone organisation reference. Those reference-game images are not licensed game assets and were not copied into the build.

- **1002045066 / cream panel:** this is the quick navigation menu. A legacy .game-header nav button selector forced near-white text onto its cream surface. Explicit menu foreground/background rules now win; navigation and activities collapse the menu/Needs. Cream activity buttons also now have explicit dark text. Unrelated world overlays hide while menus/conversations/activities are active.
- **Clothing:** rigid cream seam tubes detached from animated sleeves. Covered trouser geometry remained under skirts. Catalogue skirt weights followed opposing calves, pinching/splitting the hem; the saved orange legacy dress instead used a separate pelvis-only shell. The surface seams now taper continuously, covered leg fabric is removed, and legacy/catalogue dresses share a subdivided articulated skirt with a bounded continuous hem and small procedural motion. Waist fit is narrowed. Saved outfit IDs, colours, purchases and equipped choices are unchanged.
- **1002045073 / service:** arriving and leaving customers used the same path, the player ignored customer collision, and repeating an action could reverse facing by assigning only one Euler component after quaternion animation. Queue and exit lanes are separated, existing tables moved sideways to clear them, player collision added, and whole facing is reset per action. Board/pot/handover positions now differ appropriately. Preparation runs visibly once with resumable substeps. Fresh collected service meals are open plates. Duplicate floating order labels are suppressed; payment guards retained.
- **Cooking view:** awning collision forced the camera too close. During portrait service the cutaway rig keeps the intended working distance; home/service actions select a side view and allow further camera dragging while movement remains safely stopped. Compact controls occupy the bottom zone. Food placement, carry/serve/eat/store and persistence remain.
- **Home surfaces:** existing room zones, furniture ownership, stations and paths retained. Shared small original maps distinguish wood, fabric, tile and stone; metal uses different roughness/metalness. Indoor illumination no longer stacks the outdoor day/weather sun strength with the room light. Bathroom tile retains its material identity when home finishes change. Pot handles improve its silhouette. No claim of physical cloth simulation or new authored animation assets.

## Portrait implementation

Portrait startup is active with no rotation notice. Background/native pause still clears input safely. A close-follow portrait projection raises the player above bottom controls; tablet/desktop keep wide framing. Circular minimap and compact HUD occupy top corners; joystick and Action stay bottom-left/right. Phone apps and catalogue scroll inside safe-area/visual-viewport bounds. Keyboard resize retains physical orientation, clears held input and scrolls the focused field. Android requests portrait and adjustResize.

## Validation and limits

All final source suites passed: npm run check, check:portrait, check:portrait-quality, check:physical-home, check:mobile, and node tools/verify-street-service.mjs --portrait. See automated-results.json, journey.json, quality-checks.json and the named logs for exact results. They use actual game modules, meshes, rigs and handlers with DOM/GPU/media/storage doubles. They cover portrait startup/input/keyboard, camera sizes, dialogue recovery/branches, visible meal meshes and reachable placement, doors/reloads/eating/portions, menus, wardrobe ownership and service state/collision. They do **not** establish browser layout, touch feel, WebGL materials, device audio or performance.

PNG files here are **offline software mesh previews**, not Android/browser screenshots; their simplified lighting does not validate the new native light/material response. The built-in browser reports no available browser. Physical-device retest remains pending and supplied Android acceptance remains failed until the new identified build is reviewed. The retained humanoid and procedural garments still have limited fabric drape, fitted torso shape and procedural hand contacts; those are asset/animation limitations, not a claim to match the reference character art.

## Android build — verified current APK

The owner completed `node tools/android-local-build.mjs --debug-only` in the ordinary Windows terminal at 2026-10-30T15:02:20.715Z. Both build and debug verification exited 0, with signing files unchanged. A fresh `node tools/verify-android.mjs --debug-only` also passed.

- APK: [city-and-us-device-test.apk](../../artifacts/android/city-and-us-device-test.apk), 8347958 bytes.
- SHA256: `5d29c77b1e82269c4bb86bd0986e003edf3f50a1e9bcd6092626f033c5c990d5` (matches the owner-supplied hash).
- Native version: **0.7.1-portrait.1-debug**, code **8**; Settings shows **Build 0.7.1-portrait.1 (8)**.
- All **187 bundled source/assets files**, including **39 voice clips**, match current dist byte-for-byte. Current dist also matches the final saved repair checkpoint. **No rebuild is needed.**
- Debug signature, portrait orientation, keyboard adjustResize, target SDK 36 and absence of unexpected permissions verified.
- This handoff update changes documentation/evidence only, outside the packaged dist/native source.

[Comparison evidence](apk-source-comparison.json) · [Fresh artifact verification](../../artifacts/android/verification-debug.json) · [Ordinary-account build status](../../artifacts/android/local-debug-status.json). Physical phone verification and visual acceptance remain **pending**.

Historical tool-account compilation failed because Windows denied SDK android-36/android.jar access; the successful ordinary-account build supersedes that delivery blocker. Future source changes should use the same ordinary-terminal debug-only command. The signed release AAB remains a separate pending task; no release or publication is claimed here.

## Existing venue audit and bounded scope

Home and Mama T’s are this correction’s acceptance gate. Further application is deferred until these are reviewed, as the reference pack requests. Existing source audit: Dispatch has parcel shelves/counter but shares a small shop shell; boutique has racks/mirrors/preview but needs proportion and material review; the hotel has reception/rest with basic furniture; eatery reuses a venue shell/counter/pot; club has a DJ station/dance floor/seating but needs its material/light identity reviewed. No closed church/mosque/police/government site was opened. Remaining venue identity work is tracked in ROADMAP.md.

Recoverable pre-edit sources are under before/; prior full checkpoints and all third-party MIT notices remain. [Exact phone retest](PHONE-RETEST.md).
