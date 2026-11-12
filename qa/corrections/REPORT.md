# Focused corrections — 24 October 2026

**Correction candidate; visual acceptance pending.** The owner rejected the preceding build. New features and district expansion are paused. This pass changed the existing implementation, retained saves and customisation, and made no purchase or deployment.

Open [the before/after review pack](review.html). To play locally, run npm start and open http://localhost:3000/?review=apartment. The review uses its separate save; the main lagos-street-v1 slot and existing identity are preserved. Existing review selections remain saved rather than being reset.

## Recoverability

[Pre-edit checkpoint](../../checkpoints/2026-10-24-before-corrections/RESTORE.md): 94 files, including shipped source/assets, tools and prior notes/evidence, with a SHA-256 manifest. Browser saves were neither read nor reset. Git metadata was unavailable, so this is a filesystem checkpoint rather than a commit. Existing MIT/CC0 notices are retained.

## References actually reviewed

Read README, ROADMAP, AGENTS, latest progress/validation, and city-and-us-references/README.md, REFERENCE-INDEX.md, AUDIO-CONTEXT.md and AGREED-PLAN.md before editing. The already merged agreed plans remain in ROADMAP; this correction request supersedes feature work.

The preceding review covered **all seven included videos through 170 timestamped frames and all 41 still images**. See [the coverage audit](../reference-review/CITY-AND-US-REVIEW.md). This was frame sampling using installed VLC, not uninterrupted playback or audio listening. This correction pass re-read that audit and re-inspected the home and navigation sheets below; it does not claim a second continuous review of every clip. Audio interpretations remain owner-supplied summaries, not independently verified narration.

Navigation timestamps re-inspected:

| Recording | Time | What is visible |
| --- | --- | --- |
| 1001988127 | 00:29.15 and 00:51.65 | Vehicle/travel presentation and Map controls. |
| 1001988234 | 00:28.90, 00:32.15 and 00:35.15 | Streets/driving and a small, partly cropped minimap. |

Neither clearly demonstrates the complete requested circular minimap, green street route, facing and deviation rerouting together. **The written navigation requirement governs.** The apartment comparison also revisited 1001988060 at approximately 00:39–01:14 and whole-house-reference.jpg: distinct zones, timber, trim, upholstered furniture, warmer light and a readable furnished cutaway. No reference artwork or music was shipped.

## Implemented corrections and limits

**Hair.** The representative selected review preset is the natural-style bob. Imported bob/bun/buzz hair files are rigid meshes attached to Head, not independently skinned hair. Their source materials specify doubleSided; the old replacement material silently used FrontSide. That culls the inner faces of the thin hair shells as the head turns. The replacement now retains two-sided rendering, computes authored mesh bounds, and tags the avatar to exclude it from environment cutaways. Head attachment/local transforms, visibility, opacity and frustum bounds were checked across every selectable hair style, both sexes, four builds and both character styles. Bone-local transforms stayed stable. No evidence justified changing the skeleton or disabling all frustum culling.

**Important remaining limitation:** the reported complete disappearance was not reproduced live. The before bob samples still show hair. The material defect is confirmed and fixed; the whole reported symptom cannot be declared resolved from software previews. The owner's actual browser-selected save could not be inspected because no browser session was available. The avatar exclusion is a guard, not a claim that camera fading was the observed cause.

**Apartment.** Interior entry defaults to close follow. Whole-apartment framing now fits the room envelope to aspect ratio and rotation rather than a fixed zoom. Indoor obstruction handling cuts geometry instead of collapsing the camera against furniture. Added perimeter construction/trim, a recessed entrance, rounded mattress/pillows/blanket, cabinet fronts/toe-kick, supported chair, folded curtains, physical furniture detail, small local wood/weave textures and lower room-light intensity. Seven existing activity stations and saved finish controls remain usable. Furnished room geometry is 4,884 triangles. The portrait whole-room view remains width-limited and leaves vertical space; close follow is the useful normal play view. These changes are not an assertion that the home meets the owner's visual standard.

**Doorways.** Approach and align with the existing entrance, open the leaf, walk to the actual door plane, continue walking under a brief threshold cover, and continue from the corresponding interior/exterior plane. The cover is fully opaque during the scene switch; movement is not replaced by a stationary fade/teleport. The door then closes. Interior/exterior heading and return entrance are retained. Existing facade solids were split to create recesses, and signs/columns were cleared from the doorway. During an interrupted transition the persisted location stays at the last safe point; it commits after crossing. Separate scenes are still used.

**Navigation.** Always-visible circular minimap retains facing and green routing. The route now prefers actual streets/pavements, keeps street-aligned turns with a turn cost, and rejects diagonal shortcuts. The remaining path is reused while following it; deviation triggers a new collision-checked search. The secondary map derives roads, pavement edges, roofs, water and entrance pins from world coordinates. The existing world's road network is still cross-shaped in places; no fictitious streets or districts were added to disguise that layout.

## Evidence reviewed

The review pack contains matched before/after hair samples; all seven selectable hair states (including bald) in idle/walk/turn/cooking; portrait/landscape close and overview room views; eight samples each for complete entry and exit; and six route samples including deviation/rerouting and arrival at Dispatch.

These are **CPU software mesh/SVG previews**, not browser screenshots or captured gameplay videos. They use the source meshes, bone transforms, camera/cutaway logic and route data. The renderer was corrected to honor material sidedness, inherited visibility, vertex colours and canvas/data texture types. Invalid intermediate exports were replaced. It still approximates lighting and opacity, lacks real GPU shadows/PBR and does not establish CSS/native touch correctness. Door cover and minimap composites use source opacity/route data, not a captured DOM. Review-page sliders step through samples; timing is not a video recording.

## Automated tests

All nine suites passed; individual logs and exit results are in this directory, summarized in checks.json:

- npm run check: shipped module/server syntax, including doorway.js and interior-camera.js.
- check:corrections: 112 character combinations, 2,688 sampled idle/walk/turn/activity poses, 96 hair meshes; all 14 entry/exit timelines check covered switch, continuous local motion, heading and correct endpoint.
- check:navigation: 49 entrance pairs, 50,829 collision movement samples, maximum 8 route nodes; route reuse/deviation, seven real aperture clearances, 304 camera sweeps and restoration.
- check:gameplay: actual handlers with synthetic joystick input complete Home/Dispatch/shop/Home and retained existing venue journeys; payment, migration, customisation and reload/import/export remain valid. Every tested transition saves during the covered switch and verifies its safe checkpoint and final heading/location.
- check:review and check:review-gameplay: seven reachable activity points, style persistence, separate review/main identity, sleep/seat alignment, finish/cancel guards, computer progression and four camera aspect ratios.
- check:life, check:neighbourhood and check:visuals: retained simulation/collision/delivery rules, save validation, original 32 sex/build/outfit combinations, animation and finite geometry.

Tests use disposable in-memory saves and DOM/renderer doubles. They do not manipulate the owner's browser save and do not establish multiplayer/elections or real-device performance.

## Live acceptance remains open

The Browser skill was used for discovery; browser enumeration returned no available sessions. No live rendered before/after, real touch or physical Android evidence was obtained. Visual acceptance, natural doorway feel, live hair stability and modest-device frame rate remain unverified. Do not move on to new features or expansion on the strength of passing tests. No new Site was created; existing hosting identity must be recovered before any publication.
