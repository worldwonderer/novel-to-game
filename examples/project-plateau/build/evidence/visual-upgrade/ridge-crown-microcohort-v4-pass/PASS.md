# Ridge crown microcohort v4 pass

## Target

Remove the remaining ball-and-cone skyline grammar from the two distant ridge forests without adding
trees, draw calls, unsupported crown volumes or collision authority.

## Root cause

The v3 broad crown had a physically supported dominant mass and three shoulders, but at review
distance those volumes merged into one smooth balloon. The narrow crown remained one layered shell,
so repeated instances still read as chess pieces even though their roots and habitat placement were
physically valid.

## Accepted change

- Keeps **598** mature trees, **220** gap-sourced understory crowns, **818** crowns total and the same
  **six instanced draw calls** across the two rendered ridge meshes.
- Rebuilds each broad crown as **11 closed leaf cohorts** connected by **nine closed tapered branches**.
  Every branch begins inside the trunk/leader or a parent cohort and ends inside its supported cohort.
  The resulting 20-component crown remains **520 triangles**, equal to the previous broad-crown
  budget rather than buying the improvement through more geometry.
- Rebuilds each narrow crown as four overlapping closed whorls around one closed tapered leader.
  The five-component result is bounded to **500 triangles** and remains attached to the existing trunk.
- Retains height/age, slope, drainage, exposed-stone, stable phase, asymmetry and bounded damage as
  instance sources. Branch/leader vertices remain excluded from foliage deformation.
- Changes no ridge geometry, establishment count, exact-triangle root support, terrain material,
  navigation, collision, sun, exposure, fog or gameplay value.

## Fixed-frame evidence

The dedicated ridge-volume frame changes **8.60%** of pixels above 3/255 and **2.96%** above 12/255;
the closer boundary-forest inspection changes **11.80% / 5.82%**. The brook view, where the same
ridge forest occupies a thinner horizon band, changes **5.66% / 1.71%**. The comparison shows broad
crowns resolving as asymmetric leaf cohorts and narrow crowns resolving as supported whorls rather
than repeated spheres or cones.

See `comparison-ridge-crowns.jpg` and `metrics.json`.

## Runtime result

- Complete real-input Strong path: **PASS**.
- Launch, rendering, input, core loop, outcome and restart: **PASS**.
- 194/194 application tests: **PASS**.
- 180-frame sample: **59.9 median FPS**, **54.2 FPS 1% low**, **18.5 ms worst frame**.
- Browser/runtime/WebGL errors: none.

## Visual-parity estimate

The editorial parity estimate against pinned Web Ocean commit
`6496c77d37c12e803108c8f932680a7710a62c1c` moves from roughly **91% to 92%**, with an honest
uncertainty of about **±3 percentage points**. This is a visual-direction estimate, not a deterministic
QA score.

## Remaining gap

The ridge forest still uses two shared code-authored crown families rather than Web Ocean's broader
species/age asset library. Near-field soil-to-root transitions, higher-resolution bank/rock dressing,
and production volumetric-cloud scattering remain more consequential than adding more ridge trees.
