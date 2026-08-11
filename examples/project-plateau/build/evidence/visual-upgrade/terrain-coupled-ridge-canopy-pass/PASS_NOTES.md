# Terrain-coupled ridge canopy pass

## Accepted changes

- Replaces the two coarse ridge crown families with a closed, smoothly shaded, noise-deformed broadleaf crown shell and a closed layered-lathe narrow crown.
- Keeps 598 mature ridge trees and the existing six total instanced draw calls, while adding 220 juvenile/shrub crowns only in tree-gap samples that pass the same rendered slope, drainage and exposed-stone gates.
- Roots all 818 crowns on exact rendered ridge triangles: mature trunks embed 6 cm; understory crowns embed 4.5 cm. No collision or navigation authority is added.
- Adds stable 37 m / 13 m ridge-surface response sourced from the rendered drainage, exposed-stone and height fields, capped at 22% humus darkening and 28% mineral blend.
- Rejects two intermediate crown trials: detail-one ovoid tiers read as repeated eggs, while five smooth spheres read as lollipop crowns. The accepted crown uses one continuous irregular hull instead of hiding repetition with fog.

## Fixed-frame change evidence

Compared with `bounded-brook-ssr-and-stratified-canopy-pass/after`:

- brook review: mean absolute RGB change 1.001; 15.84% pixels changed;
- glade review: mean absolute RGB change 2.059; 19.95% pixels changed;
- ridge-volume review: mean absolute RGB change 1.621; 23.83% pixels changed;
- boundary-forest review: mean absolute RGB change 4.846; 27.36% pixels changed.

Pixel deltas prove fixed views changed, not that subjective parity is complete.

## Runtime evidence

The authoritative Chromium run records 59.9 median FPS, 39.4 FPS one-percent-low, 25.4 ms worst frame, 1912.8 ms to first frame, zero checkpoint console errors, full Strong route completion and clean restart.
