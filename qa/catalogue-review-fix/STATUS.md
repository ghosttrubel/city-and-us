# Catalogue and optional review correction

Cause: all three garments existed, but wardrobe and study cards silently filtered by character sex. The default female view therefore showed two outfits; the male tee/jeans was hidden. No garment was missing.

Both surfaces now display all three outfit cards with explicit female/male fit labels and totals. The standalone study changes only its preview model when a different fit is selected. The wardrobe can preview another fit but cannot buy or equip it for an incompatible character. Preview/cancel leaves the player's body, colours, ownership, equipment, money and storage untouched.

The large reference/capture panel starts hidden, including after reload. Quick menu → Review opens it. Close review, Escape or Walk normally releases the review pose and returns to gameplay. The four-view capture tools remain available on demand.

Places requirements are recorded in docs/OWNER_REQUIREMENTS.md and linked from README.md and ROADMAP.md. Priority remains clothing, hairstyles/accessories, then places/vehicles. Reference folders are reference/City_And_Us_Buildings_And_Places and reference/City_And_Us_Transport. No interior palettes, meshes, source designs, garment assets or save-migration policies changed in this correction.

Validation: PASS — npm run check and the shipped-game UI/save regression, including all three cards in both wardrobe modes and the standalone study, correct preview models, incompatible-fit equip prevention, preview cancellation, closed-by-default/reload review state, pose restoration, colours, money and main-save isolation. DOM and renderer doubles were used; these checks do not certify browser pixels. Automated browser screenshots remain pending per the owner's instruction; no unavailable Browser retries.
