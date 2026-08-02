# Independent visual review · 2026-08-02

## Reviewer and independence

- Reviewer: `/root/visual_review`
- Agent role: `vision`
- Independence: the reviewer made no implementation edits. It judged only the
  approved visual targets and captured runtime evidence after implementation
  and evidence generation were complete.
- Target finish judged: `playable-prototype`

## Evidence reviewed

- `build/evidence/visual-upgrade/generated/contact-sheet-supported-viewports.png`
- `build/evidence/visual-upgrade/generated/title-1440x900.png`
- `build/evidence/visual-upgrade/generated/family-1440x900.png`
- `build/evidence/visual-upgrade/generated/dive-1440x900.png`
- `build/evidence/visual-upgrade/generated/title-1280x720.png`
- `build/evidence/visual-upgrade/generated/family-1280x720.png`
- `build/evidence/visual-upgrade/generated/dive-1280x720.png`
- `build/evidence/s10/04-achromatopsia-attack.jpg`
- Approved rubric and failure examples: `design/VISUAL_TARGETS.md`

The generated manifest binds the fixed `4.25s` animation time, both required
viewports, source target hashes and every captured output hash. The S10 frame
adds a non-colour attack-state check from the current authoritative run.

## Verdict

**PASS for `targetFinish: playable-prototype`.**

| Severity | Open count |
|---|---:|
| Blocker | 0 |
| Major | 0 |
| Minor | 6 |

## Frame rubric

| Dimension | Verdict | Evidence-qualified disposition |
|---|---|---|
| Focus | PASS | Title, family and attack each preserve a primary world-space read before supporting UI. |
| Silhouette | PASS | Family limbs/tails and the folded attack shape clear the playable-prototype major threshold; remaining stylisation issues are minor. |
| Depth | PASS | Near tools/cover, middle family/route and distant plateau/sky remain separated at both viewports. |
| Material / line | PASS | Creek layering/glint, faceted basalt values, skin plane/warm accents and warm membrane edge are directly visible; surface richness remains prototype-grade. |
| Light / colour | PASS | Warm/cool separation survives the reviewed full-colour and achromatopsia evidence. |
| HUD | PASS | The world remains primary and controls remain readable; the title's right-side dark mass is a minor composition issue. |
| Motion / feedback | PASS | Still evidence plus the authoritative state suite supports the required attack/read response; full cadence remains a minor evidence gap. |
| Artefacts | PASS | No blocker/major clipping, blank frame or broken render prevents the designed decision. |
| Failure examples | PASS | The candidate no longer fails as a repeated primitive diorama or horizontal flyover at the playable-prototype threshold. |

## Closed majors

1. **Dive pose and corridor — CLOSED.** The dive is now partially folded and
   spear-like on an upper-right-to-centre diagonal. Its continuous membrane and
   attack vector remain readable without colour.
2. **Material separation — CLOSED.** The creek has layered wet/glint response;
   basalt has faceted mineral values; skin has low-frequency planes and warm
   accents; the membrane carries a warm transmissive edge.

## Open minor findings

1. `VIS-MINOR-01` — Iguanodon round eyes and blunt muzzle remain slightly
   toy-like; hands and thumb accents are understated.
2. `VIS-MINOR-02` — The dive wingtip exits the top edge.
3. `VIS-MINOR-03` — The cover mouth / defensive choice is not explicit enough.
4. `VIS-MINOR-04` — Material differentiation is functional prototype quality,
   not showcase surface detail.
5. `VIS-MINOR-05` — The title's right tree canopy and menu form a heavy dark
   block.
6. `VIS-MINOR-06` — Still frames do not prove the full
   watch → bank → dive → pull-up cadence.

These minors do not block `playable-prototype`. They remain open and prevent
this review from supporting a polished or showcase claim.
