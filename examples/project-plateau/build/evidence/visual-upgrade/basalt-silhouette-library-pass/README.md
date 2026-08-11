# Basalt silhouette library pass

## Physical requirements

- Visual variation may not be produced by arbitrary non-uniform scaling of one formation. Each
  silhouette needs its own closed load-bearing volumes, buried plinth, supported benches and resting
  fragments.
- The sampled upper mass centre of every variant must remain inside the broad buried base projection.
  A dramatic leaning top whose centre of gravity falls outside support is rejected.
- All contact-ring vertices must remain below the continuous eastern shoulder after terrain-normal
  alignment. A visual-only non-solid formation is permitted only while its complete footprint stays
  outside the `x=29` navigation boundary.
- Rock materials remain rough, non-metallic and non-emissive. Silhouette differentiation may not be
  faked with bloom, exposure or unrelated material colours.

## Accepted changes

- `basalt-shelf-original-v2.glb` replaces the runtime's one repeated shelf template with a
  deterministic **three-variant, 256,828-byte project-original library**:
  `needle-buttress`, `split-saddle` and `terraced-fan`.
- The variants contain 660, 560 and 640 triangles respectively and retain two draw calls per
  formation. Their different peak heights (10.32, 7.85 and 9.12 m), wall counts, bench positions and
  spall layouts create three genuinely different skyline rhythms rather than rotated copies.
- Every mesh component is closed. Unit QA rejects open or non-manifold edges, verifies a minimum
  0.64 m buried plinth, and requires each surface-sampled mass centre to remain within 0.2 m of the
  base centre.
- Runtime loading selects exactly one variant for each geological source and prunes the unused
  library nodes before attachment. The same correlated basalt albedo, roughness and relief maps are
  applied to all three, preserving geological family resemblance without silhouette repetition.
- Browser evidence records 60/60 supported bottom vertices for every variant. Maximum bottom
  clearances are `-0.3509`, `-0.3963` and `-0.2999` m; the closest footprint begins at `x=29.8753`.
  The procedural columns remain only as the asset-load failure fallback.

## Evidence boundary

`before/` is the verified grounding/escarpment result with the same original v1 formation repeated
three times. `after/` is the authoritative v2-library run. Direct evidence includes:

- `before/12-review-basalt-detail.jpg`: three placements share the same wall/bench silhouette;
- `after/12-review-basalt-detail.jpg`: tall needle, split saddle and terraced fan read as separate
  members of one geological family;
- `after/17-review-basalt-escarpment-contact.jpg`: each distinct formation remains buried in the same
  continuous support landform;
- `after/report.json`: all three unique variant IDs, triangle budgets, loader/fallback state and
  support measurements, plus **476.2 ms** first frame, **59.9 median FPS**, **39.0 FPS 1% low** and
  **25.7 ms worst frame**;
- `npm run verify`: Strong field record, input, outcome, restart, console/GL and visual-health gates
  passed.

This pass closes the most obvious landmark copy-paste failure, not Web Ocean parity. Plateau still
needs a broader original asset library beyond one tree and one three-member geological family,
especially slope-scale exposures, mature vegetation species variation and wind-linked motion.
