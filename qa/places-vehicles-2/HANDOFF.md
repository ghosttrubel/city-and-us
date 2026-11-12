# Places & vehicles batch 2 — local playable candidate

8 November 2026. Provisions visual direction and danfo booking direction remain as approved. Character/outfit revisions remain paused.

Review: http://localhost:3000/?review=places
Listening review: http://localhost:3000/places-voice-review.html

The game link uses the existing isolated places-review save and identity. Your main story is not reset or replaced. Run npm start if the existing local server is stopped. No new Site, publication or APK rebuild was performed.

## Newly playable in this batch

- Provisions: spoken greeting, produce/shelf guidance, grocery confirmation, player reply/payment, cancellation, insufficient funds, full pantry, parcel handover and paid-delivery reminder. Exact dialogue subtitles remain; Replay/Stop and existing dialogue volume/mute/text-only settings work.
- Parcel desk: spoken offer, player collection reply, already-carrying/return-home/needs checks, and bike-use instructions. It remains separate from the passenger ticket desk.
- Passenger desk and Phone → Ride: spoken fare review for all six prices, player booking reply, paid dispatch, waiting, boarding, travelling, arrival, completed trip, cancellation/refund and early-stop responses. Wrong counter, insufficient funds, duplicate/stale requests, premature alighting and mounted-bike booking have distinct responses. Existing car and yellow danfo remain usable.
- Red cargo dispatch bike, based on the top-left motorcycle in Delivery_And_Dispatch_Rides.png: collect a parcel, mount outside Dispatch, steer with the movement stick or WASD, release to brake, stop/dismount, enter Provisions on foot and hand over. The bike stays where parked across reloads. Return it to Dispatch and go home to finish the delivery round. Walking and the original passenger-assisted parcel journey remain available.
- Wider Surulere: Dispatch and Provisions have more separation, a dedicated shop access road, paved forecourts and passenger pickup bays; selected closed footprints and the park were moved to clear routes. The map coastline matches the expanded mainland. Old nearby saved positions and active passenger paths migrate once.

## Voice coverage and limits

52 scripted lines / 66 recorded PCM files. 14 player replies have female and male variants. All expected files exist, match the current script and hashes, contain non-silent waveforms, and serve locally with audio MIME types and byte ranges.

| Speaker | Scripted lines | Coverage |
|---|---:|---|
| Shopkeeper | 11 | Grocery browse/checkout and parcel receipt |
| Parcel attendant | 6 | Collection status, readiness and bike instructions |
| Transport attendant | 21 | Fares, trip states and refusals |
| Player | 14 | Grocery, parcel, bike and passenger replies |

These are stock synthetic English voices reading original Nigerian English/Pidgin wording. Nigerian accent, pronunciation and natural delivery have NOT received listening approval. Actual browser/device playback, autoplay recovery and audio balance are unverified. The listening page makes this review independent of gameplay. Legacy sofa/furniture sales, trading-shift scenes, boutique dialogue and other venues are not fully voiced by this batch.

## Verified

- npm run check passed after edits.
- npm run check:places-vehicles passed: actual mesh/route checks, shop/parcel/danfo game journey, save migration, protected-file hashes, joystick bike journey, voice controller behavior, ticket speech states and complete recording integrity.
- All 12 car/danfo stop/service journeys; fixed fares, once-only charges/refunds, boarding/arrival and reload.
- Manual bike journey with real joystick handlers under DOM/WebGL doubles: collect, mount, ride, brake, menu/input blocking, reload mounted, dismount, enter, receive pay once, retrieve/return bike and finish at home.
- All 121 entrance pairs and 352 camera sweeps passed CPU navigation/cutaway checks. Stale QA coordinates and camera fixtures were updated to the current layout and shipped camera mode.
- Existing daily-life state and passenger journey, mobile startup/lifecycle and retained boutique geometry/ownership transactions passed.
- 259 source/reference/asset hashes are unchanged, including the approved Provisions meshes, characters/outfits, ownership/decor modules and hosting identity. The complete earlier roadmap and owner requirements remain in the written files.
- Local HTTP review pages, new modules and all recordings respond correctly. This is not browser-rendered or listening verification.

Offline images: bike-offline.png, bike-rider-offline.png and street-offline.png in this folder. These use the actual meshes but are NOT live game screenshots.

## Unverified or planned

- Owner listening approval, native Nigerian accent/pronunciation, live browser/device audio and visual acceptance, and modest-Android performance measurements.
- The bike uses an existing seated pose and immediate mount/dismount transitions. Full mount/dismount animation, traffic-crash physics, engine sound, fuel, rentals, upgrades and additional vehicle classes are not implemented.
- Further generated-reference venues, richer activities and remaining transport work stay on the full ROADMAP.md. Character/outfit revisions remain paused. No multiplayer/elections/backend completion claim.

## Preservation and recovery

Before checkpoint: checkpoints/2026-11-08-before-places-batch-2 (1,130 files, SHA-256 verified).
After checkpoint: checkpoints/2026-11-08-after-places-batch-2 (created after these final checks; see its manifest).

Main save/identity keys remain unchanged. The layout migration preserves money, delivery IDs, fares, ownership, colours and indoor coordinates; passenger progress is remapped to the widened roads. Reload brakes the bike. A saved position caught in a relocated footprint is moved to nearby clear ground. No browser save store was edited by the tools.

## Exact review route / next step

1. Open the isolated places review. At Provisions, browse produce/shelves, then visit the back-right counter; try a purchase and cancellation and listen to both speakers.
2. Walk to Dispatch. The right desk collects parcels; the left desk books passenger tickets.
3. Collect a parcel, go outside to the red bike, mount and ride to Provisions. Release movement, dismount, enter and hand over at the counter. Return the bike to Dispatch and go home.
4. Separately book a danfo at the ticket desk or Phone → Ride; review the fare, meet the pickup marker, board and alight. Test mute/volume/text-only and replay.
5. Review pronunciation and remaining visual/performance limits before selecting the next reference-led places/vehicles batch. Continue the existing roadmap; do not restart character/outfit revisions.
