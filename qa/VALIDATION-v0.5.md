# Connected neighbourhood validation — v0.5, 23 October 2026

Status: the first connected-neighbourhood implementation and its automated acceptance journey pass. Real-browser/native-touch/visual acceptance remains open. Multiplayer has not begun and eight players remains an untested target.

## Automated results after the final code changes

| Command/check | Result | Scope |
| --- | --- | --- |
| npm.cmd run check | Passed | Syntax for shipped game, controls, shared neighbourhood, interiors, simulation, unchanged character/garment system, street and server. |
| npm.cmd run check:neighbourhood | Passed | Joystick dead zone/proportion/clamp, camera-relative vectors, collision/sliding/tunnelling, doorway and station placement, delivery state, duplicate-payment prevention, invalid spatial saves and map data. See neighbourhood.json. |
| npm.cmd run check:life | Passed | Preserved traits, needs, study/home bonuses, migration, save validation and CPU home geometry. See life.json. |
| npm.cmd run check:gameplay | Passed | Eight groups through the actual shipped game and meshes with DOM, WebGLRenderer, clock and storage doubles. See gameplay.json and connected-delivery.json. |
| npm.cmd run check:visuals | Passed | 32 sex/body/outfit combinations, representative colours/hair/accessories, deformation and scene geometry. See geometry.json. |
| HTTP | Passed | 26 current files matched local bytes, with expected MIME types, at http://localhost:3000. The prior http://127.0.0.1:3001 origin also serves the current build. See http-v05.json. |

No browser save was read or modified by these tests. Use npm.cmd if PowerShell blocks npm.ps1; no execution policy was changed. No additional dependencies are needed for these checks.

## Required journey — automated demonstration

The game-handler harness uses the real joystick pointer handlers and contextual Action button. It does not move the player by assigning positions or teleporting between route points.

1. Exited Home through its animated door, arriving at that building's corresponding street doorway.
2. Walked a route with synthetic joystick events to Dispatch, approached its entrance and entered.
3. Walked to the parcel desk and collected a parcel, without receiving payment.
4. Reloaded the game module while carrying the saved parcel; left through the same workplace doorway and walked to the provisions shop.
5. Entered the correct shop, approached its counter and handed over. Payment and rider progress were awarded once. Another action and reload did not award payment again.
6. Walked back to the Home entrance and entered, completing the round and enabling the next collection.

The test also reached cooking, washing, study, sleep and wardrobe on foot; checked creator preservation, phone app grid/back/screens, map destinations that do not teleport, local ID, task rewards, graphics persistence, save import/export/migration, focus handling and desktop key release.

The input test covers dead-zone stillness, immediate release/cancel stopping, simultaneous joystick plus independent right-side camera touch, and room/street collision. Pure tests reject remote/wrong-space pickup and handover. Camera matrices and player projections passed at 390×844, 844×390, 320×568 and 1280×900.

These pointer events are synthetic. The DOM and renderer are test doubles. The successful journey is logic/integration evidence, not rendered gameplay footage, native input verification or visual approval. CPU projections cannot prove CSS readability or overlap freedom.

## Real-browser results

**No real-browser gameplay run completed.** The browser skill was used; selecting the in-app browser reported unavailable, and discovery returned no browser sessions. No screenshot, video or successful native touch test of this build is claimed.

Earlier GPU failures are historical in GPU-INVESTIGATION.md. Earlier offline images are software mesh inspections. Neither is a visual verification of v0.5. No security policy, GPU sandbox setting or browser protection was changed.

## What remains unverified

Follow PLAYTEST-v0.5.md in a browser with working WebGL, then on a real Android phone.

- The complete journey with actual joystick fingers, independent camera finger and contextual taps.
- Rendered door swing/entry/exit, physical doorway alignment, parcel visibility, camera wall occlusion, clothing/clipping and the preserved character look.
- Portrait/landscape HUD, expandable needs, phone frame/app grid/back/close, readable map, action labels and panel spacing in real CSS layout.
- Native pointer capture/cancellation, app background/resume, touch release, keyboard focus and device orientation changes.
- Sustained Android frame rate, memory, load time, heat and context-loss recovery in Phone/Battery saver modes.

The two background street avatars remain NPCs. They are not shared players and are not multiplayer evidence. No shared session, online identity, knocking/admission system or server-authoritative access/payment implementation is claimed.

## Scope and retained systems

One neighbourhood now connects Home, Dispatch and the provisions shop. Map/Jobs/Home set waypoints; door and object actions require proximity. Interiors use separate scene groups with short doorway movement. A visible parcel follows the avatar; there is no new carrying animation clip. Existing idle/walk clips and customisation remain intact.

Story choices, local ID, needs, skills, rent, groceries, furniture, task/goal rewards, wardrobe and version-1 save compatibility remain. The older trading/kitchen challenges remain local venue activities for later scene conversion. Only delivery was replaced in this stage. Local economy and saves are still editable solo state.

The supplied phone screenshots were reviewed again for phone structure; original Lagos Street colours, text and geometry were used. No reference artwork was embedded in the game. Licenses, including the Three.js MIT notice, remain. No asset/service purchase, paid backend commitment, Site creation or deployment occurred.

## Next gate

Finish real-browser and device acceptance before world expansion or the multiplayer milestone. Then confirm backend requirements and operating costs before any paid commitment. The multiplayer acceptance must use distinct real clients targeting eight players, showing shared movement and door transitions, owner-notified knocks, server-approved admission, denial/revocation handling and mutually visible owners/visitors inside. ROADMAP.md records the requirements; no capacity or multiplayer functionality is yet verified.
