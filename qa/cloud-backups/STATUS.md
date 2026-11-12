# Auth and cloud backups — local source checkpoint

Open the project in VS Code and run `npm.cmd start`, then visit **http://localhost:3000/**. Finish the existing guest introduction if this browser is new. Open **Phone → Settings → Account & cloud backups**. Do not use a review URL for account testing.

## Implemented behavior

- Email/password sign-up and sign-in; email confirmation; password-reset email and recovery-link password form; session resume/refresh; sign-out with local credential removal and remote retry.
- The original guest story stays in its original key. Signing in does not move, replace or upload it. “Import guest progress into account” shows account/source/target and requires confirmation, creates a separate account device story, then reloads. Upload is a separate confirmed action.
- “Backup to cloud” freezes a validated snapshot, shows the existing cloud timestamp and only writes when confirmed. Conditional updates detect another device's changes; concurrent first inserts conflict. Failed or ambiguous uploads never trigger automatic retries.
- “Restore cloud backup” confirms the cloud and account device stories, rechecks the server and local copy, and retains the previous account copy for export. A newer local or cloud revision prevents replacement. Storage failure preserves the existing copy.
- Each account uses its own local slot and cloud row. A B session cannot upload A's device slot. Sign-out retains device stories; “Return to preserved guest story” returns explicitly. Old tabs cannot silently overwrite a newer local restore.
- Existing save validation and local story IDs are retained. Review mode never calls Auth/Data APIs; newly exported review files retain their exclusion tag when imported. Gallery photos/videos, credentials and oversized/invalid payloads are excluded.
- Cloud status, server timestamp, check time, errors, retry, cancellation and confirmation are displayed in the existing compact phone panel. Account display name is saved separately and explicitly.
- These tables contain solo backup snapshots only. No multiplayer money/ownership/permission authority or chat was added.

## Exact review sequence

Use two email addresses you control, after completing [dashboard setup](../../docs/SUPABASE_SETUP.md). Do not send credentials to the coding agent.

1. As Guest, export the existing story through Settings. Note money, name, location, inventory, furniture and rental state. Capture a gallery photo if desired.
2. Create account A. Confirm its email, then sign in. Check that the guest story and cloud have not changed.
3. Choose **Import guest progress into account** → Cancel. Verify no reload or copy. Repeat and Confirm. Verify the same story now runs in A's device slot. Guest remains preserved.
4. Choose **Backup to cloud**. Check account identity, local story and cloud timestamp; Cancel once, then confirm. Use **Check cloud / Retry** to verify the stored timestamp. Change some progress locally: it must not upload on its own.
5. Restore A on a second browser/device through Sign in → **Restore cloud backup**. Inspect name, money, inventory, permissions and location. The gallery must remain local; it should not appear on the second device.
6. On device 1 prepare an upload but leave its confirmation open. On device 2 save a newer cloud snapshot. Confirm on device 1: expect a conflict. Use **Check cloud / Retry** and deliberately choose which story to keep. Also test a first-insert race with a new account.
7. Prepare a restore, update cloud elsewhere, then confirm: expect a conflict. Restore a stable snapshot and use **Export previous device story** to verify the replaced local copy can be recovered.
8. Sign out A, sign in B. A's device story must not be uploadable to B. Return to Guest or restore/open B explicitly. Sign back into A and reopen its device story; verify its progress is intact.
9. Disable networking. Play and save locally; try checking/uploading and signing out. Expect visible errors and preserved device progress. Reconnect, retry server sign-out or Check cloud, then explicitly review any new upload.
10. Request a password reset, open the email link, set matching new passwords and sign in with the new password. Verify expired links and wrong passwords show errors. Check both same-tab and new-tab email links.
11. Open `?review=places`, `?review=daily`, `?review=interiors`, `?review=outfit` or `?review=apartment`. Account controls must be disabled and no Supabase request made. Return to normal play and verify real progress is unchanged.

## Verification evidence and limits

- `npm.cmd run check`: syntax checks passed (final rerun recorded separately).
- `npm.cmd run check:cloud`: deterministic Auth/Data API transport tests plus actual game/phone handler tests with DOM/WebGL doubles. See [logic tests](logic-tests.json) and [game UI tests](game-ui-tests.json). They cover auth errors, confirmation, signup-awaiting-email, reset/update password, session refresh, sign-out/account switching/races, backup/restore, conflicts, quota failure, offline preservation, stale tabs and review isolation.
- Existing life, shops/phone/media, rental vehicle permissions, decor, physical home, daily life, street services, mobile lifecycle and wardrobe regression results are recorded in the final verification manifest.
- [Live read-only probe](live-probe.json): the supplied URL/key reached Auth settings (200), email/sign-up enabled, confirmation required; anonymous table reads returned 401/42501; CORS allowed the local origin. This does **not** prove authenticated RLS, inserts, timestamp triggers or end-to-end email flows.
- The ordinary command process had restricted networking; [that failed probe](command-network-probe.json) is retained. The successful live probe ran through the available Node tool network runtime.
- No test email accounts were created and no live saves were written. Real sign-up email delivery, sign-in, account switching, password reset, authenticated backup/restore and cross-account live RLS still need the review above.
- The in-app Browser is disconnected, as recorded in the existing project handoff. No new browser visual/touch test or Android device acceptance is claimed. UI logic tests are not screenshots or WebGL/device verification.
- No PostgreSQL client/database test environment is installed. The versioned migration was saved and reviewed, but not executed against live or local PostgreSQL. Existing policy expressions, exact constraint, grants and trigger body must be checked in the dashboard before adopting it.
- The existing Android manifest has no internet permission or Auth deep-link support. No Android changes, APK rebuild or publishing occurred.

## Source and recovery

Pre-change source is preserved in `checkpoints/2026-11-12-cloud/before/` and in Git baseline `2ff86f4`. The existing repository metadata was found at `.sites-checkout/.git`, with an unborn main branch; it was reused, not replaced or reinitialized. Commands for this checkout use `git --git-dir=.sites-checkout/.git --work-tree=.`. The implementation/migration are committed after final checks.

The original MIT license, hosting identity, gallery/media assets and gameplay modules are retained. This checkpoint does not resume the paused character/outfit redesign or implement the earlier chat request.
