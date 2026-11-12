# Existing-experience repairs — 30 October 2026

Local source changes only. No new Site, deployment, branding, assets purchase or backend claims. Existing save keys, character assets, wardrobe/furniture ownership, control bindings and third-party MIT notices are retained. Synthetic tests never read the owner's browser save.

## Findings and changes

- **Dialogue:** audio previously hid all reply buttons while waiting as long as 30 seconds without a completion event. Playback is now watched for three seconds without time progress; rejected/synchronously thrown play, media errors, stalls and unresolved play fall back to subtitles for the remaining conversation. A total playback timeout also falls back to text. Continue in text skips to the next line; fixed Exit remains outside scrolling content. Media callbacks are guarded against a closed/replaced session; Exit clears held keyboard/joystick/camera input. New conversations can use sound again.
- **Bisi:** her original salon stop at (-21, 19) was inside the expanded collision margin. Route generation returned no path repeatedly. The stop is now (-21, 20.2). Routes retain their destination on failure, check each movement segment, yield before entering another actor, and expose their actual behaviour state for tests. Existing rig gestures/idle motion are reused. Selection/conversation safely pauses her, she faces the player, and Exit resumes the route.
- **Ayo:** work, directions and thanks previously shared busyreply. Work now branches into parcel/kitchen details, directions into the desk/route, and a break into food/returning to work. Another question restores the main choices. New lines explicitly use subtitles; no nonexistent voice clips or paid synthesis are requested. Existing voices remain.
- **Meals:** Finish cooking previously left the recipe at the plate stage with no meal until the player found and used the preparation counter again. Finish & plate now continues into a plating animation at the cooker, creating an open carried plate exactly once. An interrupted plate stage resumes at either cooker or preparation counter. A five-second world halo and a persistent hand/table label identify the meal. Carry, Serve, Store and animated Eat reuse the existing physical meal and save schema. The carried plate is slightly wider for visibility. Existing stored meals stay in their chosen locations and remain retrievable through Food/fridge.
- **Text:** kept existing panel width/height caps, gave conversation choices full rows within a scrolling body, anchored Exit separately, constrained meal/action controls between the touch controls, and removed cramped image-float wrapping from recipe/stock labels. Checked relevant shipped text for encoding artifacts; none found. CSS appearance still requires device review.

## Automated evidence

Passed:

- npm run check (all shipped JavaScript syntax).
- npm run check:phone-review: actual daily-review save slot and game action/joystick handlers; audio failures/completion/stale callbacks; every Ayo choice/follow-up; main save and ownership preservation. The command also includes the isolated NPC routine check; both components passed.
- npm run check:physical-home: both recipes, ingredients/storage/reload, animation state, partial meals, cancellation and exactly-once nutrition.
- npm run check:living-streets: courier NPC/player/NPC order, handover, saved settings and physical meals.
- npm run check:mobile: startup, held-input reset, portrait/background pause/resume, viewport changes and retained saves.
- npm run check:street-service: actual Bisi/Ayo approach/conversation handlers and existing customer/cooking/payment lifecycle.

[Targeted results](results.json) · [Full NPC route/collision results](npc-results.json). The daily-review journey checks actual visible meshes and ancestors, material opacity, gameplay-camera projection, hand attachment, table coordinates above the surface, mesh ray intersections, navigation to the meal, doors, reload, utensil visibility, reduced food geometry (32 to 24 grains), four-to-three portions and precisely one-quarter nutrition. It does not rely on inventory alone. One cancelled bite gives no nutrition; duplicate finish and interrupted/reloaded plating produce one meal.

The initial moving-Bisi approach in the test followed an outdated position; it was corrected to approach her current position using the real walking controls. The NPC speed assertion measures ground-plane movement because curb height changes are intentional. These were test corrections; the final checks passed.

## Software visual inspection

Inspected [cooked plate by the stove](cooked-at-stove.png) and [visible table meal during eating](visible-bite.png), rendered offline from the current retained meshes/poses. The plate is visible at the hand beside the counter and above the table. These are software previews, not browser screenshots; they do not verify CSS, Safari WebGL, device audio, touch or FPS. [Render scope](renders.json).

## Device verification — pending

No physical iPhone test was performed here. The in-app browser connection reported unavailable and browser discovery returned an empty list. The user's actual browser save was not supplied; the regression uses the same daily-review slot/start and real actions with isolated test storage. Therefore the source repairs are ready for retest, but phone-specific visual/audio/touch acceptance is not claimed. Follow the [short phone retest](PHONE-RETEST.md).
