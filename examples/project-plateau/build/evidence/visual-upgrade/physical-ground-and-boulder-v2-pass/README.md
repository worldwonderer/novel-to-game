# Physical ground and brook-boulder v2 pass

## Target

Correct the remaining uniform-brown terrain read and the creek boulder shown in review as an
implausible white/charcoal polyhedron. The pass may only use world-space sources and material energy;
it may not hide either problem with exposure, bloom, emission, screen-space decals or random masks.

## Accepted ground changes

- The terrain now carries four deterministic ecological weights: canopy/hollow-retained humus,
  brook-hydrology wet bank, slope/exposure mineral washout and route-footfall compaction.
- The brook and all three route masks share the exact authored control points used by their rendered
  ribbons. Eighteen visible canopy/cover sources drive litter; no random mask is authoritative.
- The same weights alter albedo, roughness and relief strength. Saturated banks flatten aggregate
  relief and lower roughness; retained humus darkens and remains rough; exposed mineral shoulders
  become rougher; compacted paths suppress litter and micro-relief.
- The fake amber ground disc in the glade was removed. Directional sunlight remains the energy
  source; only bounded low-opacity humidity scatter reveals the lane.
- Terrain resolution increased from 10,961 to 24,505 vertices so ecological boundaries no longer
  expose individual interpolation triangles. The redundant route overlays were halved in opacity.

## Accepted boulder changes

- `brook-boulder-original-v2.glb` preserves the v1 closed topology, broad buried support polygon,
  five independent sediment-supported spalls and collider registration.
- V1's vertex albedo depended on surface-normal orientation. That painted the sun-facing half chalk
  white and the other half slate dark. V2 uses coherent object-coordinate mineral/weathering bands
  and continuous normals instead.
- The wet contact is restricted to local `y=-0.525..-0.37`, near the buried base, rather than
  darkening roughly the lower third of the whole mass. It also lowers roughness to 0.72 only in that
  contact band.
- The material stays a non-emissive, zero-metal dielectric with seam-free correlated triplanar
  albedo/roughness/relief.

## Rejected trials

- `rejected-double-dark-albedo/` multiplies the already-dark GLB vertex albedo by the same dark
  runtime tint and makes the boulder nearly black.
- `rejected-wide-capillary-band/` fixes the normal-facing colour split but leaves an over-wide dark
  lower band, recreating the same false two-material read at a different height.

## Evidence

`after/report.json` records:

- terrain ecology ranges: humus `0..0.847`, wet bank `0..1`, mineral exposure `0..1`, route wear
  `0..1`, with `randomMasks: 0`;
- 24,505 terrain vertices and the source-coupled ecological/geological material path;
- boulder v2 loaded, fallback hidden, 47/47 support vertices at `-4.0..-2.07 cm` clearance, and the
  existing main-mass collision authority unchanged;
- **674.5 ms** first frame, **60.2 median FPS**, **39.5 FPS 1% low**, **25.3 ms** worst frame;
- Strong field record, clean restart and every mechanical visual-health gate passed without console,
  page or WebGL errors.

These checks prove source coupling, support, execution and bounded frame cost. They do not prove
subjective parity with Web Ocean.
