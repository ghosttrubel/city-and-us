# Places & vehicles batch 1 — source candidate, 8 November 2026

Implemented locally; live visual and physical-device acceptance remain pending.

## Newly playable
1. **Provisions redesign:** reference-based green exterior and enterable green/cream interior, central grocery gondola, produce crates, rear shelving, drinks fridge and checkout. A visible shopkeeper, browse interactions and contextual checkout text distinguish browsing, confirmation, successful payment, insufficient funds, full pantry and completed courier delivery. Grocery bags remain ₦500 for three pantry portions, now with explicit confirmation/cancellation and duplicate-confirm protection. Existing sofa purchase, trading shift and parcel handover remain.
2. **Dispatch & local rides redesign:** reference-based yellow/charcoal stepped terminal facade and enterable interior with ticket/parcel counters, waiting benches, parcel rack and two attendants. The new physical ticket counter opens route/service booking and responds to actual booking/arrival/refund state. Existing parcel collection, delivery pay, skill progression and return-home completion remain.
3. **Bookable yellow danfo:** select Yellow danfo at the Dispatch ticket desk or Phone → Ride. Home ↔ Provisions costs ₦125; Home ↔ Dispatch ₦200; Dispatch ↔ Provisions ₦225. See the fare before confirmation, meet the dispatched vehicle at its marked curb, board with Action, travel along the existing street loop, and alight at the destination. The passenger door slides open while waiting/arrived; the mesh has a real opening, seats, driver and turning wheels. Pre-boarding cancellation refunds once; an early stop after boarding retains the fare. Booking, money, trip progress and carried courier parcel survive reload. The original neighbourhood car, its fares and old saves without a service field remain supported.
4. **Separate review:** `?review=places` starts at Provisions using `city-and-us-places-review-v1` and `city-and-us-places-review-player-id`. It does not read/write the main story or its identity. New features are also integrated into normal play; the review route is not a separate mockup.

## Exact local review
Run `npm start` if the server is stopped; open **http://localhost:3000/?review=places**.

Start inside Provisions. Browse the produce or shelves, then walk to the back-right checkout to confirm/cancel a grocery bag. Exit through the front door. Phone → Navigation → Dispatch gives the existing walking route. Enter Dispatch, collect a parcel at the back-right desk if desired, then use the back-left ticket desk. Pick Yellow danfo, Dispatch → Provisions, review ₦225 and confirm. Close the panel, exit, follow the gold pickup marker, board with Action, watch the trip, and get out with Action. Enter Provisions and hand over the parcel; return home to finish the existing courier round.

Phone → Ride also exposes the danfo and the retained car. Main story remains at http://localhost:3000/ on the same origin; do not reset saves or switch origins to inspect this batch.

## Verification performed
- `npm run check`: passed after integration; repeated for final handoff.
- `node tools/verify-places-vehicles.mjs`: all 12 service/stop-pair journeys; room entry-to-station/exit routes using shipped collision movement; danfo footprint clearance; invalid service/fare rejection; insufficient funds; remote/interior boarding refusal; duplicate booking/alighting/refunds; early stop; reload compatibility.
- `node tools/verify-places-journey.mjs`: actual shipped game with synthetic joystick/UI. Browse → cancel → purchase/reload; insufficient funds; physical Dispatch entry and attendants; collect parcel → book/cancel/refund → rebook → board → reload in transit → alight → hand over once → home. Main save/identity and wardrobe/decor/colours unchanged.
- `node tools/verify-places-preservation.mjs`: 258 protected files unchanged, including references, character/outfit sources and assets, home/decor/wardrobe state and hosting identity. Full historical roadmap/owner requirements retained, allowing CRLF/LF normalization.
- `npm run check:daily-life`, `npm run check:mobile`, `node tools/verify-boutique-interior.mjs`, `node tools/verify-boutique-journey.mjs`: passed.
- HTTP 200 and exact byte match to current source for index/game and the new place/vehicle/service modules.
- Offline mesh renders inspected; the door aperture and terminal roof silhouette were corrected and re-rendered. PNGs here are **software diagnostics, not live game screenshots**.

Static geometry before characters: Provisions 55 meshes / 25,422 triangles; Dispatch 41 / 4,812; danfo 19 / 7,336. These are asset counts, not measured frame rates. Staff and driver reuse existing character/outfit assets. Rooms render only when active; staff animate only in their active room.

## Unverified / limitations
Actual browser rendering, camera cutaways, lighting, reference fidelity, touch controls and sustained modest-Android performance need live review. New dialogue is text-only; no matching voice recording is claimed. Boarding/alighting use the existing contextual transition, not a newly authored boarding animation or walkable vehicle cabin. The danfo is one local solo booking, not a shared passenger-capacity or traffic-physics simulation.

References are single-view PNGs, not editable models or measured plans. Room/footprint compatibility constrains proportions; hidden sides are inferred and product/vehicle/material detail is simplified. See ../../docs/PLACES_VEHICLES_BATCH_1.md for exact sheets/quadrants and the feasibility limitations stated before modelling. No exact-match visual acceptance is claimed.

## Preserved / planned
Current characters/outfits and player colours are unchanged; their quality work remains unresolved and paused. Existing property/decorating state and home rights are unchanged. Public shop/terminal fixtures cannot be edited through the home decorator. This batch grants no vehicle/business/property ownership or luxury possessions and does not rebalance prior money or entitlement.

All other places/transport collections, Mama T's new interior, library corrections, advanced property permissions, shared play, elections and office-resource handovers remain planned under the full roadmap. No backend/multiplayer/election functionality is claimed.

## Recovery / delivery
Before-work checkpoint: ../../checkpoints/2026-11-08-before-places-vehicles-142444/manifest.json (6,386 hashed files; contains source/assets/references and some extra Android Gradle cache files). No browser saves were accessed. A malformed historical roadmap link encountered during verification was repaired; its pre-repair file is retained as roadmap-before-link-repair.md. No roadmap requirement was removed.

Portable source remains in this checkout; the root has no Git repository and .sites-checkout has no commits, so no commit is claimed. Existing MIT notices and .openai/hosting.json are preserved. No new Site, publication, purchase or APK rebuild. The Android APK and baseline build/version labels predate this local source candidate.
