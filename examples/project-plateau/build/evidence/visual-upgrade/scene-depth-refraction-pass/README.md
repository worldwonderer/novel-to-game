# Scene depth refraction pass

## Accepted changes

- The brook now captures the actual opaque scene from the gameplay camera into a bounded colour
  target with an attached depth texture. Balanced quality uses 480×270; high quality uses 640×360;
  low quality keeps the existing channel-bed fallback.
- The prepass hides the brook, ripple overlay and held tools, never runs on frame zero, and restores
  render target, viewport, scissor, scissor test, XR state, shadow-map update state and visibility.
  It shares the planar reflection's meaningful-camera-motion cadence instead of rendering every
  frame.
- Refraction uses the air-to-water ratio `1 / 1.333`, the terrain-conforming ribbon's geometric
  normal plus bounded flow-normal perturbation, and a two-sample screen-space ray refinement.
- `perspectiveDepthToViewZ` validates that the captured surface lies behind the water. Inverse
  projection reconstructs its three-dimensional view-space position, so the Beer–Lambert path is
  the actual water-to-surface distance capped at 1.25 metres rather than a doubled angle heuristic.
  The authored channel-bed texture remains only as a depth-invalid or disabled fallback.
- The existing fresh-water dielectric F0 (`0.02037`), narrow silver-ribbon scale, broken bank foam,
  wet-bank transition and real planar reflection remain intact.

## Physical boundary

This is a screen-space shallow-brook approximation, not a general fluid simulation. It obeys the
relevant first-order optics—geometry-supported surface normals, Snell refraction, depth-derived path
length, wavelength-dependent extinction and dielectric Fresnel—but it cannot reveal geometry absent
from the camera capture. One representative horizontal planar reflector still approximates the
terrain-conforming ribbon, and there is no SSR reflection fill.

## Evidence boundary

`before/` is the verified authored-habitat result. `after/` is the authoritative complete run after
scene colour/depth refraction. Fixed `brook` and `brookDetail` cameras show the bank, boulder and
terrain contact; browser assertions require both colour/depth captures, `renderError: null`, and no
console or `GL_INVALID_*` errors. The complete run records **59.9 median FPS**, **39.4 FPS 1% low**
and **25.4 ms worst frame**. This closes the painted-bed refraction gap, not overall Web Ocean parity.
