# Tessellated brook free-surface pass

## Accepted changes

- Replaces the 73-row, four-vertex cross-section water carrier (292 vertices / 432 triangles) with 289 rows and thirteen cross samples (3,757 vertices / 6,912 triangles). This remains negligible beside the accepted environment asset budget.
- Interpolates one gravity base level, branch direction and grade energy per row. Every vertex across that row begins at the same water level; terrain cannot tilt the free surface across the channel.
- Reuses the exact twelve rendered-clast uniforms in the vertex shader. Stagnation pressure raises the upstream nose by at most 3.2 cm, shoulder acceleration draws the surface down by at most 1.2 cm, and the expanding alternating wake displaces it by at most 1.8 cm.
- Clamps aggregate vertical displacement to ±3.8 cm and adds that displacement back to the measured water column used by refraction and Beer–Lambert absorption.
- Adds no ocean-scale base wave, collision authority, bank geometry, particle foam, secondary water plane or static ripple overlay. The 48 retired torus overlays remain absent.
- Adds a grazing QA-only `brookSurfaceProfileDetail` camera so water/rock silhouette errors are not hidden by the existing downward review cameras.

## Physical boundary

The upstream rise and shoulder drawdown follow the pressure/speed relationship of the same bounded cylinder approximation used by the surface-normal pass; the downstream term is zero-mean alternating shedding inside the already bounded wake envelope. This is a visual centimetre-scale free surface, not shallow-water CFD, exact discharge/velocity, volume-conservation or transport-competence proof.

## Fixed-frame change evidence

Compared with `rendered-clast-obstacle-flow-pass/after`:

- brook review: mean absolute RGB change 0.289; 2.87% pixels changed above 3/255;
- brook-detail review: mean absolute RGB change 0.375; 3.55% pixels changed above 3/255;
- brook-boulder review: mean absolute RGB change 0.507; 4.28% pixels changed above 3/255;
- obstacle-flow close review: mean absolute RGB change 0.700; 6.33% pixels changed above 3/255;
- isolated water/contact crop in that close review: mean absolute RGB change 2.561; 24.32% pixels changed above 3/255.

The localized delta is expected: only water vertices inside selected rendered-clast pressure and wake envelopes move. Pixel deltas prove that the fixed water region changed, not that subjective Web Ocean parity is complete.

## Runtime evidence

The authoritative Chromium verification records 1,930.5 ms to first frame, 59.9 median FPS, 39.1 FPS one-percent-low, 25.6 ms worst frame, zero recorded browser/shader errors, all six complete-run checks, Strong route completion and clean restart. `npm test` passes 188/188 tests and `npm run verify` reports authoritative verification PASS.
