# Mixed-age ground-cover architecture pass

## Target

Remove the remaining foreground `plastic tube + radial umbrella` read without hiding ground cover,
inflating ecological density, changing collision, or borrowing Web Ocean assets.

## Accepted change

- Rebuilt the project-original ground-cover library as `original-ground-cover-library-v3`.
- Replaced equal-height radial fans with deterministic juvenile-to-mature leaf and petiole cohorts.
- Reduced source petiole radii by **38.89% / 44.12% / 42.86%** and raised their closed radial
  section from five to six sides.
- Added one leaf phase attribute shared by each closed petiole and its attached lamina. It drives
  bounded per-instance yaw, radial and vertical variation in the identical colour/depth vertex path,
  so repeated placements vary without new draw calls or detached shadows.
- Kept every measured petiole-to-lamina centroid gap below **0.1 mm**.
- Darkened the herbaceous support multiplier while keeping it inside the repository's mid-value
  dielectric energy gate.
- Increased the procedural leaf surface field from 64² to 96² and added correlated secondary veins.

## Physical evidence

All **360** placements remain in the same habitat distribution and six draw calls. All
**5,400/5,400** rhizome support samples remain **5.05–5.35 cm below** the rendered terrain, with no
horizontal relocation. Render-aware maximum diameter/height changed as follows:

| Family | v2 diameter / height | v3 diameter / height |
| --- | ---: | ---: |
| Brook arrowhead | 0.9755 / 0.3912 m | 0.7420 / 0.3112 m |
| Shade rosette | 0.7891 / 0.2069 m | 0.4865 / 0.1760 m |
| Slope sedge | 0.7796 / 0.5728 m | 0.7075 / 0.4746 m |

## Fixed-frame evidence

| Frame | Mean absolute RGB | Pixels above 3/255 | Pixels above 12/255 |
| --- | ---: | ---: | ---: |
| `21-review-ground-cover-detail` | 2.660 | 20.87% | 10.38% |
| `08-review-brook` | 0.245 | 2.36% | 0.23% |
| `10-review-glade` | 0.225 | 2.13% | 0.13% |
| `28-review-bryophyte-ground-layer` | 0.239 | 1.99% | 0.04% |

The large change is concentrated in the dedicated foreground inspection; broader environment views
change only where the ground-cover batch is visible.

## Runtime result

- Complete real-input Strong path: **PASS**.
- Launch, rendering, input, core loop, outcome and restart: **PASS**.
- 180-frame sample: **59.9 median FPS**, **39.1 FPS 1% low**, **25.6 ms worst frame**.
- Asset cost: **2,526 → 2,712 triangles**, **120,604 → 127,188 bytes**, still six draw calls.
- Browser/runtime errors: none.

## Remaining gap

This pass removes the most visible foreground scale and architecture error. It does not claim Web
Ocean parity: Plateau still needs deeper species/age variety, higher-density terrain-to-litter
transitions, less repetitive distant crowns, and stronger atmosphere/landscape-light coupling.
