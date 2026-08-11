# Original understory consolidation pass

## Target

Remove the remaining large procedural triangle foliage from the verified brook/glade frames without
making the central gameplay sightline artificially dense or weakening the terrain-support, collision,
quality-scaling and wind/shadow contracts.

## Accepted changes

- The existing original fern GLB is reused as a second instanced batch rather than adding another
  asset or copying the source geometry. Six additional draw calls cover 88 static accents:
  24 tree-fern understory skirts, 36 wetland accents and 28 route-margin accents.
- Original procedural positions, seeded rotations, colour roles and wetland/margin ecology are
  retained. The replacement batch reclassifies them against the same terrain wetness and slope truth,
  yielding 47 humid-margin, 9 drained-slope and 32 sheltered-low variants.
- Each placement scales the whole rhizome/rachis/leaflet load path together. Mature envelopes are
  locked per role: 1.45 × 0.40 m for tree-fern skirts, 1.40 × 0.50 m for wetland accents and
  1.80 × 0.90 m for route-margin accents. All 88 instances pass.
- All 1,144 root support vertices lie 2.56–3.91 cm below the rendered terrain. The replacement remains
  pliable/non-solid and does not alter collision truth.
- Colour and directional-depth passes retain the same bounded fern wind function and uniform objects.
  The complete accent anchor remains inside the existing degradable group, so low quality removes
  all six accent draw calls while balanced/high renders them.
- If either original fern batch fails, its procedural meshes are restored and any partially attached
  original batch is hidden, avoiding doubled foliage.

## Visual result

`before/21-review-ground-cover-detail.jpg` shows the remaining large, pale triangle fronds surrounding
the accepted ground cover. The same fixed camera under `after/` removes those forms while preserving
brook-bank vegetation, root contact and the open route. The wide brook/glade cameras become less
cluttered rather than replacing bad geometry with physically oversized ferns.

## Evidence

`after/report.json` records:

- 132 primary/foreground original ferns plus 88 quality-gated original accent ferns;
- twelve total runtime fern draw calls, both procedural fallback sets hidden;
- **1,144 / 1,144** accent-rhizome support vertices inside the contact band;
- all three role-specific mature dimension envelopes passing;
- **407.6 ms** first frame, **59.9 median FPS**, **53.9 FPS 1% low** and **18.6 ms** worst frame;
- Strong field record, clean restart and all mechanical visual-health gates passed with no console,
  page or WebGL errors.

This closes the static procedural fern-skirt/wetland-accent gap. Five interactive brook-response
fronds and some aggregate canopy/cover silhouettes remain procedural; the larger Web Ocean gap still
includes terrain transition sculpture, curated asset breadth and production material density.
