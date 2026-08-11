# Segmented brook reflection and hydrology pass

## Target

Remove the physically false assumptions underneath the creek before increasing its visual effect.
The previous water mesh copied the terrain height independently at every cross-channel vertex and
used one horizontal reflection plane at `(-10.5, 28)` for the entire 166 m ribbon. A direct audit of
the 73 rendered centreline rows found 35 rows rising along the single animated flow direction, a
`3.55 m` climb after the interior low point, and up to `0.0507` cross-channel grade. A brighter or
more reflective shader would only have made those errors more visible.

## Accepted physical model

- `brook-hydrology.js` treats the mapped line as two headwater reaches that lose gravitational head
  toward the existing interior saturated hollow. The north and south reaches drop `3.0870 m` and
  `3.6565 m` respectively; flow direction reverses across centreline row `35` rather than climbing
  out of the basin.
- The free surface is level across each four-vertex channel row. It no longer inherits the bank's
  transverse terrain slope. A bounded monotonic lift removes only centimetre-scale procedural bed
  humps: maximum additional ponding is `0.1273 m`, maximum centre-bed clearance is `0.2473 m`, and
  minimum downstream grade is `0.0008`.
- The measured downstream grade ranges to `0.102611`. That real hydraulic energy now increases
  normal breakup, roughness and texture-correlated aeration on steep reaches while reducing their
  sharp planar lobe. Slow reaches retain the calmer dielectric response. No emission, bloom or
  albedo lift was added.
- Both texture scales move toward the confluence. Runtime evidence records independent north/south
  UV offsets and a zero-flow confluence row instead of one basin-wide `-time` direction.

## Accepted reflection model

- Nineteen short reaches are derived from the same water levels used by the rendered mesh. Each
  stores its real centre height, longitudinal tangent, upward free-surface normal, spatial extent,
  maximum plane-fit deviation and positive downstream drop. No reach crosses the confluence.
- The existing single `320x180` render target is retained. At the bounded capture cadence the camera
  selects the most relevant visible reach and moves/rotates the Three.js `Reflector` to that reach's
  real plane before applying oblique clipping.
- The reflection shader accepts that target only inside the active reach footprint and plane-fit
  tolerance. Other water falls back to the existing bounded scene-layout probe rather than sampling
  a mirror captured at the wrong height. High-energy reaches further reduce the sharp planar term.
- Refraction remains the same-camera `480x270` colour/depth capture with inverse-projected geometric
  path length and Beer-Lambert absorption. Render target, viewport, scissor, XR, shadow and hidden
  object state restoration remain unchanged.

## Visual rejection and acceptance

`rejected-uniform-surface-energy/` records the first gravity/segmentation result. It removed the
wrong basin-wide mirror but still treated a 10% reach like the calm water, leaving a uniformly smooth
silver-road read. The accepted `after/` result couples surface breakup to the measured downstream
grade. Fixed `08-review-brook.jpg`, `11-review-brook-detail.jpg` and
`19-review-brook-boulder-detail.jpg` show no reflection jump, wrong-height reflected trunk, bank
cutaway, white clipping or missing instanced geometry. These are visual hard-reject checks, not a
claim that subjective water quality now equals Web Ocean.

## Evidence

`after/report.json` records:

- 73 surface rows, confluence row 35, zero cross-channel grade, 19 reflection reaches, bounded
  ponding/clearance and the exact downstream grade/energy range;
- ready local planar plus scene-layout reflection and same-camera depth refraction, 4 reach switches
  across the complete route and fixed review-camera sequence, and no render error;
- **633.7 ms** first frame, **59.9 median FPS**, **39.2 FPS 1% low** and **25.5 ms** worst frame over
  180 sampled frames;
- Strong field record, clean restart and all mechanical visual-health checks passing.

The performance and screenshot checks prove execution, state safety and bounded exposure only. They
do not prove subjective parity with Web Ocean, other-browser performance, or full production water
fidelity.
