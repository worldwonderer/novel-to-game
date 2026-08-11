# Original hero Ginkgo asset pass

## Physical requirements

- The landmark must expose one continuous terrain → root flare → trunk → primary branch → terminal
  branch → petiole → closed fan-leaf support chain. Crown density cannot be created with unsupported
  cards or floating aggregate blobs.
- Surface roots may be visible only where they emerge from the trunk flare. Their terminal sections
  must pass below the sampled soil plane, and the placement may not use a visual-only offset that
  disagrees with collision or terrain height.
- Bark and leaves are rough non-metallic dielectrics. Direct sun may create bounded reflected light,
  but neither material may use emission, white albedo, bloom or exposure compensation to fake detail.
- The asset must remain project-original under the connected-environment originality boundary. The
  Web Ocean asset set is used only to identify the fidelity gap, not copied into this build.

## Accepted changes

- `scripts/generate-hero-gingko.mjs` deterministically authors a project-original binary GLB using the
  installed Three.js toolchain. The accepted file is **4,548,404 bytes**, **42,084 triangles**, two
  draw calls and **583** closed bilobed fan leaves. Its SHA-256 is
  `6108e4fc948ebc7f1096e0f2b94de831e775a1bcc9a6a92c47488365ef8e1f37`.
- Seven non-uniform surface roots begin inside the load-bearing trunk flare and terminate at local
  `y=-0.14`; the exported bounds reach `y=-0.1978`. At the selected terrain anchor, the sampled
  ground variation across a 1.1 m root radius remains below 0.08 m, so the root tips stay buried
  without sinking the trunk.
- Ten primary branches and thirty terminal branch points carry every visible petiole and leaf cluster.
  The darker mapped bark and green leaf albedo enter the standard diffuse energy path; runtime
  preparation clamps metalness to zero, roughness to at least 0.8, environment response to 0.42 and
  emission to zero.
- The visible tree, terrain anchor and circular trunk collider all use `HERO_GINGKO_LAYOUT`. The
  1.48 m radius / 12.8 m high collider remains registered to
  `world.landmark.fort-gingko`, while an original non-emissive procedural tree remains as a loader
  failure fallback.
- Two new deterministic review cameras record the complete root-to-crown silhouette and a low root
  contact inspection. These are now part of the authoritative complete-run QA rather than an ad hoc
  developer capture.

## Rejected iteration

`rejected-white-bark-stilt-roots/` records the first loaded version. Its white material multiplier
turned bark into a chalk-like reflector, 403 leaves left the crown too sparse, and eight long roots
ended at the ground plane, making the tree read as if it stood on radial stilts. Raising global
exposure or hiding the root zone with vegetation was rejected: neither would repair the material
energy input or the soil/support relationship. The accepted generator darkens the dielectric base,
adds supported leaf density, shortens the roots and buries their terminal sections.

## Evidence boundary

`before/` is the verified bark/leaf-family result. `after/` is the authoritative complete run with
the original landmark loaded. The direct evidence is:

- `after/14-review-gingko.jpg`: complete silhouette, root-to-crown support hierarchy, restrained bark
  response and 583-leaf crown;
- `after/15-review-gingko-root.jpg`: trunk flare and root terminals intersect the terrain instead of
  floating above it;
- `after/report.json`: **471.2 ms** first rendered frame, **59.9 median FPS**, **39.3 FPS 1% low** and
  **25.5 ms worst frame**, with no console errors in either Ginkgo review capture;
- `npm run verify`: Strong field record, clean restart and all required browser gates passed.

This proves one reproducible original hero environment asset, its material-energy bounds, terrain
support and collision agreement. It does not prove Web Ocean parity. Most Plateau habitat forms still
come from the procedural kit, and the build still lacks a broader production asset library, textured
bark/leaf microdetail, wind deformation and curated slope dressing.
