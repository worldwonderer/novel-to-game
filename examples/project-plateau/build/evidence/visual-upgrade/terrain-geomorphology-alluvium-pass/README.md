# Terrain geomorphology and alluvium pass

## Target

Reduce the broad brown-floor read without using exposure, emission, bloom, decals or a second visual
ground plane. Rendering, player collision, object settlement and brook hydrology must continue to
sample one CPU heightfield.

## Accepted physical model

- The brook centre removes up to **0.22 m** of material.
- The nearest shared brook-control-line frame measures bend direction and side. Inner bends accrete
  point bars up to **0.34 m**; outer bends erode cut banks up to **0.14 m**.
- An older floodplain bench adds at most **0.22 m**, including a bounded depositional fan around the
  existing saturated confluence. It is not a uniform ring around the channel.
- The family glade remains on an older irregular terrace separated by a **0.62 m** riser. The active
  channel is excluded, so both headwaters still drain to hydrology row 35.
- The alluvial material weight comes from those same depositional terms, then responds to wet-bank
  saturation, local slope, hollow retention, humus and route wear.
- The tridactyl mud mesh now covers only pressure deformation, displaced rim and standing water. Its
  former opaque radial carrier caused the pale circular halo visible in `before/11`.
- Terrain reclassification never relaxes plant size or support gates. Ground-cover and accent ferns
  are fitted to their mature envelopes, and one steep-site tree fern is uniformly reduced while its
  trunk stays vertical until all **408/408** root-mantle contacts lie within the recorded terrain band.

## Rejected iterations

- `rejected-underpowered-alluvium-and-stale-reach/`: the first weak symmetric bench was visually
  negligible; an old nine-hour Vite process also served stale reflection selection and was removed.
- `rejected-symmetric-bench-and-radial-track-carrier/`: mechanically passing, but the bench still
  read as equal treatment on both banks and the mud impression exposed its elliptical carrier as a
  bright halo. It is retained as the direct `before/` comparison.

## Accepted browser evidence

`after/report.json` records:

- complete Strong result and clean restart: **PASS**;
- terrain: **24,505** vertices, alluvium range **0..0.6039**, no authoritative random ecology mask;
- brook: unchanged interior confluence, gravity-level cross sections and camera-selected local
  reflection with no render error;
- ground cover: **3,960/3,960** supported contacts and every mature envelope passing;
- accent ferns: **1,144/1,144** supported contacts and every role envelope passing;
- tree ferns: **408/408** supported contacts, vertical trunks, minimum clearance **-0.2391 m**;
- authoritative 180-frame heavy-scene sample: **59.9 median FPS**, **54.3 FPS 1% low**,
  **18.4 ms worst frame**.

The fixed images prove the accepted candidate is rendered and mechanically coherent. They do not
claim subjective parity with Web Ocean; curated asset depth and production surface fidelity remain
the larger gap.
