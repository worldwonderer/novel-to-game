# Original brook-boulder asset pass

## Physical requirements

- The route obstacle must be a closed mass with a broad support polygon below its projected centre of
  mass, not a stretched sphere touching terrain at one point.
- Every detached fragment is a separate closed body. It must settle against the same terrain
  heightfield used for rendering and may remain non-solid only while it stays below the player step
  scale and outside the main collision authority.
- The solid circle collider remains centred on the visible main mass and bounded by its footprint.
- Rock uses rough, non-metallic, non-emissive dielectric response. White diffuse clipping, emission,
  bloom and global exposure are not accepted substitutes for material detail.
- Large-surface texture response must be seam-free. A horizontal UV ring or a lighting discontinuity
  is treated as a geometry/material defect, not as weathering.

## Accepted changes

- `brook-boulder-original-v1.glb` is a deterministic project-original 19.3 KB asset containing a
  168-triangle load-bearing mass and five independently supported spalls. Total cost is 276 triangles
  and six draw calls.
- The main mass uses asymmetric fracture planes, staggered ring heights and alternating triangulation
  so its silhouette no longer follows a smooth capsule or visible latitude bands.
- Runtime placement aligns the asset to the local terrain normal, buries the main support plane by
  4 cm and settles each spall independently after the main mass is placed.
- The loader uses object-space triplanar albedo, roughness and relief from the shared weathered-rock
  package. Diffuse albedo stays below white and the lower capillary band remains authored in vertex
  colour rather than emission.
- The former procedural rock is retained only as a load-failure fallback. The original asset uses the
  same authored anchor and solid collider.
- `boulderDetail` adds a fixed physical-review camera and `19-review-brook-boulder-detail.jpg` records
  the accepted fracture silhouette, bank burial, waterline and detached-spall placement.

## Rejected trials

- The first GLB used regular face-projected UVs. The repeated texture produced a near-black horizontal
  ring across the mass. It was replaced with seam-free object-space triplanar sampling; no lighting or
  exposure increase was used.
- `rejected-coplanar-spall-support/` records the failed single-plane fragment model. Runtime evidence
  found only 30/51 support vertices in contact and an 11.79 cm floating clearance, so the fragments
  were split and settled independently rather than relaxing the support gate.
- A later material trial used a white multiplier and clipped the sunward crown into a chalk/plastic
  read. The accepted dielectric albedo is bounded below white.

## Evidence

`before/` contains the prior verified brook-detail frame. `after/` is the authoritative complete run.
Its `report.json` records:

- the original asset loaded, the fallback hidden, 276 triangles and six draw calls;
- **47 / 47** support vertices in contact, support ratio **1.0**, with clearances from **-4.0 cm** to
  **-2.07 cm**;
- one solid main mass plus five non-solid sub-step spalls, preserving the existing collision route;
- **490.7 ms** first frame, **59.9 median FPS**, **39.4 FPS 1% low** and **25.4 ms** worst frame;
- Strong field record, clean restart and all mechanical visual-health gates passed with no console,
  page or WebGL errors.

This closes the specific stretched-capsule / false-contact boulder defect. It does not establish Web
Ocean parity: the environment still needs broader original asset families, denser authored ecological
transitions and more consistent production texel density.
