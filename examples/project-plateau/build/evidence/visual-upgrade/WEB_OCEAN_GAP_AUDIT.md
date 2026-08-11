# Project Plateau versus Web Ocean: visual gap audit

## Compared evidence

- Project Plateau: the authoritative final captures in [`../current-run/`](../current-run/),
  including the input-only Strong path at 1440×900, the 1280×720 minimum viewport, and the additional
  `11-review-brook-detail.jpg`, `12-review-basalt-detail.jpg` and
  `13-review-ridge-volume.jpg` physical-structure inspections. `14-review-gingko.jpg` and
  `15-review-gingko-root.jpg` separately expose the new landmark's complete support chain and soil
  contact. `16-review-terrain-geology-detail.jpg` exposes the near-ground soil and sourced-basalt
  transition; `17-review-basalt-escarpment-contact.jpg` exposes the basin foot, continuous eastern
  shoulder and buried shelf modules from one fixed low camera. `18` through `23` expose the accepted
  slope, brook-boulder, fern, ground-cover, tree-fern and canopy-tree physical integrations.
  `24-review-iguanodon-skin.jpg` adds a fixed hero-subject material and normal-continuity inspection;
  `25-review-forest-floor-detritus.jpg` exposes the accepted canopy-sourced leaf, twig, bark and husk
  layer at terrain-contact scale. `26-review-terrain-integrated-route.jpg` inspects the route after
  retiring all three transparent overlay ribbons. `27-review-complete-boundary-forest.jpg` exposes
  the six southern succession cohorts after replacing their permanent simplified crown LOD with the
  same complete project-original tree asset used by the west/east boundary. The updated
  `13-review-ridge-volume.jpg` separately exposes the near/far ridge surfaces after adding their
  slope-, drainage- and rock-exposure-sourced distant forest. `28-review-bryophyte-ground-layer.jpg`
  inspects the accepted canopy-, moisture- and disturbance-sourced creeping moss, clubmoss and humid
  grass layer at terrain-contact scale. `29-review-riparian-cover.jpg` exposes the former foreground
  arch corridor after replacing cross-trunk bridge geometry with ten independently rooted trees.
  `30-review-brook-obstacle-flow-detail.jpg` isolates the one historical flood-lag clast whose exact
  rendered bounds intersect the upper water column, together with its bounded local response.
  `31-review-brook-free-surface-profile.jpg` lowers the inspection camera to expose the water/rock
  silhouette after the same response gained centimetre-scale geometric displacement.
- Web Ocean: `docs/images/landfall.png` and `docs/images/shore.png` from
  <https://github.com/2600th/web-ocean-3d> at commit
  `6496c77d37c12e803108c8f932680a7710a62c1c`.

This is a visual evidence comparison. It does not claim equal gameplay, camera, performance or
art-direction constraints, and the current automated PASS is not a subjective parity verdict.

## What the visual-upgrade passes have closed or materially improved

1. **Crushed, oily terrain response:** water normal maps use the correct tangent-space axis
   convention. Terrain has since removed the plane-UV tangent path entirely; its relief normal comes
   from the same world-projected height fields as its albedo and roughness. The resulting field frames
   retain readable daylight instead of collapsing the ground into black reflective patches.
2. **Flat skyline:** the display sky is bounded separately from the physical PMREM sky, with
   irregular humidity and mist pockets rather than one flat horizon band. The near/far ridges are
   now 65/74 m-deep world-space slope meshes instead of fixed-`z` vertical strips. Correlated crests,
   drainage cuts, computed normals, matte directional light and depth-tested overlap establish
   terrain volume. The near centre apron samples the playable `terrainHeight`, while unsupported
   side regions descend below grade; an elevated inspection camera rejected an earlier floating
   front edge and a later amber horizon slit.
3. **Single-scale, context-free and gravity-inconsistent brook surface:** the brook now has two
   gravity-directed animated flow scales,
   channel-depth colour, the `0.02037` fresh-water dielectric F0, a scene-layout equirectangular
   fallback probe, a 320×180 oblique-clipped planar reflection, shallow-water Beer–Lambert
   transmission, broken bank foam and a feathered wet-bank transition. Balanced quality now also
   captures the same camera's opaque scene colour and depth at 480×270. Snell refraction uses the
   gravity-level cross-channel surface plus bounded flow normals; water/opaque depth differences
   validate ordering, then inverse projection reconstructs both view-space points and measures the
   capped three-dimensional optical path passed to Beer–Lambert absorption. The mapped line is now
   two headwater reaches draining to its existing interior saturated hollow: every row loses head
   toward confluence row 35, each cross-section has zero terrain-inherited grade, and measured
   longitudinal grade drives ripple, roughness and bounded aeration energy. Nineteen short reflection
   reaches derive height, tangent and normal from that exact surface. The camera reuses one render
   target for the relevant reach, while a footprint/plane-fit mask prevents the wrong local mirror
   from leaking over the rest of the ribbon. The authored channel-bed map is now only the invalid-
   depth/low-quality fallback. Both captures update only after meaningful camera motion at a bounded
   cadence; a static camera does not pay repeated scene renders. Exact settled clast bounds now also
   source a bounded local potential-flow deflection, upstream compression zone and expanding
   downstream shedding envelope; roughness and aeration use the same local water column and grade.
   The carrier is now a 289-row by 13-cross-sample free-surface grid, so that field also raises the
   upstream nose, lowers the accelerated shoulders and displaces the alternating wake in geometry
   rather than stopping at fragment normals.
   It remains a narrow silver creek
   rather than being redesigned as an ocean.
4. **Balloon-like cloud clusters:** balanced/high quality now raymarches eleven bounded world-space
   volumes in six-near/five-far anti-solar horizon bands at 12/18 steps. The camera ray intersects a
   real 3D domain; density uses a shared
   condensation base, buoyant lobes and multiscale erosion; Beer–Lambert extinction is integrated in
   world metres; and two sun-direction samples provide correlated self-shadow. Geometry puffs remain
   only as the low-quality fallback. A rejected five-card stack and an over-bright solid-foam trial
   were rejected during iteration and are not retained as final evidence.
5. **Low-poly foliage read:** broad-canopy trees now expose a trunk → five primary branches → eight
   secondary branches → leaf-cluster load path. Two original 128×128 atlases separate elliptic-waxy
   sprays from continuous-rachis compound lanceolate sprays, and two trunk families separate wet
   furrowed bark from attached plate-barked relief with independent PBR data. Atlas cards carry an
   explicit vertex-colour input, alpha-to-coverage and face-correct shadow-aware Beer–Lambert
   transmission. The former cover arches now reuse the complete four-family canopy-tree asset on ten
   independent terrain-supported roots; their low-quality fallback also keeps every bough attached to
   one trunk rather than bridging two trees. Araucaria and tree ferns retain distinct grammars.
6. **Empty habitat:** near ground cover, mid-distance trees and deadfall, and a far tree line provide
   three density bands without changing collision truth or the approved observation route.
7. **Uniform or physically unsupported rock primitives:** brook stones use irregular forms and
   separate surface data. The hero boulder is now a 2.48 m immobile residual bank erratic rather
   than a present-flow cobble: its offset crown, four bounded fracture constraints, 34° crease
   threshold, seam-free triplanar albedo/roughness/relief, porosity-varied capillary front, 8.5 cm
   sediment burial and main-mass-only collider form one measured physical contract. Its 1.80 m³
   closed volume projects its centre of mass at least 0.51 m inside the support polygon. Eighteen
   additional code-authored rocks form three non-columnar families: historical high-flow lag,
   glade-margin bedded slabs and ridge-foot angular talus. Playable instances align a broad support
   plane to the sampled terrain normal, solve multi-point ground contact, keep the centre-of-mass
   projection inside the footprint and share placement data with static colliders. Non-solid talus
   is permitted only wholly beyond the navigation boundary. Large surfaces use seam-free
   object-space triplanar albedo, roughness and relief. Reversed caps, crater-like top fans,
   UV-banded shells, white/silver response, floating placement, oversized colliders, a smooth
   axisymmetric capsule and the opposite failure of treating every render triangle as a fracture
   were rejected during iteration; the superseded raw frames are not retained as final evidence.
8. **Unrepeatable visual review:** fixed `brook`, `basalt` and `glade` review cameras freeze the
   environment clock and hide tools/UI, so visual changes can be compared independently from the
   gameplay proof captures. `brookDetail`, `basaltDetail` and the elevated `ridgeVolume` view expose
   contact, formation and open-edge errors that the normal comparison cameras can conceal.
9. **Uniform basin-scale soil:** terrain colour and roughness now use drainage, slope and exposure
   attributes plus broad world-space and rotated mesoscale breakup. The underlying 256×256 package
   adds a tileable cellular mineral aggregate sampled at continuous triplanar 47 m and 13 m world
   periods. The same source drives albedo, roughness and derivative relief; measured height/luminance
   correlation is 0.580 and height/roughness correlation is -0.684. Damp pockets suppress exposed grain, and a
   shared three-formation layout sources broken red-basalt weathering aprons without tinting the
   central glade. A regular sine-groove trial, an imperceptibly weak micro pass and an equal-strength
   basin-wide speckle pass were rejected.
10. **Uniform marker-like ground cover:** 360 instances now form 24 deterministic tree-dripline and
    brook-bank microhabitat clusters. A curved broad lanceolate species adds a waxy low layer while
    the exposed decision corridor remains sparse.
11. **Independent red pillars without a formation history:** the landmark is now three six-column
    source zones carrying a three-member original volumetric shelf library instead of visible vertical
    rods or one copied hero silhouette. Needle-buttress, split-saddle and terraced-fan variants each
    have a 0.64–0.66 m buried plinth, overlapping broad wall/buttress volumes, thick short-cantilever
    mineral benches and blocks resting on bedrock or a bench. All three placements align to the
    sampled terrain normal; browser evidence records 60/60 buried bottom vertices at each source and
    keeps the complete non-solid footprint beyond navigation.
    The old joint columns remain only as a loader fallback. Basalt colour, roughness and relief share
    the same correlated sources as the surrounding weathering apron; a sinusoidal wood-grain trial,
    pale platform outcrop and near-black triple-tint integration were rejected.
12. **No original production-grade natural landmark:** the Fort/brook line first gained one
    deterministic project-original Ginkgo v1 GLB rather than another runtime primitive assembly. Its
    42,084 triangles remained in two draw calls; seven root flares terminated below terrain; ten
    primary branches and thirty terminal branch points carried 583 closed fan leaves through visible
    petioles. This initial proof path is retained historically and superseded by the v2 architecture
    and surface work recorded in item 63.
    Bark and leaf materials are rough, non-metallic and non-emissive, the trunk collider shares the
    exact authored anchor, and an original procedural fallback preserves the landmark if loading
    fails. A first white-bark / ground-plane-root version was rejected rather than hidden with
    exposure or foliage clutter.
13. **No reusable original geological hero asset:** the deterministic basalt-shelf GLB adds a second
    project-original natural-asset path. Its v2 library contains three distinct closed formations in
    256.8 KB / 1,860 total triangles; each selected formation stays at two draw calls and retains an
    explicit procedural failure fallback. Surface-sampled upper mass centres remain above their broad
    bases, so variety does not come from physically implausible leaning towers. This is a reusable
    geological family, not copied Web Ocean content and not a claim that the project now owns a broad
    production library.
14. **Local contact and flat-plane landmark grounding:** balanced/high rendering now attenuates local
    indirect light with a bounded 0.72 m world-space GTAO radius rather than the former nearly
    invisible 0.18 m setting. The three basalt sources also rise from one continuous 3.15 m eastern
    shoulder instead of sitting on the basin plane. Its analytic rise begins at `x=29.15`, beyond the
    player-centre limit of `x=28.4`, and completes before the closest shelf footprint. A broad-ramp
    trial that left contact corners floating was rejected; the accepted result retains 60/60 buried
    bottom vertices at every source. A true terrain sky-view trial measured only 0.996–1.000 and was
    not artistically amplified into fake landform shadow.
15. **Static broadleaf cards:** both supported leaf-atlas families now bend only from their attached
    card base toward the tip under a coherent world-direction wind field. Maximum horizontal/vertical
    tip movement is bounded to 0.085/0.018 m; spatial phase prevents a synchronized tree-line pulse.
    Directional-light depth rendering shares the same uniforms and displacement as the colour pass,
    and reduced-motion mode sets time and both strengths to zero. This closes the approved “moving
    leaf edges” contract without translating trunks or faking motion with a full-crown billboard.
16. **Smooth source-local escarpment face:** three deterministic project-original exposure variants
    now interrupt the uniform eastern cut slope below the established basalt sources. Every bed and
    short ledge is a closed outward-facing volume; basal support and the complete back surface are
    buried in the continuous shoulder, while every measured west-face footprint begins beyond the
    player capsule edge. The runtime reuses the correlated basalt material package and records the
    exposed-face, basal-contact, back-burial and navigation-separation evidence. An inward-normal load
    and a dark-on-dark albedo integration were rejected rather than hidden with more light.
17. **Capsule-like hero boulder and false fragment contact:** the creek-scale route obstacle now loads
    a deterministic project-original closed bank erratic instead of presenting the procedural sphere
    as the final visual. Its current v6 load-bearing mass uses 48 sectors, fourteen staggered surface
    rings, five asymmetric fracture constraints and 1,344 triangles; five separate closed spalls
    settle independently on the rendered terrain. The shared geological maps use object-space
    triplanar sampling after a face-projected trial produced a near-black horizontal ring. Browser
    evidence records 570/570 mass/spall support samples between -8.5 and +0.69 cm of the shared
    terrain, keeps the existing solid collider centred on the main mass and hides the fallback. A
    first merged-spall trial with only 30/51 contacts and an 11.79 cm floating clearance was rejected
    rather than weakening the physical-support gate.
18. **Repeated sparse ground ferns and static heavy fronds:** the 120 primary understory placements
    now load a deterministic project-original three-family fern library instead of presenting three
    variations of the same procedural fan. Every family has a closed buried rhizome, overlapping
    closed tapered rachises and visibly attached cambered leaflets; texture UVs are independent from
    the base-to-tip flex coordinate. Runtime moisture and slope classification yields 38 humid-margin,
    50 drained-slope and 32 sheltered-low instances. All 1,560 support-plane vertices remain inside
    the rendered-heightfield contact band. Colour and directional-depth passes share one bounded
    0.105/0.024 m wind displacement and the exact same uniforms; reduced-motion mode sets every
    displacement input to zero. A first supported load with sparse narrow leaflets and a rounded green
    root crown was rejected as wire foliage in a pot rather than hidden with exposure or density.
19. **Overscale faceted ground cover and a misidentified foreground triangle cluster:** the 360
    dripline/brook-bank placements now load a deterministic project-original arrowhead, shade-rosette
    and sedge library instead of the procedural blade and broadleaf meshes. Broad leaves share
    vertices across nine longitudinal spans, carry continuous normals and centre-ridge camber, and
    attach to closed petioles rooted in a buried crown. V2 increases family leaf counts to 9/10/18,
    moves the fourteen-sided rhizome fully below grade and constrains all instances to smaller mature
    envelopes: maximum diameter/height is **0.9755/0.3912 m** for arrowhead,
    **0.7891/0.2069 m** for rosettes and **0.7796/0.5728 m** for sedge. All **5,400** support vertices
    remain **5.05–5.35 cm** below the shared terrain with zero horizontal relocation. Source isolation
    also proved that the giant foreground triangle
    cluster in the glade came from the separate legacy `foreground-depth-fronds`, not the new library.
    Those twelve placements now reuse the supported original fern library at mature scales, bringing
    it to 132 instances and 1,716/1,716 supported rhizome vertices while hiding the bad fallback.
    The first 1,124-triangle broadleaf revision and the unreplaced foreground cluster were rejected;
    neither issue was masked by lighting or colour grading in the accepted result.
20. **Remaining procedural tree-fern skirts and wetland/margin triangle accents:** source isolation
    after the ground-cover pass still found 24 skirt and 64 degradable accent instances using the old
    procedural fern geometry. They now reuse the same project-original fern GLB in a second
    quality-gated six-draw-call batch instead of adding another asset or enlarging the ground-cover
    plants. Seeded positions, rotations and ecological roles remain unchanged; the accepted
    meander/terrace field reclassifies them as 44 humid-margin, 19 drained-slope and 25 sheltered-low
    replacements.
    Role-specific mature envelopes cap tree-fern skirts at 1.45 × 0.40 m, wetland plants at
    1.40 × 0.50 m and route-margin plants at 1.80 × 0.90 m; all 88 pass. All 1,144 rhizome support
    vertices remain 2.56–3.91 cm below the rendered heightfield, while collision stays pliable and
    non-solid. The batch is parented under the existing degradable group so low quality removes all
    six extra draw calls. Failure restores the three procedural fallback meshes and hides any
    partially attached original batch. Fixed brook, glade and ground-cover-detail frames show the
    pale triangle clusters removed rather than replaced with physically oversized foliage.
21. **Uniform brown terrain and the false two-material creek boulder:** the basin ground now derives
    four material weights from visible physical sources rather than a random colour mask. Actual
    canopy/cover positions plus hollow retention create humus; the rendered brook's shared control
    line and terrain hydrology create the saturated bank; slope/exposure creates mineral washout; the
    exact three rendered route control lines suppress litter and micro-relief through footfall. Those
    weights drive albedo, roughness and relief together across a 24,505-vertex terrain. The former
    amber glade ground disc was deleted because it painted illumination independently of light,
    normal and occlusion. The creek boulder also advanced to v2 after source isolation showed that
    its white/slate split was authored into normal-facing vertex colour, not caused by unsupported
    geometry: all 47 support vertices were already buried. V2 keeps the same closed load path and
    collider, replaces face-direction albedo with object-coordinate mineral weathering, uses
    continuous normals and confines capillary darkening to a 15.5 cm local contact band. A first v2
    runtime multiplier that made the stone nearly black and a second over-wide wet-band trial were
    rejected rather than repaired with exposure.
22. **Repeated pole-and-umbrella tree ferns:** the twelve margin scale anchors no longer use one
    procedural ring-scarred pole plus three shallow radial crown meshes. One reproducible original
    GLB now supplies humid-arch, storm-swept and sheltered-tier mature families, each split into a
    closed buried root/trunk, closed crown-overlapping rachises and indexed cambered attached
    leaflets. Terrain wetness, slope and exposed/sheltered position select 2/7/3 instances without
    changing any authored x/z anchor. Root settlement is gravity-only so trunks remain vertical;
    one steep-site individual is uniformly reduced within its mature range instead of tilting or
    floating, and 408/408 measured contacts sit 1.8–23.91 cm inside the rendered heightfield. Maximum crown
    diameter/height is 5.9463/6.0493 m inside the 6.15 m mature gate. Collision now ends with the
    solid fibrous trunk rather than extending through the pliable crown. A first supported browser
    result was rejected because world-horizontal leaf planes turned edge-on below the arch and read
    as bare umbrella ribs; the accepted geometry follows each rachis tangent and adds a closed crown
    hub instead of masking the error with brighter leaves.
23. **Repeated block-crown canopy trees:** all 128 authored canopy anchors now load one reproducible
    four-family original GLB instead of nine procedural trunk, branch, crown-blob and leaf-detail
    layers. Species and local hydrology select 6 humid buttressed, 37 drained asymmetric, 42
    plate-barked compound and 43 layered Araucaria trees without moving any x/z anchor. Gravity-only
    settlement keeps every trunk vertical and all 3,540/3,540 sampled root contacts buried; the
    widest/tallest measured instances are 9.4443/9.4672 m inside a 9.5 m mature gate. Collision
    remains on the visible trunk while branches and leaves stay pliable. Three browser results were
    rejected in sequence: sawn Y-frames under flat terminal pads, a capped trunk with coplanar
    edge-on leaves, and leaf trays attached directly to a continuous leader. The accepted model uses
    a closed root-to-tapered-trunk-to-primary/secondary/tertiary-branch load path, visible lateral
    top shoots, attached nonplanar laminae, correlated dielectric surfaces and identical colour/depth
    wind. It renders 411,180 tree triangles, below the 420,000 replacement budget.
24. **Crushed outdoor shadow energy after the asset upgrades:** same-camera display diagnostics still
    put the brook/glade p10 at only 37.3/42.6 while p90 stayed near 138, so new bark, soil and branch
    information collapsed into dark blocks. The fix is source-based rather than an exposure wash:
    the approved sun remains `2.65` and all albedos remain unchanged; directionless ambient falls
    from `0.16` to `0.08`; directional sky/ground irradiance rises from `0.42` to `0.68`; the existing
    Preetham sky's bounded PMREM response rises from `0.12` to `0.30`; homogeneous humid extinction
    falls from `0.0071` to `0.0058` per world metre; and ACES exposure moves only from `0.88` to
    `0.98`. Final brook/glade p10 becomes 65.0/71.5 while p90 remains 146.5/147.6, recovering dark
    detail without a white shoulder. Runtime evidence records every energy source and keeps the
    2,048² shadow map plus 0.72 m world-space contact occlusion enabled.
25. **One false water plane over an uphill, cross-tilted ribbon:** the prior 73-row mesh had 35 rows
    climbing along its one animated flow direction, rose roughly 3.55 m after the interior low point
    and inherited as much as 0.0507 cross-channel grade from the terrain. One horizontal reflector
    at a representative height then projected that false plane over all 166 m. The accepted model
    makes both mapped headwaters lose gravitational head toward row 35, keeps every rendered
    cross-section level, limits the monotonic bed-hump correction to 0.1273 m additional ponding and
    couples the measured 0.0008..0.102611 downstream grade to surface energy. Nineteen local reach
    planes reuse one 320×180 capture; the chosen plane is spatially and vertically masked to its own
    reach. Runtime QA records four deliberate reach changes over the complete route/review sequence,
    a normalized upward active normal, ready refraction, restored renderer state and no render error.
26. **Pale mint vegetation caused by repeated pigment multipliers:** the four original vegetation
    libraries previously multiplied very light instance tints over already-pigmented material colours
    and correlated leaf-albedo textures. The first shared calibration lowered instance lightness but
    retained another saturated green layer; the fixed ground-cover camera proved that value fell while
    relative colour saturation stayed excessive, so that result was rejected rather than hidden with
    exposure or fog. The accepted contract leaves family pigment in the material/texture layers and
    restricts instance colour to a near-neutral `0.035..0.12` saturation and `0.42..0.66` lightness
    multiplier sourced from habitat wetness, local slope and bounded individual age. Wet leaf films
    reduce diffuse return; drained exposure supplies only a smaller bounded gain. Canopy, mature
    tree-fern, fern and ground-cover snapshots all report the same contract while retaining zero
    emission/metalness, shadow-aware thin-leaf transmission, identical colour/depth wind and the
    established physical support/collision evidence. Daylight and post-processing are unchanged.
27. **Uniform distant tree bands and reachable visual-only trunks:** the former 144-tree density LOD
    scattered identical supported trunks across three horizontal southern bands; some centres still
    fell inside the navigation rectangle despite having no collision authority. The accepted layout
    keeps the same tree budget but forms twelve deterministic terrain-sourced succession cohorts:
    six beyond the southern boundary and three each beyond the west/east boundaries. All trunk radii
    are wholly outside navigation while pliable crowns may overhang. Cohorts contain 72 mature, 36
    submature and 36 pioneer size classes; terrain wetness/slope and boundary exposure drive the
    morphology mix and far-LOD allometry. Two visual results were rejected: bringing simplified
    crown blobs into the midground produced pale lollipop silhouettes and delayed a reflection-reach
    update; replacing only mature edge members left simplified young blobs mixed into the near edge.
    The first accepted result used the complete original root/trunk/branch/leaf asset for all 72
    west/east members and confined simplified LOD to the true southern distance. The later boundary
    completion pass extends the complete asset to all 144 members while retaining simplified
    allometry only as a load-failure fallback. Runtime evidence now records 4,080/4,080 supported
    edge-tree root contacts, 144/144 inaccessible load-bearing trunks, 69 within-cohort overlap links
    and the unchanged central family/route sightline.
28. **Sparse horizontal leaf fans on structurally complete trees:** the v1 canopy had a valid buried
    root → closed trunk → primary/secondary/tertiary branch chain, but close review still exposed
    large sparse laminae. A denser v2 was rejected because seven or eight leaves at each terminal
    anchor stayed legible as a repeated horizontal fan. V3 reduced broadleaf length to
    `0.40..0.49 m` and Araucaria length to `0.28 m`, then distributed each leaf around the actual
    branch axis with a deterministic golden-angle sequence and a bounded gravity-up component. V4
    retains that physical orientation but moves the leaf roots onto successive nodes along the known
    closed terminal branch axis and widens the cambered laminae without adding leaves or triangles.
    Coverage therefore comes from `810/702/900/1,188` smaller attached leaves across the four
    families, not larger crown pads. The 128-tree batch keeps eight draw calls, renders 532,740 tree
    triangles, preserves identical colour/depth wind displacement and keeps all 3,540 root contacts
    buried. The fixed close view shows three-dimensional light-facing variation while the brook and
    glade views retain their route and family sightlines; no sun, exposure, fog or emission value was
    changed to manufacture the improvement.
29. **Distance-only bank colouring and the false circular mud halo:** the first named-relief trial
    still treated both sides of the brook mainly as equal-distance bands. The accepted field derives
    a nearest channel tangent, signed bank side and bend curvature from the same control line as the
    rendered brook. Inner bends accrete up to `0.34 m` point bars, outer bends erode up to `0.14 m`
    cut banks, an older floodplain bench adds at most `0.22 m`, and the glade receives a `0.62 m`
    irregular terrace riser while the active channel remains excluded. The material's alluvial weight
    comes from those same depositional terms instead of a second colour ring. The visible pale disc
    around the tridactyl print was separately traced to an opaque radial carrier mesh; coverage now
    follows only pressure deformation, displaced rim and standing water. Terrain reclassification
    changed vegetation niches, but every mature envelope and all `3,960` ground-cover, `1,144`
    accent-fern and `408` tree-fern support contacts pass after geometry fitting. The brook still
    drains to row 35, and no exposure, sun, fog, bloom or emission value changed.
30. **Smooth shading below the terrain grid and stretched steep-ground detail:** the first attempt
    used 7.14/2.33 m periods and selected one dominant lateral projection, producing both a uniform
    fabric read and a discontinuity when the lateral normal changed dominance. The second attempt
    blended all three projections but left the original plane-UV albedo, roughness and tangent-normal
    samples underneath, preserving steep-ground stretching. The accepted path removes those
    duplicate planar samples. Correlated albedo, roughness and height-derived normal relief now use
    continuous exponent-4 triplanar weights at non-round 47/13 m periods; the near layer fades over
    `45..110 m`. Signed fine-versus-coarse height residual attenuates indirect diffuse/specular only,
    with a 0.74 diffuse floor, while wetness, deposition and route compaction suppress relief and
    cavity together. Collision and hydrology still query the unchanged 24,505-vertex CPU heightfield,
    and sun, exposure, fog, bloom and emission remain unchanged.
31. **Near-vertical source shoulder classified as loose soil:** the former 0.35 m analytic slope
    probe sampled about `0.12` at either endpoint of the half-metre rise, even though the final
    1.25 m terrain cell spans the whole face and its rendered normal measures about `1.43`. Material
    slope now comes from that final heightfield normal. Above the 34° loose-regolith angle, the actual
    three-source continuity exposes basalt; at 55° it reaches full bedrock. Transported material
    remains only on stable downslope ground over a bounded 6.5 m toe, producing recorded bedrock
    `0..1` and colluvium `0..0.9102` ranges without affecting unrelated slopes. A full-relief trial
    was rejected as a ribbed curtain, and a correlated cross-joint trial was rejected because its
    small visual change reduced measured 1% low from 54.2 to 39.1 FPS. The accepted path keeps the
    source joints but limits bedrock optical relief to 58%; geometry, collision, daylight and fog are
    unchanged.
32. **One alluvium colour for incompatible river processes and uniformly scattered bed gravel:**
    point-bar accretion, old floodplain benches and cut-bank erosion previously shared one
    depositional colour/roughness response, while 56 small stones were distributed across the brook
    by centreline distance alone. The accepted surface now derives three mutually process-bounded
    weights from the same nearest-channel frame: inner-bend coarse sand/fine gravel, low-energy
    overbank silt/clay, and outer-bend cohesive subsoil exposure. Their recorded maxima are
    `0.6472`, `0.4145` and `0.8694`; each controls correlated colour, roughness, optical relief and
    indirect cavity rather than adding a symmetric band. Thirty-six non-solid stones remain inside
    the active bed-load corridor and twenty are accepted only where point-bar process and deposited
    material both exceed threshold and route wear stays below `0.18`; every instance records at least
    eleven terrain contacts. The first shader implementation was rejected because three scalar
    attributes exceeded the GPU vertex-attribute budget and produced large fallback triangles. The
    accepted path packs the three weights into one `vec3`, restores zero browser console errors, and
    leaves hydrology, route, collision, daylight, exposure and fog unchanged.
33. **Metre-scale present-flow “cobbles” and one unexplained pale bank capsule:** all six former solid
    brook cobbles occupied `54.9%..73.6%` of the 3.4 m brook width, while the hero form used a smooth
    axial silhouette and an almost binary pale/dark read. The accepted transport contract separates
    `0.16..0.55 m` present-mobile non-solid bed/bar clasts, `1.06..1.315 m` static historical
    high-flow lag (maximum `0.387` of brook width), and one `2.48 m` immobile residual bank erratic.
    The grade-only hydrology explicitly does not claim exact discharge or transport competence.
    Six lag colliders match their reduced visible envelopes and remain above the 0.42 m step gate.
    The hero v5 asset replaces the rejected smooth capsule and rejected per-triangle fracture mosaic
    with an offset-crown closed mass, four fracture constraints and 34° crease-preserved normals.
    Browser evidence records all `234/234` base/spall support samples in contact, `-8.5..0.42 cm`
    clearance, an 8.5 cm large-mass burial depth, main-mass-only collision, non-emissive dielectric
    response and zero console errors. Sun, exposure, fog, bloom, route and water geometry remain
    unchanged.
34. **Optically deep, matte ribbon and non-physical static ripple rings:** the old shader mapped a
    normalized channel mask to a fictitious `0.035..0.82 m` optical path even though the shared
    water-level/terrain-heightfield difference is only `0.002..0.2848 m`; its `0.32..0.82`
    roughness then turned grazing sky response into a pale plastic band. The accepted shader passes
    that measured water column per vertex, uses fresh-water IOR `1.333`/F0 `0.02037`, applies
    Beer–Lambert absorption `[0.72, 0.22, 0.13]/m` over the view-corrected physical path and limits
    base roughness to `0.11..0.27`; the later rendered-clast pass permits only its localized contact
    and wake regions to reach `0.34`. Deterministic broad/fine non-periodic normal slopes break the surface
    without introducing ocean-scale displacement; aeration exists only where local downstream grade
    or bank contact can support it. All 48 non-advecting torus ripple overlays are retired with zero
    replacement draw calls. A physically shallow but visually flat version, a periodic parallel-
    stripe version and an everywhere-overenergized white-sparkle version were rejected during iteration.
    Water geometry, hydrology, sun, exposure, fog, bloom and emission remain unchanged, and the
    grade-only flow-energy term still does not claim exact discharge, velocity or wave spectrum.
35. **Pale glazed-clay hero animals despite an authored source texture:** the generated Iguanodon
    material previously multiplied its albedo by an almost-white tint, damped its normal map to
    `0.78`, had no explicit dielectric IOR and added a small `0.025` emissive lift. That combination
    erased much of the source stripe/skin separation in the glade and made direct-light faces read as
    self-lit clay. The accepted path retains the existing 1K albedo, tangent-space normal and packed
    roughness maps under an opaque biological dielectric: linear albedo multiplier
    `[0.70, 0.64, 0.52]`, approximate IOR `1.42`, specular intensity `0.92`, environment response
    `0.48`, unit normal strength, and zero metalness, clearcoat, transmission and emission. A 52°
    crease gate averages `19,797` vertices across `9,902` coincident-position groups, repairing UV-
    seam shading without rounding harder anatomical breaks. All five animals still share the heavy
    mesh/material resources and retain the same two-adult/three-young roles, morph poses, silhouettes,
    placement and shadows. Sun, fill lights, exposure, fog, bloom and geometry remain unchanged. The
    bounded optical model deliberately does not claim exact Iguanodon pigmentation.
36. **Bare, uniformly smooth forest floor between the terrain shader and metre-scale props:** the
    previous intermediate dressing supplied only eighteen large deadfall pieces plus living plant
    instances, leaving no centimetre/decimetre organic fall around canopy sources. The accepted
    project-original layer adds 360 instances across three draw calls: closed curled broadleaf litter,
    twig-and-bark fall, and cone/husk/leaf scatter. Placement begins at the recorded canopy layout,
    then the shared terrain-ecology field excludes authored reads, all route wear, saturated bank,
    excessive exposed mineral ground and slopes above `0.28`. The accepted run records humus
    `0.0801..0.8052`, route wear `0`, wet-bank weight `0..0.0672`, mineral exposure
    `0.0276..0.5681` and slope `0.0029..0.2573`. Local tangent alignment and multipoint settlement
    keep all **66,000/66,000** support samples within **-0.8..+1.03 cm** of the rendered heightfield.
    Materials are opaque, rough, zero-metalness, non-emissive organic dielectrics; the layer is
    explicitly non-solid and compressible. The first version was rejected because oversized pale
    repeated clusters read as star-shaped placement markers, and because source choice was
    accidentally correlated with variant choice. The accepted darker, smaller and independently
    sampled version changes no terrain, route, collision, hydrology, sun, exposure, fog, bloom or
    emission value.
37. **Triangular black patches and pale rectangular seams from route geometry laid over the soil:**
    the main route and both forks previously duplicated the terrain as three transparent ribbon
    meshes. Although their vertices sampled terrain height, grazing views exposed the ribbon
    triangulation and alpha/order differences as disconnected dark triangles and one large pale
    rectangle across the glade foreground. The accepted path deletes all three visible route meshes.
    Their exact authored navigation control lines already drive the terrain's continuous `routeWear`
    attribute, so path readability now comes from litter suppression, compacted colour, reduced
    optical relief and changed roughness inside the same render/collision heightfield. Runtime
    evidence records three control lines, route-wear maximum above `0.95`, **zero overlay
    geometries**, **zero overlay draw calls** and no collision change. Zero-draw semantic anchors
    preserve inspection names without reintroducing a surface. The same `brook`, `glade` and new
    route-detail cameras show the former black triangles and pale rectangle absent; no terrain
    height, navigation, hydrology, vegetation placement, sun, exposure, fog, bloom or emission value
    changed.
38. **Incomplete southern tree silhouettes and terminal-point leaf starbursts:** the succession
    layout had twelve physical cohorts, but only the 72 west/east members attached the complete
    original tree library; the six southern cohorts permanently displayed pale simplified trunk-and-
    puff meshes. At close range, each v3 terminal branch also placed nine or ten correctly oriented
    leaves at one identical endpoint, producing star-shaped clumps separated by bare branch spans.
    The accepted forest v2 path sends all 144 placements through the complete v4 root, trunk, branch
    and leaf asset across the existing 72/36/36 mature/submature/pioneer age classes. The four-draw-
    call simplified batch is now failure-only and hidden after a successful attach; the accepted
    environment count therefore falls to 20 draw calls. V4 distributes the same 3,600 leaf roots
    backward along their supporting terminal branch axes and uses wider cambered laminae while
    retaining the same 16,380 asset triangles and 532,740 main-world rendered-tree triangles.
    Runtime evidence records 4,080/4,080 supported boundary root samples, all twelve cohorts present,
    no fallback visibility, 59.9 median FPS and 39.3 FPS 1% low. No collision, navigation, terrain,
    hydrology, sunlight, exposure, fog, bloom or emission value changed. The fixed boundary frame
    proves consistent whole-tree silhouettes and age variation, but does not establish production
    forest density or Web Ocean parity.
39. **Leaf count concentrated at terminal clusters instead of distributed crown area:** v4 fixed
    the worst single-point starbursts, but broadleaf variants still placed seven to ten leaves around
    only 78–90 branch anchors and Araucaria placed nine leaves around 132 anchors. Close review showed
    dense terminal knots separated by visually bare supported branches. V5 keeps the same closed root,
    trunk and branch geometry but adds physically valid leaf-root nodes along primary, secondary,
    tertiary and Araucaria-whorl branch axes. Anchor counts rise to `132/114/132/216`; each node carries
    only six or seven leaves, for `924/798/924/1,296` leaves across the four families. Total foliage
    grows by a bounded 9.5%, asset triangles by 4.18% (`17,064` total), and the existing 128 main-world
    instances render `552,516` tree triangles below the revised 560,000 gate. A topology regression
    requires at least five distinct physical leaf-root nodes per broadleaf anchor and four per
    Araucaria anchor. Fixed close and boundary views show foliage distributed across the supported
    crown rather than swollen terminal pads. The authoritative run records 59.9 median FPS, 39.1 FPS
    1% low and all 3,540 main plus 4,080 boundary root contacts supported. No collision, terrain,
    hydrology, daylight, exposure, fog, bloom or emission value changed. The result improves crown
    continuity but remains visibly less dense and diverse than Web Ocean's production forest slope.
40. **Age and wind-damage data stopped at placement and never changed complete-tree foliage:** the
    succession layout already recorded mature/submature/pioneer age and bounded exposure damage, but
    the complete v5 asset rendered every leaf for every instance. The accepted path stores one stable
    retention rank on each complete lamina and one per-instance retention threshold derived from
    succession age, wind damage, final-terrain slope, terrain wetness and deterministic individual
    rank. Boundary retention spans `0.8840..0.9543` with a `0.9151` mean; 18 of 144 instances fall
    below `0.90`, while the 128 main-route trees stay within `0.9341..0.9639`. Rejection removes whole
    leaves rather than shrinking or moving them away from their branches. Colour and depth-shadow
    shaders share the same rank and threshold, and the values do not depend on camera or elapsed time,
    preventing shadow mismatch and foliage popping. All root support, collision, tree dimensions,
    draw calls and asset triangles remain unchanged. The authoritative run records 59.9 median FPS,
    39.8 FPS 1% low and zero browser errors. Fixed frames retain the v5 coverage increase while adding
    bounded crown variation; no sun, exposure, fog, bloom, emission, terrain or hydrology value changed.
41. **Smooth cyan ridge silhouettes with no terrain-rooted distant canopy:** the accepted eroded
    near/far heightfields had real depth, normals and drainage cuts, but their uninterrupted lit
    surfaces still read as large flat-colour background shapes beside Web Ocean's wooded slopes. An
    initial supported trial was rejected because 299 isolated single-volume crowns produced sparse
    lollipop/green-rock silhouettes. The accepted path uses closed five-lobe broad crowns and closed
    three-tier narrow crowns across **609** deterministic background trees: 279 on the far ridge and
    330 on the near ridge, split into 342 broad and 267 narrow crowns. Establishment probability is
    sourced from rendered height, final triangle normal, drainage/moisture retention and exposed-
    stone exclusion rather than a uniform scatter. Every trunk root is sampled barycentrically on
    the exact rendered ridge triangle and embedded 6 cm; browser and unit evidence record
    **609/609** supported roots, zero positive root clearance, closed crown volumes overlapping the
    load-bearing trunk tops and no collision authority. The two ridge forests cost six instanced draw
    calls total, use opaque non-emissive zero-metalness dielectric materials, receive the same scene
    lighting/fog as their supporting slopes, and retain 59.9 median FPS / 40.5 FPS 1% low in the
    authoritative run. The fixed ridge, glade, brook and boundary frames now show a continuous wooded
    skyline rather than an undecorated cyan silhouette. No sun, exposure, fog, bloom, terrain height,
    hydrology, gameplay collision or navigation value changed.
42. **Terrain ecology ignored most rendered canopy and left the forest floor visually uniform:** the
    earlier humus field sampled only eighteen secondary canopy sources even though the world renders
    128 main canopy trees. Mean humus therefore remained `0.0084`, and a material-only bryophyte trial
    was correctly rejected as too subtle. The accepted field now includes all 128 main trees, twelve
    habitat tree ferns, five cover arches and the hero Ginkgo; canopy shade combines with moisture,
    hollow retention and stable substrate while route wear, mineral exposure, active point bars and
    cut banks exclude establishment. Mean humus rises to `0.1011` without filling the open glade or
    route. A three-draw-call, **640-instance** non-solid ground layer currently adds 387 creeping moss
    sprays, 196 clubmoss sprays and 57 humid grass tufts. All **640/640** rhizomes sample the rendered
    heightfield and are buried 2.6 cm. V2 replaces the humid-grass flattened-sphere carrier and blunt
    tubes with twelve closed tapered/cambered blade volumes under a 0.42/0.48 m width/height envelope;
    opaque non-emissive zero-metalness materials and normal scene shadows preserve physical support
    and energy accounting. A first dark
    colour-multiplication trial and a rock-like cushion trial were rejected; the accepted mid-albedo
    creeping structure remains low, varied and route-excluded. The authoritative run records 60.2
    median FPS, 44.2 FPS 1% low, 22.7 ms worst frame and zero browser errors. This materially improves
    near-ground succession but does not close Web Ocean's production asset or surface-detail gap.
43. **The east escarpment violated the declared rock-stability limit, and decorative exposure meshes
    made the failure more visible:** the old heightfield lifted 3.15 m across only 0.50 m, creating a
    near-vertical wall despite the terrain contract's 55-degree intact-bedrock limit. Three attempted
    exposure libraries were rejected because their visible faces read as unsupported salmon planks,
    shelves or mounted ovals rather than bedding produced by the supporting mass. The accepted pass
    deletes that runtime library and its generated binaries instead of hiding it. The same 3.15 m rise
    now spans 3.35 m in one continuous no-overhang heightfield; its analytic maximum gradient is
    `1.410448`, below the declared `1.428148` full-bedrock threshold. Subtle bed contacts are optical,
    world-height-sourced, gated by actual bedrock exposure and bounded to an 11% albedo reduction;
    overlay geometry count remains zero. All three basalt formations moved onto the stable shoulder
    and retain **60/60** supported bottom samples. A newly exposed deadfall support error was also
    repaired with terrain-tangent alignment and multipoint settlement: all **120/120** underside
    samples across 18 branches remain within **0.63..1.20 cm** of the rendered heightfield, and the
    maximum accepted terrain slope is `0.1189`. The fixed escarpment frames contain neither the
    rejected strata props nor the floating bright shard. The authoritative run records 59.9 median
    FPS, 39.1 FPS 1% low, 25.7 ms worst frame and zero browser errors. The remaining pale foreground
    bedded slab is physically supported but still visibly too capsule-like, so this pass improves
    physical credibility without claiming Web Ocean parity.
44. **The foreground bedded-slab family was still generated from a vertically compressed sphere:**
    the east escarpment inspection therefore showed one large pale capsule even after the slope and
    deadfall were physically corrected. The accepted geometry is a single closed, joint-bounded
    irregular ring stack rather than a sphere deformation. Its `2.1064 x 0.6265 x 1.599 m` local
    envelope carries two physically connected bedding ledges, a broad coplanar buried support cap and
    31-degree crease-preserved bedding/joint normals. All six placements retain terrain-normal
    alignment, shallow burial and solid collider authority. The dominant eastern instance is reduced
    to `0.78 x 0.72 x 0.64` scale, with its collider reduced in the same pass to a `0.8 m` radius and
    `0.44 m` height; this is not a visual-only shrink around an unchanged obstacle. Runtime evidence
    records at least **54** supported contact vertices per slab, maximum support clearance
    **-3.89 cm**, correlated triplanar material channels and no emission or metalness. The fixed
    escarpment frame now reads as a low partially buried slab instead of the original foreground
    capsule. The authoritative run records 59.9 median FPS, 39.1 FPS 1% low, 25.7 ms worst frame and
    zero browser errors. The family still has only one shared silhouette, so broader within-family
    variation remains part of the production asset gap.
45. **The cloud system had valid participating media but insufficient horizon frequency:** six
    hero volumes left most approved field and ridge views with only three or four isolated cloud
    blobs, while Web Ocean's reference establishes depth through a much broader cloud field. The
    accepted extension retains the same Beer-Lambert raymarch, world-metre extinction, lifting
    condensation base and 12/18-step quality ladder, but adds five lower-opacity far-horizon volumes
    behind the existing six near banks. All eleven bank-centre directions lie opposite the local sun;
    maximum sun alignment is `-0.1768`. They therefore do not cross the local solar path, and direct
    sun attenuation legitimately remains zero instead of introducing disconnected terrain-shadow
    decals. Low quality expands its matching fallback from 30 to **56** bounded puffs. Fixed brook,
    glade and ridge frames now show two readable cloud depth bands rather than a few isolated blobs.
    The authoritative run records 60.2 median FPS, 38.4 FPS 1% low, 26.1 ms worst frame and zero
    browser errors. This closes the sparse anti-solar horizon gap, not the still-missing overhead
    cloud/terrain-light coupling or Web Ocean-scale multiple scattering.
46. **The foreground cover corridor was literally built as five repeated load-bearing tree arches:**
    each pair shared one branch mesh spanning both trunks, so the brook and glade approaches read as
    artificial pergolas even though the root colliders were valid. The accepted pass preserves all ten
    authored x/z root positions, the original trunk-only collision authority and the 3.5 m minimum
    route half-clearance, but removes every cross-trunk bridge. Balanced/high quality now instances the
    existing complete original v5 canopy library across those ten roots: five humid broadleaf, one
    locally exposed asymmetric broadleaf, three plate-barked compound broadleaf and one Araucaria.
    Mature/submature/pioneer scale, yaw and wind-history variation remain stable per tree. Runtime
    evidence records **286/286** buried root-support samples, four non-empty silhouette families,
    **42,156** rendered tree triangles in eight instanced draws and zero fallback visibility. If the
    GLB cannot load, ten independent buttressed trunks remain; each fallback bough begins within one
    trunk fork, cantilevers at most **2.34 m**, ends in an attached non-solid crown and records
    `crossTrunkBridge: false`. The fixed cover frame now reads as overlapping riparian growth instead
    of five roofs. The authoritative run records **59.9 FPS median, 39.1 FPS 1% low, 25.7 ms worst
    frame** and zero browser errors. This removes the physically impossible corridor grammar without
    claiming that a ten-instance library equals Web Ocean's forest asset diversity.
47. **The brook bank duplicated its own physical terrain with three raised transparent ribbons:**
    one 6.8 m-wide wet-bank strip sat 7 cm above ground and two narrow side strips sat 9.5 cm above it,
    even though the shared terrain already carries wet-bank, inner-bend point-bar, floodplain-silt and
    outer-bend cut-bank fields. At grazing angles those 876 vertices / 1,296 triangles read as a
    uniformly installed border and could never share exact contact with the collision heightfield.
    The accepted pass deletes the now-unused generic ribbon generator and all three visible bank
    meshes. Their names remain as zero-child, zero-draw semantic anchors; the same 24,505-vertex
    rendered/collidable terrain exclusively owns bank albedo, `0.76..0.99` roughness, optical relief,
    erosion/deposition zoning and contact. The hydrological ribbon still derives its level and
    `0.002..0.2848 m` water column from that terrain, so no water depth, flow, collision, route or
    navigation value changed. Fixed brook and brook-detail views show the pale water ending directly
    against dark saturated ground instead of against a second raised green strip. The authoritative
    run records **59.9 FPS median, 39.1 FPS 1% low, 25.7 ms worst frame**, zero browser errors and
    all six complete-run checks passing. This closes duplicate bank topology; it does not add the
    still-missing bounded off-screen reflection fill or higher-resolution undercut-bank geometry.
48. **Planar reflection alone could not fill visible geometry between short reach captures:** the
    brook now traces a perspective-correct reflected ray through the same camera's suppressed-water
    colour/depth capture before falling back to the existing local planar target and scene-layout
    probe. Balanced/high quality use **12/20** bounded steps over at most **38 m**, three hit
    refinements, depth-scaled thickness and screen-edge/above-surface rejection; low quality pays no
    SSR cost. The trace cannot recover occluded or off-screen geometry and never replaces the
    fallback. Fresnel remains the measured freshwater F0 `0.02037`, so the accepted brook-detail
    change is intentionally subtle at a downward-looking camera rather than being amplified into an
    ocean mirror. The authoritative run records no render error or console error. This closes the
    missing same-camera reflection fill for visible opaque content, not the still-missing authored
    obstacle-flow response or the inherent screen-space visibility boundary.
49. **Rounded leaves still sat on one repeated horizontal branch shelf:** v6 first replaced every
    four-point/two-triangle diamond with an eight-vertex/six-triangle cambered lamina carrying a real
    tip, three width stations and a stable missing margin. V7 then keeps the same **3,942 leaves** and
    **594 physical anchors**, but reallocates the foliage removed with one complete wind-broken
    primary per broadleaf family into four paired upper scaffold layers. Araucaria replaces two
    complete whorl limbs with supported leader twigs. The five missing limbs terminate in closed
    stumps with **15** closed fracture splinters; all branch/root meshes remain manifold and every
    leaf root still overlaps a supporting branch. The asset records **1,102** physically notched
    leaves plus colour/depth-shared rare perforations, **33,102** total triangles and only **0.82%**
    triangle growth over v6. The 128 main trees render **1,081,758** triangles in the same eight
    instanced draws. A first v7 browser result was rejected because low upper-scaffold origins left
    repeated spear-like leader tips; the accepted revision moves those load-bearing origins upward
    and shortens the bare leader instead of hiding it with cards. Fixed canopy and riparian frames
    now carry real vertical crown volume and asymmetric branch loss while preserving all **3,540**
    supported main-tree root samples, trunk-only collision and the 9.9 m mature-height gate.
50. **The distant forest remained a sparse field of polyhedral blobs over one uniform cyan slope:**
    the accepted v2 keeps **598** terrain-established mature trees and the same **six** total instanced
    draw calls, but adds **220** juvenile/shrub crowns only where unused rendered-triangle samples pass
    the same slope, drainage and exposed-stone gates. All **818** crown roots remain barycentric on the
    exact near/far ridge meshes: mature trunks embed 6 cm and understory crowns embed 4.5 cm with zero
    positive clearance. Broadleaf silhouettes now use one closed, smoothly shaded, noise-deformed
    continuous hull instead of five low-detail lobes; narrow crowns use a closed layered-lathe profile
    instead of seven-sided cones. Stable 37 m / 13 m ridge detail is gated by the rendered drainage,
    exposed-stone and height fields, capped at 22% humus darkening and 28% mineral blend, and changes
    no collision. Two browser trials were rejected: detail-one ovoid tiers read as repeated eggs, and
    five smooth spheres read as lollipop crowns. The accepted fixed ridge/boundary frames retain
    visible tree gaps and exposed rock while reducing the chess-piece silhouette and uniform-ground
    read. The authoritative run records **59.9 FPS median, 39.1 FPS 1% low, 25.7 ms worst frame** and
    zero browser errors. This is a stronger distant cohort/material system, not a claim that its two
    shared crown families equal Web Ocean's production forest library.
51. **The water ignored rocks that visibly intersected the current:** the accepted obstacle-flow pass
    derives candidates from the exact world-space bounds of the **56** terrain-settled bed/bar stones
    and six historical flood-lag clasts. It rejects **25** candidates outside the rendered wetted
    channel, qualifies **37** upper-column contacts, ranks them by radius/contact/local energy, and
    sends only the strongest **12** through a fixed shader budget; low/balanced/high activate
    **4/8/12**. The selected historical lag clast and active-bed stones carry the actual local
    downstream tangent from their nearest hydrology segment. A bounded cylinder potential-flow field
    bends normals around each clast; only the downstream half-plane receives the expanding separation
    envelope and alternating shedding, while upper-column contact and grade gate roughness and
    aeration. Aggregate obstacle slope reaches `0.04205` in the accepted scene but is capped at
    `0.052`; source aeration reaches `0.27918` under a `0.31` cap. The 2.48 m bank erratic is not
    silently treated as an in-channel obstacle, and all **48** retired torus overlays remain absent.
    The fixed close camera shows the historical rock intersecting the same water surface rather than a
    decal ring. The authoritative run records **59.9 FPS median, 39.1 FPS 1% low, 25.7 ms worst
    frame**, zero shader/browser errors and all six complete-run checks passing. This is a bounded
    shallow-water approximation, not CFD, discharge or transport proof.
52. **Obstacle response changed normals but left the water carrier geometrically flat:** the accepted
    free-surface pass replaces the 73-row, four-vertex cross-section ribbon (**292 vertices / 432
    triangles**) with **289 rows**, **13 cross samples**, **3,757 vertices** and **6,912 triangles**.
    Every base row still has one interpolated gravity water level, so terrain cannot tilt a cross-
    section and the two headwaters still drain toward confluence row 35. The same twelve rendered-
    clast uniforms now run in the vertex shader: stagnation pressure raises the upstream nose by at
    most **3.2 cm**, shoulder speed-up lowers it by at most **1.2 cm**, and the expanding alternating
    wake carries at most **1.8 cm** zero-mean displacement. Aggregate vertical motion is clamped to
    **±3.8 cm** and is added back to the measured water column used by refraction/absorption. No ocean-
    scale base wave, collision authority, bank geometry, particle foam or static overlay was added.
    Fixed brook frames change only **2.87–6.33%** of pixels above 3/255, while the isolated water/contact
    crop changes **24.32%**; the strongest change is in the dedicated obstacle close view rather than
    the whole landscape. The grazing profile camera records
    the shared water/rock silhouette without a second water plane. The accepted browser run records
    **59.9 FPS median, 39.1 FPS 1% low, 25.6 ms worst frame** and zero render errors. This is a bounded
    visual free surface, not a shallow-water CFD or volume-conservation proof.
53. **The physically supported bank erratic still exposed its twelve-sector carrier as a pale faceted
    capsule in close review:** v6 replaces the 144-triangle main mass with a closed **1,344-triangle**
    surface built from **48 sectors and fourteen rings**. The upgrade preserves the approved
    **2.4794 m** world long axis, **1.8200 m³** local volume, broad support polygon, interior projected
    centre of mass, five real clipping planes and main-mass-only collision authority. More than 90%
    of coincident vertices now share continuous normals; exactly 50 vertices retain an above-8-degree
    split at authored fracture transitions under a 42-degree crease gate. The five spalls rise from
    108 to 282 triangles and remain independently terrain-settled/non-solid. The darker zero-emission,
    zero-metalness material keeps coordinate/porosity weathering, denser triplanar relief and the
    irregular lower capillary response instead of using camera-facing albedo. Browser evidence records
    **570/570** support samples at **-8.50..+0.69 cm**, **59.9 FPS median, 39.1 FPS 1% low and 25.7 ms
    worst frame**. Fixed-frame change is concentrated in the focal asset: 8.38%, 8.56% and 18.64% of
    pixels change above 3/255 in the boulder, obstacle and grazing-profile reviews respectively.
    The upgrade removes carrier-triangle faceting; it does not claim production-library breadth.
54. **Foreground plants still exposed two incompatible fake support forms after their ecology was
    correct:** original ground-cover v1 placed wide ten-sided rhizome crowns above the soil and let
    360 instances reach **1.12–1.45 m** diameter, while the separate humid-grass succession family was
    literally a flattened seven-segment sphere with blunt tapered cylinders. Ground-cover v2 keeps
    every ecological placement and six draw calls but moves a closed fourteen-sided rhizome below
    grade, increases leaf counts from **7/8/14** to **9/10/18**, reduces the three maximum
    diameter/height envelopes to **0.9755/0.3912, 0.7891/0.2069 and 0.7796/0.5728 m**, and records
    **5,400/5,400** support samples at **-5.35..-5.05 cm** with no horizontal relocation. Its
    structure/leaf environment response is capped at **0.12/0.18** and the shadow-aware transmission
    term falls from 0.40 to 0.22 rather than being hidden with exposure. Bryophyte/herbaceous v2 keeps
    all **640** placements and three draws, buries every rhizome **2.6 cm**, and rebuilds each of the
    57 humid-grass instances as one closed **752-triangle** tuft with twelve gravity-curved tapered
    blade volumes under a **0.42/0.48 m** width/height envelope. The focal ground-cover frame changes
    **36.62%** of pixels above 3/255 and the obstacle close view changes **9.08%**; the octagonal base
    disappears instead of being recoloured. The browser run records **59.9 FPS median, 39.1 FPS 1%
    low, 25.7 ms worst frame** and zero render errors. This closes repeated support/energy errors, not
    the remaining production species/texel-density gap.
55. **A second pale triangle cluster was incorrectly attributed to the fern and ground-cover
    libraries:** fixed-camera runtime ablation proved that the remaining screen-dominating cyan bank
    cluster belonged to `world.connected_route.brook_response`. Five permanently visible procedural
    fan meshes had been authored as the interaction carrier, so a subtle wind response also left a
    large low-detail plant stand in every idle frame. The response now owns an independent five-
    instance original-fern batch rather than borrowing the static primary/accent batches. All five
    classify as humid-bank ferns, remain under **0.9155 m diameter / 0.2365 m height**, and record
    **65/65** rhizome contacts at **-3.01..-2.99 cm** below the shared terrain. Idle wind is bounded to
    **0.055/0.012 m** horizontal/vertical displacement; `answering-call` and `brush-moving` raise the
    same colour/depth uniforms instead of rotating disconnected triangle cards. Only variant zero is
    active, so the response adds two real draw calls rather than the library's six-call maximum. In
    the fixed ground-cover crop, the pale-cyan proxy falls from **10,874 to 105 pixels** and the old
    fallback is hidden. The accepted run records **59.9 FPS median, 39.4 FPS 1% low, 25.4 ms worst
    frame** and zero browser errors.
56. **Brook and forest deadwood still read as white flat-shaded foam branches and several creek logs
    were positioned from one centre point rather than supported:** all three shared families now use
    **696–912 triangles**, seven to nine closed overlapping trunk/branch/fibre volumes, curved
    twelve-sided bark rings, tapered attached branches, jagged fracture faces, distinct end grain and
    four to five tapered splinters. The existing project-authored bark albedo, roughness and height
    channels now follow every segment UV; wet-bank and dry/damp forest material responses are separate
    opaque, zero-emission, zero-metalness dielectrics with environment response capped at **0.12/0.08**.
    Ten brook logs are aligned to the sampled terrain tangent and gravity-settled from **41** underside
    samples at **-3.42..+0.80 cm** over slopes up to **0.136**. The eighteen forest-floor logs retain
    their deterministic placement but now record **78** underside samples at **-2.38..+1.20 cm** over
    slopes up to **0.1189**. The fixed ground-cover crop removes the dominant pale blocks; brook and
    detritus review changes remain localized at **2.33% / 2.81%** of pixels above 3/255. The accepted
    run keeps the same complete path and performance tier; no collider or navigation authority was
    added.
57. **The remaining foreground ground cover still formed thick, equal-height radial umbrellas:**
    v3 replaces the three equal-age fans with mixed juvenile-to-mature asymmetric petiole/leaf
    hierarchies. Closed petiole source radii fall by **38.89% / 44.12% / 42.86%** to
    **1.10 / 0.95 / 0.80 cm**, while six-sided sections replace the most visible five-sided tubes.
    Every petiole and attached lamina shares one leaf phase and flex coordinate, keeping the measured
    attachment gap below **0.1 mm** while bounded per-instance yaw, radial and vertical variation runs
    through the identical colour/depth shader path. The three render-aware maximum diameter/height
    pairs fall from **0.9755/0.3912, 0.7891/0.2069 and 0.7796/0.5728 m** to
    **0.7420/0.3112, 0.4865/0.1760 and 0.7075/0.4746 m**. All **360** habitat placements, six draw
    calls and **5,400/5,400** buried support samples remain unchanged. The dedicated foreground frame
    changes **20.87%** of pixels above 3/255, while the brook, glade and bryophyte context frames stay
    localized at **1.99–2.36%**. The accepted browser run records **59.9 FPS median, 39.1 FPS 1% low,
    25.6 ms worst frame** and completes launch, rendering, input, core loop, outcome and restart.
58. **The terrain's nominal micro detail still resolved as metre-scale blur, while the first finer
    attempt produced a non-physical dotted carpet:** the accepted pass adds a third **1.282 m**
    world-space sample from the existing correlated soil maps, but does not apply its height across
    the whole surface. Fine stone, organic and pore candidates occupy only **1.262% / 1.579% /
    0.325%** of their source channels above 0.5; deterministic sparse occupancy and variable radius
    replace the rejected one-feature-per-cell field. Wet alluvium, route compaction, established
    bryophyte and geological source masks suppress incompatible detail. Only source-gated mineral
    inclusions perturb the normal, bounded to **2.5 mm** optical relief; the shared collision
    heightfield, texture-object count and terrain draw count do not change. Two mechanically passing
    but visually invalid attempts were rejected before the final capture. The accepted fixed frames
    change **9.80–20.79%** of pixels above
    3/255 with only **0.01–0.15%** above 12/255, showing a broad low-amplitude material response rather
    than a new overlay. The authoritative browser run retains **59.9 FPS median, 39.3 FPS 1% low, 25.5 ms
    worst frame** and completes all six required checks.
59. **Homogeneous exponential fog flattened valleys, high ridges and tree crowns into one cyan
    distance band:** the accepted aerial-perspective pass analytically integrates an exponential
    **22 m** density scale height from the actual camera height to each physical-material fragment,
    using **-4 m** as the reference base and **0.0058/m** base extinction. At 100 m, a horizontal
    lowland segment records optical depth/transmittance **0.4032 / 0.6682**, a 4→34 m rising segment
    **0.2201 / 0.8025**, and a 34 m high segment **0.1031 / 0.9020**; altitude now changes aerial
    depth instead of receiving the same screen-distance colour wash. The approved sun vector feeds
    bounded Henyey–Greenstein forward scattering at anisotropy **0.58**, so warm haze can only build
    along the real solar direction. The shared shader patch covers **225** physical materials,
    including instanced world positions, while **37** explicit custom shader materials retain the
    documented FogExp2 fallback. Geometry, collision, texture count and draw count remain unchanged.
    The deterministic review frames change **24.97–74.05%** of pixels above 3/255, but only
    **0.70–3.01%** above 12/255; the authoritative browser run remains at **59.9 FPS median,
    39.4 FPS 1% low and 25.4 ms worst frame**
    and completes all six required checks without browser or WebGL errors.
60. **The altitude-corrected ridge canopy still exposed its shared smooth-shell prototype grammar:**
    the accepted v3 crown pass replaces each broad shell with one closed dominant upper mass, three
    closed flattened shoulder cohorts and three closed tapered structural forks. Fork roots overlap
    the existing trunk top and terminate inside their shoulder mass; their vertices are explicitly
    excluded from foliage lean and damage deformation, so the visible load path cannot distort like
    leaf volume. Height/age, rendered slope, drainage, exposed stone and stable position phase drive
    three nonempty architecture bands, bounded **19%** radial damage and **10%** crown-local lean.
    The broader **3.0–9.4 m** source-height envelope and random yaw expose different shoulder tiers
    without adding instances. Three mechanically passing but visually invalid versions remain
    archived: equal-lobe cauliflower, regular unsupported droplets and forks occluded by the main
    crown. The accepted ridge/boundary frames change **8.70% / 11.75%** of pixels above 3/255 and
    **3.24% / 5.96%** above 12/255. Counts remain **598** trees plus **220** understory crowns with
    exact-triangle support, **818** crowns total, six draw calls and no collision authority. The
    authoritative run records **59.9 FPS median, 39.2 FPS 1% low and 25.6 ms worst frame** and
    completes all six required checks without browser or WebGL errors.
61. **The calibrated hero Iguanodon still produced a polished white back despite nominal roughness
    1.0:** the renderer multiplied that scalar by the authored packed-map green channel, whose
    measured **0.0078–0.9020** range and **0.4301** mean left much of the animal optically smooth.
    The accepted pass preserves the source 1K albedo, normal and packed roughness maps, but linearly
    remaps relative green-channel variation into a bounded **0.72–0.94** dry-scaled-skin range.
    Observed texels therefore land at approximately **0.7217–0.9184** effective roughness. IOR 1.42,
    specular intensity 0.92, environment response 0.48, unit normal strength and zero metalness,
    clearcoat, transmission and emission remain unchanged. In the fixed subject-enclosing polygon,
    mean/95th-percentile luminance falls from **96.20/175.58** to **89.63/167.50**, while pixels above
    220/255 fall from **1.35% to 0%**. The dedicated subject frame changes **10.02%** of pixels above
    3/255, but the wider glade context stays localized at **3.79%**. No texture, material, draw call,
    geometry, animation, lighting, exposure or collision change is added. The authoritative run
    records **59.9 FPS median, 39.0 FPS 1% low and 25.8 ms worst frame** and completes all six
    required checks without browser or WebGL errors.


62. **The distant cloud banks were physically bounded, but the overhead sky and terrain illumination
    still came from disconnected systems:** the accepted pass adds one deterministic **256 x 256**
    density texture over a **2,048 m** world domain for a **620–840 m** overhead layer with **32 m**
    minimum resolved features. The visible deck ray-intersects lower/middle/upper cloud levels and
    the terrain's direct-light patch projects each physical-material world position through that
    exact advected density along the approved sun direction. Two sun-path samples use Beer–Lambert
    extinction **0.00155/m**, clamped to minimum direct transmittance **0.58**; indirect sky and IBL
    remain available, so cloud cover does not become uniform ambient mud. The patch covers **200**
    materials, skips **63** unsupported/custom materials, replaces the previous deck draw call, adds
    one texture object, **zero** extra draw calls and no collision authority. Low quality disables
    both the overhead deck and its lighting influence. The first mechanically valid version was
    rejected because its low-frequency density read as a transparent dome. In the accepted version,
    upward Strong frames change **36.73–40.76%** of pixels above 3/255 while the terrain-detail and
    Iguanodon fixed views change only **0.09% / 0.04%** above 12/255. No stripe/checker shadow or
    whole-scene darkening appears in the fixed comparison. The authoritative run records **59.9 FPS
    median, 39.4 FPS 1% low and 25.4 ms worst frame**, passes **193/193** application tests and all six
    complete-run checks. This is a shared-density layered approximation, not a fluid/microphysical
    cloud model or a claim of Web Ocean's full multiple-scattering fidelity.


63. **The original Fort Ginkgo still read as a faceted beam assembly with radial feet and terminal
    leaf paddles:** v1 used ten straight primary branches, thirty terminal points and **583** leaves at
    approximately **0.42–0.58 m**, producing a few flat piles rather than a supported mature crown.
    The accepted v2 asset remains two draw calls but rises to **123,624 triangles** and **1,971**
    closed bilobed leaves at **0.205–0.30 m**. A 35-ring/24-sector tapered trunk carries ten curved
    collared scaffolds, twenty secondaries, **68** fine twigs, **88** leaf-bearing shoots and four
    sealed pruning stubs. All seven buttress-root tips finish at least **0.20 m** below grade; child
    first rings overlap the parent centreline, maximum daughter/parent area ratio is **0.9248**, and
    recorded leaf support gap is **0 m**. Two deterministic 128² correlated bark textures keep
    roughness at **0.86–0.98** and optical relief at **8 mm**, with one **0.65 m / 0.46 m**
    around/along scale. Three mechanically passing versions were rejected: a sparse pollarded crown,
    taper-driven helical tyre bark and uniform vertical corduroy. The accepted full-tree/root frames
    change **15.74% / 7.92%** of pixels above 3/255, while unrelated fixed brook, canopy and boundary
    views stay at **1.82–2.73%**. World anchor, terrain height, two draw calls, trunk collider,
    navigation and gameplay remain unchanged. The authoritative run records **59.9 FPS median,
    39.4 FPS 1% low and 25.6 ms worst frame**, passes **193/193** application tests and all six
    complete-run checks. This closes one hero landmark architecture/surface defect, not production
    tree-library breadth, seasonal variation or fine sculpted junction parity.

64. **The v2 Fort Ginkgo had a physically supported crown but remained completely static:** the
    accepted asset now carries one secondary UV flex channel without adding a draw call. Root and
    trunk flex remain exactly zero; scaffold, secondary, twig and leaf flex rise in stiffness order
    through **0.05–0.32 / 0.28–0.56 / 0.52–0.82 / 0.40–1.00**. A coherent world-direction breeze
    bounds tip motion to **0.12 m horizontal / 0.024 m vertical**, combining **0.37 Hz** structural
    motion with **1.62 Hz** outer-leaf flutter. Colour and directional-depth materials use the same
    displacement function and uniforms, while reduced-motion mode resets time and strength to zero.
    At the fixed **14.75 s** review pose, the full tree frame changes **8.60%** of pixels above 3/255;
    the tree-and-crown region changes **15.34%**, but the root-contact region changes only **0.72%**
    above 3/255 and **0%** above 12/255. The close root frame remains at **1.15% / 0.01%** overall,
    showing that the buried support and massive trunk do not participate in the breeze. The
    authoritative run records **59.9 FPS median, 39.7 FPS 1% low and 25.2 ms worst frame**, passes
    **194/194** application tests and all six complete-run checks without browser or WebGL errors.
    This closes one landmark's static-canopy defect, not seasonal/age variation or production tree-
    library breadth.

65. **The supported v3 ridge crowns still collapsed into repeated balls and cones at review
    distance:** the accepted v4 keeps **598** mature trees, **220** gap-sourced understory crowns,
    **818** crowns total and the same six instanced draws, but redistributes the shared geometry into
    visible supported cohorts. Every broad crown now contains **11** closed leaf cohorts connected by
    **nine** closed tapered branches; branch roots overlap the trunk/leader or a parent cohort and
    endpoints terminate inside the supported cohort. Its 20 components remain **520 triangles**, the
    previous broad-crown budget. Every narrow crown becomes four overlapping closed whorls around one
    closed tapered leader, bounded to **500 triangles**. Branch/leader vertices remain outside the
    existing age/asymmetry/damage deformation. Exact-triangle root support, ridge placement, terrain,
    collision and navigation are unchanged. The dedicated ridge/boundary frames change **8.60% /
    11.80%** of pixels above 3/255 and **2.96% / 5.82%** above 12/255; the accepted skyline resolves
    as asymmetric leaf cohorts and supported whorls rather than smooth shells. The authoritative run
    records **59.9 FPS median, 54.2 FPS 1% low and 18.5 ms worst frame**, passes **194/194** tests and
    all six complete-run checks without browser or WebGL errors. This improves two shared crown
    families without pretending they equal a production species library.

66. **The mature hero Ginkgo ended abruptly at bare uniform soil despite contributing to the humus
    field:** the accepted forest-floor v2 layer keeps the original **360** three-family canopy-habitat
    clusters unchanged and adds **30** closed bilobed fan-leaf/petiole clusters in one instanced draw.
    Their source is the actual hero anchor at `[16, 37]`; placement occupies **1.45–4.85 m** in the
    inter-root sectors defined by the same seven angles as the authored buttress roots, staying at
    least **0.18 rad** from a root axis. Every cluster aligns to the local terrain tangent and is
    multipoint-settled against the shared rendered heightfield. The authoritative browser evidence
    records **79,560/79,560** supported samples at **-0.8..+1.47 cm** clearance, with no solid
    collision or terrain-height authority. In the close root view, the near-root ground band changes
    **6.70% / 2.20%** above 3/12 out of 255, while the trunk-contact region remains at **1.46% /
    0.25%**; the organic fall therefore occupies inter-root soil without masking support. The run
    records **61.0 FPS median, 40.4 FPS 1% low and 24.8 ms worst frame**, passes **194/194** tests and
    all six complete-run checks without browser or WebGL errors. This is one species-sourced root-
    zone transition, not a production litter library.

67. **The red-basalt apron still used repeated black polyhedral dice rather than source-derived
    talus:** the accepted rubble pass replaces all **44** placements with the same project-original
    joint-bounded angular-talus family used by the geological system, while preserving one instanced
    draw. Distribution remains coupled to the existing **18** cooling pillars. Every fragment aligns
    to the local terrain normal and settles from **18** support vertices with **1.8–3.97 cm** shallow
    burial; runtime evidence records **44/44** supported placements, **-3.97..+1.30 cm** clearance,
    at least eighteen contact vertices and a complete non-solid footprint beyond navigation. A bright
    salmon material integration was rejected; the accepted dark weathered oxidized-basalt response
    is opaque, non-emissive and zero-metalness. The fixed basalt views change **3.02–5.04%** above
    3/255 while preserving collision truth, and the accepted run records **59.9 FPS median, 43.4 FPS
    1% low and 23.1 ms worst frame**.

68. **The v4 ridge system remained a sparse icon field over a pale cyan wall:** surface v2 now uses
    stable **37/13/9 m** detail sourced from rendered normal, slope, solar aspect, drainage, exposed
    stone and height, with bounded **0.38/0.46/0.36/0.45** humus, vegetated-soil, slope-substrate and
    stone blends over gray-green source colours. Forest v5 takes two stratified samples per surface
    cell, growing the horizon from **598** trunks plus **220** understory crowns to **1,203** trunks
    plus **400** understory crowns, or **1,603** crowns total, without increasing the existing six
    instanced draws. Far/near layers carry **555/648** trunks and **176/224** understory crowns; every
    root remains barycentrically supported on its exact rendered triangle with zero positive
    clearance. The ridge/boundary views change **16.52% / 28.29%** above 3/255 and resolve as a
    continuous terrain–substrate–canopy mass. The accepted run records **59.9 FPS median, 40.5 FPS
    1% low and 24.7 ms worst frame**.

69. **The foreground brook stone exposed a physically impossible black horizontal belt:** investigation
    separated three causes instead of hiding the defect with light. The historical fluvial shell had
    collapsed sphere latitude rings and overlapping coplanar faces; small bed/bar stones rested on
    duplicated sphere poles; and their spherical UV maps produced a latitude belt on the replacement
    ring stack. The accepted pass rebuilds both carriers as closed monotonic support-ring-to-crown
    shells, separates side-course vertices from the downward cap, records zero collapsed support
    rings and minimum triangle areas of **0.012756 / 0.025994 m²**. Historical lag clasts expose
    **29** terrain contacts and retain the exact **1.06–1.315 m** long-axis/collider contract; all
    **56** small stones expose **21** contacts. Spherical UV sampling is retired from the small-stone
    material in favour of seam-free vertex mineral variation, #858e89 bounded colour, 0.96 roughness
    and zero metalness. The grazing review changes **7.11% / 3.32%** above 3/12 out of 255 and now
    shows one continuous gray dielectric mass with no black belt or bright lower pedestal. The final
    run records **59.9 FPS median, 39.2 FPS 1% low and 25.6 ms worst frame**, passes **194/194** tests
    and all six complete-run checks without browser or WebGL errors.

## Current editorial parity position

Against pinned Web Ocean commit 6496c77d37c12e803108c8f932680a7710a62c1c, the current fixed-
frame editorial estimate is **about 96% with ±3 percentage points uncertainty**. The estimate reflects
the accepted terrain, canopy, atmosphere, water, geological and contact passes; it is not derived from
the mechanical PASS counters. No known P0 physical-contact, open/overlapping-shell, black-band,
floating-root, duplicate-bank or navigation-truth defect remains in the current review set. Residual
differences are P1/P2 production breadth, off-screen optical fill, species/material variety and the
intentional difference between a gameplay camera and Web Ocean's showcase composition. Equality to
another project's subjective image quality cannot be proven deterministically.

## Remaining gap, ranked

### P1 — curated asset and material fidelity

Web Ocean's shore frame is carried by curated ship, rock, tree and terrain assets with distinct
silhouettes and consistent authored surface response. Plateau now has original libraries for its
main canopy, tree-fern, fern, ground-cover, brook-boulder and basalt roles, but each
library is intentionally small. The authored branch hierarchy, distinct Araucaria/tree-fern/broadleaf
grammars, twelve-cohort forest boundary, clustered understory, terrain zoning, triplanar boulder treatment, three code-authored
non-columnar rock families and coherent red-basalt joint sets materially reduce the prototype read.
The additional bark-geometry, leaf-atlas family, v2 collared-branch/short-shoot Ginkgo, basalt,
brook-boulder, three-family fern, three-family ground-cover, three-family mature tree-fern and four-
family canopy-tree asset paths, the four-family canopy/hero-sourced forest-floor detritus layer, the shared
source-coupled vegetation-albedo contract, the non-emissive Iguanodon skin-energy calibration and
correlated geological-material gates are now complete. These assets prove
reproducible offline organic and geological asset paths, and the terrain proves one coherent
multi-channel material path, not a broad production library. Plateau now has bounded age/wind/habitat-
driven leaf retention, stable bark scarring and lamina damage, rounded leaf topology, vertically
stratified upper scaffolds and five closed broken-limb topologies. All twelve boundary cohorts use
complete original tree geometry, v7 fills supported branch spans and upper crown volume instead of
terminal-only clusters, and the separate
background ridges now carry 1,203 mature trees plus 400 terrain-sourced juvenile/shrub crowns in the
same six draw calls, with branch-supported eleven-cohort broad crowns, leader-supported four-whorl
narrow crowns and
process-coupled ridge surface response. It remains a bounded distant kit rather than a new hero asset library; foreground
crown topology and within-family species/age response remain visibly repetitive compared with Web
Ocean. Plateau also lacks sculpted transition quality, broader fine branch-junction/seasonal/pruning
variation beyond the one v2 Ginkgo and four canopy families, a broader
project-original rock set, higher-resolution creature surface detail, production texel density and
fracture variation, and a broader non-repeating species-specific detritus/soil transition library.

**Inference:** this is now the largest residual breadth gap, not a blocking physical defect. Further global lighting tweaks cannot replace
several approved hero environment assets and one consistent material-authoring pipeline.

### P1 — off-screen reflection/refraction fill and production water detail

The brook now projectively samples a real mirrored scene through camera-selected gravity-reach
planes, providing local parallax without applying one wrong mirror height to the whole ribbon. A
same-camera bounded SSR trace now fills visible opaque geometry before the planar/probe fallback. Its
transmission now follows the measured `0.002..0.2848 m` water column, freshwater Fresnel response and
Beer–Lambert absorption; roughness, stochastic normal slope and local aeration are bounded by the
same shallow-stream scale and grade evidence. Rendered upper-column clasts now add bounded local
potential-flow deflection, upstream compression and downstream shedding/aeration without static
overlays. A 289-row by 13-cross-sample carrier now applies the same pressure/speed-up/shedding field
as centimetre-bounded free-surface geometry, so the close response is no longer normal-only.
Same-camera scene colour/depth reflection and
refraction close the painted-bed-only gap for visible opaque geometry, but—as screen-space methods—
they cannot recover objects outside the capture or behind
another foreground surface. Web Ocean's FFT waves and planar-plus-SSR combination therefore remain
materially richer; FFT ocean displacement itself is not appropriate for this shallow creek. The
remaining shallow-water gap is physically sourced off-screen content, higher-resolution undercut/bed
transitions and production-scale non-repeating surface/bed detail—not another exposure, fake optical
depth, static ripple decal or basin-wide plane. Current bounded grade/obstacle evidence still cannot
determine exact velocity, discharge, transport competence or a physical wave spectrum.

**Boundary:** equivalent maturity should be a brook-specific local reflection/refraction treatment.
It must preserve the approved silver broken ribbon, route readability and current performance gate;
copying ocean scale, saturation or wave amplitude would violate the design.

### P1 — terrain macrostructure and authored dressing

Web Ocean combines large relief with many curated rock and vegetation clusters. Plateau deliberately
keeps the exposed centre sparse. Drainage/slope/exposure zoning, correlated distance-faded triplanar
aggregate and bounded indirect cavity,
formation-sourced basalt weathering, two actual eroded ridge volumes and the connected eastern basalt
shoulder now combine with canopy/hollow humus retention, brook-sourced saturated margins, separate
inner-bend point-bar, older floodplain-silt and outer-bend cut-bank material families, slope/exposure
washout and footfall compaction. Geometry, material response and the small bed/bar stone batch share
the rendered brook's process field rather than using a symmetric painted ring or uniform scatter.
The new 360-instance forest-floor layer also supplies canopy-sourced curled leaves, twigs, bark and
husks only where humus, route, bank, mineral and slope evidence permits them. That organic layer now
borders a 640-instance creeping moss, clubmoss and humid-grass layer sourced from the
actual 128-tree canopy plus recorded secondary shade and moisture sources; disturbance exclusions
keep the open glade, compacted path, active bar and cut bank legible. All three travelled
routes now read through that same terrain/ecology material rather than transparent duplicate meshes,
and both ridge volumes now carry 1,203 mature background trees plus 400 juvenile/shrub crowns
established from their own slope, drainage and rock-exposure fields. This closes the paper-cut cyan skyline without extending collision or filling
the approved playable centre. Together these passes have reduced the
single uniform-brown response, flat landmark plane and paper-cut horizon without filling the approved
open centre. It has not closed production terrain fidelity: the central surface now carries
shading-rate relief, a bounded cavity hierarchy, river-process sorting, one angle-of-repose
source-rock transition and one small organic-fall library, but it still lacks broader sculpted
soil-to-rock interfaces, high-resolution bank undercuts/strata, and the curated dressing diversity
and density visible in Web Ocean.

### P2 — production volumetric-cloud self-scattering and transition depth

The visible hero banks retain view-independent 3D intersection, optical-depth accumulation,
directional self-shadow and aerial perspective. Plateau now also has a camera-centred/tiled overhead
layer whose visible coverage and direct-light attenuation sample the same advected world-space
density along the approved sun vector. This closes the disconnected cloud/ground-shadow system and
preserves physically zero local shade for anti-solar distant banks. The remaining gap is narrower:
the overhead field uses three visible-layer and two solar-path density samples rather than Web
Ocean's richer atmosphere-scale volumetric integration, so internal multiple scattering, edge
silvering and cloud-to-cloud transition depth remain less developed. Any extension must keep visible
cloud and terrain light on the same density, retain indirect sky fill, and avoid screen-facing cards,
shadow decals or a basin-wide exposure reduction.

### P1 — showcase composition versus gameplay composition

Web Ocean's repository images are authored landscape showcase shots. Plateau's normal view must keep
route, threat, subjects, camera tool, plate feedback and minimum-viewport UI legible at once. Fixed
review cameras now make an honest environment-only comparison possible, but they do not remove the
functional constraints from the shipped first-person camera.

### P2 — deliberately rejected effects

Plateau's approved art direction rejects gameplay-obscuring depth of field, uncontrolled bloom,
glossy theme-park jungle treatment and darkness that hides decisions. These are not parity gaps to
close blindly even when they contribute to another project's showcase frame.

## Next production gates

1. The first code-authored non-columnar rock, second leaf-atlas, second bark-geometry, v2 Ginkgo,
   three-member basalt-shelf library, stability-limited continuous escarpment, original brook boulder,
   three-family original fern library, three-family original ground-cover library, mature tree-fern
   library, four-family mature canopy-tree library, calibrated Iguanodon skin energy, four-family
   canopy/hero-sourced forest-floor detritus, 640-member canopy/moisture-sourced low-ground succession,
   v7 rounded-lamina, stratified-crown and closed broken-limb coverage, complete 144-member
   boundary forest, v5 distant ridge density and crown microcohorts and correlated geological-material gates are
   complete. The next asset gate is
   deeper **project-original** within-family species/age structure, branch-junction and pruning
   variation with consistent texel density and recorded provenance, including more non-repeating litter/soil
   transitions rather than merely increasing the accepted 390-instance count or cloning the same
   mature crown. The connected-environment boundary does not permit copying Web Ocean's third-party
   asset set; do not multiply the present kit merely to increase density.
2. The short gravity-reach planar segmentation, bounded same-camera SSR and measured-column
   shallow-water optics are complete. Extend water only through locally authored bed/obstacle flow
   variation or physically sourced off-screen content. The accepted depth-valid reflection/refraction
   paths and planar target
   restore render target, viewport, scissor, XR, shadow and visibility state. QA rejects
   `GL_INVALID_*` warnings after an earlier frame-zero capture ordering caused sampler mismatches and
   missing instanced geometry; it also rejects a return to static overlay rings, fake depth or
   ocean-scale waves unsupported by the brook's hydrology.
3. The two-depth anti-solar horizon field and same-density overhead cloud/direct-light coupling are
   complete. Any further cloud extension must improve self-scattering or transition depth without
   separating visible density from terrain attenuation. Preserve the 12/18-step horizon ladder, the
   low-quality puff fallback, the overhead low-quality disable policy and the current frame-time
   gate; do not reintroduce disconnected shadow decals, screen-facing cards or global exposure cuts.
4. The terrain-cohort/understory ridge forest, supported crown-microcohort variation and process-
   coupled surface are complete. Extend the ridge only with an approved project-original species or
   exposure/material family that changes identity rather than count; do not multiply the accepted
   1,203-tree / 400-understory
   system merely to chase density. Preserve the
   exact-triangle root support and closed/buried checks; use `ridgeVolume` to reject floating/open
   geometry, then compare the same `brook`, `basalt` and `glade` frames rather than tuning against
   moving gameplay cameras.
5. Route- and brook-bank-overlay retirement is complete. Any later puddling, rutting, exposed-root or
   undercut-bank detail must extend the same control-line terrain field and shared height/material
   response; QA rejects a return to transparent decals, duplicate ribbons or any visual ground/bank
   surface that can diverge from collision and navigation truth.

## Latest mechanical evidence

The final authoritative [`../current-run/report.json`](../current-run/report.json) records:

- first rendered frame: **2,205.8 ms** in the authoritative local Chromium run;
- 180 sampled frames: **59.9 median FPS**, **39.4 FPS 1% low**, **25.4 ms worst frame**;
- the cloud field retains **11** Beer-Lambert participating-medium volumes in six-near/five-far
  anti-solar horizon bands, the accepted 12/18-step ladder and a 56-puff low-quality fallback.
  Maximum bank-centre sun alignment remains `-0.1768`, so those banks correctly produce zero local
  basin shade. One additional deterministic **256 x 256** texture now carries the **2,048 m**
  overhead density field at **620–840 m**, observed at `0.2031..0.8381` density, `0.5095` mean and
  `0.3456` coverage. The visible deck and **200** physical materials sample that same advected field;
  two sun-path samples clamp direct transmittance to at least **0.58**, leave indirect light intact,
  replace the prior deck draw call and add no collision or draw call. Low quality disables both
  overhead visibility and attenuation: **PASS**;
- the hero Ginkgo v2 records **3,878,144 bytes**, **123,624 triangles**, the same two draw calls,
  seven buried buttress roots, ten collared scaffolds, twenty secondaries, **68** twigs, **88**
  leaf-bearing shoots, four sealed pruning stubs and **1,971** supported **0.205–0.30 m** fan leaves.
  Maximum daughter/parent area ratio is `0.9248`, maximum leaf support gap is zero, and two 128²
  correlated bark textures bound roughness to **0.86–0.98** and relief to **8 mm**. Its added flex
  channel keeps root/trunk at zero, orders scaffold/secondary/twig/leaf compliance, caps outer-tip
  motion at **0.12/0.024 m** horizontal/vertical, shares exact colour/depth displacement and resets
  to a fixed pose under reduced motion. The fallback is hidden, visual error is null, and
  anchor/collision/navigation authority is unchanged: **PASS**;
- brook hydrology records 73 surface rows, confluence row 35, zero cross-channel grade,
  `0.0008..0.102611` downstream grade, at most 0.1273 m additional ponding and 19 local reflection
  reaches. The planar/refraction captures and bounded SSR are ready, the active plane normal is normalized/upward,
  seven reach changes follow the route/review cameras, and `renderError` remains null: **PASS**;
- brook optics records terrain-derived base water depth `0.002..0.288 m`, IOR `1.333`, F0 `0.02037`,
  absorption `[0.72, 0.22, 0.13]/m`, roughness `0.11..0.34`, grade/bank/clast-bounded aeration and zero
  static overlay ripples. Balanced quality records a **38 m / 12-step** same-camera depth-bounded SSR
  trace over the planar/probe fallback. The run completed 172 planar and 172 refraction captures with
  zero browser console errors while retaining the explicit occluded/off-screen, no-discharge and
  no-exact-wave-spectrum boundaries: **PASS**;
- the free-surface carrier records **289 rows**, **13 cross samples**, **3,757 vertices** and
  **6,912 triangles**. One interpolated gravity base level remains shared across every row; the
  rendered-clast vertex response is bounded to **+3.2 cm** upstream compression, **-1.2 cm** shoulder
  drawdown, **1.8 cm** alternating wake amplitude and **±3.8 cm** aggregate displacement. The dynamic
  displacement is included in the fragment water column, adds no collision/bank authority, and keeps
  the no-CFD/no-volume-conservation-proof boundary explicit: **PASS**;
- rendered-clast obstacle flow records **62** exact settled candidates, **25** channel-boundary
  rejections, **37** upper-column contacts and a **12**-obstacle fixed shader budget with
  **4/8/12** low/balanced/high activation. The accepted field selects one historical flood-lag clast
  plus active-bed stones, uses normalized branch-converging downstream directions, caps aggregate
  normal slope at `0.052` and source aeration at `0.31`, retains zero static overlay ripples, and
  preserves explicit no-CFD/no-discharge/no-transport-proof boundaries: **PASS**;
- brook-bank integration records one shared render/collision heightfield, terrain-owned wet-bank,
  point-bar, floodplain-silt and cut-bank material fields, `0.76..0.99` wet-bank roughness, two
  zero-child side anchors, and exactly **zero** bank overlay geometries or draw calls. The former one
  broad and two side ribbons are absent rather than hidden or alpha-zeroed: **PASS**;
- Iguanodon skin records an opaque non-emissive dielectric material with approximate IOR `1.42`,
  linear albedo multiplier `[0.70, 0.64, 0.52]`, authored roughness/normal sources, unit normal
  strength and zero metalness, clearcoat, transmission and emission. The packed green-channel
  roughness is linearly preserved inside a bounded **0.72–0.94** dry-scaled-skin range rather than
  multiplying down to polished values. A 52° crease gate repairs
  `19,797` vertices in `9,902` coincident-position groups; the fixed subject frame passes the
  mechanical framebuffer guard and the browser records zero console errors: **PASS**;
- forest-floor detritus records **390** instances across four closed project-original organic
  families in four draw calls. The original 360 canopy-habitat clusters remain evenly split across
  curled leaf, twig/bark and cone/husk families; thirty additional bilobed fan-leaf clusters occupy
  **1.45–4.85 m** inter-root sectors around the actual Ginkgo anchor, at least **0.18 rad** from each
  authored root axis. All **79,560/79,560** support samples remain within **-0.8..+1.47 cm** of the
  rendered heightfield; route wear is exactly zero across accepted placements, wet-bank/mineral/slope
  gates remain bounded, materials are opaque non-emissive dielectrics, and the layer has no solid
  collision authority. Its fixed review crops pass the mechanical framebuffer guard with zero
  browser console errors: **PASS**;
- canopy-sourced ground succession records **640** instances in three draw calls: 387 creeping moss
  sprays, 196 clubmoss sprays and 57 humid grass tufts. The authoritative ecology counts all 128
  main canopy trees plus eighteen recorded secondary shade sources, raising mean humus from the
  under-sourced `0.0084` to `0.1009` while route and open-glade samples retain zero bryophyte cover.
  All **640/640** roots are buried exactly 2.6 cm into the shared rendered heightfield; route,
  excessive mineral exposure, active point bar, cut bank, saturation and steep slope are excluded.
  The humid-grass family uses one 752-triangle closed tuft containing twelve tapered/cambered blade
  volumes and no visible flattened-sphere carrier; opaque non-emissive zero-metalness materials cap
  environment response at 0.12–0.18. Non-solid compressible collision semantics pass, and the fixed
  inspection frame records zero browser errors: **PASS**;
- route surface evidence records the main route and both forks as one
  `terrain-integrated-footfall-compaction-v1` response sourced from their authored navigation control
  lines. Litter suppression, colour, optical relief and roughness remain inside the shared terrain;
  overlay geometry/draw-call counts are both **zero**, collision change is `none`, and the fixed route
  crop plus the same brook/glade crops pass the mechanical framebuffer guard with zero browser console
  errors: **PASS**;
- canopy-tree, mature tree-fern, fern and ground-cover runtime snapshots all record the shared
  `source-coupled-bounded-foliage-albedo-v1` contract; material/texture layers retain family pigment,
  near-neutral instance multipliers respond to wetness/slope/individual sources, and every leaf
  remains zero-emission, zero-metalness and shadow-coupled: **PASS**;
- boundary succession records twelve 12-member cohorts, a 72/36/36 mature/submature/pioneer split,
  144/144 load-bearing trunk radii outside navigation, 69 crown-overlap links and 88 linked members.
  All **144** boundary trees across the southern, west and east cohorts use the complete original
  canopy asset in eight draw calls with **4,080/4,080** root contacts supported; the four-draw-call
  simplified batch is hidden and remains fallback-only. Stable age/wind/habitat leaf retention spans
  **0.8840..0.9543**, averages **0.9151**, marks 18 instances below 0.90 and shares one complete-leaf
  rejection rule between colour and depth-shadow passes: **PASS**;
- the near/far ridge forests record **1,203** non-solid background trees plus **400** terrain-gated
  juvenile/shrub crowns in six instanced draw calls. Far/near layers carry 555/648 trees and 176/224
  understory crowns. Establishment follows each rendered ridge's height, triangle normal,
  drainage/moisture and exposed-stone fields; all **1,203/1,203** mature roots and **400/400**
  understory roots are sampled barycentrically on the exact rendered triangles, embedded 6/4.5 cm,
  and have zero positive clearance. Each broad crown contains eleven closed leaf cohorts and nine closed tapered
  structural branches in the existing broad-crown draw call; every branch overlaps its trunk/parent
  support and terminates inside its target cohort. Each narrow crown contains four closed whorls
  around one closed tapered leader. Branch/leader vertices stay outside foliage damage/lean
  deformation. Broad/narrow shared geometries remain bounded to **520/500 triangles**.
  Far/near architecture counts are **387/295/49** and **374/326/172** juvenile/mature/emergent, and
  source-damaged crown counts are **38/42**. The ridge surface adds stable 37/13/9 m detail
  gated by rendered normal, slope, solar aspect, drainage, exposed stone and height, while materials remain opaque non-emissive
  zero-metalness dielectrics and no collision/navigation authority is added: **PASS**;
- late-humid daylight records sky-to-residual-ambient `8.5`, sun-to-sky `3.8971`,
  PMREM-to-sky `0.4412`, `0.0058/m` fog extinction and unchanged `2.65` direct sun: **PASS**;
- Strong field record and clean restart: **PASS**;
- all three distinct original basalt variants loaded, the procedural upper fallback hidden, **60/60**
  bottom vertices buried at each source, their sampled mass centres above support and each complete
  footprint outside navigation: **PASS**;
- the basalt support terrain is a continuous no-overhang heightfield whose rise starts beyond the
  player capsule's reachable centre, and balanced GTAO records a 0.72 m world-space radius: **PASS**;
- basalt talus records **44** joint-bounded angular fragments sourced downslope from **18** cooling
  pillars in one instanced draw. All **44/44** placements use eighteen terrain-normal-aligned support
  vertices, **1.8–3.97 cm** burial, **-3.97..+1.30 cm** clearance and a complete non-solid footprint
  beyond navigation under a dark weathered oxidized-basalt dielectric material: **PASS**;
- both broadleaf families record branch-anchored wind, bounded displacement, shared colour/depth
  uniforms and zero reduced-motion strength: **PASS**;
- the east escarpment now rises 3.15 m over 3.35 m in one continuous no-overhang heightfield; its
  `1.410448` maximum analytic gradient remains below the declared `1.428148` intact-bedrock limit.
  World-height strata modulation is gated by physical bedrock exposure, capped at 11% albedo
  reduction and adds zero overlay geometry. The rejected decorative slope-exposure library is absent
  from the runtime and all three basalt shoulders retain **60/60** supported bottom samples: **PASS**;
- all 18 forest-floor deadfall branches use terrain-tangent alignment and multipoint underside
  settlement; all **78/78** support samples remain within **-2.38..+1.20 cm** of the rendered terrain
  and accepted terrain slope remains at or below `0.1189`. Their three 696–912-triangle families use
  closed curved trunk/branch/splinter volumes, mapped furrowed bark, distinct end grain and no flat
  shading: **PASS**;
- all ten brook-bank driftwood instances use the same closed physical family under a separately
  water-darkened material; all **41/41** support samples remain within **-3.42..+0.80 cm** of the
  rendered terrain over accepted slopes at or below `0.136`, with no collision authority: **PASS**;
- the original brook boulder v6 loaded with its procedural fallback hidden; all **570/570** main-mass
  and independently settled spall support samples remain between **-8.5 cm** and **+0.69 cm** of the
  same rendered terrain heightfield, while collision authority stays on the main mass. The closed
  **1.8200 m³**, **1,344-triangle** mass retains a **2.4794 m** world long axis, 48 sectors, fourteen
  rings, continuous normals across more than 90% of coincident vertices and selective 42° fracture
  creases. Runtime evidence records the same immobile residual-bank transport class,
  coordinate/porosity-driven weathering and zero emission/metalness: **PASS**;
- the fluvial rock transport snapshot records **36** active-bed and **20** point-bar lag stones at
  `0.16..0.55 m` with no collision authority, six static historical lag clasts at
  `1.06..1.315 m` and maximum brook-width fraction **0.387**, and one **2.48 m** immobile residual
  bank erratic. Historical clasts use one closed non-overlapping support-ring shell, split
  side/downward-cap normals, zero collapsed support rings, **29** contacts and minimum local triangle
  area **0.012756 m²**. It also records that grade-only hydrology cannot prove exact competence:
  **PASS**;
- the six bedded glade-margin slabs use one closed `2.1064 x 0.6265 x 1.599 m` joint-bounded local
  mass with two physically connected bedding ledges, 31-degree crease-preserved normals and no
  sphere-derived silhouette. Each terrain-aligned placement records at least **54** contact vertices
  and maximum support clearance **-3.89 cm**; the focal eastern slab's visible envelope and solid
  collider were reduced together rather than decoupled: **PASS**;
- terrain records **24,505** vertices and source-coupled humus, wet-bank, mineral-exposure,
  route-wear, `0..0.5699` alluvium and `0..1` bryophyte ranges with `randomMasks: 0`; brook relief and
  material masks share the rendered control points, distinguish `0..0.5699` point-bar deposit,
  `0..0.4145` floodplain silt and `0..0.8533` cut-bank exposure, and the glade has no
  emissive/transparent ground-light disc. Below that shared heightfield, continuous triplanar
  47/13 m albedo, roughness and height-derived normal detail plus indirect-only cavity response are
  coupled to wetness, alluvium and route compaction. The eastern face additionally records final-mesh
  slope classification, source basalt exposure and stable-toe colluvium without changing collision
  topology. The same terrain is now the only brook-bank surface; three raised bank ribbons and their
  **1,296** triangles are absent, with bank overlay geometry/draw-call counts both zero: **PASS**;
- brook sediment evidence records **36** active-bed-load stones and **20** inner-bend coarse-lag
  stones, maximum support clearance **-1.18 cm**, minimum **21** contact vertices, one closed
  non-overlapping support-ring shell, seam-free vertex mineral material, no collision
  authority, and route-wear exclusion for every point-bar placement: **PASS**;
- all three original fern variants loaded across **132** placements in six runtime draw calls, the
  procedural primary and giant-foreground fallbacks hidden, all **1,716/1,716** rhizome support
  vertices inside the contact band, and colour/depth wind displacement coupled through the same
  uniforms: **PASS**;
- a second quality-gated fern batch replaced **24** tree-fern skirts, **36** wetland accents and
  **28** route-margin accents in six additional draw calls; all **1,144/1,144** rhizome support
  vertices and all three mature dimension envelopes pass, with every procedural accent fallback
  hidden at balanced quality: **PASS**;
- the five-plant brook-response stand uses a third cached original-fern instance batch with only two
  active draws; the oversized procedural fan fallback is hidden, every plant stays under its
  **1.12 × 0.46 m** envelope, all **65/65** rhizome contacts remain **2.99–3.01 cm** below grade, and
  its response-specific wind shares exact colour/depth displacement uniforms: **PASS**;
- all three original ground-cover v2 variants loaded across **360** placements in six runtime draw
  calls, all **5,400/5,400** subgrade-rhizome support vertices at **-5.35..-5.05 cm**, all three
  reduced mature diameter/height envelopes passing, and zero horizontal relocation. The formal
  support geometry is below soil rather than a visible polygonal pot: **PASS**;
- all three mature tree-fern variants loaded across the same **12** authored margin anchors in nine
  draw calls, with the procedural trunk/crown fallback hidden; **408/408** root contacts are buried,
  all trunks remain vertical, every crown/height mature envelope passes, trunk-only collision remains
  registered, and rachis/leaflet colour and depth motion share the same bounded wind: **PASS**;
- all four original canopy-tree v7 variants loaded across the same **128** authored anchors in eight
  draw calls, with all nine procedural tree layers hidden; **3,540/3,540** root contacts are buried,
  all trunks remain vertical, every 10 m crown / 9.9 m height envelope passes, trunk-only collision
  remains registered, and 3,942 rounded cambered leaves root at 594 distributed nodes along closed
  primary, secondary, tertiary, upper-scaffold and Araucaria-whorl axes. Five removed limbs terminate
  in closed splintered stubs, and the leaf budget is redistributed vertically rather than increased.
  The runtime renders **1,081,758** tree triangles in the same eight instanced draws, while main-route
  retention remains within **0.9341..0.9639** with a 0.9500 mean, stable per instance and identical
  in colour/depth passes:
  **PASS**;
- the former five cover arches contain zero cross-trunk bridge geometries. Ten complete original
  canopy-tree instances occupy the same ten root/collider anchors across four non-empty silhouette
  families and render **80,478** v7 triangles in eight instanced draws; all **286/286** support samples
  are buried, fallback geometry is hidden and the fallback's
  ten individual boughs each remain attached to one trunk with at most **2.34 m** cantilever:
  **PASS**;
- all recorded field and fixed-review crops, including the brook-detail, brook-obstacle-flow-detail,
  brook-free-surface-profile, basalt-detail and ridge-volume
  inspections, full-tree and root-contact Ginkgo inspections, the low geological-material view and
  the escarpment-contact, stability-limited-escarpment, brook-boulder, grounded-fern, mature-ground-cover and
  mature-tree-fern, canopy-tree, Iguanodon-skin, forest-floor-detritus, terrain-integrated-route and
  complete-boundary-forest and root-supported-riparian-cover views:
  **PASS**, with no crushed/blank-frame failure under
  the mechanical framebuffer guard.

These numbers prove execution and basic visual health only. They do not prove that Plateau has
reached Web Ocean's subjective visual quality. The 1% low remains above the 30 FPS product gate and
is a single local run, so it is not used to claim a general performance improvement.
