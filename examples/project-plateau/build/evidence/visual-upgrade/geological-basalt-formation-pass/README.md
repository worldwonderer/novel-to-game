# Geological basalt formation pass

## Accepted changes

- Eighteen red-basalt pillars now form three six-column joint sets. Each set shares one cooling-front
  normal with bounded local variation instead of giving every column an unrelated tilt.
- Columns use a subtly tapered hexagonal joint cell, two polygon-following cross-joints, a jagged
  broken top and metre-scale diameters. The bases are buried into a low terrain-conforming bedrock
  trace rather than placed on top of the soil.
- Rubble is sourced from actual pillar bases and preferentially settles downslope with bounded
  pitch/roll. The previous basin-wide random scatter was replaced by local talus.
- Basalt now has separate tileable albedo, roughness and height maps built from multiscale value
  noise. The maps preserve the approved matte red landmark while keeping roughness/relief data out
  of the colour channel.
- The stable `basalt` review shot is retained for before/after comparison. `basaltDetail` adds a
  close but complete view of all three formations, joint direction, burial and talus contact.

## Rejected iterations

- A first visible bedrock apron was rejected because raw linear vertex colours made it a pale stone
  platform. A second version still read as a red carpet. The accepted outcrop trace is nearly flush
  with the terrain and exists mainly to close contact gaps under the columns.
- Reusing the old sinusoidal fracture map on the narrower pillars produced obvious vertical wood
  grain. It was replaced with separated, tileable value-noise maps and sparse warped fractures.
- Large pale mineral crusts and randomly oriented spalls read as stickers. Their accepted forms are
  smaller, darker and aligned to the column face; horizontal ledges keep bounded thickness.

## Evidence boundary

`before/` is the verified scene-depth-refraction pass. `after/` is the authoritative complete run
after the geological correction. The run records **59.9 median FPS**, **54.2 FPS 1% low** and
**18.5 ms worst frame**, a Strong field record, a clean restart, and no console or `GL_INVALID_*`
errors through `12-review-basalt-detail.jpg`. This improves geological support and material
separation; it does not turn the procedural formation into a production-scanned rock asset.
