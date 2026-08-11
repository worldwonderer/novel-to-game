# Original ground-cover library pass

## Physical requirements

- Every plant must carry visible mass from a buried closed root crown through closed overlapping
  petioles or sheaths into attached thin leaf surfaces. Floating cards, stemless foliage and visible
  pot-like support shortcuts are rejected.
- Instance scale is constrained by a family-specific mature-size envelope. Placement values authored
  for the smaller procedural fallback cannot be applied unchanged to the production mesh.
- Every root support vertex must lie inside the locked rendered-heightfield contact band. A point on
  a sharp analytic terrain break must move by the smallest bounded horizontal distance to continuous
  soil; support thresholds may not be widened to make an impossible bridge pass.
- Wind is zero at the root crown, increases along independent `uv1.y` flex coordinates and uses the
  same function and uniform objects in colour and directional-depth passes. Reduced motion disables
  all displacement.
- Leaves remain rough, non-metallic and non-emissive. Bounded thin-leaf transmission may restore
  backlighting, but exposure, bloom and emission may not conceal geometry or support failures.
- Ground cover and ferns remain pliable and non-solid; the physical visual does not invent rigid
  collision authority.

## Accepted changes

- `ground-cover-library-original-v1.glb` is a deterministic project-original 95.1 KB library with
  brook arrowhead, shade rosette and slope sedge families. It contains 1,590 source triangles and two
  draw calls per family; runtime reuses six instanced meshes for all 360 placements.
- Arrowhead and rosette leaves use shared vertices across nine longitudinal spans, rounded width
  profiles, continuous normals, centre-ridge camber and attached petioles instead of independent
  triangular plates. Sedge blades retain their segmented gravity curve and closed sheaths.
- Family scales are locked to measured mature envelopes. The measured maxima are 1.447 m × 0.4704 m
  for arrowhead colonies, 1.1663 m × 0.2795 m for shade rosettes and 1.1196 m × 0.7359 m for sedge
  fans; all 360 instances pass their declared diameter and height bounds.
- Moisture and slope classification yields 120 brook arrowhead, 88 shade rosette and 152 sedge
  instances across four recorded habitat roles.
- All 3,960 support-plane vertices lie inside the `-4.5 cm .. +1.5 cm` contact band. One placement on
  the analytic escarpment break is moved 0.12 m to adjacent continuous soil; no clearance or burial
  threshold is relaxed.
- The twelve oversized legacy `foreground-depth-fronds` are now included in the original fern
  library at mature fern scales. The original library consequently renders 132 instances in the same
  six draw calls, hides the giant procedural fallback, and keeps 1,716/1,716 rhizome support vertices
  in contact.
- `groundCoverDetail` and `21-review-ground-cover-detail.jpg` expose leaf curvature, petiole
  attachment, root-crown contact, size variation and the surrounding habitat without UI or tools.

## Rejected trials and diagnosis

- `rejected-overscale-faceted-leaves/` preserves the first 1,124-triangle ground-cover load. It passed
  a root-contact check but inherited oversized procedural placement scales and used only four to six
  triangles per broad leaf. The resulting multi-metre angular plants were rejected rather than
  hidden with colour grading.
- `rejected-legacy-foreground-frond/` preserves the source-isolation pair. Hiding the new ground-cover
  library did not remove the giant foreground triangle cluster; hiding
  `world.connected_route.foreground-depth-fronds` removed it completely. The accepted result replaces
  that separate fallback with supported original ferns instead of incorrectly tuning the new asset.

## Evidence

`before/` contains the previous verified fern-library pass. `after/` is the authoritative complete
run. Its `report.json` records:

- all three ground-cover variants loaded, 360 instances, six draw calls and the fallback hidden;
- **3,960 / 3,960** root-crown support vertices in band and all mature dimension envelopes passing;
- one **0.12 m** bounded relocation from a sharp break to continuous soil;
- 132 original fern instances replacing the twelve legacy foreground fronds, with **1,716 / 1,716**
  rhizome support vertices in band;
- **468.4 ms** first frame, **59.9 median FPS**, **57.1 FPS 1% low** and **17.5 ms** worst frame;
- Strong field record, clean restart and all mechanical visual-health gates passed with no console,
  page or WebGL errors.

This removes the identified giant foreground triangle cluster and closes one ground-cover asset,
scale and support gap. It does not prove Web Ocean parity: procedural tree-fern skirts and degradable
wetland accents remain visible in some brook/detail views, and the scene still lacks the reference's
breadth of curated vegetation, terrain transition sculpting and production texel density.
