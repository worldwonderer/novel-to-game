# Eroded ridge volume pass

## Accepted changes

- The near and far horizon layers are no longer fixed-`z`, double-sided vertical strips. They are
  world-space terrain bands with **65 m / 74 m** of depth, indexed slope surfaces, computed normals
  and depth-tested overlap.
- Each ridge combines a broad correlated crest, asymmetric cross-slope relief, narrow descending
  drainage cuts, bounded erosion and elevation/drainage-dependent vertex colour. A matte Lambert
  response uses the established world sun and exponential aerial fog rather than a self-lit basic
  material.
- The centre of the near front apron samples the same `terrainHeight` function as the playable
  ground and is buried 4 cm into its back edge. Outside the visual ground width, the apron smoothly
  descends below grade; the far ridge begins below and behind the near volume. This removes visible
  open edges without inventing a wall or horizon-coloured cover card.
- Both ridges remain beyond the navigation boundary and explicitly carry no collision authority.
  `13-review-ridge-volume.jpg` adds a repeatable elevated inspection view that can expose depth,
  overlap or a disconnected front edge hidden from the normal gameplay cameras.
- The accepted 72×12 grid is below the screen-space sampling limit at this distance. It preserves
  the silhouette and lit slopes of the 96×18 trial while avoiding unnecessary standard-material and
  vertex cost.

## Rejected iterations

- The previous vertical ribbon was rejected because its normal and depth never changed: it could
  only draw a paper-cut silhouette regardless of camera or sun direction.
- The first terrain-volume trial dropped both front and back edges to `y=-16`. The normal review
  views concealed it, but an elevated oblique inspection exposed a floating semicircular cut. That
  version was rejected before evidence capture.
- Connecting the entire 440 m apron to a playable ground mesh only 180 m wide left an amber sky slit
  beneath the ridge outside the ground's side boundary. The accepted centre-weighted connection
  buries the shared region and sends the unsupported side apron below grade.
- A 96×18 `MeshStandardMaterial` trial did not improve the repeated 1% low measurement. The accepted
  Lambert/grid reduction is visually equivalent at the fixed cameras, but the final tail remains
  slower than the preceding pass; this is recorded rather than described as a recovered cost.

## Evidence boundary

`before/` is the verified bounded-volumetric-cloud pass. `after/` is the authoritative complete run
after the ridge correction. The run records **496.5 ms** to first rendered frame,
**59.9 median FPS**, **39.1 FPS 1% low** and **25.6 ms worst frame**, a Strong field record, a clean
restart, and no console or `GL_INVALID_*` errors through `13-review-ridge-volume.jpg`.

The current result proves that the horizon has connected 3D slope surfaces and survives the new
edge-inspection view. It does not make the terrain a production-scanned landscape: distant rock
families, authored erosion decals, species distribution and material texel density remain below the
Web Ocean reference.
