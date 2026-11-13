# Local checkpoint ready for review

Implemented: original loading artwork and real milestone progress; portrait phone search/categories/pages/widgets; Movies with an original playable sample and saved position; City Bank with separate balances, confirmed transfers, durable operations and SQL ledger; capped fictional NPC street robberies; material-only street finish.

All eight supplied phone/loading/street references were inspected before implementation. Buildings/routes/doors, gameplay permissions, account identity, save isolation, controls and paused character/outfit work are preserved. No publication or APK rebuild.

## Verification

Required npm run check passed. local-checks.json records passing source, gameplay, account/save, phone, media, SQL and preservation regressions. Actual PostgreSQL tests cover three-user chat isolation and bank atomicity/replay/forgery/refunds/quotes/imports/robbery/reset/deletion. The actual game controller test includes a bank confirmation, cancellation and lost-response/reload without a second debit.

The sample MP4 passed actual HTTP seeking and VLC software decoding. Android MainActivity compiled against the installed Android 36 SDK with generated resource/BuildConfig stubs; no APK was created.

DOM/media/Auth/Realtime doubles remain unverified live. The browser connection was unavailable, so there are no actual in-game screenshots or rendered visual/device-performance claims. Decoder captures are labelled as such.

## Review and release dependencies

[Exact setup, bank migration/import procedure, commercial content configuration and one Android review route](../../docs/PRESENTATION_BANK_MOVIES.md).

[Supabase/OAuth/SMTP/deletion setup and secure three-account configuration](../../docs/ONLINE_SETUP.md).

Live migrations/functions, dedicated-account tests, external-browser Google/device return, actual visuals and performance, and staffed moderation/deletion queues are pending. Commercial catalogue launch requires supplied rights and content. Income/skill/task outcomes and ownership-related permissions remain client authored and need server authority before public multiplayer/economy.

Root backend checkpoints already committed: 9a9f946 (automatic saving/account foundation), ce6e931 (private chat/recovery). This presentation/bank/movie checkpoint extends those locally. Temporary builds, credentials and .bak files are excluded.
