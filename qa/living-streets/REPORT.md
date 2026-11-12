# City & Us — living-streets review, 29 October 2026

Implemented for review in the existing checkout. Physical experience acceptance remains pending; automated inventory assertions alone do not establish it. The original source/dist checkpoint is in checkpoints/2026-10-29-before-living-streets/. Existing character assets, legacy save keys, ownership and third-party licences remain.

## Compact interface first

A corner HUD holds location, time, money and small Phone/menu buttons; objectives collapse to one line. Activities use a narrow strip and a reachable Cancel button. Food cards and dialogue sit to the side. Touch targets remain at least 44px where controls were changed, with safe-area offsets. Diagnostics require an explicit setting/query; the small portrait rotation notice remains. The attached iPhone screenshots were not available in this session, so this is not a claimed screenshot-matched layout. Real notch/browser-bar/keyboard overlap checks remain pending.

## Food and physical actions

Existing station-based cooking was extended: ingredient collection, short preparations, stirring/heat, plating, an open carried cooked meal and Eat/Serve/Store/Carry choices. Serve places food at the player's own table; serving guests is not implemented. Existing utensil/seat/eating motion now accompanies visible food portions and per-bite consumption. Takeaway handover shows a bag moving between reaching hands, persists through doors/saves, and has a visible package-opening action. Completion guards retain ownership and prevent repeated receipt/consumption; cancelling an unfinished bite does not consume food.

Original editable food illustrations appear beside names/counts in storage, fridge, recipes and ordering. These are illustrations, not photographic food images; no third-party photo licence is being claimed. See [asset provenance](../../ASSETS.md).

## Dialogue, characters and environment

The reusable dialogue sequence plays an NPC line, shows selectable responses, plays the chosen player line, then plays the corresponding NPC answer. The courier supports greetings, order questions, receiving, thanks, waiting and polite refusal. Bisi supports greeting/directions/work/casual/refusal; Ayo has a short busy branch. Four additional pedestrians have routines but do not yet have complete voiced conversations.

39 bundled WAVs cover 28 short English/Pidgin script lines and female/male player variants. They were generated locally with Apache-licensed Kokoro stock voices; no paid voice service or live microphone is used. Volume, mute, subtitles and text-only settings persist, with a text fallback when audio cannot play. File hashes, duration, non-silence and script coverage were checked. Listening, pronunciation and a convincing Nigerian/Pidgin performance have not been verified. [Voice provenance and audition](../../dist/assets/dialogue/README.md).

The additive behaviour layer provides offset blinking/breathing/idles, looks, greetings, speaking gestures and simple mouth deformation while retaining the approved rig. Courier/player reaches, seller acknowledgment and utensil/eating actions use procedural poses. There are no authored eyelid/jaw/viseme controls, phoneme lip sync, captured handover clips, finger-contact solver or physically simulated food. Grips, face deformation, contact and timing need phone video review; these limitations are not marked complete.

Six named pedestrian routes are capped at 2/4/6 active actors for Battery saver/Phone/Balanced, with reduced off-screen work. Existing game time drives gradual morning/afternoon/evening/night lighting, street lamps, lightweight adjustable rain and ambient sound. Weather/settings migrate additively and persist. The existing walking/activity clock pace is retained; no duplicate clock or offline catch-up was added.

## Verification and evidence

[Final automated results](final-results.json) record passing npm run check, mobile, physical-home, street-service, daily-life, destinations, living-streets and media-server checks. New journey checks exercise shipped state/handler/mesh code with synthetic DOM/WebGL/media/storage. They cover cooking/plating/bites, doorway/reload carry, order/refusal/response sequence, partial meals, cancelled bites, duplicate guards, legacy saves and weather/settings persistence. Audio URL order is tested with a media double, not a listening test. The local HTTP check verifies SVG/WAV MIME and byte-range responses.

Software projections were generated and inspected for [plated carry](plated-carry.png), [visible bite](visible-bite.png), [preparation](preparation.png) and [handover](handover-pose.png). The [food sheet](food-illustrations.png) was inspected too. These are software-rendered geometry previews, not screenshots of the browser, CSS, real WebGL, mobile audio or facial animation. The in-app browser runtime reported no available browser, so no live browser rendering verification occurred. No physical phone was operated during this milestone.

[Exact phone acceptance steps](PHONE-PLAYTEST.md) cover all three requested journeys, conversation branches, gesture/contact observations, safe areas, persistence, day/weather changes and sustained performance. Record device/version, PASS/FAIL per step and short videos. Previous owner acceptance of earlier iPhone gameplay does not verify these new changes.

## Review link

With npm start running, open http://10.222.147.116:3000/?review=daily on the same Wi-Fi. This address was observed for this laptop during the session; phone reachability is not verified. The review story is separate from the main story; export a backup first. Voice audition: http://10.222.147.116:3000/assets/dialogue/review.html. No public hosting change was made.

## Android — separate blocked deliverable

**No device-test APK or signed AAB was produced.** Android source, bundled offline asset configuration, landscape/lifecycle handling, Gradle wrapper, signing preparation and factual store/privacy drafts are present. Compilation reached javac but sandbox access to installed SDK jars was denied; initial dependency network access was also denied. The restriction was not bypassed. No connected device, installation, signature verification of an output, upload or publication occurred.

See [exact build status and retry commands](ANDROID-STATUS.md), [build guide](../../android/README.md), [secure signing backup](../../android/SIGNING-BACKUP.md) and [store/Data Safety checklist](../../android/STORE-CHECKLIST.md). Keep the generated upload key and export its password privately into a password manager; Windows DPAPI alone is not a portable backup. The source wrapper bundles the game and requests no Internet/microphone permission, but the produced artifact still needs verification when building becomes possible. Owner contact/public privacy URL and store assets remain release tasks. Multiplayer, live player microphone chat, elections, purchases and other planned features are not implemented or claimed.
