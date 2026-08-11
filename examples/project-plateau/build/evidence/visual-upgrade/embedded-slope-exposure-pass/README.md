# Embedded slope-exposure pass

## Physical requirements

- The exposed face is not a decal. Every bed and weathering ledge is a closed volume with outward
  normals, a buried basal contact and a back volume embedded in the raised eastern shoulder.
- The strata may remain non-solid only while the complete visible footprint stays beyond the player
  capsule envelope. The player centre stops at `x=28.4`, the capsule edge at `x=29.0`, and all three
  measured asset footprints begin beyond `x=29.04`.
- Horizontal ledges overlap their parent beds; unsupported overhangs, open planes and loose fragments
  balanced on the face are rejected.
- Rock remains a rough, non-metallic, non-emissive dielectric. Visibility may be recovered by fixing
  face orientation and albedo multiplication, not by emission, bloom or global exposure.

## Accepted changes

- `slope-exposure-original-v1.glb` adds three deterministic project-original variants:
  `broad-weathering-bench`, `split-drainage-lens` and `stepped-ironstone-rib`.
- The 218.3 KB library contains 1,568 total triangles. Each selected exposure uses two draw calls for
  five or six overlapping strata and two or three short bed-supported ledges.
- The three runtime anchors sit below the established basalt sources at `z=-50`, `-26` and `-3`.
  Their back vertices are buried in the upper shoulder while the west face remains visible at the
  escarpment toe.
- The loader reuses the correlated basalt albedo, roughness and relief package, clamps all materials
  to rough non-emissive dielectric response, selects one distinct variant per source and records
  grounding evidence in the runtime snapshot.
- `slopeExposureDetail` adds a repeatable close review camera without moving the gameplay camera or
  changing collision truth.

## Rejected trials

- `rejected-inward-face-normals/` records the first integration. The closed geometry existed, but the
  west face wound toward the buried east side and was removed by front-face culling. Increasing light
  could not repair a topological orientation error.
- `rejected-underpowered-albedo/` records the corrected faces before the material-energy repair. A
  dark vertex multiplier was multiplied by the already coloured geological map, hiding most of the
  real surface. The accepted mid-value oxide multiplier remains below white and uses no emission.

## Evidence

`before/` is the verified canopy-wind baseline. `after/` is the authoritative complete run. Its
`report.json` records:

- all three original variants loaded, two draw calls per exposure and no loader error;
- basal support ratios of **1.0** with maximum clearances from **-0.4339 m** to **-0.5761 m**;
- buried-back ratios of **1.0** with maximum clearances from **-0.7853 m** to **-1.1146 m**;
- **365 / 434 / 393** west-face vertices measurably exposed above the analytic terrain;
- minimum world `x` values of **29.0555 / 29.0512 / 29.0465**, all beyond the `x=29.0`
  capsule edge;
- **452.3 ms** first frame, **59.9 median FPS**, **39.4 FPS 1% low** and **25.4 ms** worst frame;
- Strong field record, clean restart and all mechanical visual-health gates passed with no console,
  page or WebGL errors.

This pass replaces a smooth source-local cliff patch with physically embedded geological exposures.
It does not establish Web Ocean parity: most slopes still lack mature species zoning, broad curated
rock variation and production texel density.
