# Browser GPU investigation — 20 October 2026

The character design, model files, materials, lighting and graphics defaults were preserved during this investigation.

## Observed results

| Attempt | Target / profile | Result |
| --- | --- | --- |
| In-app browser discovery | Current environment | Returned an empty browser list. No browser session was available for interaction. |
| Chrome, explicit software ANGLE | about:blank; new profile under the Windows temporary directory | DevTools briefly started. The GPU process repeatedly exited with -1073741790, then Chrome logged a fatal GPU error. |
| Chrome, default graphics selection | about:blank; a different new profile under the Windows temporary directory | Same GPU-process exit code and fatal error. |

Both native retests used a blank page, without loading Lagos Street, Three.js, the character models or the street. Both used fresh temporary profiles outside OneDrive. The earlier game-page attempt used a profile inside OneDrive and had the same failure. Moving the profile did not resolve it; the failure is not limited to the game page or the OneDrive profile.

## Reproduction

Installed executable: C:\Program Files\Google\Chrome\Application\chrome.exe

Common arguments:

    --headless=new --no-first-run --disable-extensions
    --user-data-dir=<new temporary profile directory>
    --remote-debugging-address=127.0.0.1
    --remote-debugging-port=<9222 or 9223>
    about:blank

The software attempt additionally used:

    --enable-unsafe-swiftshader --use-angle=swiftshader

The default attempt omitted those two flags. These are diagnostic launch arguments, not game settings or deployment requirements.

Representative stderr from the default-graphics attempt:

    DevTools listening on ws://127.0.0.1:9223/devtools/browser/...
    GPU process exited unexpectedly: exit_code=-1073741790
    Failed to open persistent cache files ... error ... file ... being used by another process. (0x20)
    FATAL ... GPU process isn't usable. Goodbye.

The shell reported exit code 0 despite Chrome's fatal log. That exit code does not establish a successful browser test. The temporary CDP endpoint was unavailable after Chrome exited, and no browser screenshot was produced.

## Interpretation and limits

- The signed exit code -1073741790 corresponds to 0xC0000022. Microsoft identifies that status as [STATUS_ACCESS_DENIED](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-samr/7440cfac-6052-4925-84e4-c32e417de300).
- An environment permission or browser-process restriction is a plausible explanation, inferred from the blank-page reproduction and access-denied status. The exact denied resource, restriction or driver problem has not been identified.
- The cache-sharing errors also recur outside OneDrive. Their causal relationship to the GPU exits is unknown.
- These results do not establish a defect in the game's assets, a hardware GPU fault, or compatibility on another machine.
- No Windows execution policy, registry, security setting or GPU sandbox protection was changed.

## Still blocked

Rendered character/street inspection, actual browser pointer and touch interaction, WebGL context stability, wardrobe resource use in a real GPU context, and modest Android frame rate/memory measurements.

Next useful acceptance test: run npm.cmd start in a normal terminal, open http://localhost:3000 in an ordinary browser with working WebGL, and follow the checklist in VALIDATION.md. Preserve/export any browser save before testing reset or import. The local review server at http://127.0.0.1:3001 is a separate origin from localhost:3000.
