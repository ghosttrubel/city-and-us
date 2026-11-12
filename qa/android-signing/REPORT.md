# Signing-context diagnosis — 30 October 2026

## Confirmed finding

The ordinary manual run completed debug-build and debug-verification, then failed release-build at ConvertTo-SecureString. The earlier status is retained in artifacts/android/local-build-status.json; its release-failure log was copied to release-build-before-dpapi-repair.log without displaying contents.

The read-only WindowsIdentity/DPAPI probe reports GHOSTTRUBEL\CodexSandboxOffline, SID S-1-5-21-2133158106-2309644057-4184904215-1003, although USERPROFILE is C:\Users\SeniorBaby. The password.dpapi owner is the same sandbox account, its format is Windows DPAPI, and it decrypts in this context. This identifies the context mismatch; the owner's ordinary-context failure was reported by the user rather than independently run here. [Safe metadata](context-tool.json).

The recovered password was additionally validated by loading the existing PKCS12 store and its private-key entry at alias city-and-us-upload. The retained certificate SHA-256 is 8d464379876b377dbc1001ef79156a13051dc3fec4740c1e08ddf991d20f7c85. No private key, plaintext password or DPAPI ciphertext was printed or copied into this report. No replacement Android signing keys were generated.

Microsoft documents that ConvertFrom-SecureString without an explicit key uses DPAPI, and normal DPAPI decryption requires matching logon credentials, usually on the same computer: [PowerShell documentation](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.security/convertfrom-securestring) and [CryptProtectData](https://learn.microsoft.com/en-us/windows/win32/api/dpapi/nf-dpapi-cryptprotectdata). The local identity/probe results, not the USERPROFILE path, establish which account works here.

## Changes and secure handoff

- Build runner refuses missing upload keys and removes automatic signing-key creation. A shared loader keeps credentials in process memory and emits sanitized failures; whitespace in an original password is preserved.
- The read-only context check reports identity and decryption success; optional private-key validation emits only the public certificate fingerprint.
- The owner receiver generates only an ephemeral in-memory transport key, shows its public fingerprint, and waits for the confirmed encrypted handoff. The original Android signing key is never changed. AES-GCM and RSA-OAEP encrypt the original password; the sender checks the user-supplied public fingerprint before recovering/transferring it.
- The ordinary-account receiver validates the original keystore/private key/alias BEFORE saving new user-scoped DPAPI protection. It retains the previous encrypted password file, records account metadata, then runs release-only build/verification. No secret is placed in arguments, source, logs or the client bundle.
- If the original tool context later becomes unavailable, --password accepts only the ORIGINAL password through a hidden local prompt and validates it before storage. An unknown original password must be recovered from its original context or trusted backup, not replaced.
- Release-only build preserves the existing debug APK. Verification checks packaged dist assets, absence of signing files, JAR signature validity, and every payload entry's signer against the certificate from the retained private key/alias.

[Exact owner commands and recovery steps](../../android/SIGNING-BACKUP.md). No execution-policy, ACL, SDK location or sandbox permissions were changed. The initial .ps1 diagnostic was blocked by local script policy; the portable Node diagnostic uses the same supported inline PowerShell invocation style as the existing build runner, without changing that policy.

## Results and remaining step

Passed: npm run check; signing-loader regression tests (fail closed, no automatic key creation, sanitized errors, no secret arguments, whitespace preservation, unchanged files); Java verifier compilation/rejection of missing credentials; actual original password/private-key/alias validation.

The requested release retry ran node tools/android-local-build.mjs --release-only. It successfully decrypted the password and advanced to :app:compileReleaseJavaWithJavac, then failed with AccessDeniedException at android/app/build/intermediates/compile_r_class_jar/release/generateReleaseRFile/R.jar. The error is in the restricted tool execution context; no permission workaround was attempted. See artifacts/android/release-build.log and local-release-status.json. Release verification did not run because the build failed.

SHA-256 comparisons confirm the original keystore, original password.dpapi and existing debug APK remain byte-for-byte unchanged after diagnosis and retry. No release AAB exists at the final artifact path; a signed AAB has NOT been verified in this session.

The user started the ordinary-account receiver and supplied its public fingerprint. The sender matched it and delivered the encrypted handoff. At 2026-10-30T13:11:45Z the receiver validated the original private key/alias/certificate, backed up the previous encrypted DPAPI file, and stored the password for GHOSTTRUBEL\SeniorBaby, SID ending 1001. The public certificate fingerprint is unchanged. Handoff files were removed. No password was displayed. The receiver then ran the ordinary-account release-only build. Password decryption and Java compilation succeeded. Offline release lint stopped because com.android.tools.lint:lint-gradle:32.0.1 was not cached. The log is retained as artifacts/android/release-build-offline-lint.log. Added --online to the local runner to allow the configured Google/Maven repositories to supply missing declared tooling; release lint remains enabled. Requested the ordinary-account rerun with node tools/android-local-build.mjs --release-only --online. AAB verification remains pending until that completes.
