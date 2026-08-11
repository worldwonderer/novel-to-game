# Overhead cloud and shadow coupling pass

## Target

Close the most visible full-scene atmospheric gap to the pinned Web Ocean reference without adding
screen-facing cloud cards or disconnected ground-shadow decals. The visible overhead cloud and the
terrain's direct-light attenuation must come from the same advected world-space density field and the
approved sun direction.

## Rejected attempt

The first implementation passed mechanics but rendered as a low-frequency transparent dome. It is
preserved under `rejected-v1-low-frequency-transparent-dome/` and was not accepted.

## Accepted change

- Adds one deterministic, project-original **256 x 256** density texture over a **2,048 m** world
  domain, representing a **620–840 m** overhead layer with a **32 m** minimum resolved feature.
- Replaces the previous deck draw call with one ray-intersected visible layer. Each visible fragment
  samples lower, middle and upper cloud levels plus two solar-path density samples.
- Projects each lit physical-material world position through that exact advected density field along
  the approved sun vector and applies bounded Beer–Lambert attenuation to direct lighting only.
- Uses two sun-path samples, extinction **0.00155/m**, and minimum direct transmittance **0.58**.
  Indirect sky/IBL light remains available, so cloud cover does not make the basin uniformly muddy.
- Patches **200** materials, skips **63** unsupported/custom materials, adds **zero** draw calls beyond
  the replaced deck call, changes no collision, and disables both the deck and its lighting influence
  on low quality.

## Fixed-frame evidence

Upward Strong views change **36.73–40.76%** of pixels above 3/255 and reveal coherent overhead cloud
thickness. Restrained fixed review views change **7.44–25.84%** above 3/255; the terrain-detail view
changes only **0.09%** above 12/255, and the Iguanodon skin view only **0.04%**, showing that the pass
is not a global exposure or material rewrite. The comparison shows no repeated stripe/checker shadow,
no screen-space dome boundary, and no uniform whole-scene darkening.

See `comparison-contact-sheet.jpg`, `after/overhead-cloud-contact-sheet.jpg`, and `metrics.json`.

## Runtime result

- Complete real-input Strong path: **PASS**.
- Launch, rendering, input, core loop, outcome and restart: **PASS**.
- 193/193 application tests: **PASS**.
- 180-frame sample: **59.9 median FPS**, **39.4 FPS 1% low**, **25.4 ms worst frame**.
- Browser/runtime/WebGL errors: none.

## Visual-parity estimate

The editorial parity estimate against pinned Web Ocean commit
`6496c77d37c12e803108c8f932680a7710a62c1c` moves from roughly **86% to 88%**, with an honest
uncertainty of about **±3 percentage points**. This is a visual-direction estimate, not a deterministic
QA score.

## Remaining gap

The coupled field is a bounded layered approximation, not a microphysical cloud or fluid model. Web
Ocean still has richer volumetric self-scattering and transition depth. Plateau's larger remaining
visual gap is now authored near-field asset/material hierarchy: foreground species/age breadth,
Ginkgo branch/canopy junction quality, and terrain-to-rock/soil transition richness.
