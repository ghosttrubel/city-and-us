# Blender replacement batch 1 (4 November 2026)

Current garments are authored in art/blender/batch-01 and exported as dist/assets/garments/Batch01_*.glb. Sources are the owner's supplied reference PNGs: female Denim_and_Everyday_Tops (leftmost and rightmost looks), male Everyday_Tops (row 2, column 2) and Baggy_Trousers_Shorts (row 1, column 4). The male outfit combines the two individually supplied designs. Plain backs are inferred. Neutral knit/denim fabric textures are generated locally by tools/blender/build_replacement_batch.py; no new external texture license or service is required.

The original reference PNGs, character bodies, skeletons and earlier garment candidates remain intact. Original source hashes, separate IDs and crop bounds are recorded in art/reference-catalogue/manifest.json. Only the implemented batch is player-facing; the other planning crops do not imply implemented 3D assets. Third-party licensing below remains in force.

---

# Asset provenance

The game direction and project remain the user's. These third-party asset licenses apply to their respective assets, not ownership of the entire game. No paid asset or service was purchased.

## Quaternius characters — CC0 1.0

- Author: Quaternius.
- Official pack: https://quaternius.itch.io/universal-base-characters
- Author's description: https://quaternius.com/packs/universalbasecharacters.html
- Edition obtained: free Standard archive, upload 15861669, inspected 20 October 2026.
- Archive's license preserved verbatim: dist/assets/characters/License_Standard.txt.
- License: https://creativecommons.org/publicdomain/zero/1.0/
- Source bodies: Base Characters/Godot - UE/Superhero_Female_FullBody.gltf and Superhero_Male_FullBody.gltf, with binary buffers, eye, diffuse and normal textures.
- Authored hair: Hairstyles/Origin at 0/glTF (Godot)/Hair_BuzzedFemale, Hair_Buzzed and Hair_Buns.
- Source files and original texture hashes are in tools/source-assets.

Adaptations: removed unused UV/colour attributes, packed buffers into GLB, reduced textures to 512 pixels, made neutral skin diffuse maps for runtime colour selection, retained sculpted facial geometry/skin weights, fitted garment surfaces and locally authored seams, footwear, braids, locs, afro and accessories. Body build and face adjustments are limited runtime modifications.

## Quaternius animations — CC0 1.0

- Official pack: https://quaternius.itch.io/universal-animation-library
- Edition: free Standard archive, upload 17958403, inspected 20 October 2026.
- Source: Unreal-Godot/UAL1_Standard.glb, retained in tools/source-assets.
- Archive license preserved verbatim: dist/assets/characters/License_Animations.txt.
- Kept Idle_Loop and Walk_Loop. Runtime clips contain rotation tracks only, adjusted from the animation rig's bind rotations onto each target's bind rotations. Target bone translations remain intact.
- Root motion, other clips and the demonstration mannequin are omitted from the runtime pack.

## Environment and local additions

The street geometry, painted sign atlas, surface textures, produce, palms, vehicles, garment fitting and additional accessories are authored in this checkout. No reference image, commercial game character, company logo or third-party texture was copied into the playable scene. The reference folder remains unchanged.

## Three.js — MIT

Three.js 0.169.0 and matching r169 GLTFLoader, SkeletonUtils and BufferGeometryUtils are local in dist/vendor. Preserve dist/vendor/THREE-LICENSE.txt. Addons come from the official Three.js repository at https://github.com/mrdoob/three.js/tree/r169/examples/jsm.

## Rebuild

The complete dist folder is portable; playing requires no dependency install or asset service.

- node tools/prepare-assets.mjs rebuilds runtime GLBs and bind metadata from the included sources using Node builtins.
- node tools/prepare-textures.mjs rebuilds runtime WebP textures. This optional editing tool needs sharp installed locally (npm install --no-save sharp). It is not used by the game or normal checks.
- npm run check checks JavaScript syntax.
- npm run check:visuals loads actual meshes with an image-free Node test adapter, exercises appearance/animation, checks finite positions, and counts street geometry. It is not browser or performance certification.

## Offline preview tools
The optional software preview needs sharp and @napi-rs/canvas (npm install --no-save sharp @napi-rs/canvas). It uses the actual meshes and local textures with simplified shading. It does not reproduce WebGL shadows or prove playable browser behavior. The game has neither dependency.

## v0.5 local additions

The original joystick/phone UI, shared map data, door leaves, parcel and Home/Dispatch/shop interior geometry are authored in this checkout. Existing licensed character meshes, wardrobe and idle/walk clips were preserved. No reference image is shipped as an asset; phone screenshots were used only as interaction guidance. No asset or service purchase was made.

## v0.6 additions

Camera, navigation, district scenery and public-room additions are original project code. Phone icons are original inline SVG paths; wallpaper uses CSS gradients. District signs/textures are locally generated canvas artwork. Reference screenshots were reviewed for interface structure and were not embedded as game assets. Existing character models, animations, garments and third-party license files were preserved. No new external asset package or paid service was added.

## City & Us review adaptation — 24 October 2026

The optional bob packs tools/source-assets/Hair_Long.gltf and .bin (existing Quaternius CC0 source) into dist/assets/characters/Hair_Long.glb using tools/prepare-assets.mjs. It is scaled/fitted to the retained Head bone. Existing source/runtime bodies, rig names, idle/walk clips and MIT vendor notice remain. Soft-natural appearance modifies cloned eyebrow geometry, tailored jaw/chest geometry, material roughness/normal strength and clip timing; Original style remains available. New apartment details and activity poses are original code-authored geometry/transforms. No footage, screenshot, reference game mesh, brand or music has been copied into dist. No asset was purchased.

## Wardrobe and Home milestone — 25 October 2026

No external assets were purchased or downloaded for this milestone. The existing Quaternius Standard CC0 bodies, hair sources and animation clips remain, along with their included licence files and the third-party Three.js MIT notice. CC0 permits commercial use; the included licence notices are the provenance used here. The project's own additions remain the owner's source.

Actual catalogue: **35 fashion entries**, comprising Hair 12 (11 presentations plus bald), Full Outfits 3 bundles, Tops 3, Bottoms 3, Dresses 2, Native Wear 4, Shoes 3 and Accessories 5. Full outfits reuse garment components; the soft bob and long sweep wig both adapt the retained Hair_Long CC0 source through distinct fitting/scaling. These are not two independently authored hair source models. Existing buzz cuts and twin buns retain their CC0 provenance. Original braids, locs, afro, cornrows, puff, twist crown, pixie, garment cuts, native-wear forms, boots/loafers, gele/fila and geometric ankara print are code-authored here. Recolours are customisation, not extra items or models. The inventory has 16 free starter entries and 19 game-currency purchases.

**Eight movable furniture models:** Oro side table, Sunday coffee table, Bode bookcase, Palm woven cabinet, Evening floor lamp, Courtyard palm, Market stripe rug and Indigo runner. Geometry, palette, books, ceramics, woven-door detail, foliage and rug patterns are original project code in furniture-meshes.js. The original sofa and installed activity stations remain present, and are not inflated into this catalogue count.

Exact item IDs, prices, categories, source notes and bundle flags are in qa/wardrobe-home/catalogue.json. Product thumbnails in dist/assets/catalogue are software renders of the shipped meshes; no reference screenshots or third-party brand artwork were used. Rebuild them with node tools/render-catalogue.mjs after installing the optional sharp and @napi-rs/canvas development dependencies. tools/render-fashion-fit.mjs generates pose QA evidence. Normal play and all automated regressions require no packages or external asset service.

## Character/fashion study — 26 October 2026

No new third-party runtime asset. Natural swatches, neutral lighting, UV pigment masks and the isolated review UI are original code. The retained skin diffuse and normal maps are preserved. Iro/senator profile edits refine existing original garment surfaces; no new clothing design is counted. Ten small study thumbnails and two updated catalogue thumbnails are software renders of the actual existing models. Reference frames remain QA-only and are not shipped. Free alternatives and their source links are documented in qa/fashion-review/ASSET-PLAN.md; none is integrated or purchased. MIT/CC0 notices remain unchanged.

26 October 2026 physical home: original code-authored room, food/storage/utensil props, procedural hand-targeted activity cycles and locally generated shower noise. No new external assets or paid services. Existing character assets and licenses unchanged.

26 October street/service: original code-authored shop displays, menu lettering/contact shadows, cooking counter props and generated customer order labels. Reused existing character assets for two bounded customers. Original procedural preparation/stir/handover cycles; only existing idle/walk clips are authored assets. No purchase, new download or license change.

27 October 2026 connected destinations: original code-authored Tide Courtyard Hotel, Lantern Yard, Lagoon Pot and compact beach geometry/signage/props, using existing Three.js and retained CC0 characters. Original procedural beat/pickup/rest motions; no new external assets, music licences, paid service or hotel-brand affiliation. No dedicated beachwear assets were added; catalogue audit is qa/connected-city/beachwear.json.

## 29 October 2026 — food illustrations and recorded dialogue

- dist/assets/food/*.svg: original editable vector illustrations created for this project (rice, tomatoes, beans, plantain, pepper yam, jollof and plated variations). No third-party photographs or copied branded packaging. Names/quantities remain alongside thumbnails. The coarse 3D meal details are original procedural meshes, not photographs.
- dist/assets/dialogue/: 39 original-script synthetic WAV recordings, 6,113,316 bytes, 127.325 seconds. Kokoro-js 1.2.1, stock voice vectors and Kokoro-82M weights are Apache-2.0; included notice/provenance and per-clip hashes live with the assets. ONNX revision 1939ad2a8e416c0acfeecc08a694d14ef25f2231; model SHA-256 fbae9257e1e05ffc727e951ef9b9c98418e6d79f1c9b6b13bd59f5c9028a1478. See tools/voice-build/README.md and the pinned generator. The script is original. No paid service, identifiable-person imitation, microphone recording or runtime model is used. English stock voices read short English/Pidgin lines; Nigerian-accent authenticity and pronunciation are not established. Manual listening remains required.
- Stock voice/model source: https://huggingface.co/hexgrad/Kokoro-82M and https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX . Source engine: https://github.com/hexgrad/kokoro/tree/main/kokoro.js . Runtime ships recordings, not the model or build dependencies.
- Street rain/ambience uses original locally generated noise/oscillator sound. Character breathing, blink/approximate mouth movement, looks and gestures are original procedural additions to the retained compatible rig. No new motion-capture or authored facial-animation licence is claimed.
- Existing third-party MIT and character/asset notices remain unchanged. No watermarks or additional in-game branding added.

## 31 October 2026 — bounded visual correction

Original locally authored shirt panels (female/male everyday fit) in dist/everyday-clothes.js replace the body-derived shirt surface while retaining the compatible CC0 rig. Original bevelled furniture geometry, contact-shade texture, cool palette and buka service/display details. No new catalogue entries or external asset purchase/download. Source topology and all existing skin/rig files remain portable. Reference images are QA evidence only. Software comparisons are labelled as such in qa/visual-correction/review.html. Remaining body/garment replacement requirements are in qa/visual-correction/ASSET-LIMITS.md.

The six CSS Phone wallpapers were authored locally before the visual-priority switch; no imported imagery or paid packs. Earlier language/voice work is checkpointed outside dist and is not included in this correction: runtime retains the 39 existing licensed clips and reliable text fallback.

## 1 November 2026 — first reference wardrobe batch
Four original procedural skinned garment profiles in dist/reference-outfits.js are based on the owner-supplied design sheets listed in qa/wardrobe-batch-1/references.json. The reference images are not shipped or used as textures. The four new catalogue thumbnails are software renders of the actual game meshes. Retained CC0 humanoid assets and original MIT/other notices remain unchanged. No purchased or third-party replacement assets were added.


## 2 November 2026 — one supplied-design garment candidate

This supersedes the earlier “reference pictures are not shipped” statement for the single selected sheet only. The owner explicitly requested the original PNG as a catalogue reference picture: dist/assets/outfit-references/Denim_and_Everyday_Tops.png is a byte-identical copy of the owner-supplied source. It is not a texture on the character.

The separate dist/assets/garments/Square_Denim_Review.glb contains project-authored garment fitting, neckline cuts, wide-leg shape, UVs, small fabric/denim maps and construction details, using the existing Quaternius CC0 compatible body topology and rig. Source and local exporter are retained; License_Retained_Rig.txt accompanies the asset. Existing MIT and other notices remain unchanged. Back construction is plain and explicitly inferred with owner permission. No replacement batch or visual acceptance is claimed; actual game capture is pending. See qa/exact-outfit-review/STATUS.md.


## Original phone media — 12 November 2026

- `dist/assets/music/courtyard.wav` and `lagoon.wav`: original deterministic instrumental compositions generated for this project by `tools/build-original-music.mjs`. No external recordings, artist performances, sampled songs or remote services. 24-second mono PCM loops, 16 kHz. Source is portable and editable; these additions retain project ownership and do not alter third-party licenses.
- `dist/assets/wallpapers/*-image.svg`: original local vector landscape artwork for the phone. No downloaded imagery or new watermark.
- Place references: supplied `Shops/Neighbourhood_Shops_Interiors.png` and exteriors (top-left boutique; bottom-right salon); `Homes/Homes_Interiors_01.png` and `Home_Rooms_Additional.png`. No showroom sheet was found: showroom arrangement adapts the supplied home furnishing language and displays the actual existing furniture catalogue.
- No new voices. Existing generic recordings remain unapproved and disabled. Actual approved spoken coverage is still missing.
