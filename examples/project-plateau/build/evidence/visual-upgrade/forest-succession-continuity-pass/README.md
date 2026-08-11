# Terrain-sourced forest succession continuity pass

## Target

Replace the evenly scattered horizontal tree bands with a forest boundary that reads as connected
terrain ecology while preserving the approved open family/route sightline. The pass may not add
reachable visual-only trunks, hide collisions, or solve density by putting unsupported crown blobs
inside the glade.

## Accepted physical and composition model

- `forest-succession.js` redistributes the existing 144 distant-tree budget into twelve deterministic
  boundary cohorts: six beyond the southern navigation limit and three each beyond the west/east
  limits. Every trunk radius remains wholly outside navigation; only pliable crowns may overhang.
- Cohorts contain 72 mature, 36 submature and 36 pioneer size classes. Terrain height, gradient and
  wetness plus boundary exposure drive crown morphology selection and bounded far-LOD wind damage.
  Far LOD height, trunk diameter and crown size follow coupled exponents rather than independent
  stretch values.
- The 72 west/east edge members use the existing project-original canopy-tree GLB, preserving its
  buried root mantle, continuous tapered trunk, closed branch hierarchy and attached leaves. Their
  whole-tree scale represents the cohort size class without breaking the internal load path.
- The 72 true southern-distance members retain the inexpensive supported trunk/crown LOD. They remain
  beyond the navigation boundary and outside the local directional-shadow pass; the nearer complete
  edge assets carry the visible local shadow relationship.
- The open centre, family positions, route geometry, hydrology, daylight, exposure and vegetation
  albedo contract remain unchanged.

## Visual rejection and acceptance

`rejected-near-lollipop-crowns/08-review-brook.jpg` records the first layout. It moved the old
far-distance crown blobs into the midground, producing pale unsupported-looking lollipop silhouettes;
the added shadow work also delayed the bounded reflection-reach update. That run was stopped by the
existing north-headwater assertion rather than weakening the check.

`rejected-mixed-edge-lod/` replaces mature edge trees with complete original assets and passes the
runtime gates, but fixed glade/canopy views still expose pale submature/pioneer crown blobs mixed into
the near edge.

The accepted `after/` uses complete original assets for all 72 west/east members and confines the
simple LOD to the truly distant southern boundary. The brook and glade frames retain the full route
and dinosaur family silhouette while the side edges become irregular multi-height cohorts instead of
isolated trees or a uniform wall. This is a verified composition improvement, not a claim that crown
leaf density or production asset variety now equals Web Ocean.

## Evidence

`after/report.json` records:

- 144/144 load-bearing boundary trunks wholly outside navigation, twelve cohorts with 12 members
  each, the exact 72/36/36 age split, 69 within-cohort crown-overlap links and 88 linked trees;
- 72 complete original edge trees in eight draw calls with 2,052/2,052 root-contact vertices
  supported, gravity-only settlement and no collision mismatch;
- Strong field record, clean restart, ready segmented reflection/refraction and no render error;
- **634.9 ms** first frame, **59.9 median FPS**, **39.0 FPS 1% low** and **25.7 ms** worst frame over
  180 sampled frames.

The frame figures are one local run and only prove that the established `1% low >= 30 FPS` gate was
preserved. They do not prove broad hardware performance or subjective parity.
