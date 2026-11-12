# Boutique & Salon candidate — not visually accepted

2 November 2026. Local source only. No publication, Site change, APK rebuild or wardrobe replacement. The rest of the requested interior/role-dialogue work is open in CHECKLIST.md.

## Implemented candidate

Dedicated boutique geometry replaces the inherited brown shop room: pale blue ceramic floor with grout and navy skirting; cool walls; six hanging garments on a metal rail with hangers and hooks; two shaped mannequins; shoes with soles/laces, handbags and a small accessory display; an enterable fitting alcove with curtains/seat/full-length mirror; a separate checkout with POS/card reader; two hydraulic salon chairs, mirror/shelf stations, bottles, combs and a hairdryer. Counter fixtures use shaped parts and material batching. The owner-reference wardrobe was not used or reinterpreted for the scenery garments.

Attendant at checkout, stylist with a seated client, and a visitor browsing the rail. The shop fixtures occupy their own collider regions. Staff/visitor reserved positions are blocked, with clear public routes. Activities are lightweight procedural poses on the retained character rig, not newly authored salon animation assets.

Four mirror surfaces have planar reflection support. Only one front-facing mirror nearest the player updates at 6 Hz at 192×384; other mirrors retain their last reflection. GPU target restoration, non-recursion and scheduling were checked with a renderer double. Actual WebGL shader compilation, reflected image orientation/quality, cutaway behaviour and phone speed remain UNVERIFIED.

## Existing interactions connected

- Checkout: browse, preview/cancel, confirm purchase with real wallet/ownership checks, equip and named looks. No new prices or fees.
- Stylist station: hairstyle catalogue, selected hairstyle/price, insufficient funds, purchase and apply through the existing equipment system. This is not a new timed haircut simulation.
- Fitting area: clothing catalogue with existing standing/walking/seated pose preview and cancel. No claim that rejected clothing matches the owner's designs.
- Dialogue is attributed to the approached attendant/stylist. Selection, confirmation, funds, paid/owned and equipped states update the line; a reopened conversation in the same loaded story does not greet again mid-flow. The stylist acknowledges the current client. Conversation memory is session-local; purchases/equipment continue to persist through the original wardrobe save. New lines are subtitles only and trigger no unrelated audio.
- Entrance and exit retain the existing physical doorway transition. Outdoor meshes, camera and zoom/menu logic are unchanged.

## Checks passed

- npm run check — syntax, including the three new boutique modules.
- node tools/verify-boutique-interior.mjs — shipped collision movement and navigation to checkout, stylist, fitting alcove, rail and shoe display and back to the exit; actual purchase/equip guards; reflection scheduling/state restoration. 72 static meshes / 16,822 triangles before staff. These counts do not establish mobile performance.
- node tools/verify-boutique-journey.mjs — shipped game driven through synthetic joystick/UI: physical entry, preview/cancel, duplicate confirm charged once, equip, saved look/reload, stylist/fitting access, exit, and separate review-slot/main-save isolation. DOM/WebGLRenderer/storage doubles: not live browser evidence.

Logs and JSON results are in this folder. Source checkpoint is before/. Existing default save keys, wardrobe ownership and named looks are retained. No real user save was read or modified by the tests. The checkout has no usable Git repository; no commit is claimed.

## Required live review

Run npm start from this portable checkout, then open:

http://localhost:3000/?review=interiors

This runs the actual game with city-and-us-interiors-review-v1 and city-and-us-interiors-review-player-id, separate from the main story, daily review and apartment review. Normal story remains at / on the same origin.

Capture actual running-game screenshots at the entrance/overall layout, checkout and rail/fitting area, and salon stations/client. Walk all routes and exit. Check mirrors from both sides, dialogue after insufficient funds/purchase/equip, portrait touch controls and sustained modest-Android performance. Do not change the main save for screenshots.

The Browser skill was loaded and browser discovery returned no available browser (iab unavailable; browser list empty). Therefore this pass has NO actual in-game screenshots. mesh-inspection-*.png are internal software renders, explicitly not browser screenshots or acceptance evidence. Do not present them as the requested live screenshots. Visual completion and acceptance remain pending; the other interiors have not been expanded ahead of this first review.

## Independent outfit gate

../exact-outfit-review/STATUS.md records the original file and selected rightmost outfit, observed requirements and missing authored geometry/UV/weights/seated corrections. No garment or catalogue source was changed.
