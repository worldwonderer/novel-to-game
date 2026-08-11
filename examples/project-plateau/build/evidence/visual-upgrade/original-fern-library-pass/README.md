# Original fern-library pass

## Physical requirements

- Every plant must load through a closed buried rhizome into closed overlapping rachises and then into
  visibly attached leaflets. A floating card cluster or stemless foliage spray is rejected.
- Each instance follows the local terrain normal and is translated only along gravity until every
  support-plane vertex lies inside the recorded terrain-contact band. The rendered heightfield is the
  support truth; distribution density is not allowed to conceal floating roots.
- Wind displacement is zero at the buried rhizome, rises monotonically through the rachis/leaflet
  flex coordinate, remains bounded in world metres, and is identical in colour and directional-depth
  passes. Reduced-motion mode must set time and both displacement strengths to zero.
- Leaf surfaces remain rough, non-metallic and non-emissive. Thin-leaf transmission is bounded by
  Beer–Lambert absorption and the same directional shadow visibility used by the lit surface.
- Understory remains pliable and non-solid. It may overlap deadfall or player movement, but it may not
  acquire false rigid collision authority.

## Accepted changes

- `fern-library-original-v1.glb` is a deterministic project-original 551.3 KB library with three
  distinct families: humid-margin arch fern, drained-slope feather fern and low sheltered cycad-like
  rosette. The source library contains 6,594 triangles and two draw calls per family; runtime reuses
  six instanced meshes for all 120 placements.
- Every family has a closed low rhizome, 8–11 closed tapered rachises and 10–13 pairs of attached
  cambered leaflets. Texture UV and `uv1.y` flex coordinates are independent, so material sampling
  cannot move the mechanical anchor.
- Runtime classification gives moisture and slope priority, then preserves seeded variation for flat
  understory. The accepted distribution is 38 humid-margin, 50 drained-slope and 32 sheltered-low
  instances.
- Each broad support plane aligns to the sampled terrain normal. Curved terrain receives only the
  smallest gravity-axis settlement correction needed to keep every support point inside the locked
  contact band; no plant-specific rotation or looser threshold is used.
- One deterministic local texture source drives correlated leaflet albedo, roughness and relief.
  Vertex colour retains species/vein variation without emission or global lighting changes.
- Colour and custom depth materials share the exact wind displacement function and uniform objects.
  Maximum horizontal/vertical tip displacement is 0.105/0.024 m; the buried base remains fixed.
- The prior procedural three-family meshes remain only as load-failure fallback and are hidden after
  the original library has attached.
- `fernDetail` and `20-review-fern-detail.jpg` expose the accepted root crown, rachis/leaflet attachment,
  neighbouring deadfall relationship and terrain contact.

## Rejected trial

`rejected-sparse-green-rhizome/` preserves the first load. It passed contact checks but its narrow,
sparse leaflets and rounded green root crown read as wire foliage growing from a pot. The accepted
revision repairs geometry ratios and colour at the asset level; no exposure, bloom, emission or
physical-gate relaxation was used.

## Evidence

`before/` contains the prior verified brook/glade frames and report. `after/` is the authoritative
complete run. Its `report.json` records:

- all three variants loaded, 120 instances, six runtime draw calls and the fallback hidden;
- **1,560 / 1,560** rhizome support vertices inside the contact band, support ratio **1.0**, with
  clearances from **-5.5 cm** to **-0.02 cm**;
- 38 humid-margin, 50 drained-slope and 32 sheltered-low placements;
- a zero-flex buried base, bounded 0.105/0.024 m tip displacement and identical colour/depth uniforms;
- **501.9 ms** first frame, **59.9 median FPS**, **39.1 FPS 1% low** and **25.7 ms** worst frame;
- Strong field record, clean restart and all mechanical visual-health gates passed with no console,
  page or WebGL errors.

This closes the repeated sparse procedural ground-fern and static heavy-frond gap. It does not prove
Web Ocean parity: Plateau still needs broader original species/rock libraries, more mature transition
sculpting and production-scale material density across the full environment.
