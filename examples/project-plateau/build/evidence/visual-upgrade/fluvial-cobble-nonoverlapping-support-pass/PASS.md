# Fluvial cobble non-overlapping-support pass

## Target

Remove the physically impossible black horizontal band visible on the foreground brook stone and make
both historical lag clasts and small bed/bar stones obey a closed, supported, non-overlapping
stone-contact model.

## Root cause

Two separate implementation errors combined in the review frame:

1. Historical lag clasts began as spheres whose lower latitude rings were clamped onto one plane while
   their original indices remained. That created coplanar overlap and degenerate lower faces.
2. Small brook/ground stones were supported by duplicated sphere-pole vertices and sampled a spherical
   albedo/roughness/bump UV on a new ring-stack silhouette. The shared bottom-cap normals and the UV
   latitude produced the sharp black belt seen in the supplied screenshot.

The first corrected topology still left the second object's belt visible; that iteration was rejected
by the fixed brookSurfaceProfileDetail view rather than accepted on test output alone.

## Accepted change

- Rebuilds each historical fluvial clast as one indexed closed shell with a single broad support ring,
  unique-height rounded crown courses and a non-overlapping bottom cap.
- Rebuilds the **56** small active-bed/point-bar stones with the same monotonic support-to-crown
  principle instead of a rounded sphere penetrating the terrain.
- Splits side-course and downward-cap vertices at the geometric base. Side support normals now remain
  outward/upward while the independently wound bottom cap remains downward-facing.
- Records zero collapsed support rings and minimum local triangle areas of **0.012756 m²** for the
  historical family and **0.025994 m²** for the small-stone carrier.
- Uses **29** terrain-contact vertices per historical clast and **21** per small stone. The six solid
  historical lag clasts retain the exact **1.06–1.315 m** long-axis range, **0.387** maximum brook-
  width fraction, shallow burial and matching colliders.
- Retires spherical UV sampling from the small-stone material. Seam-free vertex mineral variation,
  #858e89 bounded colour, **0.96** roughness, zero metalness and low environment response replace
  the banded map while preserving one instanced draw.
- Keeps all **36** active-bed and **20** point-bar stones non-solid and excludes point-bar placements
  from route wear.

## Fixed-frame evidence

The grazing free-surface profile changes **7.11%** of pixels above 3/255 and **3.32%** above 12/255.
The brook-detail, boulder-detail and obstacle-flow views remain localized at
**2.50–3.94% / 0.29–1.24%**. In the accepted frame the foreground stone is one continuous gray
dielectric mass: the black belt, bright lower pedestal and overlapping support shell are absent.

See comparison-fluvial-cobbles.jpg and metrics.json.

## Runtime result

- Complete real-input Strong path: **PASS**.
- Launch, rendering, input, core loop, outcome and restart: **PASS**.
- 194/194 application tests: **PASS**.
- 180-frame final sample: **59.9 median FPS**, **39.2 FPS 1% low**,
  **25.6 ms worst frame**.
- Browser/runtime/WebGL errors: none.

## Visual-parity estimate

The editorial estimate against pinned Web Ocean commit
6496c77d37c12e803108c8f932680a7710a62c1c moves from roughly **95% to 96%**, with an honest
uncertainty of about **±3 percentage points**. This is a visual-direction estimate, not a
deterministic QA score.

## Remaining gap

The contact defect is closed, but the small stones intentionally use low-cost vertex mineral
variation rather than individually authored scanned surfaces. Further work should add original
stone-family breadth only if a new fixed hero view demonstrates a material identity gap without
reintroducing UV seams, floating contact or false transport claims.
