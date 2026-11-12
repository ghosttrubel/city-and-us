# City & Us reference review — 24 October 2026

## What was actually reviewed

The four updated pack notes (README, REFERENCE-INDEX, AUDIO-CONTEXT and AGREED-PLAN) were read alongside the current project handoff. All six updated videos were decoded and reviewed as **153 timestamped still frames spanning the full clips**, rather than watched with audio. Both new JPG references were opened. The five standalone reference/download*.png images were individually opened too: **41 supplied still images total** (34 earlier screenshots + 5 standalone images + 2 updated pack images). All 34 earlier screenshots under reference/references were also reviewed on contact sheets; the older character editor, home tour, phone and city/billboard screenshots were additionally opened at full size.

The in-app Browser reported no sessions. ffmpeg/ffprobe were not available on PATH or in the inspected tool locations, and downloading a free decoder was blocked by the environment's network access. The installed VLC library provided a local CPU decoding fallback. No program was purchased or installed; no audio was listened to. Audio/narrative implications below rely only on the owner's supplied **unverified summaries**, not an independent transcript.

The first accelerated decode attempt produced stale/corrupt frame buffers. It was discarded for review and replaced with isolated per-frame buffers at normal playback speed. The retained clean frames are the evidence. Timestamps are VLC media-clock samples (approximately 3-second spacing), not frame-exact presentation timestamps. Small endpoint offsets are expected; the concluding end cards or final footage are included. These are reference-video frames, never screenshots of our playable game.

| Source | Container duration | Reviewed frames | Retained evidence |
| --- | ---: | ---: | --- |
| 1001988060.mp4 | 130.148 s | 42 | city-and-us/1001988060-clean/sheet-0.jpg through sheet-3.jpg |
| 1001988093.mp4 | 25.334 s | 9 | city-and-us/primary-detail/sheet-0.jpg |
| 1001988125.mp4 | 15.200 s | 6 | city-and-us/1001988125-clean/sheet-0.jpg |
| 1001988127.mp4 | 181.267 s | 58 | city-and-us/1001988127-clean/sheet-0.jpg through sheet-4.jpg |
| 1001988234.mp4 | 83.196 s | 28 | city-and-us/1001988234-clean/sheet-0.jpg through sheet-2.jpg |
| 1001988235.mp4 | 27.767 s | 10 | city-and-us/1001988235-clean/sheet-0.jpg |

Timestamp coverage in the retained clean frames: 8060 0–129.759 s; 8093 0–25.065 s; 8125 0–15.076 s; 8127 0–181.161 s; 8234 0–83.062 s; 8235 0–27.568 s. The decoded videos reached their endings. See coverage.json for machine-readable counts.

The earlier reference/references/04-recording/home-gameplay.mp4 was additionally reviewed in **17 frames spanning 0–50.833 s**, in city-and-us/earlier-home-clean/sheet-0.jpg through sheet-2.jpg. Its actual video track ends at 50.967 s; its separate audio/container duration is 88.299 s (confirmed from MP4 mdhd track metadata). No listening to the longer audio track is claimed. The footage shows the original modest starter home, suggestion/ad prompts, the player approaching a plastic chair, a phone/social chair activity and sitting. It reinforces physical approach and correctly aligned seating. Thus the complete visual review totals **7 videos, 170 reviewed frames and 41 supplied still images**.

Each clean directory includes individual PNGs and review-frames.json. Earlier screenshots are collected in city-and-us/earlier-stills-0.jpg through earlier-stills-4.jpg. Original references remain untouched. Reference imagery/brands/music are not shipped in dist.

## Observations that inform the bounded milestone

**Primary character, 1001988093:** the adult avatar has natural proportions, a relaxed stance, smooth warm skin, soft cheeks/lips, restrained brows/eyes, straight dark side-parted bob, and a loose plum off-shoulder top with a light lower garment. The useful clean face reference is primary-detail/at-000016155.png. The clip moves through a warm timber-and-cream furnished home with rugs, couch/chairs, a bookcase and a desk, then shows an infant in a cot. The footage does not establish autonomous decision making. Refine one representative compatible rig before changing all characters.

**House tour, 1001988060:** the camera visits a downstairs office, bathroom, kitchen separated from a lounge/dining zone, stairs, upper corridor/lounge, bedrooms and wardrobe/dressing room. Dark olive walls, pale trim, coordinated rugs and warm furniture give the rooms continuity. Doorways and corridors visibly connect the spaces. At roughly 1:59–2:05 the camera pulls out to a whole-house cutaway. For this milestone, borrow the principles of room distinction, coordinated furnishings, usable routes, close follow and a genuinely centered house overview. Multiple floors and large property layouts remain later work.

**Children's room, 1001988125:** an adult gestures beside two beds and a cot; wardrobe, lights and a floor pattern make the room legible as a household space. The caption is storytelling context, not proof of an autonomous household simulation.

**Wedding journey, 1001988127:** visible sequence is home/wardrobe/food, beauty venue and shopping UI, home/outfit change, traffic/airport/departures/flight, decorated ceremony venue, group messages/dancing, low-energy airport rest, return flight, congratulatory message/gift, home and sleep. It supports connected reasons to leave and return home, contextual object actions, needs persistence and consistent character/outfit identity. Visible counters/chat/avatars do not verify another game's backend or capacity, or our own multiplayer.

**Government clip, 1001988234:** the OneState name is visible. Security/suited characters, official police vehicles, a convoy, a crowd on civic steps, a gathering and return home establish atmosphere. Keep government/elections as later server-authoritative systems; neither the footage nor its narration validates voting, accountability or player capacity.

**Event decoration, 1001988235:** pink/cream rugs and chairs, lamps, flowers, repeated black partitions and usable seating form a decorated gathering space. The avatar walks among chairs and sits; captions supply the wedding/pregnancy interpretation. No pregnancy mechanic, permissions or timing should be inferred from the visuals alone.

**whole-house-reference.jpg:** furnished cutaway with distinct rooms, stairs, seating/bed/kitchen areas and compact controls. It reinforces overview framing and readable circulation. **family-comment-reference.jpg:** anecdotal adoption/live-with-household comments; useful as a requirement that a future adopted child actually appears at home, not verified product behaviour.

**Earlier screenshots:** preserve the useful structure of customization, background/traits/goals/starting home, short guided tasks, needs, contextual venue actions, a coherent phone and readable travel/map views. Their large promotional banners and sponsorship brands are not instructions to reproduce them. New character direction supersedes the earlier character-freeze instruction.

**Standalone reference/download images:** download.png shows a branded expressive male stylised character close-up; download (4).png shows a stylised female action-character cutout. Their action poses/exaggeration are superseded by the new calm character direction. download (1).png shows Lagos-inspired roads/airport/beach/town concept panels; download (2).png and download (3).png show low-poly city intersections, sidewalks, trees, street furniture and mixed buildings. They support a readable connected streetscape, not copying assets/brands or expanding this milestone.

## Limits and reproduction

No live rendered game acceptance, Android touch test, device frame-rate/memory measurement, audio transcription, asset licensing transfer or backend verification is established by this review. No reference asset was copied into the game. These source clips are inspiration from multiple games.

The optional tools/review-references.py uses Python ctypes and the already installed Windows VLC library, captures to a caller-specified QA directory and disables audio/GPU decoding. It is not a runtime dependency. Example: python tools/review-references.py city-and-us-references/videos/1001988093.mp4 qa/reference-review/new-run. The game itself remains runnable without Python or VLC.
