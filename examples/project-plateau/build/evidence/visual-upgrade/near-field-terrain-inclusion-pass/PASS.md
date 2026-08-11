# Near-field terrain inclusion pass

## Target

Add close-range soil structure without detached decals, new collision surfaces, or the repeated
pinhole pattern produced by applying cellular microrelief uniformly.

## Accepted change

- Reused the alpha channels of the three existing correlated soil textures for stone, organic and
  pore candidates; no texture object or draw call was added.
- Added a 1.282 m world-space near sample that fades between 18 and 58 m.
- Replaced one-candidate-per-cell masks with deterministic sparse occupancy and variable radius.
- Removed universal high-frequency height. Only geology-gated mineral inclusions perturb normals,
  with optical relief capped at 2.5 mm.
- Kept wet alluvium, route compaction, established bryophyte and geological sources authoritative.

## Rejected iterations

Both `rejected-v1-dotted-carpet` and `rejected-v2-residual-pinholes` passed the automated run but
failed visual review. The first applied roughly 1–1.4 cm relief across broad surfaces; the second
lowered amplitude but retained regular cellular occupancy. They are archived to prevent a mechanical
PASS from being mistaken for physical plausibility.

## Physical evidence

Above a 0.5 candidate threshold, the final source-channel coverage is **1.262% stone**, **1.579%
organic** and **0.325% pore**. Wet/alluvial, compacted-route and living-cover gates suppress
incompatible response. Collision continues to use the unchanged shared terrain heightfield.

## Fixed-frame evidence

| Frame | Mean absolute RGB | Pixels above 3/255 | Pixels above 12/255 |
| --- | ---: | ---: | ---: |
| `11-review-brook-detail` | 0.949 | 9.80% | 0.02% |
| `16-review-terrain-geology-detail` | 1.619 | 20.79% | 0.07% |
| `21-review-ground-cover-detail` | 1.260 | 14.47% | 0.03% |
| `25-review-forest-floor-detritus` | 1.362 | 16.40% | 0.15% |
| `26-review-terrain-integrated-route` | 1.030 | 10.47% | 0.01% |
| `28-review-bryophyte-ground-layer` | 1.285 | 15.27% | 0.05% |

The broad above-3/255 response with almost no above-12/255 pixels is consistent with a restrained
material-scale change, not a new visible overlay or a repeated high-contrast marker field.

## Runtime result

- Complete real-input Strong path: **PASS**.
- Launch, rendering, input, core loop, outcome and restart: **PASS**.
- 180-frame sample: **59.9 median FPS**, **39.3 FPS 1% low**, **25.5 ms worst frame**.
- Browser/runtime errors: none.

## Remaining gap

This pass repairs the missing near-field frequency band and rejects non-physical repetition. It does
not establish Web Ocean parity: distant crown repetition, atmosphere/land-light coupling and hero
asset/material depth remain larger gaps.
