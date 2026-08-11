# Original canopy-tree library pass

## Target

Replace the 128 repeated procedural canopy trees without moving their approved habitat anchors or
closing the central route and glade. The replacement had to prove a buried root-to-trunk-to-primary-
secondary-tertiary-branch-to-leaf load path, mature dimensions, truthful trunk collision and shared
colour/depth wind. Lighting, exposure, fog and emission were not accepted as geometry fixes.

## Accepted result

- One deterministic project-original GLB contains humid buttressed broadleaf, open asymmetric
  broadleaf, plate-barked compound broadleaf and layered Araucaria families. They render 128 trees in
  eight instanced draw calls while preserving every authored x/z anchor.
- Species identity is authoritative before habitat variation: terrain hydrology separates six humid
  and 37 drained elliptic trees; 42 compound trees and 43 Araucaria retain their original families.
- Every tree remains gravitropically vertical. Gravity-only settlement puts all 3,540/3,540 sampled
  root contacts inside the rendered heightfield; the measured clearance range is `-0.5802..-0.025 m`.
- All four mature envelopes pass. Maximum measured diameter is `9.4443 m`; maximum measured height is
  `9.4672 m`, both inside the locked `9.5 m` gates.
- Closed roots feed a continuously tapering trunk. Broadleaf crowns use staggered primary branches,
  secondary and tertiary twigs; top leaf clusters terminate on visible lateral shoots rather than
  floating on or intersecting a sawn trunk cap. Araucaria uses layered whorls with supported outer
  branchlets.
- 1,719 source leaves are attached across the four variants. Their nonplanar laminae vary around the
  local midrib, preventing a world-horizontal edge-on failure. Bark and leaf channels are correlated,
  dielectric and non-emissive; colour and depth passes share the same bounded wind uniforms.
- Existing solid collision stays on the visible trunk. Branches and leaves remain pliable/non-solid.
  The accepted render uses 411,180 tree triangles, below the 420,000 replacement budget.

## Rejected browser results

- `rejected-flat-terminal-pads/`: oversized scaffold limbs stopped abruptly under one planar leaf
  layer, producing a sawn Y-frame and repeated flat crowns.
- `rejected-capped-trunk-coplanar-leaves/`: added branch hierarchy passed support tests, but the trunk
  still exposed a top cap and most leaves vanished edge-on.
- `rejected-leader-leaf-trays/`: a continuous taper fixed the cap, but top leaves attached directly to
  the leader as artificial tiers. The accepted asset adds visible lateral terminal twigs.

None of these failures was hidden with exposure, bloom, fog or emissive foliage.

## Evidence

`after/report.json` records:

- all four variants loaded, all nine procedural fallback layers hidden, and 128/128 placement anchors
  retained;
- 3,540/3,540 supported root contacts, gravity-only settlement and all trunks vertical;
- all 128 mature diameter/height envelopes passing;
- eight draw calls, 12,618 source triangles and 411,180 rendered triangles;
- shared colour/depth wind displacement with zero metalness and emission;
- **676.9 ms** first frame, **59.9 median FPS**, **39.1 FPS 1% low**, **25.6 ms** worst frame;
- Strong field record, clean restart and all mechanical visual-health checks passing without console,
  page or WebGL errors.

`23-review-canopy-tree-detail.jpg` is the accepted fixed physical view. `08-review-brook.jpg`,
`10-review-glade.jpg` and `13-review-ridge-volume.jpg` show the same library at route and landscape
scale. These checks prove support, scale, energy and runtime behavior; they do not prove subjective
parity with Web Ocean.
