# Bark and leaf family pass

## Physical requirements

- Every visible crown must expose a continuous load path from terrain-supported trunk to primary
  branch, secondary branch or bough, rachis/petiole and leaf blade. Leaf sprays may overlap, but they
  may not hover around a crown centre without a visible support.
- Trunk silhouettes and bark relief must remain part of the load-bearing volume. Bark plates cannot
  float as decals, roots cannot terminate above terrain and the collision-authoritative trunk must
  remain registered to the exact visible family instance.
- Leaf colour must enter the dielectric diffuse response as albedo. Backlighting may add bounded
  Beer–Lambert transmission, but leaves may not use emissive colour, exposure compensation or an
  unshadowed constant to hide missing material input.
- The dense-cover crown proxy may represent aggregate canopy occlusion, but the same leaf area must
  not be counted a second time by the close detail LOD. The proxy owns the canopy shadow; closed
  blades own the near silhouette and transmission.

## Accepted changes

- The 128 authored trees now resolve as three explicit biological combinations: 43
  `wet-furrowed/araucaria-whorl`, 43 `wet-furrowed/elliptic-waxy` and 42
  `plate-barked/compound-lanceolate`. Family-local instance indices keep the two visible trunk meshes
  aligned with their static colliders.
- A second load-bearing trunk family adds continuous radial flutes, staggered attached plates, five
  terrain-contacting buttresses and upper branch stubs. It has separate deterministic albedo,
  roughness and height data rather than recolouring the first bark map.
- Two original 128×128 leaf atlases now encode distinct botany: an elliptic waxy spray with a central
  twig and a compound lanceolate spray with a continuous rachis, paired leaflets and terminal leaf.
  Both broadleaf families use the same transform for visible branches and their eight terminal leaf
  anchors.
- The close cover arches replace six crossed alpha cards per cluster with thirteen closed,
  low-polygon leaf blades connected through visible petioles and a bifurcated rachis. Alternating
  petiole torsion prevents an impossible planar roof while retained crown volumes remain smaller,
  lower interior masses.
- Leaf geometry now supplies an explicit chlorophyll-weighted vertex-colour attribute. This is not
  decorative metadata: it ensures instanced family colour actually enters `diffuseColor`, which in
  turn feeds both standard reflected light and the shadow-aware Beer–Lambert opposite-side lobe.
- The thin-leaf shader uses the already face-correct `geometryNormal`; an earlier second
  `faceDirection` multiplication incorrectly inverted DoubleSide back faces. All leaf materials
  remain non-metallic, rough and non-emissive.

## Rejected iterations

- The first atlas-only result removed the old emissive floor but rendered leaf clusters as black
  webs. Increasing atlas RGB, instance colour or global brightness was rejected because those edits
  did not change the failing energy input.
- Four subsequent colour/crown-density trials were rejected after fixed-camera layer isolation
  proved that the black layer followed the leaf-detail meshes rather than bark, branches, water,
  exposure or the post stack.
- A shadow-aware Beer–Lambert lobe alone was also insufficient. Shader diagnostics showed valid sun,
  view and opposite-side terms but a near-zero material diffuse contribution. The root cause was the
  missing geometry colour attribute under a vertex-colour material, not insufficient light.
- A temporary constant-light diagnostic made the leaves visible but was removed immediately. It was
  evidence for the material-input fault and never became an accepted visual solution.
- Large smooth crown lobes brightened the roof but read as unsupported green eggs. The accepted
  version shrinks and lowers them into an aggregate interior while closed supported blades carry the
  visible edge.

## Evidence boundary

`before/` is the verified authored non-columnar rock result. `after/` is the authoritative complete
run after the two-family bark/leaf correction. The most useful comparisons are:

- `08-review-brook.jpg`: the former black near-cover web resolves into a continuous supported leaf
  roof while bark remains brown, mapped and terrain-supported;
- `11-review-brook-detail.jpg`: closed blades, petiole torsion, reduced interior masses and the
  trunk/bough load path remain legible at close range;
- `10-review-glade.jpg` and `13-review-ridge-volume.jpg`: two broadleaf silhouettes and two bark
  families break the former repeated cyan-pillar forest without changing the approved habitat
  sightline.

The run records **570.4 ms** to first rendered frame, **59.9 median FPS**, **39.1 FPS 1% low** and
**25.6 ms worst frame**, a Strong field record, a clean restart, and no console or `GL_INVALID_*`
errors through the final ridge inspection. All 119 app tests and the production build passed before
the authoritative browser run.

The result proves support continuity, collider registration, two bark/leaf families and a bounded
non-emissive light path. It does not make the code-authored vegetation equivalent to scanned or
artist-authored production assets. Species breadth, bark/leaf texel density, wind deformation,
seasonal variation and curated habitat dressing remain below the Web Ocean reference.
