# Bounded volumetric cloud pass

## Accepted changes

- Balanced and high quality now render six bounded world-space cloud volumes instead of
  camera-facing alpha cards. Each cloud intersects the camera ray with its actual 3D domain, then
  marches 12 samples on balanced or 18 samples on high.
- Extinction uses Beer–Lambert attenuation over a step length preserved in world metres. Sun light
  is sampled along the established world-space sun direction, so the lower/deeper medium is darker
  and forward-scattered light is restricted to thin cloud boundaries rather than whitening the
  entire bank.
- The density field has a shared lifting-condensation base, vertically developing ellipsoid lobes,
  smooth unions and three-octave erosion. Wind advects both the volume and its internal density;
  reduced-motion mode deterministically returns both to their authored origin.
- Distant colour is mixed toward the established humidity/fog colour by travel distance. The
  low-quality profile keeps the existing instanced puff geometry and never pays the raymarch cost.
- The hero banks are beyond the playable field. Given the approved sun vector, their projected
  ground shadows fall beyond the local basin; this pass therefore does not invent disconnected
  dark decals under them merely to make the effect more obvious.

## Rejected iterations

- A five-sprite depth stack was rejected even though it softened the old edge. It still produced
  repeated pill silhouettes and could not preserve view-independent optical depth.
- The first raymarched version was rejected because excessive ambient/direct light made the medium
  read as solid white foam. The accepted version raises sun-path extinction, darkens the humid
  underside and limits silver lining to low-density edges.
- A wide base ellipsoid created a horizontal union seam and retained the pill-shaped body. The
  accepted density field removes that slab, smoothly joins buoyant lobes, and clips them only at the
  shared condensation level.
- Four full-resolution light-density samples were visually valid but needlessly expensive. Two
  coarse samples from the same macro density field preserve directional self-shadow while restoring
  the measured frame-time tail.

## Evidence boundary

`before/` is the verified geological-basalt pass. `after/` is the authoritative complete run after
the bounded-volume correction. The run records **404.1 ms** to first rendered frame,
**59.9 median FPS**, **54.5 FPS 1% low** and **18.5 ms worst frame**, a Strong field record, a clean
restart, and no console or `GL_INVALID_*` errors through `12-review-basalt-detail.jpg`.

This pass gives the six visible cloud banks real thickness, view-independent ray/volume
intersection and physically motivated extinction. It is still a bounded single-scattering
approximation: it does not provide an atmosphere-wide spherical cloud shell, multiple-scattering
transport, or a cloud-shadow field shared with the terrain.
