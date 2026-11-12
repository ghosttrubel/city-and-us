# City & Us — bounded character and fashion review

26 October 2026. **Partial visual pass; reference quality is not achieved.** The working wardrobe was preserved. The existing superhero bodies, painted skin, opaque hair meshes and body-derived clothes are the principal asset blockers. No additional catalogue entries were added to disguise those limitations.

## Play and compare

- Interactive study: http://localhost:3000/fashion-review.html
- Playable apartment: http://localhost:3000/?review=apartment
- Local comparison pack: [review.html](review.html), [reference comparison](reference-comparison.png), [garment comparison](garment-comparison.png), [hair comparison](hair-comparison.png), [female skin/makeup](female-skin-makeup.png), [male skin/makeup](male-skin-makeup.png).
- [Free asset alternatives and smallest practical next step](ASSET-PLAN.md).

The existing server returned HTTP 200 for the game, review page, scripts and all ten study thumbnails. Run npm start from the portable project if the server is stopped. The study is independent of all browser save slots: it does not read/write stories, purchases, named outfits or furniture. Its Save image button lets a reviewer capture the actual WebGL preview in their own browser; that button has not been browser-tested here.

The existing private Site was identified and its exact identity restored to .openai/hosting.json. The source helper could not connect to git.chatgpt-team.site:443. **No deployment took place; the older hosted build is not this review.** No new Site was created and its audience was not changed.

## What changed

| Area | Delivered in this pass | Limit |
| --- | --- | --- |
| Skin | Twelve named natural swatches covering deep, rich, medium, light/fair and warm/neutral/cool/olive/rose variants; primary arbitrary picker removed. Existing custom skin colours remain until a swatch is chosen. | Preserves existing diffuse/normal maps, not newly authored realistic skin. |
| Lighting | Same neutral white studio light rig in the body editor, wardrobe and isolated study. | Live WebGL lighting remains unverified. |
| Representative collection | Amara and Bode; female bob/braids/buns and male crop/locs/cornrows; casual tee/trousers for each, female iro/buba and male senator samples. Four existing body builds and soft/defined face options remain. | Existing candidates, not six new quality hair assets or four independently authored clothing models. No new natural face mesh or expressive face rig. |
| Clothing | Narrower iro and senator extensions; sloped neckline corrects the exposed shoulder edge in the natural-style shirt. Actual thumbnails updated. | Still approximate skinned surfaces, not true sewn garment panels. Other gowns/agbada and final drape remain unresolved. |
| Makeup | Optional brows, eyeliner, lipstick, blush, individual intensities, lip colour and no-makeup reset in the isolated study. Pigment follows face UVs and retains surface detail. | Preview-only; no fitted lash meshes, purchase or persistence. Needs fitting on replacement faces and live review. |
| Accessories | Existing hoops, chain or glasses selection/removal in the study; existing headwear/shoes retained in the game. Wardrobe explicitly explains hair tucking before buying headwear and when trying hair beneath it. | Existing one-accessory slot remains; independent rings/watches/bracelets/bags and full compatibility rules are pending. |
| Preview | Rotation, face/full-body framing, zoom, standing/walking/sitting, pause, small lazy-loaded character-specific thumbnails. One renderer/model at a time, bounded rebuild rate, capped pixel ratio, hidden-page rendering skipped and disposed resources. | No measured Android frame time, memory or native-touch result. |

Shopping remains separate from owned inventory in the actual game, with existing prices, confirmation, Owned/Equipped states, cancel, ownership and named looks. The studio is a free preview study rather than a shop. The full requested hair, occasion and accessory taxonomy, filters and asset acceptance gates are retained in ROADMAP.md; they are not represented by placeholders.

## Verification — separated by evidence type

**Rendered inspection:** reopened the supplied primary 1001988093 frame at 00:16.155 (soft face/relaxed character) and 1001988127 frame at 01:01.401 (hair catalogue, owned state, colours). Inspected the before/revised garment renders, standing/walking/sitting, both close faces, six hair samples, and makeup across deep/medium/light tones. The comparison pack shows the remaining mismatch clearly. These are software rasterisations of actual meshes, with simplified fixed lighting; they do not reproduce WebGL shadows, all material responses, browser layout or animation playback. Reference frames remain QA-only, never runtime game assets. No new video/audio playback claim.

**Automated:** npm run check passed. The wardrobe/home regression passed preview/cancel, once-only charge, equip, named look, body change, furniture purchase/place/rotate/move/store, reload, money/ownership/layout preservation and reachable home activities, using test storage and DOM/renderer doubles. Additional appearance checks passed legacy-colour retention, swatch draft isolation, UV source immutability, makeup reset and ownership/layout preservation. The final neckline change triggered a separate geometry rerun rather than repeating the unchanged save/decor suite. See syntax.log, wardrobe-home.log, appearance-check.log, final-geometry.log and verification.json. Geometry success does not establish attractive characters or clipping-free clothes.

**Actual browser/device:** unavailable. Supported Browser discovery returned an empty list. No genuine browser screenshot, live CSS interaction, real touch or physical Android test was performed. Software comparison images are explicitly labelled; visual approval is pending.

**Recovery:** checkpoints/2026-10-26-before-fashion-review/ contains 161 files with SHA-256 manifest and restore instructions. All checkpoint hashes match. No browser user save was read or edited by the tools. Legacy keys, state schema, purchase IDs, named looks, furniture layout code, skeleton/animation source files and third-party MIT/CC0 notices remain.

## Asset decision and remaining work

Recommend the free MakeHuman/MPFB core body and natural-skin assets as the next bounded import, followed by fitted hair, real garment panels and retargeted existing animations. The asset plan compares this with free Blender Studio Rain/Snow and explains the licence/export tradeoffs. No proposed replacement was downloaded/integrated, and no reference-quality claim is made. The current sample is ready for review of its limitations, not acceptance as finished natural-character art.

No purchases, subscriptions, paid services, new systems or city redesign. Any future paid option must be discussed first.
