# Original basalt shelf asset pass

## Physical requirements

- The landmark must read as one geological load path: buried bedrock plinth → broad fractured wall
  and buttress → short horizontal mineral benches → blocks resting on those supported surfaces. Thin
  red ground cards, disconnected vertical rods and fragments hanging in air are hard failures.
- The module must align to the sampled terrain normal. Its complete bottom contact ring must remain
  below the heightfield, not merely touch one high vertex while the opposite side floats.
- A non-solid visible formation is permitted only while its complete footprint stays beyond the
  authored navigation boundary at `x=29`. Any part entering playable space would require matching
  collision authority.
- Basalt remains a rough, non-metallic, non-emissive dielectric. Its red colour comes from oxidized
  mineral albedo and vertex variation, not emission, bloom, excessive exposure or a duplicated tint.
- The asset is project-original. Web Ocean is only a comparison target; no mesh, texture or design
  asset from its third-party library enters Plateau.

## Accepted changes

- `scripts/generate-basalt-shelf.mjs` deterministically authors a **93,580-byte** binary GLB with
  **680 triangles**, two draw calls, three thick horizontal shelves and six supported broad spalls.
  Its SHA-256 is
  `a7fb6121d61dd2d7a492810ee61a1ee69d9793b517efe4035c1de550fad66a87`.
- The two exported meshes are closed. Unit QA quantizes their spatial edges and requires every edge
  to be used exactly twice; the load-bearing mesh records seven overlapping closed volumes rather
  than an open façade or terrain card.
- One shared template is instanced at all three `BASALT_FORMATION_LAYOUT` sources. Each anchor aligns
  its local up axis to the sampled terrain normal before applying formation yaw. The 0.62 m-deep
  plinth is then placed 0.2 m above the centre sample, leaving its entire lower contact ring buried.
- Browser QA measured **60/60 supported bottom vertices** at every source. Maximum bottom clearances
  were `-0.3060`, `-0.3642` and `-0.2644` m; negative values mean the contact ring is inside the soil,
  not floating above it. The closest visible `x` values were `29.8389`, `32.9884` and `30.1875`, all
  beyond the `x=29` navigation boundary.
- Face-planar UVs reuse the same correlated basalt albedo, roughness and relief sources that weather
  the surrounding terrain. Runtime material preparation forces metalness and emission to zero,
  roughness to at least 0.9 and environment response to at most 0.32.
- Successful loading hides only the old upper procedural columns, seams, spalls and crusts. The
  terrain-conforming bedrock/weathering apron and settled talus remain as the contact transition.
  Loader failure restores the complete procedural upper formation.

## Rejected iteration

The first integrated material left the exported red base colour active while also multiplying the
asset's red vertex colours and correlated basalt albedo texture. That triple tint conserved too
little reflected light and reduced the formation to a near-black silhouette. Increasing exposure or
adding emission was rejected because either would falsify the rock's energy response. The accepted
loader uses a neutral material multiplier; the physically meaningful vertex/albedo inputs remain.

## Evidence boundary

`before/` is the verified geological-material-continuity result. `after/` is the authoritative run
with all three original shelf modules loaded. Direct evidence includes:

- `before/12-review-basalt-detail.jpg`: the previous straight cooling columns sitting on a thin red
  trace;
- `after/12-review-basalt-detail.jpg`: a broad buried massif, visible wall/bench overlaps, supported
  blocks, talus and soil contact;
- `after/09-review-basalt.jpg`: the modules remain background scale anchors without blocking the
  family/glade composition;
- `after/16-review-terrain-geology-detail.jpg`: source-local rock and weathered ground remain one
  material family rather than an isolated prop on a differently coloured plane;
- `after/report.json`: the loaded asset count, fallback state, per-formation support evidence and
  navigation-boundary distances, plus **462.0 ms** first rendered frame, **59.9 median FPS**,
  **38.7 FPS 1% low** and **25.9 ms worst frame**;
- `npm run verify`: Strong field record, clean restart, no console/GL errors and all browser gates
  passed.

This closes the second reusable project-original natural-asset gate and materially repairs the
specific “red pillars inserted into a flat plane” failure. It does not prove Web Ocean parity. The
same shelf silhouette is reused at three sources, most vegetation still comes from the procedural
kit, and Plateau still lacks a broader original asset library, wind response, higher fracture
variation and curated slope dressing.
