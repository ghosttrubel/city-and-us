# City & Us — visual quality and interior correction references
Prepared 30 October 2026. This is an additive reference pack, not game source.

## Install
Extract this ZIP once into your existing project's `reference` folder. The result should be:
`reference/city-and-us-quality-references/README.md`
Do not overwrite source files or delete existing references. If you use `references` instead, put this folder there and give Codex the actual path.

## Source and evidence
Folders 01–04 contain user-supplied screenshots from the reference game shown as Naija Life / Lagos Life in this conversation. Folder 05 contains the user's City & Us Android screenshots. These are inspiration and defect evidence, not assets licensed for inclusion in our game or marketing. Create original artwork or use properly licensed assets.
Promotional screenshots show intended presentation, not verified gameplay behaviour. Screenshots cannot establish smoothness, voice quality, networking, route correctness or performance. No videos are included in this pack; existing video references remain in the project.

## Current decisions
- Product name: City & Us. The local source folder may still be named lagos-street.
- PORTRAIT-FIRST phones supersedes all earlier landscape-only instructions. These Android evidence images predate the portrait changes; do not revert to landscape to reproduce them.
- Preserve compatible saves, ownership, inventory, customisation and gameplay. Preserve signing keys and secrets.
- The user rejects the current visual quality. Existing approval of earlier character versions must not be treated as approval of the defects here.
- No paid assets or services without discussing costs first.

## Read these first
1. `05-our-android-defects/1002045066.jpg`: front view of orange dress and home. Inspect rigid skirt silhouette, clothing fit/edge artifacts, flat surfaces, camera and large unreadable cream panel.
2. `05-our-android-defects/1002045072.jpg`: home cooking. Controls obscure the body and work surface; light labels on pale controls are unreadable. Inspect actual rendered appearance, not just CSS sizes.
3. `05-our-android-defects/1002045073.jpg`: Mama T's. Character/customer overlap, dark patches on the dress, preparation represented by a large button panel, oversized labels and obstructed work area.
4. `03-home-camera-and-city/IMG_0097.jpeg` and `IMG_0098.jpeg`: reference home overhead composition and open floor space.
5. `01-character-clothing-and-lighting/IMG_0088.png` and `IMG_0089.png`: reference character preview framing.
6. `04-profile-social-and-phone/IMG_0104.jpeg`: reference phone app organisation. An icon alone does not prove that its service is implemented.

## Main user feedback: all interiors look the same and feel rigid
The repeated layouts, materials and furnishings are a quality problem. Each EXISTING playable destination needs an interior identity appropriate to its role, with usable circulation and recognisable objects. Do not just recolour or rescale the same apartment shell.

| Existing place | Distinct interior purpose and appearance |
| --- | --- |
| Starter home | Comfortable small home with clear sleeping, eating and kitchen zones; room to move; privacy around washing/toilet facilities |
| Mama T's buka | Serving counter, food display, kitchen workstations, customer queue and seating; visible preparation and handover |
| Boutique | Clothing racks, mirrors, mannequin/display areas and a fitting/preview point |
| Dispatch | Parcel shelves, collection counter and a marked loading/hand-over area |
| Hotel | Reception desk, lobby seating, clear signage and route to the existing rest activity |
| Eatery | Distinct service counter, dining tables, kitchen identity and takeaway collection point |
| Club | DJ position, dance floor, seating, intentional coloured lighting and suitable sound |

This table describes correction targets, not claims that every interior or prop currently exists. Audit the current project before editing. Do not expand closed church/mosque/police/government sites during this correction. Keep their roadmap entries.

## Visual priorities
1. Fix unreadable/empty panels, contrast, clipping and controls covering the character. Compact portrait HUD, circular navigation minimap, reachable touch targets; no persistent debug panel.
2. Diagnose clothing dark patches, pale edge artifacts, body intersections and deformation. Determine whether geometry, skinning, material, lighting or low rendering resolution is responsible before applying fixes. Avoid rigid cone-shaped substitutes for dresses and skirts.
3. Establish consistent surface detail and lighting: distinguish fabric, skin, wood, tile and metal. Balance colour so rooms do not all read as flat beige/green. Check skin under neutral light.
4. Frame character and room intentionally. Account for walls and doorways; maintain scale and clear paths. Furniture should look proportionate and functional.
5. Separate NPC service, queue and conversation positions. Prevent characters intersecting each other or counters. Resume routines safely after dialogue.
6. Food must be visible, identifiable, reachable and usable after cooking. Complete cook -> plate -> carry/serve -> eat with actual portions and hunger updates. A 'Prepare 3/3' button or inventory count alone is insufficient evidence.
7. Use gestures and activity-specific animations that fit the scene. Reference stills do not verify animation quality; require device playback.

## Delivery approach
Finish the currently running task, incorporate these defect images, then produce ONE bounded quality correction of the home and Mama T's. Keep a recoverable checkpoint. Establish a reusable visual approach there before applying it to other interiors; do not blindly replace the whole project.
If proper clothing/animation quality requires new 3D assets or manual modelling, identify that limitation clearly. Do not claim that a generated 2D concept image is a rigged playable model.

Produce an updated debug APK with build identifier visible in Settings. Report which issues are corrected, which are asset limitations and which remain unverified. Reuse the existing signing setup. Do not publish automatically.

## Acceptance
- Review actual Android portrait screenshots and a short user phone playtest of the exact updated build.
- Home: readable UI, face/body visible, no obvious clothing holes/patches, recognisable surfaces and comfortable walking/door crossing.
- Kitchen: visible pot/ingredients/meal, compact controls, plate findable, carry -> doorway -> serve -> eat works visibly.
- Mama T's: customers queue without overlap; player visibly prepares and serves food; payment remains correct and once-only.
- Preserve saves and customisation across reload/update.
- Run relevant automated regressions, but label test-double/CPU/software-render results accurately. They do not override failed physical-device acceptance.

## File index

### 01-character-clothing-and-lighting
- IMG_0073.png
- IMG_0074.png
- IMG_0078.png
- IMG_0079.png
- IMG_0080.png
- IMG_0081.jpeg
- IMG_0082.png
- IMG_0088.png
- IMG_0089.png
- IMG_0095.png
- IMG_0096.png

### 02-transport-and-environment
- IMG_0075.jpeg
- IMG_0076.png
- IMG_0090.png
- IMG_0091.png
- IMG_0092.png
- IMG_0093.png
- IMG_0094.png

### 03-home-camera-and-city
- IMG_0097.jpeg
- IMG_0098.jpeg
- IMG_0099.png
- IMG_0101.png

### 04-profile-social-and-phone
- IMG_0102.png
- IMG_0103.png
- IMG_0104.jpeg
- IMG_0105.png

### 05-our-android-defects
- 1002045066.jpg
- 1002045072.jpg
- 1002045073.jpg
