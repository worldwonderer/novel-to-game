# Ridge crown architecture v3 pass

## Target

Replace the repeated smooth-shell distant canopy with visibly supported, non-identical crown
architecture while preserving the accepted terrain establishment, exact root support, collision
boundary and six-draw-call ridge-forest budget.

## Accepted change

- Each broad crown now combines one closed dominant upper mass, three closed flattened shoulder
  cohorts and three closed tapered structural forks. All seven components remain inside the same
  instanced broad-crown draw call for each ridge.
- The fork roots overlap the existing trunk top and terminate inside their shoulder cohorts. Fork
  vertices are excluded from foliage radial damage and lean deformation, so the load path cannot
  warp like leaf mass.
- Three recorded architecture bands—juvenile pioneer, layered mature and weathered emergent—derive
  from height/age, rendered slope, drainage, exposed stone and stable position phase. The accepted
  run contains nonzero members in every band on both ridges.
- Per-instance asymmetry and source damage are bounded to 10% crown-local lean and 19% radial indent.
  Mature breadth, shoulder exposure, yaw and the broader 3.0–9.4 m source-height envelope change the
  distant silhouette without creating new instances.
- Narrow crowns retain their closed layered-lathe grammar. Total mature trees remain 598, gap
  understory crowns remain 220, roots remain on the exact rendered ridge triangles, and collision
  remains non-solid background-only.

## Rejected visual attempts

Three mechanically passing versions are retained as evidence rather than silently overwritten:

1. `rejected-v1-lollipop-cauliflower-silhouette`: four equal lobes read as toy balls.
2. `rejected-v2-regular-droplet-load-path`: a dominant shell removed the balls but produced repeated
   water-drop silhouettes with no visible fork.
3. `rejected-v3-forks-occluded-by-main-crown`: the load path existed, but the main crown swallowed the
   shoulder cohorts at actual field distance.

The accepted version narrows the main mass and lets flattened shoulder cohorts cross the silhouette
only where a tapered fork supports them.

## Fixed-frame evidence

The dedicated ridge frame changes **8.70%** of pixels above 3/255 and **3.24%** above 12/255. The
closer boundary-forest frame changes **11.75%** and **5.96%**, respectively, where fork support and
shoulder asymmetry are most legible. Other fixed context frames remain localized at **4.43–8.22%**
above 3/255. See `metrics.json` and `comparison-contact-sheet.jpg`.

## Runtime result

- Complete real-input Strong path: **PASS**.
- Launch, rendering, input, core loop, outcome and restart: **PASS**.
- 190/190 application tests: **PASS**.
- 180-frame sample: **59.9 median FPS**, **39.2 FPS 1% low**, **25.6 ms worst frame**.
- Ridge forest: **598 trees + 220 understory crowns**, **818 total crowns**, **6 draw calls**.
- Root support: **598/598 trees and 220/220 understory crowns**, zero positive clearance.
- Browser/runtime/WebGL errors: none.

## Visual-parity estimate

The editorial parity estimate against the pinned Web Ocean reference moves from roughly **83% to
85%**. This is a visual-direction estimate, not a deterministic QA score. The pass closes the most
obvious repeated distant-crown failure; it does not claim asset parity.

## Remaining gap

The ridge canopy is still a deliberately bounded low-poly background system. Web Ocean retains
higher within-species asset breadth, canopy-scale coverage and more authored surface response.
Plateau's largest remaining gap is now hero/near-field asset surface fidelity and broader
within-family vegetation variation, not root support or distant crown topology.
