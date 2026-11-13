# Online accounts and private chat — local checkpoints, 13 November 2026

Root repository: ghosttrubel/city-and-us. Foundation commit: 9a9f946. No publication, APK rebuild, personal player login, live schema mutation or live backup change occurred.

## Implemented source

Immediate local saving with per-Auth-user durable journals; bounded debounce/retry; conditional server writes; lost-response reconciliation; automatic account loading; necessary guest/conflict choices; review exclusion; service/session-gated simulation; stale-tab recovery export. Existing new-story reset keeps account and local Player ID. No death system or completed-life archive exists in the inspected runtime, and none was added.

Persistent email/password sessions, serialized cross-tab refresh where Web Locks are available, recovery, Google PKCE and external Android browser return, authenticated deletion, and a standalone deletion/recovery/request page. Android source has INTERNET and an exact callback filter; no embedded Google authentication.

Private one-to-one chat with separate stable public identity, bounded lookup, membership, persisted messages, realtime plus history reconciliation, pagination, durable user-scoped idempotent sends, delivered/read acknowledgements, block/mute/report controls and server send limits. Restricted moderation destination: public.chat_reports, project owner/service role only. Deletion requests: public.account_deletion_requests, same operational owner. Current static server had no prior shared-message implementation.

## Verification

- npm run check passes.
- Sync regression: migration, debounce, durable pending reload, offline/reconnect, lost response, conflict, account isolation, review rejection and reset identity pass against API doubles.
- Shipped game handlers: auto account loading, pending offline reload, reconnect, guest retention, new-story account identity, switching and malformed-save preservation pass with DOM/GPU/API doubles.
- Prior backup logic, OAuth PKCE/cancellation, session persistence/refresh/expiry and actual deletion handler caller binding pass with network doubles.
- Chat client: durable retry, duplicate prevention, receipt semantics, pagination, authenticated realtime filtering, mute and account switching pass with network/WebSocket doubles.
- All three migrations execute in isolated PGlite PostgreSQL. A/B conversation works; C cannot select, send, acknowledge or forge sender identity. Idempotency, receipt progression, block/unblock, per-user mute, private reports, send limits, pagination and account-deletion cascade isolation pass against actual local SQL/RLS.
- Mobile lifecycle, road vehicle permissions, shops/phone/media and current retail preservation regressions pass. Character/outfit sources, ownership/rental code, references, third-party MIT licenses and hosting identity match preserved fixtures.
- The older places-preservation hash test fails on unchanged dist/home-interior.js against its historical fixture. The newer retail-preservation check passes; no unrelated source was changed to satisfy the obsolete hash.

The stalled npm installation was cancelled alone. A bounded isolated install of PGlite 0.5.16 succeeded in 23 seconds; no existing project files were deleted. SQL test dependencies and cache stay ignored under .qa-db and .npm-test-cache.

## Explicitly pending live

No Supabase CLI login, privileged schema access, Google OAuth configuration or three dedicated test accounts were supplied. Live definitions must be inspected before migration application. Supabase Auth/RLS/Realtime integration, SMTP delivery, real Google/native return, real deletion, browser layout and Android performance remain unverified. Local PostgreSQL role claims are not live Supabase accounts. No destructive tests used the personal player.

[Exact setup, secure test-account preparation, one end-to-end review procedure and remaining authority/release blockers](../../docs/ONLINE_SETUP.md). Never run the opt-in live script with personal account credentials.
