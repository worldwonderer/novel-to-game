# Bounded brook SSR and stratified canopy pass

## Accepted changes

- Adds a same-camera, depth-bounded screen-space reflection trace over the existing local planar reflection and scene-layout probe fallback. The 38 m trace uses 12 balanced / 20 high steps and keeps freshwater dielectric F0 rather than forcing an ocean-like mirror response.
- Replaces four-point leaf diamonds with eight-vertex, six-triangle cambered laminae, including stable physical edge loss and colour/depth-shared rare perforations.
- Reallocates the existing 3,942-leaf budget into vertically stratified upper scaffolds after removing one complete primary limb from each broadleaf family and two Araucaria whorl limbs. All removed limbs leave closed, splintered fracture stubs; roots, trunks and branch load paths remain closed and supported.
- The first v7 browser iteration was rejected because upper scaffolds began too low and exposed repeated spear-like leader tips. The accepted revision moves the supporting scaffold origins upward and shortens the bare broadleaf leader; it does not hide the error with extra leaf cards.

## Fixed-frame change evidence

Compared with `terrain-integrated-brook-bank-pass/after`:

- brook detail: mean absolute RGB change 4.381; 24.52% pixels changed;
- canopy-tree detail: mean absolute RGB change 5.266; 27.79% pixels changed;
- complete boundary forest: mean absolute RGB change 2.692; 25.04% pixels changed;
- riparian cover: mean absolute RGB change 6.341; 39.62% pixels changed.

Pixel deltas only prove that the fixed views changed. Visual acceptance came from inspecting the rendered structure, not from maximizing the delta.

## Runtime evidence

The accepted Chromium run records 59.9 median FPS, 38.7 FPS one-percent-low, 26.0 ms worst frame, 2,258.4 ms to first frame, zero checkpoint console errors, full Strong route completion and clean restart.
