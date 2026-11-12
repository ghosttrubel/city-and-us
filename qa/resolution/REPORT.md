# Mobile resolution comparison — 26 October 2026

The owner confirms that the preceding build works on iPhone 11, including mobile startup and controls, but reports a blurry world. That confirmed build is preserved in checkpoints/2026-10-26-working-iphone-before-resolution/ (191 files with SHA-256 manifest). This change adjusts resolution and adds measurements only; character/fashion assets, landscape controls, HTTP startup fix and save ownership are retained.

## Phone comparison

**http://10.126.70.116:3000/?review=daily** — same Wi-Fi as the computer, server running. This is the isolated review story; main-story settings save separately. Reload the page to get this update. Phone → Settings → 3D resolution (also available in Needs → Resolution).

| Setting | Requested render scale | Example buffer for a 896 × 414 viewport |
| --- | --- | --- |
| Low | 1× CSS dimensions | 896 × 414 |
| Balanced | 1.25× | 1120 × 517 |
| Sharp | 1.5× | 1344 × 621 |

The previous mobile battery setting rendered at 0.75×; Low is the first increase. Old mobile stories without a resolution preference start at Low. Higher settings are explicit choices, not automatic upgrades. Each selection saves immediately and survives reload/export/import. Resolution is independent of the existing lighting preference, and mobile shadows and antialiasing stay off. Render scale never exceeds the requested step or device pixel ratio; mobile buffers also have a two-million-pixel budget for larger displays. Browser bars change the actual viewport/buffer dimensions; diagnostics show the effective scale and any cap. The table is calculated, not a device measurement.

1. Start at Low in a repeatable location, such as the home entrance or the same short street section.
2. In Phone → Settings, tap **Measure a 15-second walk**. The menu closes. Allow two seconds of warm-up, then walk the same route for 15 seconds; the small live badge shows remaining time and FPS.
3. Return to Settings to see the result. Choose Balanced and repeat, then Sharp if Balanced remains comfortable. Keep the device orientation, viewport/browser bars, location and route consistent. Opening menus, rotating, backgrounding, changing resolution/viewport or entering another location stops that comparison rather than mixing results.
4. Compare clarity and smoothness. Settings and Diagnostics list average FPS, 95th-percentile frame interval and percentage of frames over 33.4 ms, alongside location, CSS dimensions and effective scale. Send the three result rows if you want help choosing. Reload to verify your selection remains.

Results describe requestAnimationFrame intervals during active world play, including scheduling/rendering load. They are not GPU-only execution times, thermal measurements or an automatic quality rating. Results stay for this page visit; the selected resolution is saved with the story. CPU fixture FPS values in automated tests are never presented as iPhone measurements.

DOM text/buttons, the SVG minimap and the page remain at native browser resolution. Only WebGL drawing buffers change; no page scaling, artificial rotation or character-asset edits.

## Verification

- Required npm run check passes.
- npm run check:resolution passes: fixed 1/1.25/1.5 steps, DPR/pixel-budget limits, timing math and warm-up, interruption handling, both saved selectors, reload/migration validation and unchanged lighting, money, ownership/layout and daily state.
- Mobile startup/error-path checks and actual-game synthetic lifecycle checks pass, retaining HTTP-compatible identity, Retry diagnostics, context/shader error handling, portrait pause/resume, joystick reset and interrupted cooking/delivery persistence.
- Host HTTP checks verify the current network URL and new module. Checkpoint and protected assets are hash-verified in preservation.json.

**Actual device evidence:** owner confirmed the prior build works on iPhone 11. No browser session is available to this agent. New resolution clarity and FPS measurements on the physical phone remain pending the owner's comparison using the in-game meter. No phone FPS, GPU timing, Android-device result or new rendered screenshot is claimed.

No purchases, paid services, new Site, native Android project or character changes. Android packaging remains a later task. The running local server serves these files; the older hosted Site was not updated in this local-network task.
