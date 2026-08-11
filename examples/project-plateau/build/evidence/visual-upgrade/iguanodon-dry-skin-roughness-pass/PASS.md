# Iguanodon dry-skin roughness pass

## Target

Remove the hero Iguanodon's broad polished-plastic highlight without changing global exposure,
approved daylight, authored colour pattern, normal detail, geometry, animation or collision.

## Root cause

The material scalar was `roughness = 1`, but the renderer then multiplied it by the packed texture's
green channel. That channel measures **0.0078–0.9020** with a **0.4301** mean, so the effective skin
was often far smoother than the declared biological-dielectric contract. The bright back was a BRDF
error, not evidence that the sun or scene exposure was globally too strong.

## Accepted change

- Retains the source albedo, tangent-space normal and packed roughness texture.
- Linearly remaps the authored green-channel variation into a bounded **0.72–0.94** dry-scaled-skin
  range. Observed source texels therefore produce approximately **0.7217–0.9184** effective
  roughness while preserving their relative pattern.
- Keeps approximate IOR 1.42, specular intensity 0.92, environment intensity 0.48, zero metalness,
  zero clearcoat, zero transmission and zero emission.
- Adds no texture, material, draw call or geometry and changes no animation or collision authority.

## Fixed-frame evidence

The deterministic Iguanodon frame changes **10.02%** of pixels above 3/255 and **2.47%** above
12/255. Inside a fixed subject-enclosing polygon, mean luminance falls from **96.20 to 89.63/255**,
the 95th percentile falls from **175.58 to 167.50/255**, and pixels above 220/255 fall from
**1.35% to 0%**. The wider glade context stays localized at **3.79%** above 3/255. The polygon includes
some background and is recorded as a bounded comparison aid, not object-ID segmentation.

See `comparison-iguanodon-skin.jpg` and `metrics.json`.

## Runtime result

- Complete real-input Strong path: **PASS**.
- Launch, rendering, input, core loop, outcome and restart: **PASS**.
- 190/190 application tests: **PASS**.
- 180-frame sample: **59.9 median FPS**, **39.0 FPS 1% low**, **25.8 ms worst frame**.
- Browser/runtime/WebGL errors: none.

## Visual-parity estimate

The editorial parity estimate against the pinned Web Ocean reference moves from roughly **85% to
86%**. This is a visual-direction estimate, not a deterministic QA score.

## Remaining gap

The creature still uses a 1K generated texture and a stylized 25K-triangle mesh. The remaining hero
asset gap is authored scale hierarchy—fine skin breakup, junction detail and species-specific surface
variation—not global gloss or energy conservation.
