# Superseded current handoff — 1 November 2026

The approved visual direction and menu repair are now preserved in wardrobe source candidate 0.8.2-wardrobe.1 (11). The supplied outfit images have been inspected and four everyday looks implemented for review. Continue from [the latest batch handoff](../wardrobe-batch-1/HANDOFF.md), including its SDK build result and exact ordinary-terminal command. Notes below are historical.

---

# Current update — 1 November 2026

The owner approves the current visual direction. The only new runtime change hides +/− zoom controls while Quick navigation is expanded and restores them when it closes, including navigation-driven closure. Existing tap/hold zoom and immediate cancellation on menu opening remain unchanged. The two-column portrait menu and existing minimum 44px touch targets are retained.

This is a source-only UI repair after build 0.8.1-visual.1 (10); the existing APK does not yet contain it. No publication or APK rebuild was requested for this focused pass. Recovery: checkpoints/2026-11-01-before-zoom-menu; the full previous source/APK checkpoint remains checkpoints/2026-10-31-visual-review-0.8.1.

Next: outfits using images the owner will supply. Do not begin replacement outfits or resume other feature work before those images arrive. Historical modelling limitations remain documented; approval of the direction does not remove them.

Validation for this repair: `npm.cmd run check` and `node tools/verify-visual-milestone.mjs` both passed on 1 November. The existing suite checks 52 actual camera-changing taps, hold/release/cancellation, movement zoom preservation, meals and wallpaper/save compatibility with test doubles. CSS inspection confirms the menu keeps its two-column layout, portrait width constraint and 44px minimum buttons. No in-app browser was available; no browser pixels or physical touch acceptance is claimed. On the phone: open Quick navigation, tap Guide home and each menu item; reopen/close the menu and verify +/− tap-and-hold resumes without a stuck hold.

Future APK rebuild, when needed: `node tools/android-local-build.mjs --debug-only`, then `node tools/verify-android.mjs --debug-only`, in the ordinary Windows terminal. Preserve signing and install in place.

---

# Continue here — 31 October 2026

Current source candidate: **0.8.1-visual.1 (10)**. Current priority is the bounded visual correction of the everyday female/male outfits, starter home and Mama T. The owner explicitly rejects the inherited presentation. Earlier partial acceptance is not approval. Do not expand the catalogue or start further feature work before this gate.

Read AGENTS.md, the newest README/ROADMAP sections, REPORT.md, ASSET-LIMITS.md and PHONE-RETEST.md. The five latest iPhone files are directly in reference/, beginning “ChatGPT Image Oct 30, 2026”, times 03_54_09, 03_54_20, 03_54_30, 03_55_00 and 03_55_10. They are not in a 06 subfolder. The October 26 image is older evidence.

## Completed source work

Separate skinned everyday shirt panels on both retained rigs; old overlapping body shirt removed; bounded legacy skirt profile/weight mitigations; cool coordinated UI/environment; softened home furnishings and distinct surfaces; buka canopy/work/display/collection details; continuous seated meal with full/cancel/leftover behavior; tap/hold zoom across close-to-city scale with lifecycle/menu cancellation and preserved movement zoom; retained Wallpaper app and old local playable systems. Existing saves, colours, outfits, ownership, jobs and keys are preserved. New-story default is the existing everyday outfit; old saved choices are not rewritten.

## Evidence and remaining blockers

- All twelve final automated suites passed. See automated-results.json for the exact final suite statuses and named logs. It includes npm run check through npm.cmd. Geometry and synthetic pointer tests are not real touch/visual acceptance.
- review.html has labelled BEFORE/AFTER software renders of actual mesh/pose code. No live browser was available. No current candidate phone screenshot is claimed.
- Superhero body proportions, hair fidelity, panel shoulder/cuff joins, trouser tailoring and especially seated skirt drape remain modelling limits. ASSET-LIMITS.md specifies replacement topology, weights, corrective shapes and retargeting work. Do not describe these as fully solved.
- Tool-account Android compilation failed at SDK android-36/android.jar with AccessDeniedException. The attempt is archived in tool-account-android-build.log and tool-account-android-status.json. Use the owner's ordinary Windows terminal. Do not replace/generate keys, change ACLs, disable protection, uninstall the app, or package stale native outputs to hide this failure.
- The subsequent ordinary-account build succeeded. artifacts/android/city-and-us-device-test.apk is now **0.8.1-visual.1-debug (10)**, 8,356,281 bytes, SHA256 32a9d7cc9dfa8556f2df3c4e8b18f77d99994b05645923ac9ca9a0252590ee07. Fresh verification confirms all 192 bundled files match source, 39 retained voice clips, signature/portrait/permissions pass. Evidence: artifacts/android/local-debug-status.json and verification-debug.json, copied into this QA directory. Physical-device acceptance is still pending.

## Exact commands (ordinary Windows terminal, project root)

```powershell
Set-Location -LiteralPath 'C:\Users\SeniorBaby\OneDrive\Documents\projects\lagos-street'
npm.cmd run check
node tools/check-visual-correction.mjs
node tools/render-visual-correction.mjs
node tools/android-local-build.mjs --debug-only
node tools/verify-android.mjs --debug-only
```

The full regression runner includes the syntax check; the separate npm command is useful for a quick edit check. Rendering is optional when no geometry changed. The build helper hashes all existing signing files before/after and verifies bundled assets. Android verification derives versionName/versionCode from android/app/build.gradle, checks the Settings label, rejects stale extra assets, and checks signature, portrait/keyboard configuration and permissions.

Expected artifact after success: artifacts/android/city-and-us-device-test.apk. Confirm **0.8.1-visual.1-debug / versionCode 10** natively and **Build 0.8.1-visual.1 (10)** in Phone → Settings. Preserve the same debug application ID/signing key for in-place updates and saves. No release/AAB/publication is part of this pass.

For local browser review run `npm.cmd start`, then use the same saved origin with /?review=daily (typically http://localhost:3000/?review=daily). Keep main/review saves separate; changing hosts changes browser storage. Comparison images live locally in qa/visual-correction/review.html; they are not deployed.

## Recovery

- checkpoints/2026-10-31-iphone-milestone/dist: source before this session's eating/camera/Phone work.
- checkpoints/2026-10-31-before-visual-correction/dist: source before visual geometry/palette changes, including interim feature work.
- checkpoints/2026-10-31-before-visual-correction/voice-progress: parked language/voice integration and partial generated assets. Do not copy into dist wholesale. Complete coverage, verify paths/audio, then ask owner to listen to labelled samples and transcripts. Authenticity must remain pending owner approval. No paid services.
- checkpoints/2026-10-31-visual-review-0.8.1: final portable source checkpoint, excluding signing secrets and dependency/build caches. Source manifest: source-manifest.json.
- All existing signing keys stay in their original protected locations; hashes in preservation.json. Hosting identity .openai/hosting.json and the MIT notice must remain unchanged. Never create another Site for this checkout.

## Next action

Install the verified debug APK as an in-place update on Android, confirm build 0.8.1-visual.1 (10) in Settings, then run PHONE-RETEST.md on the actual iPhone/Android and compare the same views. Resolve rejected clothing/model/contact issues before catalogue expansion or further interiors. Only after the bounded visual gate, resume the parked voice-language milestone with owner listening approval, then remaining Phone work. PHONE-APPS.md preserves all app dependencies, including paid packs as plans only.
