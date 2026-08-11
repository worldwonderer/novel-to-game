# Authored habitat slice pass

## Accepted changes

- Broad-canopy trees now expose five primary and eight secondary load-bearing branches between the
  trunk crown and leaf clusters. Araucaria instances retain their separate whorled grammar instead
  of receiving broad leaves.
- The smooth canopy lobes are reduced to an interior mass. Two offset atlas layers now carry the
  outer silhouette, while the protected-cover arches use six leaf clusters per arch along their
  existing curved boughs.
- Leaf atlas coverage is physically corrected: transparent pixels lie outside the authored leaves.
  Alpha-to-coverage softens cutout edges, and a bounded emissive-map floor approximates two-sided
  waxy-leaf transmission without making foliage glow.
- Ground cover is distributed through 24 deterministic microhabitat clusters at tree driplines and
  brook-bank moisture bands instead of uniform scene-wide scatter.
- One third of the density layer now uses curved broad lanceolate leaves with a separate waxy
  roughness response; the other variants retain matte blades. The exposed decision corridor and
  protected family framing stay sparse.

## Rejected iterations

- Enlarging the leaf cards before correcting their mask exposed opaque black rectangles. That
  version was rejected; the atlas now records roughly 27% visible coverage with transparent
  corners.
- A darker transmission floor still made all backlit leaf clusters read as charcoal silhouettes.
  The accepted value is bounded and texture-modulated; it preserves shadow while keeping leaf scale
  legible.
- Replacing every canopy mass with cutout cards was rejected. Small interior masses remain to avoid
  a paper-thin roof and preserve the art direction's broad botanical masses.

## Evidence boundary

`before/` is the verified terrain/material/rock result. `after/` is the authoritative complete run
after the habitat slice. Fixed `brook`, `basalt`, `glade`, and `brookDetail` cameras provide
like-for-like inspection. This pass materially reduces repeated prototype silhouettes but does not
prove production asset or Web Ocean parity.
