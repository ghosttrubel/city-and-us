# Batch 3 — local source candidate, 8 November 2026

Review: http://localhost:3000/?review=places (isolated review save; main story untouched by tests).
Start with `npm start` if the local server is not running. Existing server returned HTTP 200 during this batch. No publish, new Site or APK build.

## Newly playable
- Shared road driving for the work bike and modest green hatchback: independent steering/accelerator, brake-to-reverse, car handbrake, horn respecting mute/volume, camera cycle, speed/direction, stopped safe exit and walking-control restoration. Pointer holds are independent; menus, blur, visibility change and pause release them.
- Per-vehicle persisted handling overrides: maximum/reverse speed, acceleration, braking, coasting, steering, width, length and wheelbase. Shared entry, collision, parking, exit, access and save logic; future road models can reuse it.
- Green reference-led hatchback at (22,-24), outside Dispatch. Complete one parcel round or paid shift, then confirm ₦900 rental. Rental lasts until returned at Dispatch; no ownership award or free access. Invalid/other-player rental, ownership or permission is refused. Ownership grants and other rentals have no new acquisition UI in this batch.
- Dispatch work-bike permission comes with the parcel round. Collect at its separate desk, mount outside, ride/reverse, stop/dismount, and explicitly hand over at Provisions. Nearby walking deliveries still work.
- Buka terrace and doorway thresholds exclude vehicles. Full footprint collision and short physics steps prevent wall tunnelling. Free recovery handles an old stuck-bike save, places vehicle/player in nearby clear space and preserves parcel, inventory and cash. Use the driving Recover button or Phone → Jobs → Recover nearby stuck vehicle.
- Provisions stocks eight purchasable lines: rice, tomatoes, beans, plantain, water, biscuits, soap and three-portion pantry bags. Quantity controls, stock, basket, total, review/confirmation, insufficient-funds/capacity/stale-confirmation guards and saved receipts/inventory. Ingredients feed the existing physical kitchen; water restores 8 energy, biscuits 20 food, soap 30 hygiene at the home bathroom. Phone → Inventory exposes use.
- Compact bottom service panels and short dialogue turns, scrollable choices/catalogue, close/minimise/replay/subtitles. Shop selections, totals, balance, parcel number/status/payment and ticket action results come from current state. Shopping does not silently hand over a carried parcel.
- Booked car/danfo rides remain passenger journeys. No driver controls appear for bookings. Fares, boarding, arrival, cancellation/refund and reload retained.

## Voice status — incomplete
Approved authentic Nigerian audible coverage: **not implemented**. The rejected generic recordings are not played by the street/service dialogue controllers. Their 52 scripts/66 WAV assets remain preserved; no replacement batch generated. Replay currently repeats the text turn. Dynamic shop/parcel text and player replies are implemented. Nigerian voice selection/recording, pronunciation/listening acceptance and device playback remain pending. Historical asset-integrity reports are not runtime voice approval.

## Verification
Automated state, actual game-handler/DOM-double and geometry checks cover paid entry, simultaneous steering/acceleration, braking/reverse, moving-exit refusal, stopped exit, parking/reload, stuck-bike recovery, basket checkout, real ingredients and passenger separation. These are **not** live browser pixels, actual multi-touch or Android performance evidence.
Evidence: state-checks.json, game-checks.json, preservation.json. Retained mobile lifecycle, physical home/cooking and street-service suites were run. `npm run check`, `check:places-vehicles`, `check:daily-life`, `check:mobile`, `check:physical-home` and `check:street-service` passed. Final focused driving/shop/game/preservation checks passed; source hashes are in verification.json.
449 protected asset/source/license/hosting files were hash-checked against the before-Batch-3 checkpoint. Full historical README/roadmap/owner requirements retained. No user browser storage was read or modified by automated tests.
The old direction-stick and generic-audio runtime tests describe superseded behavior and remain as historical source; `check:places-vehicles` now runs the current shared-driving/shop suite plus retained geometry, preservation and asset-integrity checks.

## Unverified and planned
- Browser remains disconnected; it was not retried. Live portrait layout, real multi-touch, horn playback, car visual acceptance, WebGL and modest Android FPS still require local/device review.
- Hatchback is an authored low-poly approximation of the green lower-centre reference, not an exact replica. No detailed cabin or door-opening animation. No new ownership-buying flow.
- Building architecture gaps and feasible reconstruction are recorded in docs/PLACES_VEHICLES_BATCH_3.md. No long building remodel or exact-match claim in this corrective batch.
- Authentic voices, further reference-led buildings/transport and all earlier roadmap work remain planned. Character/outfit revisions stay paused. Boats/aircraft require their own future controls. Multiplayer/elections are not claimed functional.

## Exact review route
1. Open the review link; walk to Provisions checkout. Select goods, review/cancel/pay and inspect Phone → Inventory. Bring bought rice/tomatoes home to the preparation counter for the existing recipe activity.
2. From Phone → Jobs, find Dispatch. Collect at the parcel desk (separate from tickets). Outside, approach the red bike and take driving control. Try accelerator plus steering, brake/reverse, camera and stopped dismount; walk into Provisions and choose Hand over parcel.
3. After a paid shift/round, approach the green hatchback outside Dispatch. Review/pay ₦900, enter, drive, stop/exit and reload. Park back near its original bay and Return rental to revoke access. No free rental or balance top-up.
4. Book a car/danfo at the ticket desk or Phone → Ride; confirm fare, board and arrive as a passenger.
5. Review portrait control spacing and vehicle/reference fidelity on device. Authentic voice replacement is the outstanding audible requirement.

Recovery checkpoints: checkpoints/2026-11-08-before-places-batch-3 (1253 verified files); final checkpoint listed in HANDOFF.md after verification.
