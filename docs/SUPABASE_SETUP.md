# Superseded setup reference

The 13 November automatic saving, Google/native auth, deletion and private-chat setup is in [ONLINE_SETUP.md](ONLINE_SETUP.md). The manual-only notes below are retained as historical evidence and are not the current behavior or deployment instructions.

---

# Supabase Auth and manual cloud snapshots

Project: `https://yhervptejlpgallfinro.supabase.co`. The supplied publishable key is intentionally public in `dist/cloud-auth.js`. No service-role key, secret key or database password is required by the client.

## Dashboard setup

1. Authentication → Providers → Email: enable email/password sign-in and sign-ups. Live read-only inspection on 12 November 2026 found email enabled, sign-ups enabled and email confirmation required. Keep confirmation enabled.
2. Authentication → URL Configuration:
   - Set **Site URL** to the exact root URL of the existing hosted game.
   - Add **Redirect URLs** `http://localhost:3000/` and `http://127.0.0.1:3000/` for local testing.
   - Add the exact root URL of the existing hosted game, including any deployment subdirectory and trailing slash. The game shows its exact callback under Phone → Settings → Account & cloud backups → “Email links return to”.
   - Add an exact LAN callback URL only when testing that origin on a phone. Do not use a Supabase project URL as the game's callback.
   - Hosting metadata in this checkout contains the existing project ID, but no public game hostname. No new Site was created or published.
3. Email templates: retain the standard confirmation/recovery link using `{{ .ConfirmationURL }}`. This client handles the Auth implicit-flow `#access_token=…&refresh_token=…&type=recovery` callback on the game root and removes it from browser history before awaiting a network call. A custom PKCE `?code=` or token-hash template is not the implemented flow.
4. Configure custom SMTP for delivery to ordinary players, verify its sender/domain (SPF/DKIM as required by your provider), and check Auth rate limits and email logs. Supabase's default mail service is restricted to project-team addresses and has very low limits; it is not production mail delivery. Test inbox, spam, confirmation and password recovery in a real browser. No emails or accounts were created by this implementation session.
5. Data API: expose the `public` schema. The authenticated role needs SELECT, INSERT and UPDATE on both tables. Retain owner-only RLS:
   - SELECT/UPDATE USING `auth.uid() = user_id`;
   - INSERT/UPDATE WITH CHECK `auth.uid() = user_id`.
   - No anonymous table grant is needed. The live probe's 401 “permission denied” for anonymous reads is expected; do **not** follow its generic suggestion to grant anonymous SELECT.
6. Verify backup payload size is bounded to 1 MiB and `updated_at` is populated on insert and changes on every update. Client PATCH requests match both user ID and the exact previously read timestamp; a zero-row update is a conflict. Do not let client-supplied timestamps bypass the trigger.

Official references: [password authentication](https://supabase.com/docs/guides/auth/passwords), [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [Auth REST API](https://supabase.github.io/auth/).

## Migration

`supabase/migrations/202611120001_auth_and_save_backups.sql` records the supplied schema contract. It creates tables/policies/a timestamp trigger only if a table is absent. For an existing table it checks required types, primary key, auth-user foreign key, RLS, a size-check constraint and an update trigger, then prints policy/constraint/trigger definitions for review. It does not drop/recreate tables, replace policies or triggers, rewrite rows, change existing grants or reset the database.

This is an adoption migration, not proof of the existing live definitions. Existing policy expressions, exact byte bound, grants, and trigger body still need dashboard inspection. A mismatch stops the transaction so it can be reconciled explicitly. The SQL was not executed against the live project, and no PostgreSQL test environment was available here. Do not blindly reset or re-create the live tables. Review it in the SQL editor or your established migration workflow before marking it applied.

## Storage and permissions

- The original guest key stays `lagos-street-v1`; review keys stay separate.
- Account device stories use `city-and-us-account-<Auth UUID>-v1`. Sign-in never chooses a story. Import, restore and opening an existing account story are explicit.
- Auth tokens and the selected account slot use tab session storage. Reload retains the session; closing the tab ends that tab's remembered sign-in. Device stories remain in local storage. Sign-out clears tokens immediately even if server revocation fails, offers a retry, and leaves the account's local story available offline. “Return to preserved guest story” switches back explicitly.
- Auth UUID identifies the cloud owner. The story's existing local Player ID is retained when restoring; it is not rewritten to the Auth UUID. Rental, inventory, ownership and local gameplay permissions are restored as a coherent solo snapshot.
- There is no automatic upload, background sync, queued retry, cross-account copy, gameplay authority, messaging or multiplayer implementation. A signed-in B cannot upload an A device slot.
- Cloud writes use conditional PATCH by timestamp, or INSERT when no row exists, never an upsert. The confirmation freezes the displayed snapshot. Changes to it require a fresh confirmation. An ambiguous network response requires checking cloud again.
- Local replacement retains the prior account story at `<account-key>:recovery`, available as “Export previous device story”. This is one recovery slot; the confirmation explains that another replacement replaces that older recovery copy, so export it first if needed. Guest saves remain untouched. A storage failure aborts replacement.
- Local writes check the previous stored bytes so an older open tab cannot overwrite a newer restore. Export that tab's in-memory story before reloading if the HUD reports a storage/change problem.
- Gallery photos/videos stay in local IndexedDB. Media, credentials, review-tagged exports and invalid/oversized backups are rejected. Review mode makes no Auth/Data API requests. New review exports retain their review provenance on file import; pre-existing untagged legacy files cannot reveal where they originated. These checks are not anti-cheat or multiplayer security.
- Account display-name writes are explicit and separate from the character/story name. Sign-up also supplies the requested display name as Auth metadata; it does not automatically create a gameplay profile or import progress.

## Web and Android scope

The web source now supports these flows. The existing Android manifest has no INTERNET permission and no Auth deep-link handler. Neither manifest nor APK was changed or rebuilt. Native cloud authentication needs a separate authorized Android integration, redirect/deep-link configuration and device testing. Do not point reset emails to the private Android asset origin.

No deployment occurred. Run `npm.cmd start` for local browser testing, not a review URL.
