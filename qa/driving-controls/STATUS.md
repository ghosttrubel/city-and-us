# Driving controls and compact panels — 8 November 2026

Local source update only. Review at http://localhost:3000/?review=places using the separate review save; start with npm start if needed.

## Reference used

The requested reference/driving-controls directory is absent in this checkout. The two racing screenshots are instead:
- reference/ChatGPT Image Nov 8, 2026, 08_17_58 PM.png
- reference/ChatGPT Image Nov 8, 2026, 08_18_11 PM.png

Both were visually inspected. Their paired steering chevrons, broad brake, tall accelerator and small utility icons guide the layout. The shipped graphics are original inline SVG, styled to the existing dark HUD. No screenshot artwork, racing scores, laps or racing systems were added.

## Changes

- One shared road-vehicle layout: large left/right arrows at bottom-left; separate pedal graphics at bottom-right; compact speed and D/R display; horn, camera, parking brake, recovery and park/exit icons with accessible labels.
- Independent pointer holds and amber/depressed feedback; each finger releases independently. Enter/Space operate a focused hold control. Existing WASD/arrows remain. Menus, focus loss and lifecycle resets clear held input and feedback.
- Car profiles retain the parking brake and stopped exit. Bikes show Throttle and Park/dismount, without a car handbrake. Existing shared physics/access functions and saved state remain authoritative.
- Safe-area padding on all bottom/side edges, responsive thumb targets, compact landscape adaptation. Walking joystick/action remain separate from road controls. Passenger bookings still do not grant driving control.
- Rental/service and street dialogue panels use the dark HUD palette. The street remains sharp behind service sheets, without the old full-screen blur.
- Rental price and balance are shown before review. Confirmation shows the amount, remaining balance, duration and lack of ownership; payment remains explicit. Optional instructions/recovery use expandable details.
- Cancel or successful payment closes the rental panel. A brief payment toast confirms the charge. Failed permission/payment keeps its explanation visible. Stale confirmation callbacks cannot charge or reopen a closed flow.
- Dialogue retains choices, close, minimise/expand, replay/text and subtitles; optional controls and the existing voice-status note sit under expandable options.
- No changes to city meshes, physics/collision/recovery rules, progression, save schema, main-story storage keys, passenger transaction rules or purchase confirmation logic.

## Verification

Passed: npm run check, npm run check:places-vehicles, npm run check:mobile, and the final focused node tools/verify-places-3-game.mjs run (including denied-rental explanation and compact text dialogue). The vehicle suite also verified 449 protected source/asset/license/hosting files. Results, logs and final source hashes are recorded in checks.json and the existing qa/places-vehicles-3 reports. Automated tests use isolated fixtures, DOM/renderer doubles and geometry/state checks; they do not access the owner's browser saves.

The historical npm run check:phone-review reaches its audio-double assertion and fails because it expects hello.wav playback. Generic recordings were already disabled before this change (the retained false audio gate in dialogue.js); they remain disabled. The compact text-dialogue path is covered by the focused game-handler test instead. This pass does not repair or re-enable that superseded voice suite.

Live visual acceptance is still pending. Browser discovery returned no available sessions; no browser screenshot or physical Android multi-touch/performance result is claimed.

## Local review

1. At Dispatch, approach the green hatchback. Review ₦900, cancel and check that the panel closes without charge.
2. After a completed parcel round or paid shift, confirm rental. Check the brief receipt, then tap the car action again and choose Drive car.
3. Hold gas and either steering arrow together; release either finger independently. Check amber feedback, brake-to-reverse and the R indicator. Try horn/camera; stop before parking/exiting.
4. Open Phone while holding a pedal, then close it: the car should stay stopped until a new press.
5. Use the red work bike with a collected parcel. Check throttle/dismount labels, recovery, walking handover and reload.
6. Open a shop or street conversation. Check dark compact panels, expandable details, scrolling, costs, confirmation, minimise and close.
7. On a portrait phone, check bottom safe-area clearance and that the road stays visible. Also check a narrow 320px viewport and landscape.

The complete historical roadmap remains in README.md and ROADMAP.md. No publication, new Site or APK build.
