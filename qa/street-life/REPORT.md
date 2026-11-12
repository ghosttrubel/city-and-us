# Street and Mama T’s review — 26 October 2026

Home functionality was implemented, checked and reported first in ../physical-home/REPORT.md. Its 201-file checkpoint is checkpoints/2026-10-26-home-before-street; all recorded hashes verified unchanged. The earlier 193-file pre-home checkpoint also remains available.

## Implemented for review

- Existing Surulere street: warmer wall/paving colours, different lower facades, salon/provisions displays and lettering, Mama T’s menu sign, inexpensive static contact shadows. No new district, expensive mobile shadow maps or character replacement.
- Two existing pedestrians now travel between named local errands with short stops. Nearby optional Talk; Bisi greets and gives landmark directions with an optional existing route; Ayo can decline. No automatic conversation or prompts for distant people.
- Canvas selection identifies visible people/buildings, labels public entrances, outdoor services and background-only buildings. Door actions still require physical approach. Left-side canvas taps are accepted; the joystick retains its own touch handling.
- Mama T’s: two customers per shift arrive, queue, order, wait with visible order/patience indicators, receive a carried package and depart. Accept → three short preparations → eight-second simmer/two stirs → collect the correct plate → serve. Original procedural player arm actions and visible ingredients/pot/utensil/food support the interaction.
- Restaurant-supplied ingredient stock is separate from owned home groceries. Recipe definitions, nutrition identifiers, meal IDs and physical carried-food inventory are shared. A customer plate cannot be stored/eaten as a personal meal. Each served order awards ₦450 base game currency (₦495 with Industrious), chef progress and time/needs changes once.
- Cancel before preparation returns reserved restaurant ingredients; after preparation they are spent. Cancelled plates are discarded with no reward. Leaving the area closes the shift; customers depart. Reload resumes saved order/queue/patience/plate state and completed payment, without offline catch-up. Transient action animation restarts from the last completed step. A final-departure save bug found during integration was fixed.

## Evidence boundaries

Automated: npm run check; check:physical-home; check:street-service; check:daily-life passed. The home and street journeys execute shipped handlers with synthetic joystick/touch events, real ray casting/meshes, and DOM/GPU/storage doubles. Service domain tests cover duplicate acceptance/preparation/collection/serving, wrong plate, distance, refunds, cancellation at three stages, walking away, patience expiry and reload. Rides retain physical pickup/travel/drop-off, fares and early cancellation. Final mobile/resolution results are recorded in ../food-service/*.log.

Rendered: before.png and after.png are matched software street frames; ../food-service/prepare.png, stir.png and serve.png use the shipped service controller’s poses. Home previews are separate. They are NOT browser screenshots. Software lighting differs from WebGL; text sprites/instancing are incomplete in this renderer. Inspection found and corrected home furniture cutaways and lowered package attachment to the hand grip. Wrist/grip transitions and existing garment clipping remain art limitations.

Actual browser/device: PENDING for this milestone. Browser discovery returned no sessions. The owner’s earlier iPhone 11 startup/control confirmation remains recorded but does not verify these new activities, street features, water/audio or FPS. No test count establishes visual acceptance. Authored character clips remain idle/walk only; activity movement is original procedural animation, not mocap.

No purchases, paid services, new hosting identity or deployment. Character asset files and third-party licenses preserved. Existing saves, purchases, wardrobe/inventory/named outfits, home ownership, conservative mobile graphics, landscape pause and saved Low/Balanced/Sharp settings retained. Native Android packaging/landscape manifest remains a later roadmap task; this is the web checkout.

## Phone review

Open http://10.126.70.116:3000/?review=daily on the same Wi-Fi, in Safari on iPhone 11 or Chrome on Android. Keep the PC/server running. Landscape is required. The isolated review uses its own saved story; the main game is http://10.126.70.116:3000/.

1. Follow the home acceptance sequence in ../physical-home/REPORT.md: delivery across the doorway, table eating/leftovers, saved ingredient storage and both recipes, study and shower.
2. Outside, approach Bisi by Surulere House/salon. Greet, ask directions and optionally start the route. Tap a visible building; try Enter from a distance and then at its physical door.
3. Walk to Mama T’s centre terrace/counter (opposite the home). Action → Work in the kitchen. Wait for the two customers; accept, prepare three times, use cooker, stir twice, finish, collect and serve. Check the payment once. Cancel the second order and leave; customers should walk away.
4. Reload with a carried service plate or during preparation. Rotate to portrait mid-activity; gameplay and input must pause, then resume in landscape. Compare Low/Balanced/Sharp through Phone → Settings one step at a time. Real phone performance still needs measurement.

If a character/food/action is missing or controls overlap on the device, report the step and use the existing Diagnostics panel. Do not clear saved storage as a troubleshooting step.

Final result: all six npm commands listed in ../food-service/checks.json exited 0, including check:mobile and check:resolution. Both checkpoint manifests verified unchanged (193 pre-home files; 201 home-before-street files). Nineteen character-asset/mobile-runtime/control/resolution/hosting files also match the preserved source checkpoint. LAN HTML and all newly requested modules returned HTTP 200. These are source/HTTP/automated checks, not live browser or device evidence.
