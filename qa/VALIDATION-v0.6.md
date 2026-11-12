# Visual navigation validation — v0.6, 23 October 2026

Implementation is complete locally. Automated acceptance is separate from rendered browser and physical-device acceptance. The latter two remain NOT RUN. No multiplayer or elections are implemented.

## Automated checks

| Command | Result and evidence |
| --- | --- |
| npm.cmd run check | Passed: shipped modules and server syntax, including camera.js, navigation.js and districts.js. |
| npm.cmd run check:neighbourhood | Passed: joystick, collision/sliding, entrances, room stations, delivery proximity/exact-once payment and malformed spatial saves. qa/neighbourhood.json. |
| npm.cmd run check:navigation | Passed: all 49 entrance pairs, 39,353 movement samples, no route through obstacles/water, deviation routing, real floor-height intersections, 304 building camera turns, cutaway restoration and unloaded camera resource release. qa/navigation-camera.json. |
| npm.cmd run check:life | Passed: retained traits, study/home bonuses, activities, needs, migration and interior geometry. qa/life.json. |
| npm.cmd run check:gameplay | Passed: actual game and assets driven by synthetic joystick/Action handlers; delivery, four public venues, cross-district walks, unloading, save/reload and cross-district export/import. qa/gameplay.json and qa/connected-delivery.json. |
| npm.cmd run check:visuals | Passed: 32 character combinations, idle/walk deformation, colours/rig/garments and CPU street geometry. qa/geometry.json. |
| Local HTTP | Current files return 200, match local bytes and have appropriate MIME types. qa/http-v06.json. This is source-serving verification, not rendered testing. |

The tests use isolated in-memory saves; the user's real browser storage was not accessed. The visual-character tool now writes its temporary stage to tools/qa-visual-stage.txt so it does not overwrite the handoff in tools/qa-progress.txt. Third-party MIT and character provenance files remain intact. No new dependencies are needed for the six checks.

## Automated demonstration

The game-handler harness walks with the actual shipped joystick handlers and contextual Action, rather than assigning player positions or teleporting between destinations:

1. Leaves Home through its animated door, walks to Dispatch, collects the parcel at its desk, reloads while carrying, walks to Provisions and hands over for one payment.
2. Returns Home and preserves the existing daily-life, wardrobe, task, graphics and save flows.
3. Follows the route computed by the shipped navigator to Yaba Reading Room, studies, reloads inside, then walks to Yaba Works and completes an ordered paid records task.
4. Walks the connected mainland bridge to Island Trading Arcade, buys groceries and checks distant Yaba scenery is unloaded.
5. Reaches Marina Kitchen, eats, reloads in the saved room, imports a different district room and restores the exported Island story. Imported room/coordinates are retained.
6. Opens working phone screens, Back/Home, disabled future-app labels and future district notices; returns to the original Home on foot with appearance and completed-delivery state intact.

CPU camera checks aim at player head/feet while turning beside every building and verify opacity changes/restoration and opaque ray intersections. These are geometric assertions, not screenshots. Four viewport projections in the gameplay harness validate finite matrices and an in-frame player, not CSS overlap/readability.

## Rendered browser results — NOT RUN

The Browser skill was read and used. Selecting the in-app browser returned unavailable; documented discovery returned an empty list of sessions. No rendered gameplay run, screenshot, recording, native browser touch test or visual approval is claimed. No alternate browser/security workaround was used.

The local HTTP server is available at http://localhost:3000 while its process remains running; restart with npm.cmd start if needed. HTTP responses and older offline images are not evidence of v0.6 rendered acceptance.

## Physical-device results — NOT RUN

No actual Android phone was connected or tested. Frame rate, memory trend, heat, battery use, two-finger joystick/camera interaction, orientation changes, touch targets and browser lifecycle handling remain unmeasured. There is no performance or universal-device support claim.

## Required manual acceptance

Follow PLAYTEST-v0.6.md. It provides precise routes, camera turns/zooms/door transitions, phone actions, four viewport sizes, save round trips, touch cancellation tests and a 15-minute physical-device run. Record automated, rendered-browser and physical-device results separately. Fix any observed obstruction, clipping, transparent sorting, UI overlap or sustained-performance issue before shared-session work.

## Scope and limitations

- Cutaways are immediate at obstruction and restore smoothly; camera inward collision correction is immediate and outward recovery eased. Buildings remain in the scene. Transparency appearance still needs rendered inspection.
- Routes are grid-based across clear ground/pavements, with every shortcut and endpoint connector checked against movement obstacles and walkable district boundaries. They are walking guidance, not automatic movement or vehicle routing.
- The three districts are deliberately compressed/stylised. Yaba and Island contain accessible activities; Ikeja/Lekki/Victoria Island are future plans and cannot be selected as playable areas.
- Distant expansion geometry is built/disposed with hysteresis. Surulere groups and new district details use distance visibility; collision/navigation data remain loaded. Measured mobile performance is still required.
- Characters, animations, customisation, local identity, original delivery and daily-life systems remain. No online authority, multiplayer, election, ad-service or paid-backend claim is made.
- No purchase, Site creation, hosting change or deployment occurred. .openai/hosting.json is referenced by AGENTS.md but absent from this supplied checkout; the existing identity must be recovered before publication rather than inventing one.
