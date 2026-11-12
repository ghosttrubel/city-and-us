# Connected destinations review — 27 October 2026

This bounded milestone follows the completed home/street/Mama T work. It does not implement the entire follow-up plan. Source checkpoint: checkpoints/2026-10-26-before-connected-city (209 files, hashes verified unchanged). Saves, ownership, meals, home layouts, wardrobe and resolution settings are preserved. No purchases, paid service, new Site or native Android project.

## Exactly what is playable

| Area | Places and interiors | Activities / limits |
| --- | --- | --- |
| Mainland: Surulere + Yaba, existing districts reused | Existing home, Dispatch, Provisions, Boutique/Salon; Mama T’s outdoor terrace/counter. Existing Yaba reading room and work hub retained. | Home/wardrobe/decorating, delivery/ride service and Mama T’s two-customer food-service loop preserved. Yaba’s older counter/menu study and records activities are retained, not newly upgraded action animations. |
| Victoria Island waterfront, reusing the original Island footprint and save IDs | Tide Courtyard Hotel reception/rest suite; Lagoon Pot Eatery, adapted from the existing Marina Kitchen room; existing Trading Arcade. | Hotel: book at reception for ₦700 per two-game-hour rest, physically approach/use the bed, +45 energy; cancel an unused booking for one refund. Eatery: buy/collect a ₦700 pepper-yam takeaway, carry it through doors and reload, eat/store at home. No instant food reward. Trading/groceries retained. |
| Ajah / coastal quarter, one compact connected addition | Lantern Yard Club room; Coastal Beach gate leading to a small open-air shore activity area. | Club: free four-green-beat dance activity with original procedural movement; mood reward at most once per game day. Beach: approach/pick up three litter pieces, carry a bag and deposit at the recycling bin; progress saves, reward once per game day. Named NPC caretaker Efe follows a nearby walking routine. No swimming, expansive resort, music catalogue or full nightlife simulation is claimed. |

The street is continuously walkable from Mainland across the existing bridge into VI, then through the new coastal link to Ajah. Navigation uses real collision-checked paths and physical doors. The map is a compressed fictional layout, not accurate Lagos geography. Existing local Ride stops are unchanged; new destinations currently use walking routes.

Tide Courtyard is an original fictional hotel name and code-authored design, not a real hotel replica/affiliation. It is a compact reception/rest suite, not a fully operating multi-room hotel. New destination interiors load on entry and dispose after exit. District scenery still loads near the player and unloads at distance with hysteresis. Character assets are reused, no full device-DPR jump, expensive mobile shadows or paid assets added. Real device FPS still needs measurement.

## Mapped and explicitly unfinished

Grace Courtyard Church (existing south-west footprint), Neighbourhood Mosque (existing neighbourhood footprint), Mainland Police Station (existing estate footprint), Governor Residence Site (existing flats footprint) and a fictional Presidential Residence Site in the coastal quarter are mapped, routable closed sites. They have no Enter action, finished interior, public appointment or enforcement gameplay. Their names/status appear in navigation and selection. No real-world residence address is represented.

## Portrait and visible names

The full-screen portrait blocker and hidden/inert game-root rule are removed. A small rotate notice leaves the scene and interface visible. Movement/simulation pause; Phone, navigation, Help and Settings remain available. Held inputs clear on rotation; resume has no time catch-up. Opening utility menus during a paused activity returns to its last completed step; a door crossing is safely cancelled before opening navigation. No orientation-lock dependency or artificial page rotation.

Nearby public labels explicitly identify Bisi, Ayo, the two customer NPCs and Efe as NPCs. Labels are limited to three within 12 metres, with screen-overlap suppression and scene-occluder checks. Phone → Settings can hide labels, and that choice saves. No account identifier is displayed in these labels. There are no connected human players; human-stranger labels and shared privacy need the later account backend.

## Beachwear audit

The actual 35-item catalogue has no Beach category or dedicated swimwear. Existing tee and Court shorts can be previewed, purchased/equipped and saved for both male and female characters; round frames exist but are not verified protective sunglasses. Missing: swim trunks, swimsuits/bikinis, modest swimwear, cover-ups, sandals/flip-flops, beach sunhat and beach bag. No placeholder clothes were added. See beachwear.json for the tested ownership/preview/reload audit; live fit is not verified.

## Verification boundaries

Automated results: required npm run check; destination domain/world-route/interior-clearance checks; actual-handler connected-city journey; nonblocking portrait checks; beachwear ownership audit; preserved physical-home, street/service, daily delivery/ride, mobile startup/lifecycle and resolution regressions. Each result is listed in checks.json. Scripted journeys use actual shipped handlers/meshes and synthetic joystick/input with DOM/GPU/storage doubles; they do not measure a real phone.

The journey walked Mainland → hotel → club → beach → eatery, crossed physical doors, tested booking charge/cancel/resume, dance inputs, beach partial-progress reload, takeaway persistence, planned-site navigation and privacy/ownership reload. It checked new interior unloading. Payment/refund/reward replay and ingredient/meal preservation are covered separately.

Software renders: hotel/coast exteriors and hotel rest, club, beach pickup and eatery frames in review.html. These are NOT browser screenshots. Lighting/text rendering differ from WebGL. Inspected rest and beach frames; protected activity furniture from camera cutaway. Procedural pickup reach, dance, resting and grip transitions remain simple; no authored activity clips or reference-quality art claim. Existing garment/face/hair issues remain deferred.

Actual browser/device verification: PENDING. Browser discovery returned no sessions. Earlier owner confirmation that iPhone 11 startup/controls worked predates these additions. No new Safari/Android pixels, touch, name-label layout, portrait CSS, audio or FPS acceptance is claimed.

## Review link and steps

http://10.126.70.116:3000/?review=daily — same Wi-Fi, PC/server running. Uses the existing isolated daily-review save; main story remains http://10.126.70.116:3000/ . Reload the page to receive the new modules; do not clear browser storage.

1. In portrait, confirm the scene remains visible and Phone → Navigation/Settings and Help open. Rotate to landscape and confirm movement resumes without a stuck stick.
2. Phone → Navigation → Tide Courtyard Hotel. Follow the route over the bridge, enter its door, approach reception, book, then walk to the bed. Try cancelling an unused booking and reloading a used booking.
3. Route to Lantern Yard Club in Ajah. Enter and approach the floor. Tap four separate green beats. Cancel/resume or rotate during play.
4. Route to Coastal Beach Gate. Enter, pick the three visible litter pieces, reload after one, then use the green recycling bin. Efe is an NPC. Check nearby-name hide/show in Settings.
5. Route to Lagoon Pot. Collect one pepper-yam takeaway, leave carrying it, reload, then carry it home to eat/store. Compare cash and meal count before/after repeated taps.
6. Select church/mosque/police/residence sites: each must say planned/closed and offer a route without a false entrance. Compare Low/Balanced/Sharp gradually if needed; report actual phone performance separately.

## Next / planned, not delivered here

ROADMAP.md merges every follow-up. Next bounded milestone: skippable/replayable saved action-led tutorial; casual-gig versus employment distinction; conversational interviews with requirements/responses/rejection, pay/hours/responsibilities, resignation/reapplication; documented fictional economy review. Existing pay/rent/clothes/furniture balances were not silently rebased.

Later: optional adjustable ageing independent of game days/real dates; server-timed appointments and monthly elections; real accounts/Friends/accepted-player Chat/block/report/Events/invitations/RSVP with honest concurrent capacity; varied careers/social roles and international travel. Babalawo/traditional spiritual roles remain separate from crime. Fictional yahoo-boy missions and financial-crime investigators require evidence, fair consequences and appeal/review, with no real fraud instruction, arbitrary arrests or paid immunity. None is presented as working multiplayer or enforcement.
