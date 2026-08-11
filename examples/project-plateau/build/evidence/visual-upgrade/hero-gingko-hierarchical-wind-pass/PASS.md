# Hero Ginkgo hierarchical wind pass

## Target

Give the Fort Ginkgo physically ordered breeze response without moving its load-bearing root/trunk,
turning the crown into one rubber mass, or letting colour and directional-shadow silhouettes disagree.

## Root cause

The accepted v2 Ginkgo had a supported root-to-shoot hierarchy but no flex data. Applying one uniform
tree transform would have made the buried roots and massive trunk sway with the leaves; driving only
the leaf material would have left branches static and broken the visible load path.

## Accepted change

- Regenerates the same two-draw-call asset as **3,878,144 bytes** with one secondary UV channel. Its
  `uv1.y` carries normalized hierarchy flex and `uv1.x` carries deterministic phase rank.
- Keeps root and trunk flex exactly **0**. Scaffold branches occupy **0.05–0.32**, secondaries
  **0.28–0.56**, twigs **0.52–0.82**, and supported leaves **0.40–1.00**.
- Applies one world-direction breeze to supported local vertices. Maximum tip displacement is bounded
  to **0.12 m horizontally** and **0.024 m vertically**, with **0.37 Hz** structural motion and
  **1.62 Hz** leaf flutter.
- Uses the identical displacement function and uniforms in colour and depth materials, so moving
  foliage cannot leave a static or disconnected directional shadow.
- Reduced-motion mode resets time and both strengths to zero. Geometry hierarchy, world anchor,
  terrain height, trunk collider, navigation and gameplay remain unchanged.

## Fixed-frame evidence

At the fixed **14.75 s** review pose, the full Ginkgo frame changes **8.60%** of pixels above 3/255
and **2.82%** above 12/255. Inside the tree-and-crown region the change is **15.34% / 5.10%**, showing
that the response is visible and localized. The root-contact region changes only **0.72%** above
3/255 and **0%** above 12/255; the close trunk/root frame is **1.15% / 0.01%** overall. Unrelated
fixed brook, ridge, canopy, boundary and riparian views remain at **1.91–3.00%** above 3/255 and at
most **0.34%** above 12/255.

The accepted comparison shows a fixed root/trunk silhouette, continuous branch junctions and small
outer-crown offsets rather than whole-tree shear. See `comparison-wind-contact-sheet.jpg` and
`metrics.json`.

## Runtime result

- Complete real-input Strong path: **PASS**.
- Launch, rendering, input, core loop, outcome and restart: **PASS**.
- 194/194 application tests: **PASS**.
- 180-frame sample: **59.9 median FPS**, **39.7 FPS 1% low**, **25.2 ms worst frame**.
- Browser/runtime/WebGL errors: none.

## Visual-parity estimate

The editorial parity estimate against pinned Web Ocean commit
`6496c77d37c12e803108c8f932680a7710a62c1c` moves from roughly **90% to 91%**, with an honest
uncertainty of about **±3 percentage points**. This is a visual-direction estimate, not a deterministic
QA score.

## Remaining gap

This closes the landmark's static-canopy defect, not production tree-library breadth. Seasonal and
age variation, finer sculpted junction/pruning diversity, and the surrounding soil/root transition
remain less developed than Web Ocean's curated near-field asset stack.
