# Rendered-clast obstacle-flow pass

## Accepted changes

- Builds the local flow field from the exact settled world bounds of 56 rendered bed/bar stones and six historical flood-lag clasts. It rejects 25 candidates outside the rendered wetted channel and qualifies 37 upper-column contacts.
- Ranks qualifying obstacles by rendered radius, upper-water-column contact and local grade energy, then uses one fixed twelve-obstacle shader budget with 4/8/12 low/balanced/high activation.
- Uses the local branch-converging downstream tangent from the sampled hydrology. A bounded cylinder potential-flow approximation bends the local surface around each clast; upstream compression and an expanding downstream separation/shedding envelope modulate normal slope, roughness and aeration.
- Caps aggregate obstacle normal slope at 0.052 and source aeration at 0.31. The accepted scene reaches 0.04205 and 0.27918. This is explicitly not CFD, discharge, velocity, transport-competence or exact-wave-spectrum proof.
- Keeps all 48 retired static torus overlays absent. The 2.48 m residual bank erratic remains outside the obstacle field because its rendered bounds do not intersect the wetted channel.
- Adds `brookObstacleDetail`, a fixed QA-only camera that isolates the selected historical lag clast and the shared water/stone contact without altering gameplay composition.

## Rejected intermediate result

The first browser trial compiled and passed mechanics, but its 0.034 slope / 0.24 aeration caps were visually swallowed by the pre-existing stochastic flow normals. It was not archived as accepted progress. The final pass raises the still-bounded local caps and includes potential-flow upstream compression in the same contact-energy chain; it does not add decals, particles or disconnected foam geometry.

## Fixed-frame change evidence

Compared with `terrain-coupled-ridge-canopy-pass/after`:

- brook review: mean absolute RGB change 0.230; 2.12% pixels changed above 3/255;
- brook-detail review: mean absolute RGB change 0.260; 2.43% pixels changed above 3/255;
- brook-boulder review: mean absolute RGB change 0.316; 2.60% pixels changed above 3/255;
- the water/contact crop inside the brook-detail frame: mean absolute RGB change 0.756; 6.35% pixels changed above 3/255.

The small full-frame delta is expected because the response is spatially limited to stones whose exact bounds touch the upper water column. Pixel deltas prove that the fixed water region changed, not that subjective Web Ocean parity is complete.

## Runtime evidence

The authoritative Chromium verification records 1,886.3 ms to first frame, 59.9 median FPS, 39.1 FPS one-percent-low, 25.7 ms worst frame, zero recorded browser/shader errors, all six complete-run checks, Strong route completion and clean restart. `npm test` passes 188/188 tests and `npm run verify` reports authoritative verification PASS.
