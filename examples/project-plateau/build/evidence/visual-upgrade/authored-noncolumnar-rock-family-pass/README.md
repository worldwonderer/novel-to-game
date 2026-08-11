# Authored non-columnar rock family pass

## Physical requirements

- Every playable rock must rest on the actual terrain rather than on a guessed horizontal plane.
  Its broad support footprint is aligned to the sampled terrain normal, shallowly buried, and
  checked at multiple support vertices so a single centre sample cannot conceal floating edges.
- The projected centre of mass stays inside the support footprint. Large rocks do not balance on a
  point, lean through arbitrary pitch/roll, or use a decorative transform that contradicts gravity.
- A rock that visibly blocks the player must have a static collider matched to its visible footprint
  and height. Decorative ridge talus is non-solid only because every instance lies wholly beyond the
  navigation boundary.
- Surface detail must follow the rock volume without a visible UV shell seam. The material response
  remains matte and restrained under the established sun rather than becoming white, metallic or
  self-lit merely to expose the shape.

## Accepted changes

- Eighteen deterministic placements now form three geology-specific non-columnar families:
  **fluvial cobbles** beside the brook, **bedded slabs** at the glade margin, and **angular talus** at
  the ridge foot. Each family has a distinct convex deformation grammar instead of reusing columns
  or randomly scaled spheres.
- Each generated mesh has a stable flattened support plane. Placement samples every support vertex,
  aligns the local up axis to `terrainGradient`, rotates only around that terrain normal, then solves
  the vertical offset before applying a bounded shallow burial. Recorded support clearance and
  contact counts make the settlement rule inspectable.
- The six brook and six glade rocks inside the playable field are collision-authoritative. Their
  static circular colliders exceed the player's maximum step height and are derived from the same
  authored placement data. The six ridge-foot talus pieces are explicitly non-solid and remain
  wholly behind the `z = -90` navigation boundary.
- Large-rock albedo, roughness and relief use separate deterministic texture fields sampled through
  seam-free object-space triplanar projection. The direct spherical `map`, `roughnessMap` and
  `bumpMap` paths are deliberately unused for these meshes.
- Existing small brook and ground stones now use the same terrain-normal settlement rule rather than
  arbitrary three-axis rotations. Their lighter geometry remains separate from the larger authored
  family so the correction does not silently increase decorative mesh cost.

## Rejected iterations

- A first cap construction used the wrong winding order and exposed a black hole. It was rejected as
  invalid topology, not disguised with a darker material.
- A large single-point top fan produced radial triangles and a crater-like crown under the low sun.
  It was rejected because its silhouette and shading implied a volcanic vent rather than erosion or
  fracture.
- Spherical UV mapping created a horizontal shell seam across the large cobble. It was rejected in
  favour of object-space triplanar sampling rather than hidden by camera placement.
- Excessive environment response turned the rock white/silver and made the dielectric stone read as
  polished metal. The accepted material restores low environment intensity, high roughness and a
  bounded mineral-value range.
- Early foreground placements dominated the brook camera without improving habitat logic. They were
  moved into the hero-boulder depositional cluster and glade margin, where flow, slope and route
  composition support their presence.

## Evidence boundary

`before/` is the verified eroded-ridge-volume result. `after/` is the authoritative complete run
after the non-columnar rock correction. The most useful visual checks are:

- `08-review-brook.jpg` and `11-review-brook-detail.jpg`: fluvial-cobble clustering, matte response,
  multi-point ground contact and scale beside the hero boulder;
- `10-review-glade.jpg`: restrained bedded slabs at the habitat margin rather than arbitrary route
  clutter;
- `13-review-ridge-volume.jpg`: angular talus remains attached to the distant ridge apron and outside
  the playable collision domain.

The run records **560.3 ms** to first rendered frame, **59.9 median FPS**, **38.8 FPS 1% low** and
**25.8 ms worst frame**, a Strong field record, a clean restart, and no console or `GL_INVALID_*`
errors through the final ridge inspection. The 1% low remains above the 30 FPS product gate but is
slightly below the preceding ridge pass, so this change is not described as performance neutral.

The result proves physically supported placement, collision honesty and a seam-free large-rock
material path. It does not turn these deterministic code-authored meshes into scanned or
artist-sculpted production assets. Rock atlas breadth, high-frequency fracture history, bark
geometry, leaf-atlas variety and production texel density remain below the Web Ocean reference.
