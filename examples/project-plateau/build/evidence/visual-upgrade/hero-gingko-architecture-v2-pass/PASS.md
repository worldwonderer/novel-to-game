# Hero Ginkgo architecture v2 pass

## Target

Replace the Fort landmark's faceted trunk, radial-foot roots, oversized terminal leaf paddles and
unsupported-looking branch junctions with a mature tree hierarchy that remains grounded, readable and
inside the approved two-draw-call landmark role.

## Root cause

Version 1 used straight tapered cylinders for ten primary branches and put **583** leaves measuring
approximately **0.42–0.58 m** only around thirty terminal points. The result was a small set of flat
leaf piles on visibly spliced beams. Seven exposed conical roots read as stilts rather than a trunk
flare, and broad smooth material response left no stable bark scale.

## Rejected iterations

- `rejected-v1-sparse-pollarded-crown/`: curved structure passed, but the bare leader ended as a
  flat-cut pole above a sparse crown.
- `rejected-v2-regular-diagonal-bark/`: taper-varying UV repetition produced helical tyre-like bark.
- `rejected-v3-uniform-corduroy-bark/`: direction was corrected, but equal-width vertical grooves
  still read as manufactured corduroy.

All three passed mechanics and were rejected by the physical/visual gate.

## Accepted change

- Rebuilds the asset as **3,318,204 bytes**, **123,624 triangles** and the same **two draw calls**.
- Uses a 35-ring, 24-sector tapered/fluted trunk and seven curved buttress roots whose tips all finish
  at least **0.20 m below grade**.
- Builds ten curved collared scaffold branches, twenty secondaries, **68** fine twigs, **88**
  leaf-bearing shoots and four sealed pruning stubs. Child first rings overlap their parent centreline
  and flare 8–16%; the maximum recorded daughter/parent area ratio is **0.9248**.
- Distributes **1,971** closed bilobed fan leaves measuring **0.205–0.30 m** along supported outer
  shoots rather than thirty terminal piles. Recorded maximum leaf support gap is **0 m**.
- Adds two deterministic 128² correlated bark textures for albedo and roughness/relief. Roughness is
  bounded to **0.86–0.98** and optical bump amplitude to **8 mm**; repeat scale is **0.65 m** around
  and **0.46 m** along the branch surface.
- Keeps zero emission, zero metalness, the same world anchor, terrain height, trunk collider,
  navigation and gameplay behavior.

## Fixed-frame evidence

The dedicated full-tree view changes **15.74%** of pixels above 3/255 and **10.34%** above 12/255;
the root-contact view changes **7.92% / 5.82%**. Unrelated fixed canopy, boundary and brook views
remain localized at **1.82–2.73%** above 3/255 and at most **0.26%** above 12/255. The accepted views
show no flat-cut leader, radial stilt feet, helical tyre pattern or equal-width corduroy surface.

See `comparison-gingko.jpg` and `metrics.json`.

## Runtime result

- Complete real-input Strong path: **PASS**.
- Launch, rendering, input, core loop, outcome and restart: **PASS**.
- 193/193 application tests: **PASS**.
- 180-frame sample: **59.9 median FPS**, **39.4 FPS 1% low**, **25.6 ms worst frame**.
- Browser/runtime/WebGL errors: none.

## Visual-parity estimate

The editorial parity estimate against pinned Web Ocean commit
`6496c77d37c12e803108c8f932680a7710a62c1c` moves from roughly **88% to 90%**, with an honest
uncertainty of about **±3 percentage points**. This is a visual-direction estimate, not a deterministic
QA score.

## Remaining gap

This is one deterministic hero tree, not production-library breadth. Seasonal/age variation, finer
branch-junction sculpting, canopy motion and the surrounding soil/root-transition dressing remain
less developed than Web Ocean's curated near-field asset stack.
