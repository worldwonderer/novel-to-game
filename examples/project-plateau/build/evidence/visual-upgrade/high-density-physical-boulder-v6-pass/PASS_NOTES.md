# High-density physical brook-boulder v6 pass

## Accepted change

- Replaced the review-scale v5 main mass (**12 sectors / 144 triangles**) with a deterministic
  closed v6 mass (**48 sectors / 14 surface rings / 1,344 triangles**).
- Kept the approved physical envelope: **2.4794 m** world-space long axis after placement scale,
  **1.8200 m³** closed local volume, broad coplanar support polygon and centre of mass inside that
  polygon.
- More than 90% of coincident geometric vertices share continuous normals. Exactly **50** vertices
  retain a greater-than-8-degree normal split at the five authored fracture transitions; the mesh no
  longer exposes every carrier triangle as a fake fracture.
- Raised the five closed, independently settled spalls from **108** to **282** triangles without
  adding collision authority. The main mass remains the only solid obstacle.
- Darkened the dielectric rock multiplier from `#858d88` to `#747c76`, increased correlated
  triplanar relief sampling density, and retained zero metalness/emission plus the irregular
  porosity-sourced lower capillary band.

## Physical and runtime evidence

- Browser support evidence: **570/570** main-mass and spall support samples accepted,
  **-8.50..+0.69 cm** clearance against the same rendered/collision terrain.
- The residual-bank transport class and approved **2.48 m** immobile long axis are unchanged.
- Complete-run checks for launch, render, input, core loop, outcome and restart all pass with no
  browser/page/console error.
- Current run: **1,901.6 ms** first frame, **59.9 FPS** median, **39.1 FPS** one-percent-low and
  **25.7 ms** worst frame. The added geometry does not consume the 30 FPS product margin.

## Fixed-frame delta from v5

- `19-review-brook-boulder-detail.jpg`: mean absolute channel delta **1.470**;
  **8.38%** of pixels change above 3/255.
- `30-review-brook-obstacle-flow-detail.jpg`: mean delta **1.468**;
  **8.56%** of pixels change above 3/255.
- `31-review-brook-free-surface-profile.jpg`: mean delta **3.142**;
  **18.64%** of pixels change above 3/255.

The accepted images remove the twelve-sided crown and large triangular cheek planes visible in v5,
while retaining a few broad load-bearing fracture faces and an embedded gravity-supported base.
This is evidence of a specific focal-asset improvement, not a claim that the whole scene has reached
Web Ocean's subjective production quality.
