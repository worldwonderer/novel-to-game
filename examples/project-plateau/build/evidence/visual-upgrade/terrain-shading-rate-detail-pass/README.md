# Terrain shading-rate detail pass

## Target

Close the smooth-heightfield gap visible against Web Ocean without changing terrain collision,
sunlight, exposure, fog, emission or bloom. Detail may alter only the optical response below the
shared CPU heightfield's vertex spacing; all load-bearing and hydrological queries remain unchanged.

## Accepted physical model

- Soil albedo, roughness, relief and cavity response sample the same deterministic height package.
  They are separate correlated channels rather than decorative colour noise.
- A continuous world-space triplanar projection weights all three axes with exponent **4**. It has no
  dominant-side branch and therefore no 45-degree projection boundary on the eastern escarpment.
- The two non-round world periods are **47 m** and **13 m**. Their 611 m beat lies beyond the scene,
  while the 13 m layer fades from **45..110 m** so sub-pixel relief does not become distant shimmer.
- The correlated height derivative perturbs the real surface normal by a bounded **0.16..0.21 m**
  optical relief. The former plane-UV tangent normal, albedo and roughness samples are removed rather
  than allowed to stretch down near-vertical ground.
- Signed fine-versus-coarse height residual attenuates only indirect diffuse/specular light, with a
  **0.74** diffuse floor. Direct sunlight remains governed by the actual normal and shadow map; the
  cavity term is not painted albedo or a fake direct shadow.
- Wet, alluvial and route-compacted surfaces reduce both relief and cavity strength. Material
  disturbance therefore responds to the same hydrology, deposition and footfall fields already used
  by the accepted terrain pass.

## Rejected iterations

- `rejected-overfrequent-dominant-side-projection/`: 7.14/2.33 m periods turned the basin into a
  uniform fabric, while a hard choice between X and Z side projections left a mathematical seam when
  the dominant lateral normal changed.
- `rejected-duplicated-planar-tangent-channels/`: continuous triplanar detail and 47/13 m periods
  passed mechanically, but the old plane-UV albedo/roughness/normal path still ran underneath it.
  Keeping that duplicate path preserved the exact steep-ground stretching this pass was intended to
  remove.

## Accepted browser evidence

`after/report.json` records:

- complete Strong result and clean restart: **PASS**;
- WebGL shader compilation and all fixed review cameras: **PASS**, with no console render error;
- terrain: **24,505** shared-heightfield vertices plus the recorded triplanar surface-detail contract;
- daylight: unchanged **0.98** exposure, **2.65** direct sun and **0.0058/m** fog extinction;
- authoritative 180-frame heavy-scene sample: **59.9 median FPS**, **38.8 FPS 1% low**,
  **25.9 ms worst frame**.

The fixed images establish rendering, scale continuity and absence of the rejected plane-UV path.
They do not prove subjective parity with Web Ocean or eliminate the remaining gap in authored terrain
transitions, erosion structures and dressing density.
