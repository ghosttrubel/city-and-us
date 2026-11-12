# v0.5 manual playtest — connected delivery

Open http://localhost:3000. If your existing save uses http://127.0.0.1:3001, use that address instead. Both serve this checkout; browser saves belong to their origin. Keep/export an existing story before deliberately resetting it. A new story begins inside Home; an older story may resume on the street, so use Guide home and its actual entrance first.

## Complete the first round

1. Use the bottom-left joystick to move. Its centre is a dead zone; push partly for slower movement, further for full speed. Release to stop. Drag the right side with a second finger to turn the camera. On desktop use WASD/arrows and mouse drag.
2. At Home's front door, the lower-right Action button reads **Go outside**. Press it. Check that the door opens and you step onto the corresponding street doorway.
3. Follow the Dispatch waypoint. If needed, Phone → Jobs → Guide to Dispatch. Phone → Map shows the buildings and entrance locations. Selecting a destination must not move your character.
4. Approach the Dispatch entrance and press **Enter Dispatch**. Walk to the back-right parcel desk; press **Collect parcel**. Confirm that a parcel appears and money has not increased.
5. Return to the exit, press **Go outside**, then walk to Provisions at **24 Bode Thomas St**. Enter the shop, walk to the back-right counter and press **Hand over parcel**.
6. Confirm one payment and rider skill progress. Pressing Action again or reloading must not pay twice. Follow the Home waypoint, approach Home's entrance and enter. The objective should acknowledge completion; another delivery can then be collected.

The gold ground ring and directional/distance label indicate the current waypoint. Map routes are not automated. Walk around buildings and furniture. If an Action is unavailable, move closer to the relevant doorway or station.

## Additional acceptance checks

- Repeat in portrait and landscape. The joystick, character and Action control should remain visible; the phone must scroll when needed, with a usable back and close control.
- Keep one finger moving while rotating with the other. Release/cancel either pointer independently. Background/resume the app and verify no stuck movement.
- Try pickup away from the desk and handover away from the correct shop counter. Neither should succeed. Reload after collection and after payment to check persistence and no duplicate award.
- Walk into furniture/walls, then slide along their edge. Verify that door entry/exit returns to the same building. Inspect actual door alignment and camera occlusion.
- Reach Home's cooker, bathroom, desk, bed and wardrobe on foot. Check needs/skills and preserved customisation, including a reload.
- Inspect the real-layout map: player position/facing, footprints, roads, three entrances and waypoint. Indoor map position is represented at the current building's street entrance and labelled accordingly.
- Try Phone/Battery saver graphics on a modest Android phone and record sustained frame rate, heat, memory and loading time.

## Result status

The equivalent journey passes automated game-handler checks with synthetic input and renderer/DOM doubles. This checklist has **not** been completed in a real browser in the agent environment because no browser session is available. Do not mark native touch or visuals verified until an actual run records its browser/device and observations. Multiplayer is not part of this local build.
