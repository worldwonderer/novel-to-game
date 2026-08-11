# Analytic height aerial-perspective pass

## Target

Replace the homogeneous cyan distance wash with physical altitude-dependent humid depth while keeping
the approved sun direction, readable glade lane, scene geometry, collision and performance tier.

## Accepted change

- Integrates exponential height density analytically along each camera-to-fragment world segment.
- Uses a -4 m reference base, 22 m scale height and 0.0058/m base extinction.
- Adds bounded Henyey-Greenstein forward scattering from the existing approved sun vector at 0.58
  anisotropy; it does not invent a second light or a screen-space glow.
- Reconstructs world position through batching and instancing before the fog integral.
- Patches 225 physical materials after both initial world construction and original-asset loading.
  Thirty-seven explicit custom shader materials retain the documented FogExp2 fallback.
- Adds no geometry, texture object, draw call or collision surface.

## Physical evidence

At 100 m, measured analytic optical depth/transmittance is:

| Segment | Optical depth | Transmittance |
| --- | ---: | ---: |
| 4 m horizontal lowland | 0.4032 | 0.6682 |
| 4→34 m rising segment | 0.2201 | 0.8025 |
| 34 m horizontal ridge | 0.1031 | 0.9020 |

The ordering is the intended physical result: equal screen distance no longer gives equal haze when
one ray remains in dense humid low air and another stays above it.

## Fixed-frame evidence

Across the eleven deterministic review frames, **24.97–74.05%** of pixels move above 3/255 while only
**0.70–3.01%** move above 12/255. The three dynamic Strong-path frames are recorded separately in
`metrics.json` and are not used to claim a fixed-image delta. The change is broad and restrained: low ground gains denser aerial
separation, high ridges retain more transmission, and the approved subject lane remains readable.
See `metrics.json` and `comparison-contact-sheet.jpg` for per-frame values.

## Runtime result

- Complete real-input Strong path: **PASS**.
- Launch, rendering, input, core loop, outcome and restart: **PASS**.
- 190/190 application tests: **PASS**.
- 180-frame sample: **59.9 median FPS**, **39.4 FPS 1% low**, **25.4 ms worst frame**.
- Browser/runtime/WebGL errors: none.

## Remaining gap

This pass improves depth ordering but does not manufacture asset fidelity. Compared with Web Ocean,
the largest remaining image gap is the repeated smooth-shell distant canopy and the limited authored
surface breadth of hero trees, rock and creatures.
