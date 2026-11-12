# Shops, services and phone checkpoint — 12 November 2026

Local implementation now includes separate enterable Hair Salon and Furniture Showroom, corrected Provisions shopping, confirmed stylist service, connected phone Shopping, image wallpapers/themes/fonts, gameplay capture/gallery and original bundled music. Bisi uses the real home/Provisions route; Ayo reads delivery and needs state. Character/outfit redesign remains paused.

[Exact review steps, verification evidence and blockers](qa/shops-phone/STATUS.md). Chat requires an authenticated shared messaging backend; no multiplayer claim. Approved spoken dialogue is still unavailable. Live browser and modest-Android acceptance are pending because the in-app Browser is disconnected. No publication or APK rebuild. The existing Site identity, saved location IDs, original assets and complete historical roadmap are retained.

---

# Driving controls and panel correction — 8 November 2026

Reference-led steering arrows and pedal graphics now share one dark, portrait-first road HUD for cars and bikes. Rental panels retain explicit costs/confirmation and close on payment or cancellation; dialogue and service panels are compact and dark with expandable details. Physics, permissions, recovery, saves and city assets are retained. Local source review only; browser/device visual acceptance remains pending. [Changes, verification and review route](qa/driving-controls/STATUS.md). Full historical roadmap follows.

---

# Batch 3 local review — 8 November 2026

Shared permissioned road driving, earned/paid hatchback rental, stuck-bike recovery, stocked Provisions and compact state-based dialogue are implemented for local review. Authentic Nigerian voice replacement remains pending; generic recordings are not approved or played by these controllers. Live device/layout/car-visual acceptance remains unverified. See [exact features, evidence and review route](qa/places-vehicles-3/STATUS.md). Review: http://localhost:3000/?review=places . Full roadmap retained below; characters/outfits remain paused.

---

# Shared road driving decision — 8 November 2026

Add the modest green rentable hatchback now. All future player-drivable road vehicles use shared configurable motion, collision, parking, entry/exit, permissions and saved state. Rental requires a completed parcel round or paid shift plus confirmed payment; ownership or explicit permission also grants access. No free cars. Booked rides stay passenger journeys. Bikes use appropriate handling; boats/aircraft require separate future controls. Character/outfit work stays paused. Full historical roadmap follows.

---

# Current corrections — vehicles, shopping and compact dialogue

Batch 2 direction accepted. Priority: reproduce/fix the bike trapped at Mama T’s; robust vehicle/doorway collisions, safe parking/exits and free recovery without parcel loss. Implement distinct driving controls (steering, accelerator, brake/reverse, suitable parking brake, horn, camera, stopped exit), preserve passenger-only booked journeys, portrait touch use and input release on menus/focus loss. Then implement stocked individual products, quantities, basket, confirmation and usable inventory; dialogue must describe actual state and never invent purchases/events. Use a compact bottom dialogue panel with short turns, scrollable choices, close/minimise/replay/subtitles and input isolation. Generic voices are NOT approved as authentic Nigerian voices; replacement is pending and no new voice batch is authorised. Assess architecture/material/proportion/layout fidelity to supplied PNG references before further lengthy modelling; PNGs are references, not enterable models. Preserve approved work, all saves, permissions, colours and the complete roadmap. Character/outfit revisions remain paused. Local review only.

---

# Places & vehicles batch 2 — ready for local review, 8 November 2026

Implemented: voiced grocery/parcel/passenger interactions; a manual red dispatch bike with saved parking, braking and delivery handover; wider streets, forecourts and pickup bays. 52 scripted lines / 66 recorded files are connected. Nigerian accent/pronunciation and live device acceptance remain unverified; legacy furniture/trading and other venues are not fully voiced. No blanket voice-completion claim.

Review: http://localhost:3000/?review=places · Listening: http://localhost:3000/places-voice-review.html

[Exact features, verification, gaps and next review route](qa/places-vehicles-2/STATUS.md). Next priority stays PLACES AND VEHICLES using the owner’s references. Preserve the full roadmap, saves, property permissions and player colours. Character/outfit revisions remain paused. The historical decisions below are retained.

---

# Places & vehicles batch 2 corrections — 8 November 2026

Provisions visual direction is owner-approved; preserve it. Danfo booking direction is accepted. Next: audible situation-aware Nigerian English/Pidgin shop and dispatch dialogue with player replies, mute/volume and subtitles; a usable parcel dispatch bike (collect, mount, ride, dismount, hand over), with walking retained; more spacious streets, pavements and pickup areas. Parcel dispatch remains distinct from passenger tickets. Report voice coverage and working vehicle interactions explicitly; missing parts are not complete. Character/outfit revisions remain paused. Preserve all saves, rights, colours, ownership and the full roadmap below.

Installed offline voices are stock English synthesis voices. The script can use Nigerian English/Pidgin wording, but Nigerian accent, pronunciation and device playback remain pending listening/device acceptance. No paid service or voice cloning.

---

# Places & vehicles batch 1 — local source candidate, 8 November 2026

Implemented for review: reference-led Provisions and Dispatch exteriors/interiors with attendants, grocery browse/confirmed checkout and a physical ticket desk; a bookable yellow danfo with explicit fares, boarding, travel, arrival, refunds and reload support alongside the original car. Existing courier, food, home, wardrobe and property state are retained.

**Review:** http://localhost:3000/?review=places (run `npm start`; separate story/identity). [Exact features, review route, checks and limits](qa/places-vehicles/STATUS.md) · [Selected references and asset feasibility](docs/PLACES_VEHICLES_BATCH_1.md).

Automated state/geometry/game-handler, preservation, mobile-lifecycle and retained-system checks pass. Live browser/device visual acceptance and performance remain unverified. Source candidate only; no publication or APK rebuild. Character/outfit revisions remain paused and unresolved. Other places, transport and the full agreed roadmap remain planned. This delivery status supersedes historical clothing-first gates below.

---

# Active priority — PLACES AND VEHICLES, 8 November 2026

Recovery accepted. Keep current characters and outfits temporarily; their visual quality remains unresolved, not final approved art. Character, outfit, hairstyle and cloth revisions are paused. The next authorised work is a manageable reference-led places and transport batch, following a feasibility audit before lengthy modelling.

Use the owner's existing places and transport designs. Implement appropriate enterable interiors, attendants, situation-aware dialogue and activities, and usable/bookable transport with fares, boarding and arrival where applicable. Preserve property permissions, player colours, modest progression, balances, ownership, saves, working systems, mobile controls and the complete agreed roadmap. Luxury assets are progression goals, not starter gifts. Multiplayer and elections remain planned until their backends are tested.

This priority supersedes clothing-first and character-sample gates below. Historical requirements and evidence remain intact. Local review only; no publication or APK rebuild in this batch. Recovery checkpoint: checkpoints/2026-11-08-before-places-vehicles-142444.

---
# Character quality samples — capability obstacle recorded

The owner authorises one female and one male playable Blender sample, using character-style polish and supplied outfit designs, with an early capability gate. Reference inspection and exact outfit selections are recorded in [the quality preflight](docs/CHARACTER_QUALITY_PREFLIGHT.md). The current bases and scripted garment builder cannot reliably deliver the requested finish; new samples and the isolated review scene are not implemented. Further approximations and cloth physics remain stopped. Existing assets, game and saves are preserved. [Current garment handoff](docs/GARMENT_HANDOFF.md). This status supersedes earlier implementation plans below.

---

# Current owner requirements — 4 November 2026

The clothing direction is approved. Current priority: **clothing → hairstyles and accessories → places and vehicles**. [Owner requirements and places milestone acceptance criteria](docs/OWNER_REQUIREMENTS.md) record enterable gameplay buildings, property/decorating permissions, modest starts and earned luxury, ordinary-player election candidates, office-bound resources, contextual attendants/dialogue/activities, and preservation of saves and colour choices. These are requirements; planned places, permissions and elections are not being claimed as implemented.

Use the existing places and vehicles references at their milestones. No further invented interior palette changes: materials and contrast must remain distinct. Keep the clothing corrections first. The catalogue and standalone study now expose all three outfits: two female fits and one male fit. Cross-fit previews leave the player unchanged; incompatible garments cannot be equipped. Reference and capture tools start hidden under Quick menu → Review.

---

# Blender replacement batch 1 — 4 November 2026

The approved charcoal square-neck / washed-black denim direction now has clearer separate dyes, seam and pocket stitching, a defined waistband, and neutral knit/denim fabric maps. The three editable batch sources use the existing characters and 65-bone skeletons. Only these implemented garments are wearable:

| Outfit | Independent top | Independent bottom |
| --- | --- | --- |
| Charcoal square-neck & washed-black jeans | top-f-square-charcoal | bottom-f-washed-black |
| Ivory tank & light-blue wide jeans | top-f-scoop-tank | bottom-f-blue-wide |
| Relaxed tee & baggy jeans | top-m-relaxed-tee | bottom-m-blue-baggy |

Female tops and bottoms mix across the two female outfits. The male parts use the male skeleton. Every outfit and part has its own cropped thumbnail and item ID. The remaining reference designs are planning entries, not wearable promises. [Individual reference inventory](art/reference-catalogue/index.html).

Rejected clothing is removed from active shops, wardrobes, the standalone fashion study and the renderer used by NPCs. Wardrobe schema 2 archives the exact original version-1 wardrobe under `wardrobe.legacy`, maps retired equipment and saved looks to valid garments, and grants replacements free. Money, identity, progress, saved colours and other customisation remain intact. Original reference sheets and earlier Blender assets are retained; the pre-change checkpoint is under `checkpoints/2026-11-04-before-wardrobe-replacement`.

Run `npm run wardrobe:export` to export existing edited batch sources and validate; `npm run wardrobe:catalogue` to refresh the cropped inventory; `npm run check:wardrobe-replacement` for migration, rig and game-save isolation checks; `npm run check` for syntax. [Editing instructions](art/blender/batch-01/README.md) · [Review status and limits](qa/wardrobe-replacement/STATUS.md).

**Automated visual capture is pending.** The owner will review in a normal laptop browser and supply screenshots; the disconnected in-app Browser must not be repeatedly retried. `http://localhost:3000/?review=outfit` provides the actual game and four-view capture for the charcoal outfit, with an isolated save. `http://localhost:3000/fashion-review.html` previews this batch without reading or writing any story save. Approved environment, boutique geometry and controls are retained. No publication or APK rebuild in this batch.

This section supersedes historical wardrobe and approval status below.

---

# Blender outfit workflow — 4 November 2026

Blender 5.2.3 is available. The selected rightmost charcoal top/washed-black jeans now has an editable source at [art/blender/Square_Denim.blend](art/blender/Square_Denim.blend), using the retained character and 65-bone skeleton. [Portable editing/export instructions](art/blender/README.md).

The game’s isolated `?review=outfit` loads `Square_Denim_Blender.glb` and provides independent top/jeans colour controls. Normal wardrobe entries and saves remain unchanged. The original PNGs and earlier candidate are preserved.

**Single-outfit visual review remains open.** [Source comparison and actual asset renders](qa/blender-outfit/review.html) are provided, with [verification and remaining limits](qa/blender-outfit/STATUS.md). These are Blender renders, not game screenshots. The in-app Browser is unavailable, so actual live-game capture and phone performance verification remain pending. No further outfits, normal-play replacement, publication or APK rebuild.

Run `npm run outfit:export`, `npm run outfit:render`, `npm run check`, then `npm start`. This status supersedes the historical “Blender unavailable” note below.

---

# Wardrobe correction resumed — one outfit candidate, 2 November 2026

The supplied designs are required. Source audit found 75 PNGs and four text files, with no supplied 3D assets. The rightmost charcoal square-neck top/washed-black jeans in Denim_and_Everyday_Tops.png now has a separate fitted, skinned GLB review candidate. The original PNG is the catalogue reference picture. The plain matching back is inferred with the owner's explicit permission.

**Visual acceptance remains pending.** Actual front/side/back/seated game screenshots have not been captured because the Browser connection is unavailable. No exact-match claim and no wardrobe batch replacement. [Asset, source audit, differences, tests and migration gate](qa/exact-outfit-review/STATUS.md).

Run npm start and open http://localhost:3000/?review=outfit for the actual game with a separate save and four-view/source capture controls. The existing environment, interior work and menu/zoom repair are retained. Normal wardrobe ownership/equipment and named looks are unchanged; promotion waits for review. No publication or APK rebuild.

---

# Current owner review — 2 November 2026

**Wardrobe batch 1 and building interiors are visually rejected.** Approval applies to the outdoor visual direction and the menu/zoom repair, not generic interiors or approximate outfits. Preserve saves and ownership. Historical acceptance language below does not override this decision.

All accessible locations are tracked in [the interior checklist](qa/interiors-2026-11/CHECKLIST.md). Boutique & Salon has a local source candidate with its own fixtures and contextual catalogue conversation. **It is not complete or visually accepted:** actual in-game screenshots, live mirror rendering and device review are still required. Provisions, Mama T’s and Yaba library are the next members of the first batch; all other audited locations remain pending.

The exact-outfit task is separate: [selected original filename, sheet position and missing modelling assets](qa/exact-outfit-review/STATUS.md). No further wardrobe substitutions or batch expansion.

Local review: run npm start and open http://localhost:3000/?review=interiors . This is the running game using a separate interior-review save/identity; the normal story remains in its original slot. [Candidate evidence and limits](qa/interiors-2026-11/STATUS.md). No APK rebuild or publication in this pass.

---

# Current review — wardrobe batch 1 (1 November 2026)

**0.8.2-wardrobe.1 (11)** adds two female and two male everyday reference-based outfits as free, saved Full Outfits, with distinct garment geometry. It includes the Quick navigation zoom-hiding repair. Approved environment direction, customisation and existing gameplay are preserved. This batch has modelling limits and is awaiting owner/device review; other categories and features remain deferred.

[Batch handoff, exact reference selections, limitations and build status](qa/wardrobe-batch-1/HANDOFF.md) · [Labelled software pose comparisons](qa/wardrobe-batch-1/review.html). This newest status supersedes the historical notes below.

**APK status:** source candidate 11 is ready, but the tool-account build failed on SDK android-36/android.jar access. The existing APK is still code 10. Run `node tools/android-local-build.mjs --debug-only` in the ordinary Windows terminal; it also verifies the APK. No publication.

---

# Current update — 1 November 2026

The owner approves the current visual direction. The only new runtime change hides +/− zoom controls while Quick navigation is expanded and restores them when it closes, including navigation-driven closure. Existing tap/hold zoom and immediate cancellation on menu opening remain unchanged. The two-column portrait menu and existing minimum 44px touch targets are retained.

This is a source-only UI repair after build 0.8.1-visual.1 (10); the existing APK does not yet contain it. No publication or APK rebuild was requested for this focused pass. Recovery: checkpoints/2026-11-01-before-zoom-menu; the full previous source/APK checkpoint remains checkpoints/2026-10-31-visual-review-0.8.1.

Next: outfits using images the owner will supply. Do not begin replacement outfits or resume other feature work before those images arrive. Historical modelling limitations remain documented; approval of the direction does not remove them.

---

# Current priority — bounded visual correction (31 October 2026)

Review source **0.8.1-visual.1 (10)**: original skinned everyday shirt panels for female/male, cooler UI/environment, softer home furnishings and distinct Mama T buka details. Continuous seated eating and tap/hold zoom are retained and tested. Saves/customisation/signing/hosting identity are preserved. **Visual acceptance is pending; earlier partial acceptance is superseded.** Body, garment-contact and seated-skirt limits are explicit.

[Handoff and exact commands](qa/visual-correction/HANDOFF.md) · [Evidence/report](qa/visual-correction/REPORT.md) · [Labelled software comparisons](qa/visual-correction/review.html) · [Physical retest](qa/visual-correction/PHONE-RETEST.md) · [Remaining modelling work](qa/visual-correction/ASSET-LIMITS.md). Run `node tools/check-visual-correction.mjs` (includes `npm run check`) and review its logs. Automated checks/software renders are not device acceptance.

**Updated debug APK built and verified:** [Download build 0.8.1-visual.1 (10)](artifacts/android/city-and-us-device-test.apk). All 192 bundled files match the frozen source, the retained debug signature verifies, and signing files are unchanged. SHA256: `32a9d7cc9dfa8556f2df3c4e8b18f77d99994b05645923ac9ca9a0252590ee07`. Twelve automated suites passed, including `npm run check`; physical-device and visual acceptance remain pending. Do not publish. Future rebuilds use `node tools/android-local-build.mjs --debug-only` in the ordinary Windows terminal, then `node tools/verify-android.mjs --debug-only`; the tool account cannot compile against the protected SDK jar.

Further voice/Phone feature work is paused for this visual gate. The completed free Wallpaper flow is retained; unfinished language/voice-selection work is checkpointed outside the runtime. Owner will review future labelled voice samples personally; Nigerian authenticity remains unapproved. [Full Phone app audit and dependencies](qa/visual-correction/PHONE-APPS.md).

All dated notes below are historical and do not override this status.

---

# Current gate — portrait home and Mama T’s visual correction (30 October 2026)

Portrait-first phone gameplay supersedes landscape-only and portrait pause requirements. The supplied Android screenshots are failed acceptance. Finish the bounded home/Mama T’s correction and review build 0.7.1-portrait.1 (8) on the actual phone before applying the approach elsewhere. Preserve saves, ownership, controls and signing. No publication or new feature milestone. [Evidence](qa/portrait-first/REPORT.md) · [Phone retest](qa/portrait-first/PHONE-RETEST.md).

Delivery update: the ordinary-account debug build and fresh artifact verification passed. APK SHA256 `5d29c77b1e82269c4bb86bd0986e003edf3f50a1e9bcd6092626f033c5c990d5` contains all final saved repairs (187 bundled files match current source/checkpoint). No rebuild is needed for this documentation update. Device visual acceptance remains the gate.

Remaining existing-venue identity work after this gate: Dispatch parcel collection/loading circulation; boutique clothing displays/mirrors/fitting; hotel reception/lobby/rest route; eatery service/kitchen/takeaway; club DJ/dance/seating/light/sound. Audit and improve their role-specific geometry, furnishings and materials, not a universal recolour. Closed public/government sites stay closed. Retained character assets still limit torso/clothing drape and activity contact; do not claim reference-art parity from CPU checks.

---

# Current priority — finish existing experiences (30 October 2026)

The iPhone defect pass repairs dialogue completion/fallback/Exit, Bisi's routine, Ayo follow-ups, physical cooked meals and compact text. No new milestone/features are being opened. [Repair evidence](qa/phone-fixes/REPORT.md) and [phone retest](qa/phone-fixes/PHONE-RETEST.md). Automated checks pass; actual device acceptance remains pending. Preserve existing saves, characters, controls, portable source, ownership and the existing hosting identity.

---

# Active milestone update — 29 October 2026

Owner-authorised compact UI, kitchen/eating improvements, voiced NPC and selected player responses, reusable character behaviour, time/weather and Android packaging supersede earlier native-packaging deferrals. Preserve all earlier completed gameplay and ownership.

Implementation/evidence: qa/living-streets/REPORT.md. Acceptance pending on a real phone: food/utensil and handover contact, facial approximations, voice pronunciation/naturalness, HUD safe areas and sustained modest-device performance. Existing rig has no authored jaw/eyelid/viseme controls; small procedural deformations are an approximation. Stock English voices are not a verified Nigerian/Pidgin accent performance. Nearby pedestrians are scripted, not connected humans. The existing walking/activity game-clock pace remains; there is no offline catch-up.

Android source and secure signing/build instructions are prepared in android/. No APK/AAB was produced: sandbox access to installed SDK jars was denied during compilation. See qa/living-streets/ANDROID-STATUS.md. No store upload, publication, paid service or purchase is authorised. Multiplayer, elections, live microphone chat, ads and purchases remain planned.

---

﻿# City & Us roadmap

Owner-approved direction, merged 24 October 2026 from city-and-us-references/AGREED-PLAN.md. City & Us is the chosen name; availability has not been checked. The project belongs to the owner. Preserve package identity, legacy save keys, customisation, compatible animations, working gameplay, portable VS Code source and third-party licenses. No watermarks or unapproved branding.

## Current milestone — connected destinations (26–27 October 2026)

**Implemented for review:** reused Mainland/VI plus connected Ajah coast, hotel reception/rest suite, physical Lagoon Pot takeaway, club beat activity and beach clean-up; nonblocking portrait experience and nearby NPC labels/privacy. Full statuses and evidence: qa/connected-city/REPORT.md. Church/mosque/police/residence sites are mapped and CLOSED, with no false interiors. Beachwear audit is incomplete (existing casual items only). Automated checks pass; actual browser/device acceptance remains pending. The next tutorial/interview/economy milestone is planned, not implemented.

Preserve the completed home/street/service work and checkpoint checkpoints/2026-10-26-before-connected-city (209 files). Deliver a compact expansion before the next systems milestone; do not implement every follow-up together.

- Reuse Surulere and Yaba as Mainland, adapt the existing Island district into a stylised Victoria Island waterfront while retaining save IDs, and connect one compact Ajah/coastal area. This is a fictional compressed map, not geographic navigation. Selectively load distant scenery/interiors.
- Retain Mama T’s/buka and make the existing second eatery distinct. Prioritise working hotel, club and beach destinations: physical entrance, identity, marker, an interior where relevant and a tangible activity. Original fictional hotel design/name; no branded hotel copy. Planned religious/civic/residential sites must say unfinished and have no false Enter action.
- Map church, mosque, police station and fictional presidential/governor residence sites. Appointment-based presidential/governor visits are later work. No enforcement implementation in this destination pass.
- Add a few purposeful NPC roles/shopfront details; name labels must identify NPCs explicitly, limit distance/overlap/visibility through walls, and respect privacy. Real stranger display names require real shared accounts; never expose account IDs or imply NPCs are human players.
- Audit Beach catalogue against actual purchasable/equippable meshes; document missing designs instead of adding placeholders.
- Current portrait requirement: active gameplay, no rotation notice; compact controls, purpose-built camera, safe-area/keyboard support. Background/native pause remains.

## Next bounded milestone — guidance, employment and fictional economy

After connected destinations: a short skippable/replayable action-led tutorial with saved progress (joystick, camera, Action, doors, phone, navigation, needs and first gig). Do not substitute a long instruction page.

Distinguish casual gigs from employed positions. Employment needs a short conversational interview with meaningful answer/skill/requirement checks; rejection must be possible and explained. Show pay unit, hours and responsibilities before acceptance. Resignation must state consequences and reapplication rules. Existing jobs remain casual local gigs until these employment systems are implemented and tested.

Review wages against food, fares, rent, clothing/furniture; label per-order/per-shift/per-game-day pay. Document a fictional economy with affordable essentials and meaningful saving/wealth progression; make no real-world wage-accuracy claim. Do not silently rebalance existing ownership or cash in this destination pass.

## Later shared-world and life systems — planned, not simulated online

- Different occupations/social roles; later international travel. Game days stay separate from real dates. Optional ageing with a clearly explained adjustable pace, never one game day = one year. Server-timed real-world appointments and monthly elections stay independent of accelerated simulation/ageing. Current game days do not age characters.
- Friends/public Player ID, Chat and Events require real accounts/shared state. Requests/acceptance, accepted-player messages, blocking/reporting, event creation/invitations/RSVP/venue capacity. Invitation-list size is separate from concurrent attendance capacity; show both honestly. No fake online contacts or multiplayer claims before tested backend authority.
- Preserve babalawo/traditional spiritual roles independently of criminal activity. Retain the fictional yahoo-boy crime storyline without real fraud instructions. Financial-crime investigators may investigate/arrest characters only through fictional evidence, missions, permissions and fair rules; define consequences and review/appeal for incorrect enforcement. No arbitrary player arrests or paid immunity. Existing police/fictional agency roadmap and abuse-prevention requirements remain.

## Preserved milestone — physical home activities, then a livelier street

Owner instruction, 26 October 2026: complete and report home functionality before street work. Preserve working iPhone startup, touch controls and background pause, resolution settings, saves, purchases, inventory and owned furniture. Checkpoint: checkpoints/2026-10-26-before-physical-home/.

**Street/service implementation status (26 October):** after the home report, added the bounded warmer street comparison, two existing pedestrian routines, optional nearby conversations/directions, visible selection with physical-door checks, and Mama T’s two-customer service shift. Automated handler/state journeys pass; software previews are in qa/street-life/review.html. New device/browser, touch, audio and performance acceptance remain pending. No expansion of police, financial-crime agency, native Android, districts or character assets.

**Home implementation status (26 October):** A–E implemented for review; state/handler/mobile-lifecycle checks and syntax pass. Software previews and limitations: qa/physical-home/REPORT.md. Actual Safari/Android rendering, touch and audio acceptance remain pending. Original procedural activity cycles use retained idle/walk rig; art refinement is outstanding.

1. Compact mobile activity strip: activity, remaining time and Cancel; expandable details, safe areas, visible character and controls.
2. Physical food: one saved inventory across scenes, received → carried → placed/opened → partly eaten → consumed. Hand package, table placement/opening, seated eating with visible food and utensils. Hide/remove only after consumption, discard or deliberate storage. Duplicate receipt/meal/needs-reward guards; reload every stage.
3. Interactive fridge and dry cupboard: visible contents and saved ingredient quantities, eligible grocery/leftover storage and withdrawal. Available/missing recipe ingredients. Two complete recipes at physical stations: collect → prepare → cook/stir → plate → eat/store. Short touch prompts, visible ingredients/utensils and character movement, no expensive physics; exact-once deduction.
4. Visible activities: seated reading/typing with a book/computer; shower entry, modest privacy, water/sound/movement and exit; aligned eating hands, seating and food. Identify missing animation assets; never claim idle is a completed action animation.
5. Comfortable home: more usable room/doorway clearance and separated kitchen, bathroom, sleep and living zones. Migrate conflicting furniture to storage without deleting ownership or receipts; clear activity routes.
6. Only after the home report: one before/after street comparison with warmer/brighter palette, readable inexpensive shadows, varied shopfronts/signage/Nigerian details and coherent identity. Purposeful NPC routines, nearby optional Talk, greetings/directions/declines; landmark names and optional existing route. Direct visible object/person/building selection; building name/actions, physical door approach required, explicit decorative-vs-enterable status. Protect phone performance.

Acceptance sequences: receive outside → carry through door → place/open/eat; store groceries → reload → select/cook recipe → eat/store; study/shower/compact strip/clear walkways; then greet an NPC and ask directions on updated street. Separate automated, software-rendered and actual browser/device evidence. Discuss costs before any purchase.

## Preserved priority — mobile resolution and performance comparison (26 October 2026)

The owner confirms the game works on iPhone 11 but the world looks blurry. Preserve the confirmed mobile startup/controls and accepted character assets. Saved Low (1×), Balanced (1.25×) and Sharp (1.5×) resolution options now change the render buffer independently of lighting. Mobile shadows/AA remain off; no automatic full-device-DPR rendering. Old mobile saves start at Low, with bounded higher steps chosen explicitly. DOM text and SVG UI remain sharp.

An in-game 15-second walk comparison records average FPS, frame interval p95 and slow-frame percentage after warm-up. Interruptions cancel the sample; results include viewport/scale/location for fair comparisons. Actual new phone performance remains pending owner measurements; automated fixtures do not establish device speed. See qa/resolution/REPORT.md and the 191-file owner-confirmed checkpoint checkpoints/2026-10-26-working-iphone-before-resolution/.

The LAN-HTTP identity fix and independent startup/asset/WebGL/shader diagnostics are preserved. The earlier blank-world report is resolved by the owner's iPhone confirmation, not by geometry tests. Android-device verification remains separate.

Current orientation policy (30 October): portrait-first active phone gameplay; preserve landscape/tablet/desktop usability, safe areas and visual-viewport keyboard handling. Native packaging is authorised and requests portrait; prior web-only/native deferral is historical.

## Preserved milestone — playable daily life and phone fulfilment (26 October 2026)

The owner accepts the current appearance sufficiently to continue. Preserve the accepted checkpoint at checkpoints/2026-10-26-before-daily-life/ (182 files); character replacement and further fashion polish are explicitly deferred. This acceptance permits the bounded daily-life milestone; it does not claim the supplied reference art standard has been achieved.

Implemented candidate: Phone Food (Mama T’s two meals, physical collection/delivery to three existing entrances, explicit handover and stored meals), one Phone Ride service (three curb stops, physical pickup/boarding/road-loop travel/alighting), and home cooking (chop, heat, stir, serve, pause/resume). Needs, game-currency payments/refunds, new objectives and version-1 saves are connected. See qa/daily-life/REPORT.md for safeguard/reload checks and exact browser/device limitations. Preserve existing wardrobe, decorating, courier work and locations. No district expansion, paid assets, second ride service or online authority is included.

## Deferred character and fashion art

Checkpoint: checkpoints/2026-10-26-before-fashion-review/ preserves 161 runtime/source/asset files and hashes. Current review: [report](qa/fashion-review/REPORT.md), [rendered comparisons](qa/fashion-review/review.html), [free asset plan](qa/fashion-review/ASSET-PLAN.md). Play http://localhost:3000/fashion-review.html. This study does not access browser saves. Existing gameplay/wardrobe ownership and furniture layouts remain in the original game.

Delivered foundation: 12 labelled natural skin swatches, legacy custom-colour preservation, neutral preview lighting, six existing hairstyle samples across two characters, casual and native outfit samples, narrower iro/senator profiles, existing accessory selection, optional UV makeup study and small lazily loaded thumbnails. These remain visibly stylised. No natural face replacement, textured hairline, fitted lashes or finished cloth solution is claimed. Makeup is preview-only, not persistent or purchasable. The supplied frames are compared in local QA only.

Asset blocker: the retained superhero bodies, painted/faceted skin, opaque hair shells/tubes and body-derived clothes cannot achieve the requested reference standard through more primitive additions. Preferred proposal is MakeHuman/MPFB CC0 core characters/natural skins with authored hair and clothes; the asset plan also compares free CC-BY Rain/Snow. Preserve body customisation and animation compatibility through a tested retargeting/migration step.

When a later art milestone is authorised, expand with real fitted assets, not placeholders:

- Hair: braids, cornrows, locs, twists, afro, curls, wigs, ponytails, updos, short cuts and fades; colour choices, textured hairlines and stable moving attachment.
- Makeup: optional brows, fitted lashes/eyeliner, lipstick and blush; individual intensity controls, reset/no makeup, face/skin-tone-specific fitting, saved looks.
- Fashion occasions: Casual, Work/Formal, Native Wear, Wedding, Dinner/Party, Beach, Sportswear. Include actual distinct agbada, senator, ankara, iro/buba, gele and fila designs, with formal outfits appropriate for government occasions. Resolve stiff/bulky gowns with garment assets and tested weights.
- Accessories: earrings, necklaces, bracelets, watches, rings, glasses, hats/headwear, bags and footwear; independent sensible slots, correct attachments, removal and explicit pre-purchase compatibility rules. Current headwear tuck notice is only the first compatibility case.
- Catalogue: category tabs and filters, visual thumbnails, game-currency prices, Owned/Equipped states, separate shopping/inventory, large rotation and face/full-body preview. Preserve confirmed once-only purchases, named outfits and persistent ownership. Preview/cancel must never charge or overwrite the equipped look. Keep asset loading bounded and measure repeated use on modest Android.

Browser/device verification remains pending: supported browser discovery returned no sessions. Software renders and automated state/geometry checks do not establish reference-quality rendering; current appearance acceptance comes from the owner. Existing Site identity has been recovered in .openai/hosting.json; publication currently fails to connect to its Git host. Do not create another Site or label the old hosted build as this review.

## Working foundation

Local solo play: appearance editor, traits/goals/starting homes, needs, skills, groceries, rent, home activities, furniture purchase, tasks and local saves/import/export. Physical doors connect Home, courier Dispatch, provisions and Yaba/Island venues. Courier payment is guarded against duplicates. Camera collision/cutaways, circular minimap, green walkable routes, phone screens, compact HUD and district loading are implemented. Automated checks remain separate from rendered/device acceptance; see qa/VALIDATION.md.

Local Player IDs are not accounts. Friends, multiplayer, elections, flights, families, ads and online ownership are not functional.

## Preserved functional milestone — Wardrobe, Shopping and Home Decorating

Owner update, 25 October 2026: the prior corrections are accepted sufficiently to move forward. Preserve them; do not restart the visual milestone. The accepted source is recoverable in checkpoints/2026-10-25-accepted-corrections/ (97 files with SHA-256 manifest). The earlier correction report remains historical evidence, not an active feature gate.

The current scope is the complete boutique/salon → preview → purchase → equip → named look → home → furniture purchase/place/rotate/move/store → reload journey. Game currency only. No government, families, multiplayer, district expansion or paid assets/services in this pass.

Implemented candidate: 35 fashion catalogue entries across the eight requested categories; owned/shop separation, actual mesh thumbnails, rotatable/zoomable animated preview, preview cancellation, confirmed purchases, persistent ownership, equip/unequip and named looks. A physical Boutique & Salon occupies the existing salon; the home wardrobe shares its inventory. Eight original furniture pieces across Tables, Storage, Lighting and Decor support buy/place/rotate/move/store, valid/invalid feedback, collision and activity-route checks, saved layouts and existing finishes. Installed activity stations and the legacy sofa remain anchored. The new furniture collection is movable. See qa/wardrobe-home/REPORT.md for actual counts, validation and limitations.

Remaining defects and review: live browser CSS/WebGL, native touch, modest-Android performance and garment fit in live rendering still need owner/device review. Software previews and automated checks are separate evidence. Preserve close/whole-apartment views, doorway continuity, routes, accepted characters and old saves while addressing reported defects. Future varied floorplans, relocation of installed activity stations, cloth simulation and additional catalogue assets stay separate increments; no roadmap expansion is authorised here.

## Phone — agreed requirements and delivery gate

Owner update, 24 October 2026. The visible name is **Phone**. The owner has accepted the prior corrections sufficiently to proceed with the wardrobe/home milestone. Deliver further phone work in separate bounded app milestones; do not implement all apps at once.

### Interface and customisation

Build an original, polished smartphone interface: coherent device frame, readable status area, carefully spaced labelled icons, consistent typography, clear Home/Back/Close navigation and responsive portrait/landscape layouts. Each app needs its own purpose-built screen hierarchy, useful content and real interaction states. Opening a different app must not just repeat a generic menu.

Provide saved wallpaper, theme/light-dark appearance, accent colour and app arrangement preferences. Keep defaults and migration compatible with old stories; preserve separate main/review saves, appearance and progress. Maintain readable contrast, touch targets, scrolling, keyboard/focus access, modest-Android performance and reliable return to gameplay. Use local/original or appropriately licensed artwork; discuss costs before any purchase/service commitment. Never infer a branded partnership from the reference screenshots.

### App inventory and implementation status

The inventory below preserves the current named app plan and adds the owner's explicitly required ride ordering and playable mini-games. The phone screenshots also contain third-party branded services; their presence is not permission to copy them or add their entire catalog. Existing wider agreed gameplay plans remain elsewhere in this roadmap.

| App | Required underlying gameplay | Current status / delivery dependency |
| --- | --- | --- |
| Jobs | Real job opportunities, accepted work, objectives, physical collection/delivery or venue activity, completion and exactly-once pay. | Local courier/shop guidance works; additional occupations remain planned. |
| Profile | Actual saved identity, traits/goals, home and skills; working character editor. | Local profile/editor work; authenticated public identity remains planned. |
| Navigation | Actual world/entrance map, facing, destination selection, street route and rerouting; preserve the always-visible circular minimap. | Preserved from the accepted correction checkpoint; live device verification still pending. |
| Tasks | Real progress, navigation to required activities, completion and guarded reward claims. | Implemented locally. |
| Settings | Working controls, graphics, save export/import and phone customisation. | Existing controls/graphics/save actions work; phone appearance/layout customisation unfinished. |
| Ride | Select pickup/destination, see an in-game fare, request a vehicle, track its physical arrival, board, travel and alight at the destination. | Local solo implementation: one service, three existing stops, physical vehicle/boarding/road-loop travel/alighting, guarded fare/refund and saved trip. Browser/device review pending. |
| Food | Browse an available restaurant menu, place a priced order, track preparation/collection/delivery, receive food and consume or store it. | Local solo implementation: Mama T’s two meals, preparation, courier collection/delivery to three entrances, handover, storage/eating and guarded payments. Browser/device review pending. |
| Games | Actual playable mini-games with clear rules, controls, start/play/pause/end/replay, scores and saved best results. | Unfinished; deliver playable mini-games (plural), not links, static mockups or score buttons. |
| Chat | Send/receive real messages between accepted players with saved history and required block/report handling. | Unfinished; depends on accounts, shared service and moderation. |
| Friends | Stable public IDs, request/accept/decline/remove, invitations and permitted physical visits. | Unfinished; local Player IDs are not online accounts. |
| Events | Create/join/RSVP/invite, real venue/time/guest state and playable attendance/activities. | Unfinished; follow agreed event and permission rules. |
| Government | Actual terms, officeholders, treasury/budgets/projects and permissioned actions tied to the government systems. | Unfinished; depends on tested authoritative government implementation. |
| Voting | Eligible accounts, real candidates/manifestos, one vote per office, deadlines, results and succession. | Unfinished; depends on tested server authority; no mock votes or local-only election claim. |

Only implemented, tested app flows belong on the playable phone home screen. Keep unfinished apps and remaining subfeatures recorded here; do not fill the phone with disabled/Soon icons or buttons that merely announce a future feature. A partially delivered app may expose its working functions, without implying unfinished functions exist. Current visible apps: Jobs, Profile, Navigation, Tasks, Settings, Food and Ride. Distinct existing screens are retained; polished customisation is not yet claimed complete.

### Physical ride and food fulfilment

Ride and food requests must link the phone to the existing physical world and correct pickup/delivery entrance. A confirmation screen is not fulfilment.

- **Ride:** select a reachable pickup and destination; show fare/availability before confirmation; create one trip ID; dispatch a visible NPC vehicle for solo play along valid streets; show truthful waiting/arrival status; require the player to reach and board that vehicle; visibly travel and alight at the selected stop/entrance. Do not substitute an instant location change. Persist trip state and settle the in-game fare once, with defined cancellation/refund behavior.
- **Food:** select an actual restaurant and reachable delivery address/entrance; show menu, quantity, total and availability before confirmation; create one order ID; preparation leads to physical pickup from that restaurant and a courier journey to the chosen entrance, followed by handover/receipt. If self-collection is offered, the player must reach the restaurant and collect it. Ordering alone must not add food to inventory or restore hunger. Receipt adds the actual food item; eating applies its effects.
- Keep request IDs, money, fulfilment state and the corresponding world actor/location consistent through saves, reloads and interruption. Test duplicate taps, unavailable routes, cancellations, retries, refunds and exactly-once charge/receipt. Do not claim shared deliveries or rides until independent clients and server state are tested. Do not invent real-time ETAs without simulation support.

### Bounded implementation and acceptance

The owner now authorises food fulfilment, one ride service and cooking together as a bounded daily-life milestone. Further smartphone customisation, Games-app mini-games and other apps remain separate increments. Social/government apps wait for their stated gameplay/backend dependencies. Preserve the full inventory rather than dropping unfinished apps from the plan.

For every app, implement and test the underlying gameplay/state/save behavior together with its distinct screen, then inspect rendered interaction and phone-device usability before calling it complete. Mini-games need actual played rounds; Ride needs request → physical vehicle pickup → boarding → travel → alighting; Food needs request → restaurant pickup → physical delivery → receipt → eating/storage. Reports must distinguish automated tests, software previews, live browser and physical-device results. The current authorisation covers daily-life fulfilment and cooking, without an unrelated phone redesign.

## V1 work — separate milestones

1. **Home decoration and daily life.** Buy/place/rotate/move/store furniture and change finishes; validate clear walkways and save layouts. Visible cooking/eating/washing/sleep/study/computer/wardrobe/sitting. Start modestly, then rent larger apartments as well as buying later; rented homes remain decoratable. Later varied layouts, floors/stairs and decorator work. Decorator invitations by stable Player ID need acceptance, property-scoped permissions, budget, approval and revocation, never ownership transfer/unrestricted access. Progress towards home/rental/landlord/club ownership with clear tenancy terms, NPC tenants/customers for solo play and no devastating offline charges.
2. **Useful city and occupations.** Deepen Lagos and physical courier/trading/decorator/DJ jobs; connected enterable shops, workplaces, restaurants, homes and venues. Everyday/native clothing: agbada, senator, ankara, iro/buba, gele, fila and kaftans. Traits, attitude, life goals and home choices affect saved progression. Balanced occasional NEPA interruptions, generators/inverters. Walking first; later danfo, keke, taxis, private cars and ferries. Useful maps/green routes and reserved billboard inventory. Broader cities follow an appealing Lagos V1.
3. **Accounts and small shared sessions.** Solo and one-friend play; NO eight-player minimum. A configurable, tested technical room maximum; host privacy, invitations and preferred capacity within that bound. Friend lists, persistent groups and visible concurrent players are separate concepts. No unlimited-capacity claim. Evaluate Supabase Free auth/database and Colyseus with free/low-cost hosting: candidates, not purchases or proven capacity. Server validation of money, jobs, ledgers, movement, rooms, ownership and permissions. Reconnect, portable deployment, backups and save migration. Test real independent clients, never NPC substitutes.
4. **Friends and visits.** Stable public Player IDs separate from secrets/local IDs. Accepted friend requests/chat, invitations, blocking/reporting/moderation before public social play. Visitor physically approaches/knocks; server notifies owner and requires permission. Both see shared movement/interiors and consistent street entry/exit. Test denied/revoked/stale access, reconnect, duplicate requests and unauthorised entry with server logs.
5. **Events, clubs and audio.** Weddings, birthdays, housewarmings, naming ceremonies, club nights/gatherings: venue, date/time/timezone, guests, RSVP, invitations, dress code, decorating and game-currency gifts. Friday club nights/Saturday disco/Sunday parties plus custom schedules and public/NPC solo events. Dance/socialise/seating/food/music. DJ booth/gigs, approved catalogue, synchronised playback, club ownership/hiring/expenses. Original or commercially licensed music/effects, including appropriate independent-artist grants. Separate music/effects/ambience levels and mute; clicks, footsteps, knocks, cooking, traffic and neighbourhood sound. Reference music is not licensed.
6. **Android first release.** Play Store first; public web later. Desktop retained for development/review. Joystick/action and independent camera, portrait/landscape, adjustable graphics and measured modest-device performance. Packaging, lifecycle/resume, storage migration and release checks. Prepare optional rewarded ads for launch as a separately tested integration; basic movement, saves and friend visits never require forced ads. Later cosmetics and billboard/event sponsors. Real-cash promotions remain a separately reviewed future proposal. No revenue promises.

## Later bounded expansions

- **Couples/families:** mutually accepted relationships, optional proposals/marriage and shared household permissions. Optional non-explicit pregnancy only with agreed participation and adjustable progression; never automatic from dating. Adoption for solo parents/couples, NPC children initially, household care and saved relationships. Children must move into and appear in the home. Optional naming/welcome ceremonies. Do not infer autonomous AI from captions.
- **Airport/return travel:** one airport/destination first, fares/booking, check-in, boarding, skippable journey, arrival activities, return booking/travel. Airport jobs later. Test money/progress persistence and interrupted travel. Abuja/Port Harcourt are reference destinations, not current playable cities.
- **Government:** monthly server-clock president/governor/two-legislator elections; one vote per eligible account per office, countdowns, candidates, manifestos, results and terms. Authenticated server authority, auditable tallies and transfer of office; test duplicate/replay/concurrent votes and deadlines. Public virtual-tax treasury, budgets, spending logs and completed projects. Bounded virtual corruption/accountability consequences. Unique bad-governance reports with anti-spam; threshold enables a legislative proposal, not automatic removal. Define removal vote/succession; impeachment can trigger an exceptional replacement election. No paid votes/political authority.
- **Government places:** Government House, presidential residence/offices with private/public areas, meetings, appointments, ceremonies/inauguration, NPC security, official vehicles and visits. Permissions separate from cosmetic access. Official privileges/property pass to the next officeholder, not permanent personal rewards. OneState reference supplies atmosphere only.
- **Reserved links:** Ikeja north of Yaba (past z=-112), Victoria Island east/southeast of Island (past x=126), then Lekki. Require useful destinations, continuous walkable geometry, entrance routes and loading budgets before opening/claiming playable. Compressed fictional planning directions, not geographic reconstruction.

## Police and fictional financial-crime agency — roadmap only

Record two future career/investigation paths: local police and the fictional Civic Financial Integrity Bureau (CFIB). The name describes a game-only agency and implies no real affiliation. Do not implement these in the daily-life milestone.

- Stations: enterable police stations and CFIB offices with public reporting desks, case/records areas and permissioned staff areas; reuse or add locations only in an authorised later milestone.
- Careers: optional training, supervised entry roles, progression, shifts and game-currency pay for legitimate duties. Define role permissions; a costume or rank cannot grant unrestricted powers over players.
- Reporting: structured incident reports with time/place, relevant evidence, acknowledgement and case status. Protect reporter privacy; rate-limit duplicates and abuse. An accusation or popularity vote is never automatic proof.
- Investigations: saved case IDs, evidence provenance, interviews, leads, audit trails and reviewable outcomes. CFIB handles fictional fraud, embezzlement and public-fund cases using in-game transaction records; no access to real financial accounts.
- Fair enforcement: published rules, proportionate bounded consequences, evidence thresholds, notification, independent review/appeal, conflict-of-interest handling and reversal/refund after mistakes. No arbitrary confiscation, pay-to-escape enforcement, profiling or unchecked player-police authority. Separate mistakes from intentional misconduct; begin with controlled solo NPC cases.
- Shared enforcement requires tested server authority, permissions, immutable case/action logs, anti-abuse controls and reconnect/replay tests before player-facing powers. Offices, careers, reporting, investigations and enforcement are currently unimplemented.

## Costs, assets and hosting

Suitable free licensed assets first, provenance and MIT notice retained. Discuss any purchase/subscription/paid service before spending. Before backend selection estimate auth/persistence, region, concurrency, compute, database/storage, bandwidth and logging. Free local testing does not establish internet capacity or free production operation. Naming availability remains unchecked.

Continue this checkout and preserve .openai/hosting.json if present; never create another Site for it. The existing identity was recovered on 26 October 2026; the current files remain local because source-host connectivity prevented publication. No purchase or hosting commitment is part of this local review milestone. Plans remain planned until implemented and tested, one bounded milestone at a time.

## Confirmed Mama T’s gap — after home activities

Owner reports the existing kitchen job leaves the player idle with no visible customers. Replace that job only after the current home work: a small purposeful customer flow arrives, queues, orders, receives food and leaves. Player accepts, prepares/collects the correct meal and serves with visible actions/carried food. Short order indicators, patience and clear feedback; once-only successful-order pay. Reuse cooking/inventory where appropriate. Test cancellation, leaving and reload without duplicate pay or stuck customers. Protect mobile performance; idle plus a progress bar is not a completed service job. This supplements, and does not replace, the recorded street requirements.

Mama T implementation update, 26 October: the bounded two-customer flow is now implemented for review with shared recipe/meal inventory, visible procedural preparation/stirring/handover, patience, cancellation/leaving and once-only payment. State and shipped-handler journeys pass. Actual browser/device verification and animation/art acceptance remain pending; see qa/street-life/REPORT.md. The larger restaurant/customer system remains future work.
