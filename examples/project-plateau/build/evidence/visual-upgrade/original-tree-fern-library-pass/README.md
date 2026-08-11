# Original tree-fern library pass

## Target

Replace the twelve repeated procedural pole-and-umbrella tree ferns that dominated the route margins.
The replacement had to preserve the approved open central sightline and every authored tree anchor,
while proving a physically legible root-to-trunk-to-rachis-to-leaflet load path. Exposure, bloom,
emission and false ground shadows were not accepted as fixes.

## Accepted result

- One deterministic project-original GLB contains humid-arch, storm-swept and sheltered-tier mature
  tree ferns. Each variant has a closed root/trunk mesh, closed overlapping rachises and indexed,
  cambered attached leaflets. The runtime renders the three structural roles in nine instanced draw
  calls across the existing twelve placements.
- Habitat selection follows terrain wetness, slope and exposed/sheltered margin position. It produces
  3 humid, 5 wind-exposed and 4 sheltered trees without adding random placement authority.
- Every tree remains gravitropically vertical. Settlement translates the root mantle only along
  world gravity until no support contact can hover. All 408/408 measured root-contact vertices lie
  `1.8–17.36 cm` inside the rendered terrain.
- The largest rendered crown is `5.9463 m` across and the tallest tree is `6.0493 m`, both inside the
  locked `6.15 m` mature envelope. Existing x/z anchors remain unchanged.
- Collision is restricted to the solid fibrous trunk (`3.5 × placement scale` high). Flexible fronds
  and sub-step roots do not create an invisible full-crown cylinder.
- Bark and leaf albedo, roughness and relief are correlated, locally authored and non-emissive.
  Rachis/leaflet flex is stored independently from texture UVs; colour and depth passes use the same
  bounded wind function and uniforms.

## Rejected first browser result

The first load passed topology and support checks but failed the fixed low camera: leaflet surfaces
were authored against a world-horizontal radial rather than each curved rachis tangent, so the lower
laminae turned edge-on and the crown read as bare umbrella ribs above a sawn-off trunk. The accepted
asset follows the local rachis tangent, adds a closed crown hub and varies mature frond tiers. The
problem was not repaired by increasing exposure or leaf emission.

## Evidence

`after/report.json` records:

- all three variants loaded, the four procedural fallback draw calls hidden, and 12/12 placement
  anchors retained;
- 408/408 root contacts supported, gravity-only settlement and all trunks vertical;
- all twelve mature dimension envelopes passing;
- shared colour/depth wind displacement with zero metalness and emission;
- **711.9 ms** first frame, **59.9 median FPS**, **39.2 FPS 1% low**, **25.5 ms** worst frame;
- Strong field record, clean restart and all mechanical visual-health checks passing without console,
  page or WebGL errors.

`22-review-tree-fern-detail.jpg` is the accepted fixed low view. `08-review-brook.jpg`,
`10-review-glade.jpg` and `13-review-ridge-volume.jpg` show the same library at route-composition scale.
These checks prove support, scale, energy and runtime behavior; they do not prove subjective parity
with Web Ocean.
