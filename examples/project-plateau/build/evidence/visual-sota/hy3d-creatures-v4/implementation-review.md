# HY3D creatures v4 · implementation-owner visual review

- Source fingerprint: `66fac75814e21b4ee41ceae71cd08e6817a58b7fab4779e0c67cf468b46332a1`
- Evidence manifest: `manifest.json`
- Manifest SHA256: `71f204c2a003d318c7cea937ccec7b4675235cf7f8d4fa8b7a4cafa06b089b44`
- Review kind: implementation-owner review; not independent promotion evidence
- Disposition: `READY_FOR_INDEPENDENT_REVIEW`

## Rubric disposition

| Category | Points available | Owner review | Evidence |
|---|---:|---|---|
| Creature anatomy and identity | 25 | Meets target | Four-angle Iguanodon/pterodactyl orbits; continuous tail root and wing membrane; two adult/three young family is readable. Young reuse the shared mesh with a persistent juvenile-proportion morph. |
| Creature material and surface | 10 | Meets target | Matte PBR colour/normal detail remains readable without the source asset's glossy roughness response. |
| Environment form and depth | 15 | Meets target | Brook, canopy, glade, basalt and Fort remain separate route/depth anchors; the tree-root regression test and live frames show grounded trunks. |
| Lighting, atmosphere and colour | 15 | Meets target | Warm side light, cool distance, humid shafts and the glade sun lane preserve subject separation without a full-frame tint. |
| Camera and signature composition | 15 | Meets target | All six visual targets, both supported viewports and eight creature orbit views pass the source-bound capture suite. |
| Motion and behaviour | 10 | Meets target | Six Iguanodon morph targets and three pterodactyl morph targets preserve graze, reach, play, tail counter-motion, wing beat and dive fold over shared static source meshes. |
| Expedition tools and UI integration | 5 | Meets target | Field camera, plate board, rifle and edge UI preserve the mahogany/brass/ivory/charcoal grammar and focal protection rectangles. |
| Runtime delivery and accessibility | 5 | Meets target | No console/external request failures; 150% text and reduced motion fit; 1440x900 measured 120.5 median/108.7 1%-low FPS and 1280x720 measured 120.5/107.5 FPS. |

The implementation-owner pass finds no blocking defect in the tracked target
set. It deliberately does **not** award the final `100/100`: the contract in
`design/VISUAL_TARGETS.md` also requires a reviewer who did not implement the
candidate to inspect the live run and record zero blocking defects.

## Delivery facts

- Iguanodon GLB: `1089008` bytes, `24996` triangles, shared by five animals.
- Pterodactyl GLB: `1327456` bytes, `30496` triangles, shared by three animals.
- Combined creature payload: `2416464` raw bytes, `1793074` gzip-9 bytes.
- Built distribution: `3197477` raw bytes.
- Both GLBs are absent from the cold title request list and each is requested
  exactly once after the first player interaction.
- The complete target suite captured 18 checkpoints with zero console or
  external-host errors.

## Remaining release evidence

1. Run the current source in a clean reviewer context at normal speed.
2. Bind the review to this source fingerprint and manifest hash.
3. Record any blocker/major/minor finding with a live frame or timestamp.
4. Only a zero-blocker/zero-major independent disposition may promote the
   candidate to the strict `100/100` ceiling.

