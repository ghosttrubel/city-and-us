# Android SDK access diagnosis

The blocker remains. No debug APK or release AAB has been produced. Gameplay files and the prepared upload key/password were left unchanged; the two signing files were compared byte-for-byte via private in-memory SHA-256 values.

## Finding

This is a path-resolution permission restriction in the tool's Windows execution context. The first ancestor whose Java toRealPath call fails is C:/Users/SeniorBaby/AppData. C:/, C:/Users and C:/Users/SeniorBaby resolve successfully. The installed SDK directory, platform directory and both jars grant SeniorBaby FullControl and CodexSandboxUsers ReadAndExecute. The tool cannot inspect the ancestor ACLs. The evidence strongly identifies the restricted tool context; testing from the owner's ordinary terminal is still needed to conclusively rule out a separate owner-context restriction.

The SDK jars exist, their attributes and bytes are readable, and java.util.zip.ZipFile opens/closes both successfully (14996 and 1837 entries). Java NIO ZipFS closes by resolving the path and fails with AccessDeniedException, reproducing the javac cleanup failure. This is not evidence of missing/corrupt jars or incorrect sdk.dir. Build output and Gradle caches already live in the user-owned checkout. Moving the project would still leave the same SDK ancestor path; moving the SDK to evade the tool boundary or broadly changing ACLs is not appropriate. No security settings, Windows permissions, SDK files or signing files were changed.

The OpenJDK 21 implementation resolves each Windows path component with FindFirstFile and rethrows a failure against the requested full path, explaining why the original exception names a jar even though the first failing component is AppData: https://github.com/openjdk/jdk21u/blob/master/src/java.base/windows/classes/sun/nio/fs/WindowsLinkSupport.java . This interpretation combines primary-source code with the local ancestor probe.

## Exact failure

Original project-root build command:

    node tools/android-build.mjs --offline --release

Failing Gradle task: :app:compileDebugJavaWithJavac. Compiler: Android Studio JBR 21.0.10. Original log: android/.gradle-user/daemon/9.1.0/daemon-21360.out.log.

Affected paths:

- C:/Users/SeniorBaby/AppData/Local/Android/Sdk/platforms/android-36/android.jar
- C:/Users/SeniorBaby/AppData/Local/Android/Sdk/platforms/android-36/core-for-system-modules.jar
- First failing ancestor: C:/Users/SeniorBaby/AppData

Exception: java.nio.file.AccessDeniedException; WindowsLinkSupport.getRealPath → WindowsPath.toRealPath → ZipFileSystemProvider.removeFileSystem → ZipFileSystem.close → JavacFileManager.close.

The fresh read-only reproduction used:

    & 'C:\Program Files\Android\Android Studio\jbr\bin\java.exe' android/build/diagnostics/SdkAccessProbe.java 'C:\Users\SeniorBaby\AppData\Local\Android\Sdk\platforms\android-36\android.jar' 'C:\Users\SeniorBaby\AppData\Local\Android\Sdk\platforms\android-36\core-for-system-modules.jar'

[Jar probe log](android-sdk-access-probe.log) and [ancestor probe log](android-sdk-parent-probe.log) preserve the observed outputs. A portable copy of the read-only probe source is at tools/android/SdkAccessProbe.java; use that path if reproducing after deleting build outputs. Probe failure is intentional diagnostic evidence, not a passing build. A full Gradle build was not repeated after reproducing the same blocking operation.

## Smallest manual step

Open the existing project in an ordinary VS Code terminal under your normal Windows account (no Administrator rights needed). From the project root run:

    node tools/android-local-build.mjs

This offline recovery command uses already cached dependencies and existing signing files. It builds and verifies the debug APK first, then builds and verifies the release AAB. It stops at the first failure, preserves per-step logs and writes artifacts/android/local-build-status.json. It refuses to proceed without the prepared signing key/protected password, and does not generate a replacement. No passwords are printed or stored in source. It does not alter execution policy, permissions or security settings, publish, purchase, or install on a phone.

Expected outputs after success:

- artifacts/android/city-and-us-device-test.apk
- artifacts/android/verification-debug.json
- artifacts/android/city-and-us-release.aab
- artifacts/android/verification.json

These files do not exist yet. If the ordinary terminal still fails, the smallest follow-up is the named artifacts/android/*-build.log (which contains no signing password); no reinstall/ACL reset is justified before that result. Debug/release/browser saves are separate, so export a backup before importing. Physical-device acceptance remains a separate step.

## Changes and checks

Added tools/android-local-build.mjs and a --debug-only mode to tools/verify-android.mjs so APK verification can finish before release work. Signing files are unchanged and ignored; no changes to dist or game saves. Script syntax checks pass. npm.cmd run check passed (exit 0), as did node --check for both build/verification scripts. PowerShell rejects the npm.ps1 launcher, so the standard npm.cmd launcher was used with execution policy unchanged. Artifact verification and the complete recovery command remain unexecuted because no package can be built in this restricted context.
