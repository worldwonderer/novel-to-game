# Canopy wind coupling pass

## Physical requirements

- Wind bends flexible leaf tips; it does not translate trunks, detach the card base from its secondary
  branch or move the complete crown as one rigid blob.
- The visible leaf and its directional-light shadow must use the same displacement function and the
  same live uniforms. Static shadow cards under moving leaves are rejected.
- Motion stays within plant-scale deflection: at full settings the maximum authored horizontal tip
  displacement is 0.085 m and the vertical flutter is 0.018 m.
- Reduced-motion mode sets both displacement strengths and wind time to zero instead of leaving a
  slower but persistent oscillation.

## Accepted changes

- Both branch-supported atlas families now receive a coherent world-direction wind field. A low
  0.82 Hz macro bend and restrained 2.3 Hz leaf flutter vary by world position so the tree line does
  not pulse in lockstep.
- Displacement is weighted by `uv.y`: the card's branch/rachis edge remains fixed, and flexibility
  grows toward the leaf tips. Tree roots, trunks, primary/secondary branches and aggregate crown
  shadow volumes remain stationary.
- A custom depth material reuses the exact colour-pass uniform objects and vertex deformation for
  directional-light shadow rendering. Alpha testing remains active, so the moving shadow follows the
  leaf atlas rather than its full rectangular card.
- Runtime evidence exposes wind direction, amplitudes, frequencies, anchor interval, current time,
  current strength and shadow-coupling contract for both 43-instance elliptic-waxy and 42-instance
  compound-lanceolate families.

## Evidence boundary

`before/` is the verified basalt-library result without general canopy motion. `after/` is the
authoritative wind-coupled run. `motion-evidence/` holds the same fixed `brook` and `glade` cameras at
6.0 and 14.75 seconds; animal and atmosphere animation also change between those frames, so the
images document live rendering but are not used alone to attribute every changed pixel to wind.
Direct evidence includes:

- `after/report.json`: both leaf families report branch-attached tip deformation, 0.085/0.018 m
  amplitudes, shared colour/depth uniforms and reduced-motion disablement;
- unit QA: full-strength time advances at 3.25 s, reduced motion resets time and both strengths to
  zero, and colour/depth materials share the same uniform object;
- runtime shader compilation: no page/console/WebGL errors in the fixed-camera or complete-run paths;
- **488.4 ms** first frame, **59.9 median FPS**, **39.3 FPS 1% low** and **25.5 ms worst frame**;
- `npm run verify`: Strong field record, input, outcome, restart and visual-health gates passed.

This closes the missing broadleaf edge-motion contract. It does not yet add wind deformation to the
heavier fern crowns or ground ferns, and it does not replace the remaining need for broader original
species and slope-exposure asset families.
