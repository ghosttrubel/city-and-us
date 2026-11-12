# Visual milestone validation — 20 October 2026

Status: npm checks and isolated gameplay regressions pass. Rendered browser and Android acceptance remain blocked. The current character design and playable scene were preserved.

## Completed in this follow-up

| Command | Result | Scope |
| --- | --- | --- |
| npm.cmd run check | Passed | Shipped game, character, garments, street and HTTP server syntax. |
| npm.cmd run check:visuals | Passed | 32 sex/body/outfit combinations, idle/walk deformation samples, colour application, ground heights and scene geometry. |
| npm.cmd run check:gameplay | Passed | Actual game module and real 3D assets, using DOM, renderer, clock and storage test doubles. |

Use npm.cmd in PowerShell on this machine because its policy blocks npm.ps1. No execution policy was changed. On shells where npm works normally, npm run check and the other npm scripts are equivalent.

The expanded CPU test covers both sexes × four body builds × four outfits. Across those 32 cases it exercises both face choices, all six hairstyles, all four accessory choices and six representative colour values. Skin, top, trouser and shoe material colours are asserted. Five appearance colour fields are also checked in the gameplay save/application flow. This is not the full Cartesian product of all appearance options, nor a rendered clothing-clipping test. See geometry.json.

The gameplay runner passed eight groups of checks:

- Initial creator, six selection fields and five colour controls; applying the name/look to the street player; preview camera presets and renderer disposal calls.
- Restoring saved appearance/name on a fresh game-module boot.
- Tap-to-walk movement and position saving; rejecting a destination inside a building.
- Orbit drag, Character view, Street view and Phone graphics event handlers.
- Home sleep/food, wardrobe use inside Home and return to the saved street position.
- Successful trader, rider and chef jobs, including money, skills, time and needs.
- Food venue payment, JSON save export/import and rejection of an invalid skin colour.
- Filling missing appearance defaults in older version-1 saves without losing progress.

See gameplay.json and tools/verify-gameplay.mjs. These checks exercise the shipped handlers and geometry with test doubles; they do not establish actual browser input dispatch, visual correctness, GPU cleanup or mobile usability. The test uses isolated in-memory storage and never accesses the user's browser save.

The existing local review server responded HTTP 200 at http://127.0.0.1:3001. Earlier HTTP asset/MIME checks are retained in http.json. Earlier software mesh PNGs are offline inspections, not browser screenshots.

## GPU investigation

The in-app browser still returned an empty list of available browsers. Native headless Chrome was then tested twice on about:blank with fresh temporary profiles outside OneDrive: once with explicit software ANGLE and once with default graphics selection. Both crashed before loading game code, with repeated GPU-process exits of -1073741790 and a fatal GPU-not-usable message.

This reproduces the failure independently of the game and OneDrive profile. A browser/environment permission restriction is plausible; its precise cause remains unidentified. Cache-sharing errors also recur. See GPU-INVESTIGATION.md for commands, stderr excerpts, the Windows status-code reference and the limits of that inference. Temporary profiles were removed after the owned browser processes exited.

No successful WebGL playtest or browser screenshot is claimed. No GPU sandbox, Windows policy or security setting was changed.

## Measurements, not frame-rate claims

The runtime character folder remains 1,598,068 bytes. Expanded sampling found a maximum of 27,014 triangles and 22 material draw calls for one character. The street has 70,047 triangles, 63 material draw calls and 22 collision bounds. Draw counts exclude shadow passes and additional avatars.

Phone mode's existing pixel-density/shadow limits, batched static meshes, two culled NPCs and paused world rendering during wardrobe preview remain in place. No Android frame-rate, peak-memory or thermal measurement is available.

## Blocked acceptance checklist

Open the playable game in a browser with working WebGL. The review URL is http://127.0.0.1:3001; npm.cmd start serves http://localhost:3000. Those are separate save origins. Export any existing save before testing destructive reset/import flows.

- [ ] Inspect the current character face, skin, hair, clothes and accessories in both preview camera presets and on the street.
- [ ] Watch both sexes and all four outfits walking; inspect dress/tunic, limbs, shoes and hair for clipping or poor ground contact.
- [ ] Check actual canvas taps, camera drag/zoom and walking around buildings; inspect camera obstruction near shopfronts.
- [ ] Use wardrobe repeatedly, Home return, venue labels and each job in a real browser; reload and verify appearance/position persistence.
- [ ] Check phone-size layout, colour pickers, touch targets, scrolling and portrait/landscape behavior.
- [ ] On a modest Android phone, measure sustained frame rate, loading time and memory in Phone graphics; check context loss/recovery and heat over a longer session.

These remain blocked by unavailable browser rendering in this environment and the absence of a real Android device. They are required before accepting visuals/performance.

## Remaining visual limits and scope

Builds scale the silhouette rather than use separate sculpted morphs. The face option makes a small jaw adjustment. Garments are fitted skinned meshes without cloth simulation; some hair and accessories remain generated geometry. There is no hair physics or foot IK. Camera obstruction near buildings and dress/tunic walking clipping still need rendered review.

No character/environment redesign, purchase, new Site, backend, multiplayer or election work was performed. Visual review remains the gate before expansion.
