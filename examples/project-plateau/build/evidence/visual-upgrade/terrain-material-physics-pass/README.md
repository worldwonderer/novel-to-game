# Terrain, canopy and rock-physics pass

## Accepted changes

- Terrain colour and roughness now respond to authored drainage, slope and exposure attributes.
- Broad world-space breakup and a rotated mesoscale sample prevent one repeated UV direction from
  defining the entire basin.
- Soil albedo, roughness, height and tangent-space normals now come from deterministic tileable
  multiscale value noise. A sine-based trial was rejected because it produced long artificial
  grooves that read as a shader pattern rather than erosion or sediment.
- Hero canopies keep the approved low-poly mass but add a second offset leaf-card layer and reduce
  the underlying crown volume, improving edge breakup without changing the route or collision
  truth.
- The brook boulder now uses broad clipped fracture planes with continuous weathered normals,
  seam-free triplanar albedo/roughness/relief, a darker and smoother lower wet band, and shallow
  sediment burial. Its collider radius and height were reduced to match the visible rock rather
  than an earlier oversized capsule.

## Rejected or bounded alternatives

- Regular sine grooves were removed after fixed-camera inspection.
- A first triplanar projection was rejected because all three projections sampled the same texture
  phase at local `y = 0`, creating a false horizontal rock band. The accepted shader offsets each
  projection and blends them with broader normal weights.
- The boulder is intentionally shallow-buried rather than held wholly above the heightfield: this is
  the bounded approximation for a deposited rock in sediment when the terrain mesh is not locally
  remeshed.
- No bloom, depth-of-field, extra ocean-scale waves, or dense prop scatter was added.

## Evidence boundary

`before/` is the verified planar-reflection result. `after/` is the authoritative complete run after
this pass. Fixed `brook`, `basalt`, `glade`, and `brookDetail` cameras provide like-for-like visual
inspection. The mechanical framebuffer checks only reject blank, crushed, or clipped frames; they
do not prove subjective parity with Web Ocean or production asset fidelity.
