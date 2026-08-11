# Basalt rubble multipoint-settlement pass

## Target

Replace the red-basalt landmark's repeated black polyhedral dice with source-coupled angular talus
that visibly rests on the escarpment, remains outside navigation and preserves the existing one-draw
rubble budget.

## Root cause

The former rubble reused a DodecahedronGeometry silhouette, sampled only a nominal placement
height and carried a nearly black uniform response. The pieces repeated the same toy-like volume,
could not prove a broad support footprint and did not read as fragments shed by the eighteen cooling
columns above them.

## Rejected iteration

The first angular-talus integration passed support and runtime checks but used a bright salmon
multiplier. It separated too strongly from the weathered source rock and read as newly painted props,
so it was rejected before the accepted evidence run.

## Accepted change

- Reuses the project-original joint-bounded angular-talus family for all **44** rubble placements.
- Preserves one instanced draw and derives the downslope distribution from the existing **18** source
  pillars.
- Aligns every piece to the sampled terrain normal and settles a closed flat footprint by **18**
  support vertices with **1.8–3.97 cm** deterministic shallow burial.
- Records **44/44** supported placements, **-3.97..+1.30 cm** support clearance and at least **18**
  contact vertices per placement.
- Uses a dark weathered oxidized-basalt dielectric response rather than black plastic or bright
  salmon; emission and metalness remain zero.
- Keeps the complete rubble field non-solid and beyond the navigation boundary.

## Fixed-frame evidence

The Strong basalt frame changes **15.91%** of pixels above 3/255 and **4.53%** above 12/255.
The fixed basalt, escarpment-contact and stability-limited slope views change
**3.02–5.04% / 0.36–1.71%**. The accepted frames replace repeated dice with elongated, differently
oriented fragments that follow the slope without introducing a new collision surface.

See comparison-basalt-rubble.jpg and metrics.json.

## Runtime result

- Complete real-input Strong path: **PASS**.
- Launch, rendering, input, core loop, outcome and restart: **PASS**.
- 194/194 application tests in the final integrated tree: **PASS**.
- 180-frame accepted-pass sample: **59.9 median FPS**, **43.4 FPS 1% low**,
  **23.1 ms worst frame**.
- Browser/runtime/WebGL errors: none.

## Visual-parity estimate

The editorial estimate against pinned Web Ocean commit
6496c77d37c12e803108c8f932680a7710a62c1c moves from roughly **93% to 94%**, with an honest
uncertainty of about **±3 percentage points**. This is a visual-direction estimate, not a
deterministic QA score.

## Remaining gap

The accepted family closes the obvious toy-rubble failure but remains one deterministic code-authored
talus grammar. A larger production library could add source-specific fracture ages, lichen succession
and individually sculpted hero fragments without changing the established support and navigation
contract.
