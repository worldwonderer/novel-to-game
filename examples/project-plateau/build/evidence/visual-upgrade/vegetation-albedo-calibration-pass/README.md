# Source-coupled vegetation albedo calibration pass

## Target

Remove the pale mint/plastic response shared by the original canopy-tree, mature tree-fern, fern and
ground-cover libraries without changing the approved daylight, lifting exposure, adding emission or
using bloom. The correction must remain attached to actual leaf material energy and habitat sources.

The former instance colours used HSL lightness values around `0.78..0.95`. Those colours multiplied
already-pigmented material colours and correlated leaf-albedo textures, so sun-facing and transmitted
leaves lost too little energy and distant crowns collapsed into one pale green family.

## Accepted physical model

- `vegetation-albedo.js` owns one shared, testable contract used by all four libraries. Every leaf
  remains a non-emissive, non-metallic dielectric with shadow-aware thin-leaf transmission.
- Material colour and the correlated albedo texture carry the leaf pigment spectrum. Instance colour
  is a near-neutral multiplier rather than a third saturated-green pigment layer. The rejected first
  iteration lowered lightness but repeated green spectral bias at all three layers, reducing value
  while increasing colour saturation.
- Family is still authoritative for the base multiplier. Actual habitat wetness lowers diffuse return
  by a bounded amount; drained slope exposure gives a smaller bounded gain; deterministic individual
  variation represents age without random colour masks.
- Instance lightness is clamped to `0.42..0.66` and instance saturation to `0.035..0.12`. These are
  multipliers over separately bounded material and texture inputs, not claimed measured absolute leaf
  reflectance.
- Daylight, ACES exposure, sun intensity, fog extinction, emission, metalness, geometry, placement,
  wind, collision and shadow displacement are unchanged by this pass.

## Visual rejection and acceptance

`rejected-repeated-pigment-instance-tint/` records the first bounded-lightness result. It removed the
white mint wash but left strongly saturated foreground ground cover because material, texture and
instance tint all encoded the same green bias.

The accepted `after/` fixed views keep tree-fern and canopy shadow detail, retain back-lit thin-leaf
transmission and preserve terrain/route readability while removing the repeated saturated instance
layer. `19-review-brook-boulder-detail.jpg` also confirms that the reported boulder no longer has the
old authored white/slate face split: continuous normals, coordinate-driven weathering and a narrow
contact wet band produce a smooth light-facing transition rather than a two-material cut.

These captures demonstrate the implemented material response and reject crushed/blank output. They
do not prove that vegetation asset density or overall visual quality equals Web Ocean.

## Evidence

`after/report.json` records:

- all four original vegetation libraries reporting
  `source-coupled-bounded-foliage-albedo-v1` at runtime;
- zero render errors and all mechanical framebuffer exposure/readability guards passing;
- **1038.6 ms** first frame, **59.9 median FPS**, **38.2 FPS 1% low** and **26.5 ms** worst frame over
  180 sampled frames;
- Strong field record, clean restart and all existing physical support, collision, hydrology and
  renderer-state checks passing.

The first-frame value is a single cold local run and is not presented as a loading improvement. The
performance gate remains the established local `1% low >= 30 FPS` constraint.
