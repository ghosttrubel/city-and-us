# Mobile Safari startup and landscape-only web review

26 October 2026. Candidate fix ready for device testing. **Actual iPhone 11 and Android rendering/touch verification is pending the owner's confirmation.** No actual browser session was available; the Browser skill runtime returned no sessions. Automated assertions are not pixel or device evidence.

## Exact local-network link

Open **http://10.126.70.116:3000/?review=daily&diagnostics=1** on the phone/tablet. This is the current Windows WiFi interface address, checked by HTTP from the host on 26 October. It opens the separate daily review save. Main story on the same origin: http://10.126.70.116:3000/ . Localhost on the phone means the phone, not the computer.

Keep the computer awake, the server running and both devices on the same Wi-Fi. The existing server is already serving these files. If it has stopped, run npm start in the project folder. No install or paid service is needed. A DHCP change can change this IP. A different hostname/IP is a different browser storage origin; use the existing save export/import when moving origins, and do not clear Safari website data to test this fix.

## Simple iPhone 11 / Android browser test

1. Open the review link in Safari on iPhone 11, or Chrome on Android. Disable portrait orientation lock if necessary. In portrait, expect **Rotate your device to play**; the game and inputs must remain paused. No artificial page rotation/stretching or orientation-lock API is used.
2. Rotate sideways. Diagnostics should reach **First frame submitted** and show build mobile-startup-2026-10-26. Collapse Diagnostics to inspect the scene. Confirm the home/world, character and minimap actually contain visible content. A submitted-frame count alone does not prove correct pixels.
3. Move with the left joystick, release to stop, drag the right side to turn the camera, and use Action. Open Phone, then close it. Rotate to portrait while moving, wait, rotate back: the player must stay stopped until a fresh input. Try both landscape directions and show/hide the browser bars; controls should stay inside the notches and home indicator.
4. Start cooking or order food in the review. Rotate to portrait / switch apps, wait, and return: progress must pause and resume without a time jump or new charge. Reload once and check your position/order/meal. On a tablet, repeat at its landscape size.
5. If blank or stopped, expand **Diagnostics**, tap **Copy report** (or manually copy the selected text), or send a screenshot of the panel. Include iOS/Android/browser version and whether it fails before/after rotation. Retry reloads the same URL; it does not clear saves. Report separately whether world, character, minimap and touch controls work.

## Diagnosed startup fault

The prior code used crypto.randomUUID() to create the local Player ID. That API is restricted to secure contexts; normal LAN HTTP differs from localhost. On a fresh phone/origin the call throws, the catch block calls the same function again, and startup stops before renderer and minimap initialisation. The earlier loading overlay had already been removed, which exposed HTML controls with no running world. The previous function was reproduced failing with randomUUID unavailable.

The replacement uses crypto.getRandomValues() to generate the same LS- plus 16 uppercase hex format. Existing IDs and save keys are unchanged. getRandomValues is available in insecure contexts; see [MDN randomUUID](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID) and [MDN getRandomValues](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues). This identifies and fixes a real network-startup defect; it does **not** establish that this was the only failure on the owner's iPhone. The new diagnostics collect that evidence.

## Changes

- A small classic bootstrap script runs before importing the game. It captures error/unhandled rejection, failed fetch status/path, required asset-load failures, module initialisation errors, WebGL constructor errors, shader/link diagnostics and context loss/restoration. A startup stall shows an error with Retry. The panel works without devtools and keeps at most 40 log entries. It includes no save contents or Player IDs.
- Loading remains visible until a render call returns. Progress reports character assets, saved story, WebGL, scene/character construction and saved-location opening. Diagnostic counters show frame submissions, CSS and backing-buffer canvas sizes, draw calls, triangles, geometries, texture counts and live renderers. Heap bytes appear only if the browser exposes them; Safari/GPU byte usage is explicitly unavailable. A normal disposed preview is excluded from context-loss failure handling.
- Phones/tablets use no antialiasing, a maximum pixel ratio of 1 (battery mode remains 0.75), no world shadows and low-power preference. The saved graphics choice is retained. Current character, clothing, texture and scene assets were not replaced. No visual-quality work or city redesign occurred.
- Phones/tablets are landscape-only, including touch-capable iPads reporting a desktop user agent. Portrait uses an independent full-screen rotate prompt and an inert game tree with input capture blocking. Simulation, animation, rendering, cooking, delivery/travel, held joystick and keyboard input pause. Rotation/background lifecycle resets elapsed-time/input state and saves through existing safe-position handling. Menus and previews resume in place.
- Canvas aspect/buffer and UI dimensions follow the visual viewport; resize, orientation and browser-bar changes update them. Safe-area insets protect controls/menus. Phone landscape, short screens and tablet landscape retain reachable controls. CSS layout/touch acceptance remains a device test.

## Network, asset and memory audit

The host fetched all 35 discovered JavaScript modules and all character-directory assets over http://10.126.70.116:3000 with HTTP 200 and appropriate MIME types. GLTF asset URLs are module-relative; no localhost-only absolute asset URLs were introduced. The existing GLTF loader already includes a Safari-specific image-decoding fallback. The retained renderer is Three.js r169 (WebGL 2); the monitor reports the actual context/shader version or failure on the device.

The character directory totals approximately 1.64 MiB compressed. Five external textures are each 512 × 512; a simple RGBA-plus-mipmap estimate is 1.33 MiB each. This is file metadata, **not measured Safari/GPU allocation**; geometry, canvas textures, framebuffers, previews and driver overhead add usage. No evidence yet justifies changing the accepted assets. See network-assets.json and phone diagnostics for the bounded audit and live counters.

## Automated checks

- Required npm run check.
- npm run check:mobile: reproduces the previous HTTP crypto failure; verifies import/asset/shader/context failure UI, deliberate renderer disposal, capped DPR and diagnostic state; actual game handlers verify paused cooking/delivery, held-joystick reset, viewport resize, no elapsed-time catch-up, fresh HTTP-compatible identity, reload and protected ownership/layout state. DOM, renderer, timers and storage are isolated doubles.
- Existing daily-life journey and wardrobe/decorating journey pass, including payment, cancellation, completion, reload and activity access. Their unchanged exhaustive geometry/pose suites were not rerun as rendering evidence.
- HTTP module/asset audit: network-assets.json. Checkpoint/unchanged-asset verification: preservation.json.

**Not tested:** actual Safari/WebGL pixels, physical touch dispatch, notch/browser-bar layout, device memory/performance or Android browser pixels. Do not mark the blank iPhone world fixed until the owner confirms visible world/character/minimap and working touch controls.

## Preservation and deferred Android work

Recoverable checkpoint: checkpoints/2026-10-26-before-mobile-startup/ (188 files plus SHA-256 manifest and restore notes). Earlier checkpoints remain. Existing save slots, IDs, purchases, named outfits, furniture and daily-life systems are preserved. No browser user storage was accessed by automated checks. MIT/CC0 provenance remains.

The owner confirmed there is no Android wrapper/project. **Do not create one during this fix.** Native Android packaging and landscape configuration are a later task; no native orientation or APK build is claimed. When authorised, configure both landscape directions, lifecycle persistence and safe areas, while retaining the web portrait pause gate as a fallback. No purchases, paid services or new Site. This local-network fix was not published to the old hosted Site.
