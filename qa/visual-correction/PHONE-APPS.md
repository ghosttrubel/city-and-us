# Phone app audit — 31 October 2026

Only existing local flows and the completed Wallpaper flow are exposed. Visual correction is the active gate; no social/government placeholders were added. Logic checks use test doubles, so physical-phone acceptance remains separate.

| App | Underlying system / current access | Status and dependency |
| --- | --- | --- |
| Jobs | Courier parcel desk → Provisions handover → Home; Mama T two-customer preparation/service | Local playable jobs retained. Additional careers planned. |
| Profile | Saved identity, traits, skills; Change my look → wardrobe/customisation | Local working flow. Local ID is not an online account. |
| Navigation | Actual entrances, minimap, route planning and physical walking | Local working flow; no new districts or teleport shortcuts. |
| Tasks | Real state predicates and guarded reward claims | Local working flow. |
| Settings | Graphics/resolution, dialogue controls, save export/import, build ID | Working local controls. Voice-language separation is parked until the visual gate; legacy speech/text fallback remains. |
| Food | Order → courier collection/delivery → receipt → physical meal and storage | Local working flow; continuous seated eating now ends at full, finished or cancelled. |
| Ride | Fare → dispatch → physical arrival → board → road travel → alight | Existing one-service local flow retained. No shared backend claim. |
| Wallpaper | Six original CSS thumbnails → preview → apply → story save/reload | Implemented before visual-priority switch; retained and regression-tested. Changes in-game Phone only. |
| Friends | Account IDs, request/accept/decline/remove, invites, permissioned visits, block/report | Planned; needs authenticated shared service and tested permission/reconnect behavior. No icon. |
| Chat | Saved messages between accepted players, delivery/history, block/report/moderation | Planned; needs accounts, shared messaging and moderation. No icon. |
| Events | Venue, time/timezone, guest state, invitations/RSVP, playable attendance | Planned; needs event model, permission rules, scheduling and real activity flow. No icon. |
| Boutique | Existing physical shop, catalogue, previews, ownership and equipping | Physical shop and Profile/wardrobe remain usable. Separate Phone app planned; must connect to actual catalogue/venue and price/ownership rules. No decorative icon. |
| Home/Decor | Existing Needs → Home & rent → furniture placement/rotation/storage; saved finishes/layout | Existing physical/local decorating retained. Separate Phone app planned; must integrate valid placement and property permissions. No decorative icon. |
| Games | Multiple playable games with rules, controls, pause/end/replay and saved best scores | Planned. Existing venue activities are not a completed Games app. No icon. |
| Health | Existing food, energy, mood, hygiene and home activities | Needs remain usable. Separate app/care systems planned; requires a defined health model and meaningful actions. No decorative icon. |
| Government | Terms, officeholders, treasury/budgets/projects and permissioned actions | Planned; requires tested authoritative backend. No icon or functionality claim. |
| Voting | Eligible accounts, candidates, one vote per office, deadlines, results/succession | Planned; requires authenticated authority, concurrency/replay tests and auditable tallying. No mock elections or icon. |

Premium voice packs remain planned: owner-reviewed Nigerian performances, express rights, costs discussed before commitment, free essential dialogue and text fallback. No purchase UI or dialogue lock. The owner will personally review labelled samples/transcripts when voice work resumes.

Paid wallpaper packs remain planned until real billing/entitlement restoration/refunds are designed and tested. The current six wallpapers are free. No purchase buttons. Theme/light-dark, accent and app-arrangement preferences remain separate unfinished work.
