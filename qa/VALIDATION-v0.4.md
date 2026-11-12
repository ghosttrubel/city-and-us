# Daily life milestone validation — 23 October 2026

Status: local implementation and automated checks complete. Real-browser visual/touch acceptance and Android performance remain open. No further world or backend expansion was started. The current character design, idle/walk clips and customisation were preserved.

## Automated checks passed after the final refinements

| Check | Result | Evidence and scope |
| --- | --- | --- |
| npm.cmd run check | Passed | Syntax for game, life simulation, interior, character, garments, street and HTTP server modules. |
| npm.cmd run check:life | Passed | Trait effects, home/study bonuses, resource rejection, midnight rollover, legacy migration, invalid saves and ray-pickable finite interior geometry. See life.json. |
| npm.cmd run check:gameplay | Passed | 15 groups of actual game-handler regressions with real meshes/animations and DOM, WebGLRenderer, timer and localStorage test doubles. See gameplay.json. |
| npm.cmd run check:visuals | Passed | 32 sex/body/outfit combinations, representative appearance colours/hair/accessories, finite deformation, spawn and street geometry. See geometry.json. |
| HTTP checks | Passed | 24 files at http://localhost:3000 matched local bytes, including modules, models, textures and retained licenses; expected MIME types, HEAD and missing-file 404. See http-v04.json. |

Use npm.cmd on this Windows machine if PowerShell blocks npm.ps1; no execution policy was changed. All four npm checks require no additional packages. Tests use isolated in-memory saves and do not access or overwrite browser progress.

The gameplay suite covers selected and skipped introduction paths, persistence, character editing/reload, sleep/resting pose, cooking groceries, wash, study focus, activity cancellation, wardrobe use in Home, all three successful job challenges, food/payment, import confirmation and malformed-import rejection, older saves, stable local ID, map travel, grocery/furniture purchases, single-claim task rewards, graphics persistence and reset/cancel.

## Input and camera refinement checks

- Keyboard movement stops when its last key is released, when window focus is lost, or when a menu opens. Closing the menu does not restart a held key.
- Tab and Shift-Tab wrap within a menu, misplaced focus returns inside, Escape closes it and focus returns to the opening control. This is handler logic tested with a DOM double, not native browser focus dispatch.
- Two-pointer zoom changes the Home camera. Pinch release does not trigger a home object. Pointer cancellation and unexpected capture loss do not leave the camera dragging. Button zoom also works in Home.
- Camera aspect/projection values and on-screen home activity centres were checked at 390×844, 844×390, 320×568 and 1280×900. A projected cooker tap activates its handler at each size. Venue-label separation is tested against the same conservative estimated rectangles used by the UI; actual font sizes and CSS bounds remain unverified.
- Activity controls replace the lower HUD/home dock while running, and restore them on finish/cancel. Short portrait home controls scroll horizontally. These visibility transitions are checked; their rendered layout is still an acceptance item.

See input-camera.json for projection results. Those coordinates are not screenshots. No DOM or rendering test double is treated as visual verification.

## Real-browser testing

**No successful real-browser playtest was performed.** The browser skill was followed and the in-app browser was retried after the interruption. Selection reported unavailable, and discovery returned an empty browser list. There was no session in which to load the game, dispatch real touch/mouse/keyboard input or capture rendered screenshots.

Historical native Chrome GPU failures from 20 October remain documented in GPU-INVESTIGATION.md. They were not repeated in this follow-up and are not evidence of a current successful browser test. No GPU/security policy was changed. Earlier offline PNGs remain software mesh inspections only.

## Playable local addresses and saves

- http://localhost:3000 — standard local server, running the current checkout. Restart with npm.cmd start from the project root if needed.
- http://127.0.0.1:3001 — previous review origin, also served from the current checkout so earlier saves at that address remain accessible.

Browser storage is origin-specific. Use the same address as your existing save; Settings can export/import a backup when moving between addresses. Version-1 saves retain existing money, skills and appearance; missing daily-life fields receive defaults. The local Player ID persists across sessions, import and new-story reset on that browser. It is explicitly distinct from any future online account ID; clearing browser storage can lose it.

## Reference review and assets

The prior implementation pass read reference/references/README.md and reviewed the supplied screenshot groups for activities, choices, interiors and phone structure. Recording review was sampled, not full playback: five frames from approximately the first 15 seconds and one around 30 seconds of the roughly 88-second recording were inspected. Later sampling attempts did not yield usable frames. The samples show the cutaway home and overlapping feedback/promotional panels; no claim of reviewing every recorded action is made. Samples are retained under qa/reference-review and are not shipped game assets.

The playable interior geometry and interface are original local code. Current licensed character assets and the third-party MIT notice remain intact. No purchases, new Site, deployment, added watermark, online backend, multiplayer or elections were included.

## Remaining acceptance checklist before expansion

- [ ] In a working WebGL browser, complete both selected and skipped introductions; reload and verify choices, local ID and appearance.
- [ ] Play a full routine using actual object taps, then large buttons: cook → wash → sleep → study → job → groceries/sofa → claim rewards. Check cancellation, insufficient groceries, rent due and import confirmation.
- [ ] Inspect the current character, clothing and resting pose in all home palettes; review idle/walk transitions and clipping. Cooking/washing/study use existing idle at their stations, not dedicated new animation clips.
- [ ] Test native pinch, pointer capture/cancel, mouse drag/wheel, WASD/arrows, focus wrapping/restoration and keyboard shortcuts in a real browser.
- [ ] Inspect portrait/landscape HUD, short-phone scrolling dock, activity feedback, every phone section, text contrast, label spacing and camera framing. CPU projections alone do not establish readable layout.
- [ ] On a modest Android phone, measure sustained frame rate, load time, memory and heat in Phone/Battery saver modes; test orientation changes, background/resume and WebGL context recovery.

Body/face morphs remain limited; there is no cloth/hair simulation, foot IK, sound or dedicated activity clip set. Map travel uses timed local transitions. The browser-local economy and saves are editable solo state. Flights, government offices, online social systems and server-enforced elections remain deferred in ROADMAP.md.
