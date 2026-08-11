# Geological material continuity pass

## Physical requirements

- Soil colour, roughness and relief must describe the same aggregate. Independent decorative noise
  is rejected because a bright grain cannot simultaneously behave like a dark depression or use an
  unrelated roughness response.
- Wet drainage pockets must suppress exposed fine relief as water and sediment fill the surface;
  they cannot receive the same dry granular contrast as the open glade.
- Red-basalt weathering may occur only around the three authored column formations and must weaken
  downslope into the soil. A global red tint, circular decal or unrelated pebble scatter would sever
  the material from its geological source.
- The material pass cannot change heightfield collision, route topology or the intentionally open
  decision corridor. Surface shading adds no invisible solid geometry.

## Accepted changes

- The 256×256 original soil package now includes a tileable 31-cell mineral aggregate in the same
  authored height field used for albedo, roughness and derivative normal response. Across all texels,
  height/luminance correlation is **0.580** and height/roughness correlation is **-0.684**; regression
  tests require the signs and minimum magnitudes rather than merely checking that three textures
  exist.
- The terrain shader samples that package at two rotated world-space scales (`0.31` and `0.67` per
  metre). Broad UV normals were reduced from `0.55` to `0.34`; correlated derivative relief now
  supplies the near response without amplifying one twenty-metre tile into large soft bumps.
- Aggregate visibility is modulated by the existing macro/mineral field and reduced by up to 48% in
  drainage pockets. The result keeps the exposed glade granular while the brook bank remains darker,
  wetter and more sediment-filled.
- The former local basalt cluster literals are now one shared `BASALT_FORMATION_LAYOUT`. A separate
  `terrainBasaltInfluence` vertex attribute extends an elliptical weathering apron west/downhill from
  those exact sources, then a broken macro/mesoscale mask blends correlated basalt albedo, roughness
  and relief. The central glade remains below 0.01 influence.
- The pass adds no dependency, runtime asset request, draw call or collision primitive. One new fixed
  `terrainDetail` camera records the soil-to-source-basalt transition during authoritative QA.

## Rejected iterations

- `rejected-underpowered-micro/` records the first dual-scale shader. It compiled and was physically
  correlated, but its linear-space remap changed the existing ground by only a few percent and was
  visually indistinguishable from the smooth baseline. Passing tests without visible progress was
  not accepted.
- `rejected-uniform-aggregate/` records the first stronger cellular result. It exposed real correlated
  grains but applied almost the same contrast across the whole basin, reading as uniform procedural
  speckle. The accepted version gates visibility through macro mineral structure and damp-pocket fill.
- Adding hundreds of pebble meshes to make the surface look detailed was rejected before
  implementation: it would contradict the open-route density rule, add marker-like clutter and create
  a second unsupported visual/collision truth.

## Evidence boundary

`before/` is the verified original-hero-Ginkgo result. `after/` is the authoritative complete run
with the geological material continuum. Useful comparisons are:

- `10-review-glade.jpg`: the formerly smooth central field now carries bounded centimetre/decimetre
  aggregate without repopulating the family sightline;
- `11-review-brook-detail.jpg`: wetness reduces the new dry-grain contrast at the channel edge;
- `12-review-basalt-detail.jpg`: the column bases retain continuous bedrock while their sourced
  weathering zone breaks into the surrounding soil instead of tinting the whole basin;
- `16-review-terrain-geology-detail.jpg`: a low fixed inspection view exposes the material transition,
  fine relief, vegetation contact and basalt source relation.

`after/report.json` records **459.5 ms** to first rendered frame, **59.9 median FPS**, **39.2 FPS 1%
low** and **25.5 ms worst frame**. The Strong field record, clean restart and all 16 review/gameplay
captures passed without console or `GL_INVALID_*` errors. All **125** application tests and the
production build passed before the authoritative browser run.

This pass closes the flat single-scale soil response and ties weathered basalt material to its source.
It does not establish Web Ocean parity. The terrain package remains a compact code-authored 256×256
set rather than a broad scanned/artist-authored library, and Plateau still lacks mature surface decals,
wind deformation, richer slope exposures and wider original asset breadth.
