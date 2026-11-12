# v0.6 manual visual and navigation acceptance

Status: required, not performed in a rendered browser or on a physical device. Automated reports are not substitutes. Start with npm.cmd start and http://localhost:3000. Keep your existing origin or import an exported backup. Export your real story before manual testing; use a separate browser profile for disposable tests.

## Rendered desktop browser — record separately

Record browser/version, viewport, graphics mode, save origin and a screen recording. Test 390×844, 844×390, 320×568 and 1280×900 (browser emulation is not a physical-device result).

1. **Preservation:** load an existing story. Check name, wallet, Player ID, skills, clothing, hair, accessories and delivery state. Open the character editor, preview face/full body, change one colour and save. Verify idle/walk and the carried parcel still look correct.
2. **Camera:** leave Home through Action. Walk clockwise and anticlockwise around Home and the tall apartments. At each corner, rotate the camera a full turn while moving; repeat at closest/default/farthest zoom. The player must remain visible, geometry must not cover the screen, nearby blocking walls/roofs must cut away and restore when clear, and unrelated buildings must remain visible. Check for transparent sorting artifacts, popping or flicker.
3. **Doorways:** enter/exit Home, Dispatch and the shop three times with the camera aimed toward a roof and then toward the street. No opaque wall may hide the avatar during the door swing; no camera flight across the city or lost character is acceptable. Repeat in a Yaba and an Island venue.
4. **Minimap and green route:** Phone → Jobs → Guide to Dispatch. Close the phone. Follow the circular-map route and ground dots without reopening the expanded map. Confirm arrow facing while turning, destination at the real doorstep, route staying outside buildings/stalls/park furniture, and contextual Enter Dispatch at the end. Walk deliberately off the route and turn back; it should recalculate within about half a second after movement/heading change. Map tap opens optional expanded Navigation.
5. **Delivery:** enter Dispatch, walk to the back-right desk and collect. Reload while carrying. Follow green guidance to Provisions; enter, approach its counter, hand over and check one payment. Repeated Action/reload must not pay twice. Follow Home and enter to complete the round.
6. **Yaba travel:** select Yaba Reading Room in Navigation. Walk north along the connected link; no teleport/loading dead end. Observe the campus palette, book market and signs. Enter, approach the counter and study. Select Yaba Works, enter and file LAG → YAB → MAR for pay. Exit and reload outside; position and progress must persist.
7. **Island travel:** choose Island Trading Arcade. Walk across the bridge; route and movement must stay on its deck, never the lagoon. Confirm district scenery appears before arrival without a long freeze. Enter the arcade and buy groceries or trade. Visit Marina Kitchen, eat or complete a cooking shift. Walk around the clock tower and waterfront. Return Home on foot. Confirm Yaba disappears from rendering at distance and rebuilds on a return visit without missing doors or signs.
8. **Phone:** open each working app, use Back, Home and Close, scroll long Tasks/Navigation screens, change graphics, export and import a backup. Import a story saved in another district: it must reopen in that imported room/position. Disabled Food/Chat/Friends/Events/Government/Voting icons must say Soon and have no working action. Future Ikeja/Lekki/Victoria Island areas must say Not accessible. No development notes should appear.
9. **HUD/orientation:** repeat at all four sizes. Time, money, location and one objective must remain readable. Minimap, joystick, Action and character must not overlap. Needs and zoom must be reachable. Phone content must scroll within its frame; Home/Close must remain reachable in short landscape. Notifications must not cover walking/action controls.
10. **Keyboard:** test WASD/arrows, E/Space, P/J/M/T/H, zoom, Esc and Tab focus. Release a key during a modal and after switching tabs; movement must stop. Check the console for errors while travelling, rebuilding districts and importing.

## Physical Android — separate result, not emulation

Repeat steps 1–9 on the actual modest Android phone in portrait and landscape. Record model, RAM, Android/browser versions, screen resolution and graphics mode. Start in Phone mode, repeat demanding cases in Battery saver.

- Hold the joystick with one finger and rotate the camera with another. Release, drag out of bounds, cancel a touch, switch apps, lock/unlock and rotate orientation. No stuck movement or stolen joystick pointer is acceptable.
- Play for at least 15 minutes, including two return trips Surulere → Yaba → Island → Home. Record initial/load times, average frame rate, obvious long frames, memory trend where available, heat and battery behaviour. Target a steady, usable 30 fps on the test phone; record actual results, do not infer them from CPU checks.
- Check cutaway transparency, lighting, shop text, wardrobe detail, route visibility on bright/dark ground, native scrolling and all touch targets. Verify old saves after restarting the browser.
- If memory rises on each district round trip, record a profile; check detached meshes, textures and camera entries. If graphics fail, capture the error and device details without changing browser security settings.

## Result record

For each step record PASS / FAIL / NOT RUN, screenshot/video timecode, actual result and reproduction. Keep three labels separate: automated checks, rendered browser, physical Android. No visual or physical-device sign-off exists yet.
