# Shops and phone — local review, 12 November 2026

This checkpoint changes gameplay and saved state flows. It is not a publication or APK rebuild. The supplied character/outfit assets remain paused and unchanged. The existing `salon` save ID now names the Boutique; separate `hair-salon` and `showroom` locations have their own physical entrances.

## Checkpoints

- Recovery copy: `checkpoints/2026-11-12-shops-phone/before/` contains the previous runtime, package and full README/ROADMAP.
- Shops/services: Provisions greeting → selection → reviewed basket → confirmation → receipt/inventory; separate stylist and showroom flows; obstacle-aware NPC routine.
- Phone/interiors: connected shopping, saved appearance choices, capture/gallery, bundled music, contrasting venue materials and compact panels.
- Final runtime snapshot: `checkpoints/2026-11-12-shops-phone/after/`; its manifest verifies the final top-level runtime source. Verification results are recorded alongside this report. File counts and diagnostic images are not gameplay completion evidence.

## Exact review route

Run `npm.cmd start` in this folder on Windows (or `npm start` in a terminal where npm scripts are enabled). Open **http://localhost:3000/?review=places**. This uses the existing isolated review save, not the normal story save. The normal game remains at http://localhost:3000/.

1. **Provisions:** walk from the entry to the shopkeeper at the back-right checkout. Use Action. Read the greeting, choose **Let me choose my goods**, add rice/water and review the basket. Cancel once: money must stay unchanged. Review again and confirm: the exact total is deducted and inventory is updated. The shopkeeper acknowledges the purchase. There is no Furniture sales button. A carried parcel still has explicit counter handover and once-only pay.
2. **Displayed goods:** close the panel, approach produce, shelving or the drinks fridge, then tap/click visible stock. The selected product is named with its catalogue price; choose quantities in the basket. Stock meshes and their labels are selectable; shelving, counters and other fixtures are decorative. Payment for physical browsing still requires the checkout. All eight Provisions product types are linked.
3. **Boutique:** Phone → Shopping → Visit physical shops → Boutique, then follow the route and enter. Speak to the attendant before browsing. Select a currently implemented clothing/accessory item, preview it, cancel, then confirm a purchase if desired. Buying retains the existing separate ownership/equipping rules and compatible body fits. The fitting area and browsing visitor remain usable. Hair services are no longer offered here.
4. **Hair Salon:** use the same physical-shops list to find Hair Salon, west of the Boutique. Enter and approach the stylist at the back-right consultation position. Discuss a style, read its price, cancel without payment, then select again and confirm. Watch the seated service and stylist hand movement; it takes about five seconds. Cancellation/closing/reload during service takes no payment and keeps the old hair. Completion equips the chosen style, charges once and acknowledges it. Previously owned styles are applied free. Existing hairstyle geometry is retained.
5. **Furniture Showroom:** route to the showroom on Courtyard Lane. Enter, inspect a displayed piece or speak at the counter, then choose **Show me the furniture**. Check dimensions/price, cancel, and confirm a purchase. Delivery is immediate to your existing home storage, not a simulated furniture van. **My home storage / placement** guides you home unless already there. At home use Needs → Home & rent → Furniture catalogue / decorate → Owned to place, rotate, move or store the piece. Doorways/activity routes must remain clear. The legacy ₦3,000 sofa remains a fixed-position installation, sold through explicit showroom confirmation; it is not a free starter gift.
6. **Shopping app:** Phone → Shopping offers Groceries & household, Clothes & accessories, Furniture, and routes to physical stores. Grocery checkout adds actual ingredients/consumables; clothes use the same ownership catalogue; furniture uses the same receipts and home storage. Preview/cancellation must not charge. Reload and check inventory/ownership.
7. **Wallpaper/Themes and Fonts:** preview an image wallpaper, apply it, return to Phone Home and reload. Choose Midnight/Forest/Plum and apply; app surfaces should change. Fonts has System, Humanist, Book serif and Clear mono: preview, apply, then inspect the phone and reload. These preferences affect the game phone only.
8. **Camera/Gallery:** Phone → Camera closes the phone and opens capture controls. Move/frame the actual game, take a photo, and wait for **Saved to Gallery**. Return to the game, open Gallery, view and Export; Delete requires a second confirmation. On a supported browser choose Record video, observe the recording timer, then Stop & save and play the clip in Gallery. Video is silent gameplay, capped at 30 seconds and a bounded bitrate. HUD and navigation-helper overlays are excluded. Unsupported recording is explicitly disabled. If saving fails, Retry/Export/Discard are available and a new capture cannot overwrite the unsaved one.
9. **Music:** choose Courtyard Morning or Lagoon Walk, press Play, adjust volume, pause, change track and reload. Track/volume are saved; autoplay is deliberately not forced after reload. These are bundled original 24-second instrumental loops. Music pauses on blur/backgrounding.
10. **NPCs and retained systems:** Bisi travels between the actual home and Provisions entrances, pauses for her routine, follows collision-checked routes and yields to people. Ayo's opening reflects a carried parcel, paid handover, hunger or completed rounds; his work/directions/break replies remain distinct. Recheck the parcel bike, paid hatchback rental, home cooking/eating/washing and saved wardrobe colours.

## What the automated evidence establishes

The retained life/home/cooking, street service, vehicle/rental, wardrobe, mobile lifecycle and decoration checks passed. The new shop/phone journeys and media-controller tests passed. The media test initially conflicted with the harness’s fake timers during HTTP testing; corrected timer use and natural process shutdown produced a clean exit. The original failure log is retained, with the successful retest in `media-final.log`.

`npm.cmd run check` exited 0 on the final source. See `final-verification.json`, `gameplay-results.json`, `media-results.json`, `preservation.json`, `regressions.json` and per-suite logs in this folder. Tests execute shipped handlers and state rules with isolated saves. DOM/renderer/audio/recorder doubles do **not** prove browser rendering, actual codec output, speaker playback, IndexedDB durability or Android touch/performance.

The older `verify-life` test aimed at the empty centre of the desk/chair group and failed identically before and after this change. It now aims at actual fixture meshes; the baseline comparison is in `tools/check-home-baseline.mjs`.

Geometry diagnostics (`*-diagnostic.png`) use the actual meshes and were inspected to catch layout/material problems. They are **not live-game screenshots** and do not establish visual acceptance. The showroom adapts supplied home furniture references; no dedicated showroom design sheet was found.

## Concrete blockers and device verification

- **Player chat is not implemented.** `server-core.mjs` is a static-file/range server. There is no configured account provider or messaging service, so this is not merely a missing API key. Required dependencies: authenticated server-issued player identities; persistent conversations/messages and delivery receipts; recipient authorization; reconnect/idempotency; mute/block enforcement; persistent reports and moderation handling. Independent-client tests are required before exposing real chat. No NPC or local-demo chat is presented as multiplayer.
- **Actual spoken dialogue remains unavailable.** Existing generic recordings are unapproved and remain disabled. Contextual subtitle turns, replay and volume controls are retained. The dependency is approved Nigerian English/Pidgin performances with rights and coverage for the connected lines, or an owner-approved speech solution. No new recordings or generic voice batch was generated.
- **Live browser/device review is unavailable in this session:** Browser discovery returned no connected browsers. Verify phone layouts, ray selection, camera visibility/mirrors, salon posing, frame rate on a modest Android device, audio output, real photo pixels, IndexedDB save/reload, video codecs and exported downloads.
- Gallery media is stored separately in browser IndexedDB, scoped to the story/identity. It is not embedded in story JSON exports. Export captures separately. Storage is bounded to 40 captures / 80 MB across stories; browser storage clearing removes local media. Stop/save before closing the browser; abrupt process termination can interrupt a recording.
- Rental/ownership implementations and modest-start balance are retained. No shared-property permission or election backend is claimed. The other agreed places and larger shared-session systems remain on the complete ROADMAP for subsequent batches.

## Reproduce checks

```text
npm.cmd run check
node tools/verify-shops-phone.mjs
node tools/verify-phone-media.mjs
node tools/verify-retail-preservation.mjs
node tools/check-retail-regressions.mjs
node tools/verify-places-3-game.mjs
```

No secrets, branding, watermark, Site creation, publication or APK rebuild were introduced.
