# City & Us — daily life and phone fulfilment

26 October 2026. Implemented for local solo review. The owner accepts the current appearance sufficiently to continue; character replacement and further fashion polish are deferred, with outstanding art issues retained in ROADMAP.md and qa/fashion-review/ASSET-PLAN.md.

## Play

[Daily-life review](http://localhost:3000/?review=daily) uses separate storage and starts in the furnished home. [Main story](http://localhost:3000/) retains the existing save. The existing server is serving the current dist files. If needed, run npm start from the project folder. Localhost is for this computer; it is not a hosted phone/device link. Export/import when switching origins.

1. Approach the cooker and use Action. Start with one grocery, chop three times, keep heat 55–75 and stir twice at least two seconds apart. Simmer ten seconds; four seconds in the green band produces a better plate and chef skill. Serve, then eat or store via Phone → Food. Close/Pause preserves progress. Cancelling during preparation refunds the grocery; after heating, the ingredient is consumed.
2. Phone → Food: choose jollof & plantain or beans & plantain from existing Mama T’s, and Home/Dispatch/Provisions. Review total including 150 delivery fee and confirm. The courier walks from Dispatch to the restaurant, collects, then walks a collision-checked route to the selected entrance. Meet outside and press Action. Receipt stores the meal; only eating restores food/mood. Full refund before handover, including when the courier is waiting.
3. Phone → Ride: one Neighbourhood Ride service, three existing curb stops. Review fare and confirm. Follow the pickup marker, meet the arriving vehicle and board with Action. Close Phone to watch travel along the road loop; alight with Action after it stops. Full refund before boarding. During travel, request the next safe stop to end early; the fare is retained and no completed-trip objective is awarded.
4. Phone → Tasks: claim the three daily-life objective rewards once. Existing work, groceries, needs, wardrobe and furniture remain available.

## Persistence and safeguards

Money and service transitions share the existing version-1 save snapshot. Request serials guard stale/repeated confirmations; order/trip/cook IDs and terminal states guard cancellation, refunds, receipt, serving, eating and rewards. Insufficient funds and unavailable food routes reject before charge. Stored meals are limited to 20 with space reserved for active orders/cooking.

Service movement saves at phase changes, user actions and approximately one-second intervals. Reload resumes progress/actor position rather than restarting a charge or inventing offline completion. Hidden pages pause delivery/travel; cooking requires its activity screen open. Normal pagehide saves the current position/progress. A sudden process failure can lose the unsaved fraction of the latest second of movement. Existing storage-failure handling remains; this milestone does not introduce server transactions or multi-tab locking. Solo/device-local safeguards do not establish online payment authority.

## Automated verification — passed

| Check | Evidence |
| --- | --- |
| Required syntax check: npm run check | syntax.log |
| Daily domain transitions, all six ride stop pairs, road vehicle footprint samples, courier path clearance, insufficient funds/unavailable routes, repeated payment/refund/receipt/eat/serve, early stops, old/invalid saves, state reloads | state-checks.json and state-checks.log |
| Actual shipped game handlers with synthetic joystick: cook/cancel/pause/reload/serve/eat, food confirm/cancel/physical receive, ride board/travel/reload/alight/early-stop, reward claims, exact retained wardrobe/decor/appearance | journey.json and journey.log |
| Existing life simulation regression | verify-life.mjs.log |
| Existing gameplay journey through Home, courier work, Yaba and Lagos Island, cooking, other activities, phone/export/import and reload | verify-gameplay.mjs.log |
| Boutique purchase/equip/named look, furniture buy/place/move/rotate/store, reload and home activity reachability with the new cooking activity | verify-wardrobe-home.mjs.log |
| HTTP 200 for root, isolated daily review and all three new modules | http.json |
| Both 182-file accepted-appearance and 161-file pre-fashion checkpoints hash-verified; 88 selected current art/wardrobe/decor/license files unchanged from accepted appearance | checkpoint-verification.json |

The scripted journeys use isolated DOM, WebGLRenderer, timer and storage doubles while exercising actual game handlers and scene objects. They did not access the owner's browser storage. Static geometry sampling establishes clearance against existing obstacles; it is not a rendered traffic or touch test. An initial broad gameplay run reached its execution timeout; the subsequent full run completed successfully. Unchanged exhaustive fashion/pose suites were not repeated.

## Actual browser/device verification

Not performed: the supported browser runtime returned no sessions. No new browser screenshots, live WebGL/CSS inspection, native-touch tests, Android frame-time/memory measurements or device reload/resume results are claimed. HTTP responses and synthetic viewport checks are not browser/device verification. Owner review should cover phone scroll/controls in portrait and landscape, vehicle/courier visibility, camera travel, heat slider/stir timing, background/resume, and modest-device performance.

## Preserved scope and remaining work

New files: dist/daily-life.js (state), daily-world.js (world actors), daily-ui.js (screens). Integration uses existing game/life/navigation/location systems and scene assets; no new runtime dependencies or purchased assets. A single lazily created courier is released after completion/cancellation; one cloned vehicle is reused. This is a small neighbourhood service with the current stylised assets, simple road-loop turns and existing ambient traffic, not full traffic AI or a polished vehicle interior. Broader menus/addresses/services and art refinement are deferred.

Checkpoints remain in checkpoints/2026-10-26-before-daily-life/ and checkpoints/2026-10-26-before-fashion-review/. They contain source/assets and restore instructions; browser saves remain on the user's device. Wardrobe ownership, named outfits, decorating and third-party MIT/CC0 provenance are preserved. No secrets were added to client code. No purchases, paid services or new Site.

Police and the fictional Civic Financial Integrity Bureau are roadmap-only: stations/offices, careers, reporting, evidence-led investigations, proportionate enforcement, appeals and audited server permissions. No enforcement gameplay was implemented.

## Hosting

Existing Site identity and audience retained. The previous hosted publication is not this daily-life build. The existing source helper failed to connect to git.chatgpt-team.site:443; no source push, saved version or deployment occurred. Exact status is in hosting.json. Use the local review link above for these files.
