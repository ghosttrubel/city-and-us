# Store and testing checklist — 29 October 2026

Nothing has been uploaded or published. No Play account, advertising, voice or hosting service has been purchased. A signed bundle is preparation, not store approval.

## What this build actually contains

Offline solo life simulation with retained character customisation, local saves, homes, inventory, cooking/eating, courier food delivery, one local ride service, casual gigs and connected destinations. Scripted NPC choices use bundled synthetic voices. Currency is fictional game currency. No multiplayer, accounts, elections, live microphone chat, purchases, ads or payments are implemented.

## Before device distribution

- Verify final APK/AAB hashes and signatures; confirm all dialogue manifest clips are inside the package. Use the debug APK for sideload testing and the signed release AAB for a later Play testing upload only after owner review.
- Check landscape rotation, camera/joystick independence, cutouts, 44px touch targets, compact HUD/objectives and default hidden Diagnostics.
- Cold-start with airplane mode enabled. Import an exported browser save, then verify appearance, ownership, meals, time/weather and unfinished cooking. Export it again through the document picker.
- Lock/switch apps during cooking, an unfinished bite, courier speech, the bag transfer, a door transition and a ride. Resume without catch-up, double charges or lost portions.
- Run the exact cooking, takeaway and voiced conversation journeys in qa/living-streets/PHONE-PLAYTEST.md. Review gestures, actual audible words, pronunciation, mouth/hand positions, safe areas and food visibility on a physical phone.
- Measure Low resolution/Battery saver first on a modest Android handset. Log device/OS/System WebView, median and slow frame intervals, heat, memory pressure, 15-minute play and return after interruption. Browser CPU tests do not establish Android FPS.
- Test current Android 16 as well as an older supported phone. Test large screens separately: Android can override orientation constraints on some large-screen devices. Check release save migration and Android document-provider cancellation/failure paths.

## Play preparation (owner action later)

- Confirm application ID com.cityandus.lagosstreet before first upload; keep version codes increasing afterward. Debug uses a separate .debug package and save sandbox.
- Securely back up the upload key/password and verify recovery. Choose Play App Signing deliberately in the owner's console. Do not share signing secrets in source archives.
- Supply owner developer identity/contact, support email and a publicly accessible privacy-policy URL. dist/privacy.html is an offline testing-build draft; it is not yet a published policy.
- Complete app access (no login), content rating/IARC, audience, ads declaration (no ads), Data Safety and any applicable financial/health declarations from actual gameplay. Do not choose an age rating without completing the questionnaire. Claims about planned features must stay out of the listing.
- Capture genuine device screenshots and supply the store icon/feature graphic. The local launcher icon is a simple original building symbol; it is not a completed store art package. Do not use software previews as device screenshots.
- Suggested factual description: “Build a local story in a stylised Lagos neighbourhood. Make a home, cook meals, run casual gigs, order takeaway and talk with scripted neighbours. Solo progress saves on your device.” Do not advertise online play, purchases, elections or unlimited crowds.
- New apps/updates currently require target API 36; this project targets 36. Recheck at submission: https://developer.android.com/google/play/requirements/target-sdk
- For personal accounts created after 13 November 2023, current production-access rules require at least 12 opted-in closed testers continuously for 14 days and an application for production access. Confirm which rules apply to the owner's account: https://support.google.com/googleplay/android-developer/answer/14151465
- Internal/closed test upload, tester invitations, purchases and production publication are not performed by this milestone.

## Data Safety worksheet — offline Android package

| Item | Observed implementation / draft response |
| --- | --- |
| Data collected off device | No game-server collection. No INTERNET permission or telemetry SDK. Local chosen name, random ID, saves and settings remain on the device. |
| Data shared | No automatic sharing with the developer or third parties. A user can export a save using Android's document picker; selecting a cloud provider is a deliberate user file action handled by that provider. Review the form's user-initiated transfer exceptions at submission. |
| Audio | Bundled synthetic playback only. No mic permission, recording, live chat or external synthesis. |
| Device/location/account identifiers | No location or device identifier API; a random game-local ID is generated and stored locally. No authenticated account. |
| Diagnostics | Local startup/device/WebGL information; no save contents and no automatic sending. User may deliberately copy/share the report. |
| Deletion | Reset local story in Settings; clear app storage/uninstall for all local data. Delete separately exported files separately. No server account to delete. |
| Encryption in transit | No app data transmission; do not claim a tested encrypted backend. |
| Backups | Android automatic app backup is disabled; explicit save export remains available. |
| Ads/purchases | Neither SDK nor feature is present. |

This worksheet applies only to the bundled Android build. Browser hosting may log HTTP requests. Any future backend, ads, payments or analytics changes require a fresh audit. Play defines collection as off-device transmission and excludes on-device-only processing: https://support.google.com/googleplay/android-developer/answer/10787469
