# Grounding and basalt escarpment pass

## Physical requirements

- Contact darkening may attenuate only local indirect light. It may not act as a screen vignette,
  painted blob shadow or metre-spanning substitute for missing geometry.
- The three basalt sources must belong to one continuous load-bearing landform. A shelf module may
  not sit on an unrelated flat plane or bridge across terrain with unsupported bottom vertices.
- The landform must remain outside traversal. `NAVIGATION_BOUNDS.maxX` is 29 m and the 0.6 m player
  capsule therefore reaches at most `x=28.4`; the accepted analytic rise starts at `x=29.15`.
- The escarpment is a continuous single-valued heightfield with no overhang. Its full 3.15 m source
  elevation is reached at `x=29.65`, before the closest shelf footprint begins near `x=29.84`.
- Rock and ground stay rough, non-metallic and non-emissive. Exposure, bloom and fake shadows may not
  hide a support failure.

## Rejected branches

1. A physically evaluated terrain sky-view term was not shipped. Across the current basin its true
   range was only `0.996056…–1.000` (mean `0.999387`) because the terrain slopes do not occlude the
   approved sun/sky hemisphere meaningfully. Amplifying that near-unity signal would have invented
   dramatic terrain shadow rather than revealing a real one.
2. The first broad escarpment ramp rose gradually from `x=29` to the shelf plateau. Existing
   bottom-vertex tests found that its slope passed underneath the 7.7 m-wide shelf modules and left
   their west contact corners roughly 1.5–2.8 m unsupported. The rejected frames are retained in
   `rejected-broad-ramp-floating-footprint/`; this version was not promoted.

## Accepted changes

- Balanced/high quality GTAO now uses a **0.72 m world-space radius**, **0.82 m thickness**, six
  samples and a **0.30 blend**. Low quality still disables GTAO. Transparent vegetation, water,
  atmosphere and first-person tools remain excluded, avoiding alpha-card halos and self-shadowed UI.
- Three overlapping source bands at `z=-50`, `-26` and `-3` form one navigation-exterior eastern
  shoulder. Deterministic 11% FBM breakup changes the crest without opening holes or creating
  unsupported overhangs.
- The accepted steep rise completes before any original shelf footprint. Browser evidence records
  **60/60 buried bottom vertices** at every formation; maximum bottom clearance is `-0.3364`,
  `-0.3609` and `-0.2670` m and the closest complete footprint remains beyond `x=29`.
- Terrain weathering now treats the raised west face as the same sourced basalt family while keeping
  the central glade unpainted. The change does not alter the route heightfield west of the boundary.
- `terrainDetail` now documents basin aggregate and the exterior apron. `escarpmentDetail` separately
  documents basin foot → continuous cliff face → buried shelf. Runtime snapshots expose the actual
  tone mapping, shadow map, GTAO scale and geological topology rather than relying on screenshot
  interpretation alone.

## Evidence boundary

`before/` is the verified original-basalt-shelf pass. `after/` is the authoritative run for this
pass. Direct evidence includes:

- `before/12-review-basalt-detail.jpg`: shelf modules stand on the former nearly flat basin surface;
- `after/12-review-basalt-detail.jpg`: all three modules rise from a connected eastern shoulder;
- `after/16-review-terrain-geology-detail.jpg`: basin soil, weathering transition and cliff foot;
- `after/17-review-basalt-escarpment-contact.jpg`: the full physical support chain at a low fixed
  camera, with no blank/crushed-frame failure;
- `after/report.json`: contact-occlusion parameters, continuous-heightfield topology, source heights,
  asset support evidence, **418.4 ms** first frame, **59.9 median FPS**, **39.2 FPS 1% low** and
  **25.5 ms worst frame**;
- `npm run verify`: Strong field record, input, outcome, restart, console/GL and visual-health gates
  passed.

This pass removes the largest immediate grounding failure, but it does not prove Web Ocean parity.
The escarpment face is still generated from one terrain/material system, shelf silhouettes are reused,
and the wider scene still lacks a production-scale original rock/tree library, local erosion variants,
wind response and Web Ocean's curated dressing density.
