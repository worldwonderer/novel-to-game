# Daylight energy balance pass

## Target

Recover the visible terrain, bark, leaf and ridge information that remained crushed after the asset
passes, without pretending that exposure, emission or a directionless ambient lift was new material
detail. The accepted change had to preserve the approved late humid sun direction, keep highlights
below clipping, retain local shadows and derive the additional fill from physically named sources.

## Accepted result

- `DAYLIGHT_ENERGY_PROFILE` records one shared late-humid-day energy contract. The approved sun stays
  at intensity `2.65`; terrain and asset albedos are unchanged.
- Directionless ambient light falls from `0.16` to `0.08`. Directional sky/ground irradiance rises
  from `0.42` to `0.68`, so upward and downward surface orientation still matters rather than every
  shadow receiving the same lift.
- The existing Preetham physical sky now drives rough-dielectric PMREM response at `0.30` instead of
  `0.12`. It remains separate from the bounded display sky, so a bright visible horizon cannot become
  an unbounded reflection source.
- Homogeneous humid-air extinction changes from `0.0071` to `0.0058` per world metre. Far ridges and
  the tree line retain aerial depth, but the medium no longer removes almost all local contrast before
  asset detail can be read.
- ACES exposure moves from `0.88` to `0.98`, a bounded final encoding adjustment after the light-source
  rebalance. It is not the sole or largest energy change.
- Existing local glade, subject, canopy and basalt lights retain their previous intensities. Shadow
  maps and the bounded world-space GTAO contact term remain active.

## Same-camera display evidence

The screenshot measurements below are display-space diagnostics, not scene-linear radiometry:

- `08-review-brook.jpg`: p10/p50/p90 moves from `37.3/70.0/137.6` to
  `65.0/97.2/146.5`.
- `10-review-glade.jpg`: p10/p50/p90 moves from `42.6/72.6/137.5` to
  `71.5/102.6/147.6`.
- `13-review-ridge-volume.jpg`: accepted p10/p50/p90 is `67.1/107.8/148.1`.

The narrow p90 increase and much larger p10 increase show shadow recovery without a white shoulder.
The fixed frames retain visible cast shadows, terrain relief, humid distance separation and the late
warm horizon. No bloom, emissive vegetation, fake ground light or material-albedo increase was added.

## Evidence

`after/report.json` records:

- the exact daylight profile and its named energy sources in the runtime snapshot;
- sky-to-residual-ambient ratio `8.5`, sun-to-sky ratio `3.8971` and
  PMREM-to-sky ratio `0.4412`;
- shadow map and world-space contact occlusion still enabled;
- **686.7 ms** first frame, **59.9 median FPS**, **39.1 FPS 1% low**, **25.7 ms** worst frame;
- Strong field record, clean restart and all mechanical visual-health checks passing.

These measurements prove the accepted energy configuration and runtime health. They do not prove
subjective parity with Web Ocean or that every material has production texel density.
