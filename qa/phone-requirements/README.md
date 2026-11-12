# Phone requirements update — 24 October 2026

Current repairs remain the active milestone; visual acceptance remains pending.

Implemented only the visible heading change to **Phone** and removal of the six disabled Soon icons. Jobs, Profile, Navigation, Tasks and Settings retain their existing distinct working screens. Saves and the hair/apartment/doorway/navigation implementations were not redesigned. The ten other files in the prior correction source-hash inventory match exactly; game.js changed only the phone title and placeholder rendering (scope.json).

ROADMAP.md and city-and-us-references/AGREED-PLAN.md now record the 13-app inventory, actual implementation status, saved smartphone appearance/layout, distinct app screens, playable mini-games and physical ride/food fulfilment. Ride, Food, Games and other unfinished apps are requirements, not implemented features. The existing repair acceptance gate still applies.

Reviewed the existing implementation, project/owner notes and the original phone-home-screen, phone-services and phone-government-and-business screenshots. Third-party brands shown there were not imported into the app list or shipped UI.

Validation: npm run check and the existing full verify-gameplay.mjs suite both passed. The gameplay test now checks that unfinished Government/Soon icons are absent, the old heading is absent and all five working app buttons remain enabled. It exercises existing phone navigation, save/import/export and the physical delivery/venue journey with isolated storage and DOM/renderer doubles. See syntax/gameplay logs and result JSONs here. No browser/device rendering was obtained for this update; automated passes are not visual acceptance.

Recoverable pre-update files and hashes: ../../checkpoints/2026-10-24-before-phone-requirements/. Restore individual files from there if needed; do not reset browser storage. The earlier 94-file repair checkpoint remains intact. No purchase or deployment.
