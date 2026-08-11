# Subgrade ground-layer and cambered-cover pass

## Accepted change

- Kept all **360** original ground-cover ecological placements and all six instanced draw calls, but
  replaced v1's visible ten-sided above-grade root crowns with closed fourteen-sided rhizomes that
  widen below grade and taper before emergence.
- Increased attached leaf counts from **7/8/14** to **9/10/18** for arrowhead, rosette and sedge while
  reducing their marker-like mature maximum diameter/height from
  **1.4487/0.5197, 1.1127/0.2869, 1.1196/0.7805 m** to
  **0.9755/0.3912, 0.7891/0.2069, 0.7796/0.5728 m**.
- Buried every ground-cover rhizome by **5.2 cm**. Browser evidence records **5,400/5,400** support
  samples at **-5.35..-5.05 cm** with no horizontal relocation.
- Reduced ground-cover environment response to **0.12/0.18** for structure/leaves and reduced the
  shadow-aware additive transmission term from `0.40` to `0.22`; material/texture/instance pigment
  remains non-emissive, zero-metalness and habitat sourced.
- Kept all **640** canopy/moisture-sourced low-ground placements, but replaced the 57 visible
  `humid-grass-tuft` sphere-and-blunt-tube instances with a compact subgrade rhizome and twelve
  closed, tapered, cambered blade volumes. Maximum tuft width/height is now **0.42/0.48 m**.
- Every low-ground rhizome remains sampled from the rendered terrain and is buried **2.6 cm**;
  **640/640** roots pass. The layer remains non-solid and compressible.

## Fixed-frame evidence

- `21-review-ground-cover-detail.jpg`: mean absolute channel delta **7.403**;
  **36.62%** of pixels change above 3/255. Large polygonal crowns disappear below the soil and the
  foreground families no longer fill mature tree-scale envelopes.
- `28-review-bryophyte-ground-layer.jpg`: mean delta **0.390**;
  **3.34%** of pixels change above 3/255; the deliberately low layer remains spatially restrained.
- `30-review-brook-obstacle-flow-detail.jpg`: mean delta **2.011**;
  **9.08%** of pixels change above 3/255. The dominant fluorescent octagonal tuft becomes a smaller
  gravity-curved blade cluster with no visible carrier base.

## Runtime evidence

- Complete-run launch, render, input, core loop, outcome and restart: **PASS**.
- First frame: **1,886.6 ms**.
- Performance: **59.9 FPS** median, **39.1 FPS** one-percent-low, **25.7 ms** worst frame.
- No browser, page, shader or console errors were recorded.

This closes a repeated visible support/energy error. It does not claim that Plateau yet has Web
Ocean's full foreground species library or production texel density.
