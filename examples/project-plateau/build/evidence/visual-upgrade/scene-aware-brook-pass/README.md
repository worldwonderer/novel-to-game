# Scene-aware brook and physical-contact pass

## Evidence boundaries

- `before/` is the verified `rock-physics-correction/after/` baseline.
- `after/` is the verified current run after the brook and bank-boulder changes.
- `08-review-brook.jpg` retains the established fixed camera on both sides.
- `11-review-brook-detail.jpg` is an additional close inspection camera introduced only in the
  after set; it is not a pixel-comparable before/after pair.
- The framebuffer checks reject blank, crushed and clipped captures. They do not score subjective
  material fidelity or prove Web Ocean parity.

## Accepted implementation

- 512×256 equirectangular environment probe assembled from actual scene layout and refreshed after
  the HY3D scene assets attach; no additional scene render occurs per frame.
- Water Fresnel begins at the dielectric fresh-water F0 (`0.02037`) instead of an invented 14%
  normal-incidence mirror floor.
- Approximate channel-bed transmission uses a sub-metre shallow-water optical path and
  Beer–Lambert wavelength absorption.
- The bank boulder is scaled to the creek, keeps its stable base nearly level, and is grounded from
  per-vertex terrain contact with a multi-point support assertion.

## Rejected spike

A true GPU cube capture plus screen-colour/depth refraction spike was discarded before this accepted
pass. In the tested renderer lifecycle it corrupted later lit meshes into black silhouettes, while
the extra backdrop pass exceeded the headless runtime budget. No cube target or screen-backdrop path
remains; the later `planar-reflection-pass` is a separate single-view, state-restored successor.

## Remaining visual gap

This probe is a bounded distant-environment approximation. It cannot reproduce planar parallax,
per-object occlusion, SSR detail or scene-depth refraction. Curated environment assets and authored
material fidelity also remain visibly below the Web Ocean reference.
