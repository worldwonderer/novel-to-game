# Ridge surface biophysical-continuity v2 pass

## Target

Turn the pale cyan, sparsely planted horizon into one terrain–substrate–canopy mass comparable to Web
Ocean's island silhouette, without adding draw calls, floating roots or collision authority.

## Root cause

The v4 ridge forest sampled one candidate per surface cell and therefore left large blank areas
between **598** trunks and **220** understory crowns. The surface shader used only broad drainage,
stone and height response over a pale cyan source colour, so the slope read as a smooth backdrop
behind repeated tree icons rather than as the substrate supporting a forest.

## Rejected iteration

A shader-only trial added slope/aspect detail but retained the pale source colours and sparse sampling.
The fixed views showed almost no meaningful change. It was rejected rather than claiming an
imperceptible procedural field as progress.

## Accepted change

- Upgrades the surface profile to process-coupled-distant-ridge-surface-v2, with stable
  **37/13/9 m** broad, fine and micro response sourced from rendered normal, slope, solar aspect,
  drainage, exposed stone and height.
- Raises bounded humus, vegetated-soil, slope-substrate and stone blending to
  **0.38 / 0.46 / 0.36 / 0.45**, while retaining opaque, non-emissive, zero-metalness materials.
- Changes the far/near source colours to grounded gray-green #394840 / #3c4a35 instead of cyan.
- Uses two stratified surface samples per cell while keeping the existing three instanced draws per
  ridge and **six total draws**.
- Grows the supported horizon from **598** trunks plus **220** understory crowns to **1,203** trunks
  plus **400** understory crowns, or **1,603 total crowns**.
- Records **555/648** far/near trunks and **176/224** far/near understory crowns. Every mature and
  understory root remains barycentrically supported by its exact rendered ridge triangle with zero
  positive clearance.
- Adds no navigation, collision or surveyed-geology claim.

## Fixed-frame evidence

The dedicated ridge-volume view changes **16.52%** of pixels above 3/255 and **10.89%** above
12/255. The complete-boundary view changes **28.29% / 20.66%**, while the Strong brook frame changes
**19.09% / 7.11%** because the horizon is intentionally part of its composition. The accepted frames
show a materially denser closed forest mass and gray-green substrate instead of empty cyan wall.

See comparison-ridge.jpg and metrics.json.

## Runtime result

- Complete real-input Strong path: **PASS**.
- Launch, rendering, input, core loop, outcome and restart: **PASS**.
- 194/194 application tests in the final integrated tree: **PASS**.
- 180-frame accepted-pass sample: **59.9 median FPS**, **40.5 FPS 1% low**,
  **24.7 ms worst frame**.
- Browser/runtime/WebGL errors: none.

## Visual-parity estimate

The editorial estimate against pinned Web Ocean commit
6496c77d37c12e803108c8f932680a7710a62c1c moves from roughly **94% to 95%**, with an honest
uncertainty of about **±3 percentage points**. This is a visual-direction estimate, not a
deterministic QA score.

## Remaining gap

The horizon now reads as a coherent forested landform, but it remains a bounded low-poly distant
system rather than a production species library. Additional work should change silhouette identity
or disturbance history, not multiply the accepted density merely to chase count.
