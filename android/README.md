Verified current portrait APK: **0.7.1-portrait.1-debug (versionCode 8)**, visible as Build 0.7.1-portrait.1 (8) at the top of Phone → Settings. The ordinary-account debug build and fresh artifact verification passed. All 187 bundled files match current source and the final repair checkpoint; **no rebuild is needed**. SHA256: `5d29c77b1e82269c4bb86bd0986e003edf3f50a1e9bcd6092626f033c5c990d5`. [Comparison evidence](../qa/portrait-first/apk-source-comparison.json) · [Phone retest](../qa/portrait-first/PHONE-RETEST.md). Physical-phone acceptance remains pending. For future source edits, run `node tools/android-local-build.mjs --debug-only` in the ordinary terminal; tool-account SDK compilation remains restricted.

# Current build status — 30 October 2026

The debug APK at artifacts/android/city-and-us-device-test.apk is now the verified portrait build identified above. The original signing password has been recovered, validated against the retained upload key/alias, and re-protected for GHOSTTRUBEL\SeniorBaby. Ordinary-account release compilation now succeeds, but offline release lint needs an uncached dependency. Run node tools/android-local-build.mjs --release-only --online in the normal terminal to fetch declared tooling, build and verify the signed AAB. No signed AAB is verified yet. [Evidence](../qa/android-signing/REPORT.md) · [Recovery and backup](SIGNING-BACKUP.md).

---

# Android device testing — City & Us

The complete web game is bundled from ../dist. The app opens https://appassets.androidplatform.net/assets/index.html inside its own WebView; that hostname is intercepted locally. It is not a server or laptop LAN address. There is no INTERNET permission. This checkout's existing Site identity is unchanged.

## Build

Use Java 17+ (Android Studio JBR works), Android SDK platform/build tools 36 and Gradle 9.1.0. Set JAVA_HOME, ANDROID_HOME and GRADLE_HOME when they are not in the locally detected Windows paths. Open this android folder in Android Studio or the entire checkout in VS Code.

From the project root:

- npm run check
- npm run android:debug
- npm run android:release

The first build generates the standard Gradle wrapper. Afterward, Gradle wrapper tasks can also be run in android/. All dist assets, including voice WAVs, must be present before a final package build. The build runner copies outputs to artifacts/android/. No web server is used by the installed app.

Debug package: com.cityandus.lagosstreet.debug. Release package: com.cityandus.lagosstreet. Initial version code 7. These are newly prepared Android identities; confirm the final release identity before any first Play upload. The existing npm identity and legacy save keys remain unchanged. Debug/release and browser saves are separate; export/import via Phone → Settings to move a story.

The native wrapper uses a restricted local HTTPS asset handler, DOM storage, hardware acceleration, portrait orientation and keyboard adjustResize, safe-area insets and lifecycle pause notifications. Save export uses Android's document picker; import uses its file chooser. All WebView permission requests are denied. No microphone, camera, location, storage-wide, ad, billing, tracking or online-account SDK is included.

## Signing and backup

Release builds use CITY_KEYSTORE and CITY_KEY_PASSWORD if supplied. Otherwise it uses the EXISTING .local-signing/city-and-us-upload.p12 and decrypts .local-signing/password.dpapi. It refuses to generate replacement signing keys. DPAPI must be created/read under the intended Windows account; see SIGNING-BACKUP.md for the encrypted owner-account handoff or hidden original-password prompt. Neither is included in dist or Android assets. The entire directory and key file types are ignored by Git. Never commit them. The encrypted key is separate from the app source; this checkout is under OneDrive, so exclude .local-signing from source shares and public archives as well.

DPAPI recovery depends on this Windows user profile. A copy of password.dpapi alone is NOT a portable password backup. Before Play submission:

1. Keep the original key password in your trusted password manager and follow SIGNING-BACKUP.md for local recovery without displaying it. Do not paste it into chat, source, screenshots or build logs.
2. Keep two encrypted offline copies of the .p12 key in separate safe places, and store the alias city-and-us-upload and certificate fingerprint with your release records.
3. Restore a copy on a separate secure machine and verify the certificate using keytool before relying on the backup. Never overwrite or regenerate a key already used for releases.
4. When uploading later, decide Play App Signing/enrolment in the owner's Play Console. This local signing step neither enrols nor publishes the app.

## Device test (not established by a successful build)

Install artifacts/android/city-and-us-device-test.apk with adb install -r or Android's package installer. Use a modest Android phone with current System WebView. No connected physical device was available during initial preparation. Test airplane-mode cold start, portrait startup/cutouts, keyboard resizing and wide tablet/browser layouts, resume after lock/switch, audio focus, crash/relaunch, local-save persistence and export/import. Uninstalling clears local data; export first. Measure the same 15-second walk at Low resolution/Battery saver, then Phone; record device, OS, WebView, FPS and worst-frame interval. A debug APK is not a Play release and a built AAB is not device acceptance.

Offline build note: the local environment restricts Java network downloads. Use node tools/android-build.mjs --offline --reuse-cache to snapshot installed Gradle dependencies into an ignored local cache. The offline flag selects installed Kotlin 2.2.0 reflection/stdlib for AGP's build process only; ordinary builds retain AGP defaults. Built-in Kotlin compilation is disabled because this app shell is Java-only. No Kotlin runtime is required by the app.

## Restricted-tool build recovery

The SDK jar failure has been narrowed to Java path resolution at the AppData ancestor in the restricted tool context. See ../qa/living-streets/ANDROID-DIAGNOSIS.md. In an ordinary user VS Code terminal at the project root, run node tools/android-local-build.mjs. It requires the existing prepared signing files and builds/verifies the debug APK before the signed release AAB, recording each step under artifacts/android/. No administrator rights, SDK move or ACL changes are required by this recovery command. Its end-to-end success remains unverified until that owner-context run.

Release dependency cache: if the ordinary-account release reaches lintVitalAnalyzeRelease but reports a missing lint-gradle artifact in offline mode, run node tools/android-local-build.mjs --release-only --online. This allows the configured Google/Maven repositories to supply missing build tooling, retains release lint checks, preserves the existing debug APK and performs signed-AAB verification afterward. It does not change dependency versions or signing keys.
