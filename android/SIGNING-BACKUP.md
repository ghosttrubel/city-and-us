# Signing password recovery and backup

Preserve .local-signing/city-and-us-upload.p12 and its alias city-and-us-upload. Build commands never generate replacement signing keys. Passwords are passed only through private process input/environment, never command arguments, console output, source or logs. .local-signing and artifacts/android are ignored by Git and are not Android assets.

## Completed owner recovery (30 October 2026)

The original password was recovered and validated, then re-protected for GHOSTTRUBEL\SeniorBaby (SID ending 1001). The original upload keystore, alias and certificate are unchanged; a backup of the previous encrypted password is retained. Routine builds now run in the ordinary account. The context mismatch below describes the original failure, and the handoff instructions are retained for future recovery.

## Confirmed context mismatch

The tool's actual Windows identity is GHOSTTRUBEL\CodexSandboxOffline (SID ending 1003), even though USERPROFILE points to C:\Users\SeniorBaby. The original password.dpapi was owned by that sandbox account and decrypted there. An ordinary SeniorBaby PowerShell process could not use that original protection context. The active file has now been re-protected for SeniorBaby; the old ciphertext is retained only as an encrypted backup. Do not infer identity from USERPROFILE or folder names.

Run node tools/android-signing-context.mjs in either terminal to print account metadata and a boolean decryption result. Add --validate-key to validate the recovered password against the existing private key and alias; only the public certificate fingerprint is printed. No password is displayed. See [diagnosis](../qa/android-signing/REPORT.md).

## Preferred: encrypted handoff to the ordinary Windows account

At diagnosis, the original password was recoverable in the tool context. The completed handoff stored it for the ordinary account. No password reset or signing-key replacement was needed.

1. Open the project's normal VS Code terminal as your ordinary Windows account, without elevation. Run:

       node tools/android-signing-repair.mjs --receive

2. Keep that terminal open. Send the assistant ONLY the public recipient fingerprint displayed by the helper. It is not a password. The receiver expires after 15 minutes.
3. The assistant compares that fingerprint and runs the sender in the original sandbox context:

       node tools/android-signing-repair.mjs --wrap <public-recipient-fingerprint>

4. The recovered password travels only in an authenticated encrypted envelope. A temporary in-memory RSA transport key protects an AES-GCM key; neither replaces or modifies the Android upload key. The receiver's transport private key is never written to disk. It checks the original password/private key/alias, keeps an encrypted backup of the previous DPAPI file, and stores new DPAPI protection plus account metadata for your ordinary account.
5. The receiver automatically runs node tools/android-local-build.mjs --release-only. This preserves the existing debug APK, builds the AAB, checks bundled assets and verifies all payload entries against the retained upload certificate. Success produces artifacts/android/city-and-us-release.aab and verification-release.json. local-release-status.json records the actual result; a file alone is not verification.

If a receiver is closed abruptly, close any remaining receiver first, then remove only .local-signing/owner-handoff-request.json and owner-handoff-response.json before retrying. Never delete the .p12, password.dpapi, or encrypted password.dpapi.previous-* backup. Those handoff JSON files contain public metadata/encrypted material only, but still stay outside source shares.

## Alternative: supply the ORIGINAL password locally

If the old context becomes unavailable but you have the original password in a trusted password manager, run in your ordinary Windows terminal:

    node tools/android-signing-repair.mjs --password

Enter it only at the hidden local prompt. Do not paste it into chat, shell commands, screenshots or source. The helper refuses an incorrect password or missing alias before replacing the protected password file; the keystore is read-only. It then runs release build and verification. No administrator access or execution-policy/ACL change is required.

If neither the original decryption context nor an original-password backup is available, stop and recover that original account/profile or trusted signing backup. Creating a new password does not unlock an existing keystore. Do not generate replacement signing keys.

## Long-term backup

Keep two encrypted offline copies of the original .p12 and store its original password separately in your trusted password manager. Record the alias and public certificate fingerprint. DPAPI ciphertext alone is not a portable password backup. Verify a restored copy with keytool's hidden password prompt before relying on it; never place its password on the command line. Exclude .local-signing from source/public archives and OneDrive shares. This recovery neither enrols Play App Signing nor publishes an app.

If release lint is missing from the offline cache, rerun node tools/android-local-build.mjs --release-only --online in the ordinary terminal. Keep lint enabled; this downloads missing declared tooling and then verifies the AAB.
