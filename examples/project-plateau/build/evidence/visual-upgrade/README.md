# Project Plateau visual-upgrade evidence

## Retention policy

This directory keeps a compact, reviewable history rather than every intermediate full-run capture.
Each pass retains its prose, metrics/report data, root comparison sheet, every frame named by the
pass documentation, and at least one representative frame for each accepted or rejected evidence
directory. Generated report screenshot lists remain the capture manifest even when a non-critical
raw frame was pruned. The complete authoritative final capture is
[`../current-run/`](../current-run/); the final browser report, runtime state and all 32 review frames
live there.

This prevents thousands of duplicate title/gameplay frames from obscuring the actual visual changes
while preserving the frames needed to inspect every documented acceptance or rejection claim.

- `foundation-pass/before/`: approved gameplay baseline before the visual-quality work.
- `foundation-pass/rejected-overexposed/`: discarded physical-sky attempt; preserved to document
  the exposure regression.
- `foundation-pass/after/`: bounded-sky and material-foundation result before density work.
- `environment-density-pass/before/`: same-camera foundation frames.
- `environment-density-pass/after/`: near/mid/far habitat density, first surface pass, skyline and
  QA-gate work.
- `surface-atmosphere-pass/before/`: the environment-density result used as the locked baseline.
- `surface-atmosphere-pass/after/`: leaf-scale silhouettes, bark microstructure, separated
  soil/brook response, smoother canopy normals, bounded humidity and the prior cloud-bank baseline.
- `water-cloud-rock-pass/before/`: the locked `surface-atmosphere-pass/after/` result.
- `water-cloud-rock-pass/after/`: correct tangent-space terrain normals, the dual-scale
  depth/flow/foam brook shader, soft-alpha cloud impostors, weathered rock forms and three fixed
  environment-review cameras.
- `rock-physics-correction/before/`: the rejected faceted hero-boulder frame retained for comparison.
- `rock-physics-correction/after/`: shared-vertex continuous normals, subtle low-frequency mineral variation and vertex-tested terrain contact for the hero boulder.
- `scene-aware-brook-pass/before/`: the verified rock-physics result used as the locked baseline.
- `scene-aware-brook-pass/after/`: a scene-layout local reflection probe, shallow-water
  Beer–Lambert channel-bed transmission, dielectric Fresnel, and a creek-scale boulder with stable
  multi-point terrain contact. `11-review-brook-detail.jpg` is an additional close inspection view.
- `planar-reflection-pass/before/`: the verified scene-layout probe result used as the locked
  baseline.
- `planar-reflection-pass/after/`: a real low-resolution oblique-clipped planar reflection layered
  over the existing physical water response, with explicit renderer-state restoration and
  GL-error QA.
- `terrain-material-physics-pass/before/`: the verified planar-reflection result used as the locked
  baseline.
- `terrain-material-physics-pass/after/`: drainage/slope/exposure terrain layering, natural
  tileable multiscale soil noise, a second offset leaf-card canopy layer, and a physically corrected
  brook boulder with triplanar weathering, a damp lower band, shallow sediment burial and a
  collider matched to its visible volume.
- `authored-habitat-slice-pass/before/`: the verified terrain/material/rock result used as the
  locked baseline.
- `authored-habitat-slice-pass/after/`: visible trunk-to-leaf branch hierarchy, corrected leaf-atlas
  transparency, bounded waxy-leaf transmission, six-cluster cover arches, tree-dripline/brook-bank
  ground-cover clusters and a broad lanceolate understory species.
- `scene-depth-refraction-pass/before/`: the verified authored-habitat result used as the locked
  baseline.
- `scene-depth-refraction-pass/after/`: a same-camera 480×270 colour/depth prepass, geometric-normal
  Snell refraction, depth-measured shallow-water optical paths and Beer–Lambert transmission of the
  actual visible terrain/objects, with the authored bed retained only as a bounded fallback.
- `geological-basalt-formation-pass/before/`: the verified scene-depth-refraction result used as the
  locked baseline.
- `geological-basalt-formation-pass/after/`: three coherent six-column cooling-joint sets, restrained
  cross-joints and spalls, nearly buried shared bedrock, pillar-sourced downslope talus, and separate
  tileable basalt albedo/roughness/height maps. `12-review-basalt-detail.jpg` verifies formation and
  ground contact without changing the established comparison camera.
- `bounded-volumetric-cloud-pass/before/`: the verified geological-basalt result used as the locked
  baseline.
- `bounded-volumetric-cloud-pass/after/`: six bounded world-space cumulus volumes with real
  ray/volume intersection, balanced/high 12/18-step density marching, Beer–Lambert extinction,
  sun-direction self-shadow, a shared condensation base, wind advection and distance-matched aerial
  perspective. Low quality retains the instanced-puff fallback.
- `eroded-ridge-volume-pass/before/`: the verified bounded-volumetric-cloud result used as the
  locked baseline.
- `eroded-ridge-volume-pass/after/`: two connected world-space ridge bands with 65/74 m depth,
  computed slope normals, correlated crests, drainage cuts, matte directional response and
  exponential aerial fog. The near apron buries into the playable heightfield and descends below
  grade outside its width; `13-review-ridge-volume.jpg` exposes otherwise hidden open-edge errors.
- `authored-noncolumnar-rock-family-pass/before/`: the verified eroded-ridge-volume result used as
  the locked baseline.
- `authored-noncolumnar-rock-family-pass/after/`: eighteen deterministic fluvial-cobble,
  bedded-slab and angular-talus placements with convex family-specific geometry, terrain-normal
  multi-point support, shallow burial, seam-free object-space triplanar surfaces and collision
  authority matched to the playable rocks. Ridge talus remains wholly beyond the navigation
  boundary and explicitly non-solid.
- `bark-leaf-family-pass/before/`: the verified authored non-columnar rock result used as the locked
  baseline.
- `bark-leaf-family-pass/after/`: two registered bark/trunk families, two original leaf-atlas
  families, branch-tip atlas attachment, closed petiole-supported near-cover blades, explicit leaf
  albedo input and face-correct shadow-aware Beer–Lambert transmission. The aggregate interior crown
  owns canopy occlusion so the detail LOD does not double-count the same leaf area.
- `original-hero-gingko-asset-pass/before/`: the verified bark/leaf-family result used as the locked
  baseline.
- `original-hero-gingko-asset-pass/rejected-white-bark-stilt-roots/`: the discarded first hero-tree
  load, retained because its chalk-white bark and ground-plane root tips violated material-energy and
  terrain-support constraints.
- `original-hero-gingko-asset-pass/after/`: a reproducible project-original 4.55 MB hero Ginkgo with
  a terrain-to-root-to-branch-to-petiole support chain, buried root terminals, 583 closed fan leaves,
  two draw calls, a registered trunk collider, a non-emissive local fallback and two fixed physical
  review cameras.
- `geological-material-continuity-pass/before/`: the verified original-hero-Ginkgo result used as the
  locked baseline.
- `geological-material-continuity-pass/rejected-underpowered-micro/`: the compiled but visually
  negligible first dual-scale soil trial.
- `geological-material-continuity-pass/rejected-uniform-aggregate/`: the discarded stronger trial
  whose equal basin-wide contrast read as procedural speckle.
- `geological-material-continuity-pass/after/`: a correlated dual-scale soil albedo/roughness/relief
  pipeline, damp-pocket aggregate suppression, shared basalt-formation sources and bounded downslope
  weathering aprons. `16-review-terrain-geology-detail.jpg` exposes the near material transition.
- `original-basalt-shelf-asset-pass/before/`: the verified geological-material-continuity result used
  as the locked baseline.
- `original-basalt-shelf-asset-pass/after/`: one reproducible project-original 93.6 KB closed basalt
  shelf GLB reused at three sources, with a buried plinth, overlapping fractured walls and buttress,
  three short mineral benches, six supported spalls, source-matched material maps and an explicit
  procedural fallback. `report.json` records 60/60 buried bottom vertices and a footprint outside
  navigation for every formation.
- `grounding-and-basalt-escarpment-pass/before/`: the verified original-basalt-shelf result used as
  the locked baseline.
- `grounding-and-basalt-escarpment-pass/rejected-broad-ramp-floating-footprint/`: the discarded broad
  exterior ramp whose slope left shelf contact corners 1.5–2.8 m above support.
- `grounding-and-basalt-escarpment-pass/after/`: world-space local contact occlusion and one continuous
  navigation-exterior basalt shoulder. The analytic rise begins beyond the player capsule limit and
  completes before the closest shelf footprint; `17-review-basalt-escarpment-contact.jpg` exposes the
  basin-foot-to-cliff-to-buried-shelf support chain.
- `basalt-silhouette-library-pass/before/`: the verified grounding/escarpment result with the same v1
  shelf silhouette repeated at all three sources.
- `basalt-silhouette-library-pass/after/`: a deterministic project-original three-variant GLB library
  with distinct needle-buttress, split-saddle and terraced-fan load paths. Every variant is closed,
  keeps its sampled mass centre above the buried base, loads in two draw calls and records 60/60
  supported bottom vertices.
- `canopy-wind-coupling-pass/before/`: the verified basalt-library result without general broadleaf
  edge motion.
- `canopy-wind-coupling-pass/after/`: branch-anchored broadleaf tip deformation with a coherent world
  wind direction, bounded macro/flutter amplitudes, shared colour/depth-pass displacement and a true
  zero-motion accessibility state. `motion-evidence/` records two fixed times for the brook and glade.
- `embedded-slope-exposure-pass/before/`: the verified canopy-wind result with a smooth eastern
  escarpment face below the three basalt sources.
- `embedded-slope-exposure-pass/rejected-inward-face-normals/`: the closed first asset load whose
  exposed west faces wound inward and disappeared under normal front-face culling.
- `embedded-slope-exposure-pass/rejected-underpowered-albedo/`: the corrected geometry before removal
  of a dark-on-dark vertex-colour/albedo multiplication that hid the physical surface.
- `embedded-slope-exposure-pass/after/`: three distinct project-original closed bedrock exposures with
  basal burial, overlapping strata, short bed-supported ledges, buried back volumes, outward normals,
  correlated basalt surface maps and a capsule-exterior footprint. `18-review-slope-exposure-detail.jpg`
  exposes the accepted west face and terrain connection.
- `original-brook-boulder-asset-pass/before/`: the verified embedded-slope result retaining the
  procedural hero boulder and its rounded latitude-based silhouette.
- `original-brook-boulder-asset-pass/rejected-coplanar-spall-support/`: the rejected single-plane
  fragment placement, where only 30/51 support vertices contacted terrain and the worst spall floated
  11.79 cm above the rendered heightfield.
- `original-brook-boulder-asset-pass/after/`: a deterministic original closed bank erratic with an
  asymmetric fractured main mass, five independently settled spalls, bounded dielectric albedo,
  seam-free triplanar surface response and the existing collider registered to the load-bearing mass.
  `19-review-brook-boulder-detail.jpg` exposes the accepted support, waterline and silhouette.
- `original-fern-library-pass/before/`: the verified brook-boulder result retaining the repeated,
  static procedural ground-fern families.
- `original-fern-library-pass/rejected-sparse-green-rhizome/`: the first supported original GLB load,
  rejected because narrow leaflets and a rounded green root crown read as wire foliage in a pot.
- `original-fern-library-pass/after/`: a deterministic three-family, 120-instance original fern
  library with closed buried rhizomes, overlapping tapered rachises, attached cambered leaflets,
  moisture/slope habitat classification, independent flex coordinates and identical colour/depth
  wind displacement. `20-review-fern-detail.jpg` exposes the accepted support and foliage density.
- `original-ground-cover-library-pass/before/`: the verified fern-library result retaining the
  procedural ground-cover fallback and oversized legacy foreground-depth fronds.
- `original-ground-cover-library-pass/rejected-overscale-faceted-leaves/`: the first supported
  ground-cover asset load, rejected because procedural placement scales produced oversized plants
  and each broad leaf remained a visibly faceted plate.
- `original-ground-cover-library-pass/rejected-legacy-foreground-frond/`: paired source-isolation
  captures proving that the glade's giant triangle cluster came from the separate legacy foreground
  frond system rather than the newly loaded ground-cover group.
- `original-ground-cover-library-pass/after/`: a deterministic three-family, 360-instance original
  ground-cover library with curved shared-vertex leaves, closed root-to-petiole load paths,
  family-specific mature-size envelopes, 3,960 supported root vertices and bounded sharp-break
  relocation. Twelve original fern instances replace the giant foreground fallback;
  `21-review-ground-cover-detail.jpg` exposes the accepted foliage scale and contact.
- `original-understory-consolidation-pass/before/`: the verified ground-cover result retaining
  twenty-four procedural tree-fern skirts and sixty-four degradable wetland/margin triangle accents.
- `original-understory-consolidation-pass/after/`: the same original fern GLB reused as an 88-instance,
  quality-gated static accent batch. Every replacement preserves seeded ecology, stays inside a
  role-specific mature-size envelope, keeps its buried rhizome in the rendered terrain and retains
  pliable/non-solid collision truth. The fixed brook, glade and ground-cover-detail cameras expose
  removal of the remaining pale triangle clusters.
- `physical-ground-and-boulder-v2-pass/before/`: the verified understory result with a uniformly
  brown basin response, a transparent amber glade ground-light disc and a creek boulder whose
  normal-facing vertex colour produced the reported white/slate split.
- `physical-ground-and-boulder-v2-pass/rejected-double-dark-albedo/`: the first v2 runtime material,
  rejected because it multiplied the GLB's already-dark albedo by another dark tint.
- `physical-ground-and-boulder-v2-pass/rejected-wide-capillary-band/`: the colour-split correction
  before restricting moisture to a physically narrow base-contact band.
- `physical-ground-and-boulder-v2-pass/after/`: source-coupled canopy/hollow humus, brook hydrology,
  slope washout and route compaction drive terrain albedo/roughness/relief with no random mask; the
  fake ground light is deleted. Boulder v2 keeps 47/47 buried support vertices and the existing
  collider while using coordinate-driven weathering, continuous normals and a narrow wet contact.
- `original-tree-fern-library-pass/before/`: the verified physical-ground/boulder-v2 result retaining
  twelve repeated procedural pole trunks and three umbrella-crown geometries.
- `original-tree-fern-library-pass/after/`: a deterministic three-family mature tree-fern GLB at the
  same twelve anchors, with buried root mantles, vertical fibrous trunks, closed crown hubs and
  rachises, attached cambered pinnate leaflets, source-coupled habitat selection, measured mature
  envelopes and identical colour/depth wind. `22-review-tree-fern-detail.jpg` exposes root support,
  trunk-to-crown continuity and the accepted layered frond silhouette.
- `original-canopy-tree-library-pass/before/`: the verified tree-fern result retaining 128 trees from
  nine procedural trunk, branch, crown-blob and leaf-detail layers.
- `original-canopy-tree-library-pass/rejected-flat-terminal-pads/`: the first original asset load,
  rejected because oversized scaffold limbs ended under one flat leaf layer.
- `original-canopy-tree-library-pass/rejected-capped-trunk-coplanar-leaves/`: the hierarchical branch
  revision before making the trunk itself continuous and varying leaf roll.
- `original-canopy-tree-library-pass/rejected-leader-leaf-trays/`: the continuous-trunk revision
  before moving top leaves onto visible side shoots.
- `original-canopy-tree-library-pass/after/`: a deterministic four-family mature canopy-tree GLB at
  all 128 approved anchors, with buried root mantles, continuous tapered trunks, closed primary/
  secondary/tertiary branch loads, supported top shoots, attached nonplanar leaves, source-coupled
  habitat selection, measured mature envelopes, trunk-only collision and identical colour/depth
  wind. `23-review-canopy-tree-detail.jpg` exposes the accepted load path and crown volume.
- `daylight-energy-balance-pass/before/`: the verified canopy-tree result with new material and
  geometry detail still crushed by weak outdoor shadow energy.
- `daylight-energy-balance-pass/after/`: a recorded late-humid daylight energy contract that reduces
  directionless ambient, increases directional sky/ground irradiance and bounded physical-sky PMREM
  response, relaxes humid extinction per world metre and applies a small ACES encoding correction.
  Same-camera p10 rises materially while p90 remains bounded; direct sun and all asset albedos stay
  unchanged.
- `segmented-brook-reflection-pass/before/`: the verified daylight-energy result retaining a
  terrain-following water ribbon, one basin-wide horizontal reflection plane and one animated flow
  direction that climbs out of the interior low point.
- `segmented-brook-reflection-pass/rejected-uniform-surface-energy/`: the first gravity-level,
  camera-segmented result before measured longitudinal grade changed ripple, roughness, aeration and
  sharp-reflection energy. It removed the false full-ribbon mirror but kept a uniform silver-road
  response across calm and 10% reaches.
- `segmented-brook-reflection-pass/after/`: two mapped headwaters lose gravitational head toward one
  interior saturated hollow; every four-vertex cross-section stays level, centimetre-scale bed humps
  receive bounded ponding, and downstream grade drives surface energy. Nineteen local reach planes
  reuse one camera-selected reflection target with spatial/plane-fit validity masking, while the
  existing same-camera depth refraction remains intact.
- `vegetation-albedo-calibration-pass/before/`: the verified segmented-brook result retaining
  over-bright instance tints across the original canopy, mature tree-fern, fern and ground-cover
  libraries.
- `vegetation-albedo-calibration-pass/rejected-repeated-pigment-instance-tint/`: the bounded-lightness
  trial rejected because material colour, leaf texture and instance tint still repeated the same
  saturated green spectral bias.
- `vegetation-albedo-calibration-pass/after/`: one shared source-coupled albedo contract keeps actual
  family pigment in the material/texture layers and limits instance colour to a near-neutral
  wetness, slope and individual-age multiplier. All leaves remain non-emissive dielectric surfaces;
  daylight, exposure, fog, geometry, placement and collision are unchanged.
- `forest-succession-continuity-pass/before/`: the verified vegetation-albedo result retaining 144
  distant trees as evenly scattered horizontal bands, including visual-only trunks inside the
  nominal navigation rectangle.
- `forest-succession-continuity-pass/rejected-near-lollipop-crowns/`: the first twelve-cohort layout,
  rejected because it promoted the old far-distance crown blobs into the midground and delayed the
  bounded reflection-reach update.
- `forest-succession-continuity-pass/rejected-mixed-edge-lod/`: the passing mature-edge asset trial,
  rejected visually because pale simple submature/pioneer crowns still mixed with the complete
  near-edge trees.
- `forest-succession-continuity-pass/after/`: the same 144-tree budget becomes twelve terrain-sourced
  boundary cohorts with a 72/36/36 age split. All load-bearing radii remain wholly outside navigation;
  72 west/east members use the complete original canopy-tree asset and only the true southern-distance
  members retain the simplified LOD.
- `canopy-leaf-hierarchy-v3-pass/rejected-flat-leaf-fans/`: the denser v2 crown rejected because
  leaves at each terminal branch still spread as one repeated horizontal fan.
- `canopy-leaf-hierarchy-v3-pass/after/`: smaller individual laminae use golden-angle phyllotaxis
  around the real terminal branch axis, forming three-dimensional attached leaf clusters without
  changing anchors, trunk collision, daylight or exposure. All 3,540 root support contacts remain
  buried and the 128-tree batch remains above the 30 FPS 1% low gate.
- `terrain-geomorphology-alluvium-pass/rejected-underpowered-alluvium-and-stale-reach/`: the first
  named-relief trial retained a visually weak symmetric bench; its reflection result also exposed a
  stale nine-hour Vite process, so neither the image nor the cached reach state was accepted.
- `terrain-geomorphology-alluvium-pass/rejected-symmetric-bench-and-radial-track-carrier/`: the
  mechanically passing intermediate before bend-side deposition. It retains the pale elliptical
  carrier around the mud impression and distance-only bank treatment as explicit reject evidence.
- `terrain-geomorphology-alluvium-pass/after/`: one shared heightfield now supplies channel incision,
  meander-inner point bars, meander-outer cut banks, an older floodplain bench and the glade terrace;
  the same process supplies the alluvial material weight. The mud impression covers only actual
  pressure/rim/water disturbance, vegetation is re-fitted rather than allowed to float, brook
  drainage remains unchanged and the heavy fixed-review run stays above the 30 FPS 1% low gate.
- `terrain-shading-rate-detail-pass/rejected-overfrequent-dominant-side-projection/`: the first
  shading-rate trial rejected because 7.14/2.33 m periods read as uniform fabric and a hard lateral
  projection choice created a mathematical 45-degree seam.
- `terrain-shading-rate-detail-pass/rejected-duplicated-planar-tangent-channels/`: the continuous
  triplanar 47/13 m trial before deleting the old plane-UV albedo, roughness and tangent-normal path;
  keeping both preserved steep-ground stretching and paid for duplicate samples.
- `terrain-shading-rate-detail-pass/after/`: correlated soil albedo, roughness, height-derived normal
  relief and signed residual cavity now use one continuous world-space triplanar field. The 13 m
  layer fades by view distance, cavity affects indirect light only, and wet/alluvial/route compaction
  reduces relief and cavity without changing collision, hydrology, sun, exposure or fog.
- `escarpment-regolith-stability-pass/rejected-overstrong-columnar-relief/`: the first physically
  classified cliff correctly exposed source basalt but let its directional optical relief become a
  repeated ribbed curtain across the whole face.
- `escarpment-regolith-stability-pass/rejected-expensive-cross-joint-projection/`: the correlated
  orthogonal-joint trial was rejected because its small visual change did not justify the measured
  1% low reduction from 54.2 to 39.1 FPS.
- `escarpment-regolith-stability-pass/after/`: the eastern material field now reads the final rendered
  heightfield normal rather than an under-resolved analytic endpoint probe. Regolith above 34° exposes
  the existing source basalt, stable downslope ground retains a bounded 6.5 m colluvial toe, and
  bedrock optical relief is limited without changing geometry, collision or daylight.
- `fluvial-sediment-sorting-pass/rejected-unpacked-process-attributes/`: the first separated sediment
  shader exceeded the runtime vertex-attribute budget and produced large fallback triangles; retained
  as explicit reject evidence rather than accepted as a colour treatment.
- `fluvial-sediment-sorting-pass/after/`: the shared meander process now drives separate inner-bend
  coarse point-bar, older overbank-silt and outer-bend cohesive cut-bank material responses. The
  existing small non-solid stone batch is split into 36 active-bed and 20 source-qualified point-bar
  placements with recorded terrain contact and route exclusion. Process weights are packed into one
  GPU attribute; hydrology, route, collision, sunlight, exposure and fog are unchanged.
- `WEB_OCEAN_GAP_AUDIT.md`: evidence-versus-inference audit against the supplied Web Ocean reference.

`fluvial-sediment-sorting-pass/after/report.json` records the latest input-only Strong path,
first-frame timing, 180-frame heavy-scene performance sample, three established visual-review
cameras, the brook-detail, basalt-detail and ridge-volume inspections, and the new whole-tree and
root-contact Ginkgo cameras plus the low geological-material, escarpment-contact, slope-exposure and
brook-boulder and grounded-fern inspections plus the mature-ground-cover and mature-tree-fern
inspections.
Mechanical framebuffer
exposure/readability guards reject
blank, crushed or clipped evidence; they do not score subjective composition, material fidelity or
fun.
