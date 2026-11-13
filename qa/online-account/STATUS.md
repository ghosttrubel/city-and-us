# Online foundation — local source checkpoint, 13 November 2026

Implemented locally: immediate local saves with per-Auth-user durable pending snapshots, bounded debounce/retry, conditional server writes, ambiguous-response reconciliation, automatic account loading, necessary guest/conflict choices, review exclusion, and service/session-gated simulation. Existing reset replaces the story in its existing account slot and keeps local Player ID. No death system or completed-life history exists in the inspected runtime; none was added.

Email/password, recovery, persistent sessions, Google PKCE/external Android browser return, authenticated deletion and an external deletion-request page are implemented in source. SQL/Edge Function deployment, OAuth credentials, real email delivery, device return testing and live three-account security checks remain required. Existing cloud rows have not been modified by this task.

Verification: sync unit regressions, real game handlers with DOM/API doubles, prior cloud snapshot logic, mobile lifecycle and road vehicle permissions passed. These are not live Auth, browser or device acceptance. The old places-preservation hash test fails on unchanged dist/home-interior.js against its historical fixture; this file was not edited.

See docs/ONLINE_SETUP.md for dependencies and the end-to-end review route. No publication or APK rebuild.
