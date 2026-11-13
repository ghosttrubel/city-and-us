# Presentation, Movies and City Bank checkpoint

Local source only. No publication, APK rebuild, live schema change or personal-player test has been performed. The earlier account/chat checkpoints remain in the root repository.

## Implemented

- Original City & Us arrival artwork and branding. Progress follows actual module/asset/scene milestones and the first submitted frame; it is not a download-byte percentage. Slow startup offers retry, required-file/graphics errors retain diagnostics, and diagnostics close during normal play.
- Portrait phone: retained wallpaper/theme preferences, readable coloured icons, game-time/cash/sync widgets, search, categories and twelve-app pages. Existing apps remain connected. Chat has distinct incoming/outgoing bubbles and retains the authenticated messaging and receipt rules.
- Movies: one original 16-second film, Lagoon Light, with original animation and synthesized music. Catalogue, film details, native play/pause/seek/volume, fullscreen, retry and saved watch position are connected. Closing/backgrounding pauses and saves; progress writes are throttled. No commercial title or stream is advertised.
- City Bank: carried cash and deposits are separate; transfers require confirmation, preserve total funds and record history. Ordinary existing purchases, refunds and payouts now carry durable operation IDs into account saving. Server prices/formulas, wallet locks, compare-and-swap snapshots and a unique ledger validate signed-in balance changes atomically. A retry cannot debit twice.
- Fictional NPC robbery: only when walking freely on the street, checked every 120 seconds, 2.5% chance, at least 30 minutes between losses, 8% of carried cash capped at ₦500, minimum cash ₦1,000. Deposits, premium purchases and real money are excluded. No player theft. Settings are in ROBBERY in dist/bank.js for guests and public.robbery_tuning for accounts.
- Street material finish: stronger asphalt grain, pale paving joints and road/pavement contrast, with separate roughness. Existing buildings, geometry, routes, door access, texture sizes, batching and character/outfit assets remain.

The existing new-story action resets the whole story and keeps account/Player ID. It waits for outstanding account writes before resetting, then journals the reset atomically. No death mechanic, inheritance or completed-life history has been invented.

## Visual references and evidence

All eight images in reference/presentation-phone-street were inspected before implementation: 01 home/icon spacing, 02 useful widgets, 03 app organisation, 04 compact status panels, 05 illustrated startup, 06 street surface/depth, 07 readable phone grid, 08 lower-page navigation. Supplied Shops, Homes and Markets exterior collections informed paving/plaster contrast. Naija Life branding/artwork was not copied.

The in-app browser reported no available browser and was not repeatedly retried. **No actual in-game screenshots, rendered phone acceptance or Android performance result is claimed.** The original artwork and film poster were inspected as assets. Film evidence in dist/assets/movies/verification shows actual VLC software decoding: 379 frames over 16.023 seconds and distinct captured frames. These are film decoder captures, not game screenshots.

## Local verification

Run:
- npm run check
- npm run check:presentation
- node tools/verify-movie-http.mjs
- npm run check:bank-db
- npm run check:account
- npm run check:chat
- npm run check:chat-db
- npm run check:shops-phone
- node tools/verify-road-vehicles.mjs
- node tools/verify-mobile-startup.mjs
- node tools/verify-mobile-lifecycle.mjs

Database checks execute the migrations in isolated PGlite PostgreSQL, including owner isolation, replay/CAS, funds conservation, forged balances, fixed parcel quotes, refunds, approved guest import, robbery cap/cooldown, reset and deletion. Chat checks use three isolated UUIDs; live Supabase Auth/Realtime remains pending. App/controller tests use DOM/media API doubles and do not establish browser playback. A real local HTTP server test verifies MP4 MIME and seek ranges. MainActivity compiles against Android 36 using generated resource/BuildConfig stubs; that is not an APK/device test.

The preservation test now permits only the exact reviewed cash-journal substitutions in state modules. It still checks the remaining permission logic, assets, MIT licenses, references and hosting identity. The older verify-places-preservation.mjs has a pre-existing stale home-interior.js hash and is not represented as passing.

## Bank deployment and legacy money

Complete docs/ONLINE_SETUP.md first. Inspect the live definitions with supabase/inspect-live.sql, compare them privately, then apply migration 202611140001_city_bank.sql after the account/chat migrations. Never reset tables. Back up the existing database before the schema deployment. The migration seeds wallets once from already uploaded snapshots without rewriting those snapshots. It aborts rather than rounding fractional legacy currency; such a case needs an exact audited migration.

New accounts get the existing ₦15,000 starter amount. Existing guest saves retain their exact local cash/deposits. A first-time import with other funds cannot establish a trusted online balance merely by sending a client amount. The project owner must review that player's exact pending envelope and approve it in SQL Editor, using the verified Auth UUID:

    insert into public.wallet_import_approvals(user_id,payload)
    values ('VERIFIED_AUTH_UUID', $approved$EXACT_REVIEWED_SAVE_ENVELOPE_JSON$approved$::jsonb);

Use a dedicated test user first. Keep the envelope private and outside Git/dist. Review funds, outstanding paid orders/parcel quote, claimed rewards and an empty bank.ops array; do not approve a review save. The approval is private, applies only before that user's wallet exists, matches the full envelope, and is consumed atomically. The waiting client then retries its unchanged pending save. Do not edit an existing wallet or use this route to replace a newer account save. Divergent pre-ledger cash needs explicit operator reconciliation; both local/recovery copies stay available. There is no automatic conversion of arbitrary unverified guest wealth into trusted funds.

Use SQL Editor/service-role tooling only to manage robbery tuning and approved imports. Never put privileged keys in the client. Account deletion cascades through wallet, receipts, approvals and ledger for only that account.

## Contracted films later

Edit dist/movie-catalogue.js: stable id, title, year, description, credit, rights note, rightsStart, rightsEnd, available, HTTPS streaming url, artwork and durationLabel. The current player supports progressive MP4 and browser-supported media; HLS/DASH/DRM support is not implied. Prefer range-capable H.264/AAC delivery. Set the native movie_stream_hosts resource to the exact contracted HTTPS CDN/artwork/redirect hosts; the list is empty today because the sample is bundled. Keep URL/rights changes in reviewable source.

Commercial catalogue launch depends on supplied distribution rights, licensed video/artwork, territory/date terms and delivery infrastructure. Client-side availability dates are presentation controls, not rights enforcement. Protected commercial delivery needs authenticated server entitlement/date/territory checks and appropriately short-lived playback URLs (plus DRM if the contract requires it). No commercial media is supplied or scraped here.

Android source implements the standard WebChromeClient fullscreen custom-view callbacks, Back-to-exit, MP4 MIME and byte-range asset responses. See [Android's fullscreen API contract](https://developer.android.com/reference/android/webkit/WebChromeClient#onShowCustomView(android.view.View,%20android.webkit.WebChromeClient.CustomViewCallback)). Native playback, background/return and external-browser Google return still require device testing after a separately authorised APK build.

## One Android end-to-end review

1. Run npm start. For a USB-connected test phone use adb reverse tcp:3000 tcp:3000, then open http://127.0.0.1:3000/ in Android Chrome. Use dedicated test accounts after the migrations/OAuth/SMTP are configured. The existing installed APK contains earlier source.
2. Cold-load on a slow connection, check progress/retry, then phone spacing/search/categories and clear close/back controls. Walk the retained shop/home/dispatch route, enter/exit and check rental permissions. Review-only visuals can use ?review=places; that mode intentionally makes no account requests.
3. Sign in as A. Make a paid action, wait for Saved, deposit ₦1,000 (cancel once first), withdraw ₦250, reload and confirm cash + deposits and history. Disconnect while a save is pending, reload, reconnect and verify a single transaction. Confirm gameplay pauses. Do not test robberies by changing production tuning; use local tests or a dedicated staging project.
4. Open Movies → Lagoon Light. Play with sound, pause around seven seconds, leave/reopen to resume, seek, fullscreen/Back, background/return and test a failed request/retry. Check that the old video stops and watch position survives reload.
5. In a second A browser create a genuine conflicting story; review the choice/recovery copy. Sign out and switch to B, checking A's pending progress stays isolated. Exchange A/B chat messages and verify sent/delivered/read, retry, pagination, block/mute/report; use C for denied conversation access. Follow ONLINE_SETUP.md for recovery, Google return and dedicated-account deletion.
6. Capture actual startup, phone home, bank, movie player and street screenshots and assess a modest Android phone's responsiveness. Native fullscreen/Google validation remains pending until a later authorised build.

## Remaining release blockers

Live migrations, three-account Supabase verification, SMTP/Google configuration, deletion-function deployment, a staffed report/deletion queue, actual browser screenshots and modest-device/native acceptance remain pending. No public multiplayer/economy claim.

Wallet transfers and cash arithmetic are server validated, but job success, skill/study, tasks, movement, inventory, ownership/rent/vehicle eligibility and property access still originate in the solo client. A forged gameplay outcome can still claim a formula-based reward. These actions need authoritative server validation before public multiplayer/economy; online-required play does not solve that. Server price/formula changes must accompany future gameplay catalogue changes.
