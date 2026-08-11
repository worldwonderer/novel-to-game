# Brook response fern and physical deadwood pass

## Accepted result

- Runtime scene-group ablation isolated the pale bank triangle cluster to
  `world.connected_route.brook_response`, not either existing fern batch or the ground-cover GLB.
- The permanent five-fan procedural carrier is replaced by five instances from the cached original
  fern library. Only the humid-bank variant is active, so the dedicated response stand costs two
  runtime draws.
- The five ferns stay below 0.9155 m diameter and 0.2365 m height. All 65 rhizome samples are buried
  2.99–3.01 cm in the rendered terrain. Idle wind is 0.055/0.012 m horizontal/vertical and the exact
  same uniforms feed colour and depth passes.
- Brook driftwood and forest deadfall share three rebuilt 696–912-triangle families. Each family is
  composed of closed curved trunk, branch and tapered fibre volumes with mapped bark, distinct end
  grain and jagged splinters; no family uses flat shading.
- Ten wet-bank logs have 41/41 supported underside samples at -3.42..+0.80 cm. Eighteen dry/damp
  forest logs have 78/78 supported samples at -2.38..+1.20 cm. Neither layer owns collision.

## Fixed-frame change

| Frame | Mean absolute RGB delta | Pixels above 3/255 |
| --- | ---: | ---: |
| `21-review-ground-cover-detail` | 2.333 | 7.32% |
| `11-review-brook-detail` | 0.257 | 2.33% |
| `25-review-forest-floor-detritus` | 0.327 | 2.81% |

Within the fixed cluster crop, the pale-cyan proxy fell from 10,874 pixels to 105. The result removes
rather than recolours the screen-dominating triangle carrier.

## Runtime evidence

- Complete clean run: launch, render, input, core loop, strong outcome and restart all pass.
- Time to first frame: 1,901.3 ms.
- Median: 59.9 FPS.
- 1% low: 39.4 FPS.
- Worst sampled frame: 25.4 ms.
- Browser/runtime errors: none recorded.

Authoritative raw evidence is in `before/`, `after/`, and `metrics.json`.
