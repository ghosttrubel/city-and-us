# Editable replacement batch 1

Open Square_Denim.blend, Tank_Denim.blend or Male_Everyday.blend in Blender. The original approved source remains at ../Square_Denim.blend. All source PNGs remain under reference/outfits.

Each file retains its character's existing 65-bone rig. Garment objects and material names are Top_Knit, Top_Binding, Jeans_Denim, Jeans_Stitch and Hardware. Keep those names and all bones. Neutral 256px knit / 512px denim textures multiply the player's chosen dyes; keep Hardware separate. Preserve UVs and normalised weights (maximum four influences). The character body is a fit reference and is excluded from garment export.

From the repository root run npm run wardrobe:export. Set BLENDER_BIN if Blender is installed elsewhere. The tool exports these edited sources, remaps joints to the game's exact original skeleton and validates assets before retaining outputs. GLBs have a 2 MiB and 30,000 triangle build budget; runtime uses five garment material batches per avatar, immutable shared geometry and independent dye materials.

npm run wardrobe:init is only for constructing missing source files. It refuses to overwrite existing files without -- --rebuild. Normal iteration uses wardrobe:export and never init. The older outfit:* commands are historical single-candidate tools; the active runtime uses Batch01_*.glb.

The plain back construction is inferred from the supplied front designs. Source fidelity, seated clipping and lighting must be reviewed in the real game. Software diagnostics are not browser screenshots or device-performance certification.
