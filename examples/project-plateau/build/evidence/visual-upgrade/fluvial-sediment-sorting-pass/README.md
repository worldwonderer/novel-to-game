# Fluvial sediment sorting pass

This pass does not add a decorative bank colour ring or scatter arbitrary stones. It reuses the
same brook control-line frame, bend curvature and shared CPU heightfield that already drive channel
incision, point-bar accretion and cut-bank erosion.

## Accepted result

- Inner bends expose a coarse-sand / rounded-fine-gravel point-bar material.
- Older low-energy benches retain smoother, high-roughness overbank silt.
- Outer bends expose cohesive cut-bank subsoil instead of receiving depositional colour.
- Terrain colour, roughness, optical relief and indirect cavity read the same three process weights.
- The 56 existing non-solid small stones are no longer spread uniformly across the channel: 36 stay
  inside the active bed-load corridor and 20 settle only in source-qualified inner-bend coarse lag.
- Every stone retains terrain-normal alignment, shallow burial and at least eleven support contacts;
  point-bar stones also exclude route-wear locations.
- River, route and collision geometry, sunlight, exposure, fog, emission and bloom are unchanged.

## Rejected result

`rejected-unpacked-process-attributes/` records the first browser output. Three new scalar terrain
attributes exceeded the runtime GPU vertex-attribute limit, causing a shader validation failure and
large triangular fallback colour fields. The accepted result packs point bar, floodplain silt and cut
bank into one `vec3` attribute and all interpolated process values into four vectors. Browser console
errors return to zero.

## Evidence boundary

The fixed cameras and machine snapshots prove deterministic process classification, support,
collision policy and basic rendering health. They do not establish subjective parity with Web Ocean.
