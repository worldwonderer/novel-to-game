# Hero Ginkgo root-zone litter pass

## Target

Replace the abrupt hero-tree-to-uniform-soil contact with a species- and root-sourced organic
transition, while preserving the shared rendered terrain, buried buttress roots and open support
silhouette.

## Root cause

The existing 360 forest-floor clusters sampled secondary canopy habitat only. The hero Ginkgo
contributed to terrain humus but had no corresponding fallen fan leaves, so the close root frame
showed a mature crown and bare homogeneous soil as disconnected systems.

## Accepted change

- Keeps the existing **360** three-family canopy-habitat clusters unchanged and adds **30**
  deterministic Ginkgo clusters in one additional instanced draw.
- Adds a fourth closed manifold family made from curled, finite-thickness bilobed fan leaves and
  small petiole/twig fall. It reuses the existing opaque, rough, non-emissive zero-metalness organic
  material path.
- Sources the new placements from the actual Ginkgo anchor at **[16, 37]**. They occupy **1.45–4.85
  m** radial distance in the inter-root sectors defined by the same seven root angles used by the
  authored tree, with at least **0.18 rad** angular separation from a root axis.
- Aligns every cluster to the local terrain tangent and multipoint-settles it against the shared
  rendered heightfield. Runtime evidence records **79,560/79,560** supported samples at
  **-0.8..+1.47 cm** clearance.
- Adds no solid collision, navigation, hydrology or terrain-height authority and does not cover the
  trunk/root contact silhouette.

## Fixed-frame evidence

The complete root frame changes **2.50%** of pixels above 3/255 and **0.41%** above 12/255. Inside
the visible near-root ground band, the new organic transition changes **6.70% / 2.20%**; the trunk
contact region stays localized at **1.46% / 0.25%**, showing that litter accumulates between roots
rather than becoming a masking ring. The unrelated fixed brook, canopy, generic forest-floor and
boundary frames remain at **2.13–2.27%** above 3/255 and at most **0.14%** above 12/255.

See `comparison-gingko-root-litter.jpg` and `metrics.json`.

## Runtime result

- Complete real-input Strong path: **PASS**.
- Launch, rendering, input, core loop, outcome and restart: **PASS**.
- 194/194 application tests: **PASS**.
- 180-frame sample: **61.0 median FPS**, **40.4 FPS 1% low**, **24.8 ms worst frame**.
- Browser/runtime/WebGL errors: none.

## Visual-parity estimate

The editorial parity estimate against pinned Web Ocean commit
`6496c77d37c12e803108c8f932680a7710a62c1c` moves from roughly **92% to 93%**, with an honest
uncertainty of about **±3 percentage points**. This is a visual-direction estimate, not a deterministic
QA score.

## Remaining gap

This closes one hero root-zone discontinuity, not production ground-dressing breadth. Higher-
resolution bank/rock transitions, broader species-specific litter and soil libraries, and richer
volumetric-cloud scattering remain visible gaps.
