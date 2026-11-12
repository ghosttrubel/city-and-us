# Physical home review — 26 October 2026

Implemented for review: compact activity strip; physical meals across doors and reload; four-bite seated eating and stored leftovers; fridge/cupboard ingredient stock; jollof and beans/plantain recipes with collection, preparation, heat/stir and plating; seated reading/typing; shower entry/privacy/water/procedural sound/exit; larger zoned home and safe furniture migration.

Checkpoint before changes: checkpoints/2026-10-26-before-physical-home (193 files). Wardrobe, purchases, owned furniture, main/review save keys, mobile startup, landscape pause and resolution settings retained. Conflicting furniture moves into owned storage; no ownership deletion. No assets purchased or character assets changed.

Automated evidence: npm run check; verify-physical-home-state.mjs; verify-physical-home.mjs; updated verify-mobile-lifecycle.mjs all passed. Full physical delivery/door/table/leftovers/reload and both recipe journeys use actual game handlers and synthetic joystick. Tests cover stale taps, ingredient deduction/refunds, once-only nutrition, furnished routes, migration, portrait/background pause and reload ownership. DOM, GPU, audio and storage are doubled; these are NOT browser/device results.

Rendered evidence: carry, eat, prepare, study, shower and overview PNGs in this folder, generated from shipped meshes by the software renderer. Inspected eating/preparation/study/shower frames; corrected camera cutaway hiding activity seats/surfaces. Software rendering approximates lighting and does not reproduce WebGL water instancing, sound, touch or phone performance.

Animation limitation: the retained asset contains Idle_Loop and Walk_Loop only. Activity cycles use original procedural poses and two-bone hand targeting, not authored activity clips or mocap. Refinement of wrist/grip and transitions remains art work. Do not call the actions reference-quality or device-accepted. Shower remains clothed behind a privacy screen.

Browser/device verification: PENDING. Browser discovery returned no available sessions. Owner's earlier iPhone 11 startup confirmation predates this home change. No new Safari/Android touch, pixels, water or audio acceptance is claimed.

Phone review: http://10.126.70.116:3000/?review=daily (same Wi-Fi; server must remain running). Review save is separate from the main story. Landscape required. Choose Low/Balanced/Sharp in Phone > Settings for comparison.

Review sequence: Phone > Food, order to Home; go outside and receive; enter carrying package; approach dining table to place/open/take bites. Use Phone > Food to carry leftovers to the fridge. At prep counter unpack one grocery portion, store ingredients in fridge/cupboard, reload, select recipe; collect from each cabinet, prepare three times, simmer with two stirs, finish and plate. Eat or store. Test desk reading/computer, shower entry/exit and Cancel. Rotate mid-activity and reload after a partial bite/recipe step.

Transient animation time is not resumed after reload: the player returns to the safe standing point with the last completed bite/recipe step. Ingredient reservations and completed rewards persist. Cancel before preparation refunds collected ingredients; after preparation it discards the recipe without refund. No offline timer catch-up.

Next: street appearance/routines/selection and Mama T's actual customer service job. Their previous timer/idle behaviour is not accepted and is not included in this home completion.
