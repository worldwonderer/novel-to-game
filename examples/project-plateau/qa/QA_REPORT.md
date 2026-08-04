# Project Plateau QA report

`targetFinish: playable-prototype`

**Local automated build handoff: PASS. Strict visual promotion: 100/100 PASS. Public-host smoke: PASS. Example publication: MAINTAINER-GO.**

**Authoritative runtime QA: PASS. Independent visual review: PASS. Visual promotion: PASS. Demonstrated/publication tier: `playable-prototype`.**

The final source-bound visual bundle passed all six visual targets, both supported
viewports and the fixed-transform bilateral pterodactyl wing sequence. The
independent record is
[`evidence/independent-visual-review-2026-08-04.md`](evidence/independent-visual-review-2026-08-04.md).

On 2026-08-01 the maintainer reported three successful informal first-time
sessions and explicitly accepted the project for publication under `examples/`.
The sessions did not retain the protocol's raw environment, timestamps, paths,
results or verbatim answers, so the specific first-time criteria remain
unverified in this repository. Independent anatomy/material/environment/light/
composition/motion/UI/runtime visual review now passes; full live colour-cue
route review remains `NOT_RUN`. Publication is a product decision with disclosed
evidence gaps, not an inferred general release pass.

Independent reviewer `/root/visual_v17_review` (`vision`) made no implementation
edits and judged only the approved targets and captured evidence. The final
verdict is PASS / GO for `playable-prototype`, with 0 blockers and 0 majors.
The durable rubric and reviewed paths are in
[`evidence/independent-visual-review-2026-08-04.md`](evidence/independent-visual-review-2026-08-04.md).

Nine focal release assets pass current runtime and review evidence. Audio remains
an explicitly degradable asset: authored sound captions and existing visual/state
feedback are the tested fallback. This supports a playable prototype, not polished
or showcase quality.

## Current authoritative run

| Field | Observed |
|---|---|
| Source commit | `null` — merge candidate is bound by canonical app fingerprint |
| App fingerprint | `8396d9b9879a3a934cac03cf83e02d1ccd305b77945185afce436094a46833e1` |
| Install | [`npm ci`](evidence/install.log) — 24 packages, 0 vulnerabilities |
| Verify | `npm run verify` |
| Result | exit `0`; 7/7 suites; 17/17 commands |
| Duration | `588739 ms` |
| Log | [`evidence/verify.log`](evidence/verify.log) |
| Structured handoff | [`verification.json`](verification.json) |
| Suite discovery | 22 registered pass/fail files; 2 explicit non-suite tools; 0 orphan |

The retained verification locator `4ee6f47bac6f0d4be248569a24c310a78e588d0a`
matches the candidate app bytes. The fingerprint remains the authoritative
current-run identity; the commit is historical location metadata.

The earlier `8793fb9` / `e99883ce…` 16-command run is historical gameplay
evidence only and is superseded by the current structured handoff above.

## Environment and budgets

| Surface | Environment | Result |
|---|---|---|
| Runtime | Node.js `v25.6.1`; npm `11.9.0`; Python `3.14.3` | PASS |
| Browser | Google Chrome `150.0.7871.187` | PASS |
| Viewports | target `1440×900`; minimum `1280×720` | PASS |
| Target heaviest state | median `59.9 FPS`; 1% low `39.4 FPS` | PASS vs `45/30`; active rendering capped near 60 FPS |
| Minimum heaviest state | median `59.9 FPS`; 1% low `38.9 FPS` | PASS vs `45/30`; active rendering capped near 60 FPS |
| Built payload | `3260635` raw bytes; `2017917` gzip bytes | PASS vs `50/20 MiB` |
| First local no-cache frame | `2997.6 ms` at simulated 25 Mbps | PASS vs `8000 ms` locally |
| Power policy | DPR capped at `1.25`; title `30 FPS`; paused `15 FPS`; hidden `4 FPS`; default GPU preference; no persistent drawing buffer | PASS |
| Runtime requests | only `127.0.0.1:4173`; no external host | PASS |
| Historical public preview | `https://plateau.vibecoco.ai`; Google Chrome `150.0.7871.187` | `HISTORICAL / NOT_CURRENT`; the retained run is bound to `e99883ce…`, not the current `1b0ae821…` candidate, and does not count as current release proof |

The loading measurement uses Chrome DevTools throttling against local Vite. It
does not measure public-host cold-cache timing. The separate historical
[`public-host`](evidence/public-host/report.json) record proves only the older
`e99883ce…` deployment; it is `HISTORICAL / NOT_CURRENT` for this candidate.
No deployed current-fingerprint PASS is claimed.

## Suite discovery and execution

| Suite | Discovered files or surfaces | Same-run result |
|---|---|---|
| `unit:simulation` | nine `test/*.test.js` files, 77 assertions | PASS |
| `build:production` | `index.html`, `src/`, `public/` | PASS; Vite production build |
| `browser:checkpoint-history` | `qa_s0.py`–`qa_s7.py`, `qa_s9.py` | PASS; 9/9 commands |
| `browser:complete-run` | `qa_s8.py` | PASS; Strong/Mixed/Panic plus achromatopsia Strong by keyboard/mouse |
| `browser:current-visual` | `qa_s10.py`, `qa_visual_targets.py`, `capture_visual_upgrade.py` | PASS; glade/plates, four-state checkpoints for three additional vision deficiencies, six visual targets, eight creature orbits and four motion sequences |
| `qa:design-invariants` | `qa/check_design_invariants.py` | PASS; 10/10 design-derived checks |
| `repo:contract` | validator and repository unit discovery | PASS; validator plus 31 repository tests |

## Complete run

The `s8-strong-input-only` record is one normal-speed browser path. It does not
invoke `teleportForTest` or `advanceTimeForTest`.

| Step | Input and expected change | State | Browser | Visual |
|---|---|---|---|---|
| Clean start | Enter the basin; receive a fresh 180-second field order | [`00`](../build/evidence/s8/state/00-clean-field-order.json) | [`00`](../build/evidence/s8/browser/00-clean-field-order.json) | [`00`](../build/evidence/s8/00-clean-field-order.jpg) |
| First proof | Walk to brook, examine, raise camera, expose plate | [`01`](../build/evidence/s8/state/01-strong-brook-frame.json) | [`01`](../build/evidence/s8/browser/01-strong-brook-frame.json) | [`01`](../build/evidence/s8/01-strong-brook-frame.jpg) |
| Full proof | Use cover, reach glade, expose young-play and branch-pull plates | [`03`](../build/evidence/s8/state/03-strong-glade-frames.json) | [`03`](../build/evidence/s8/browser/03-strong-glade-frames.json) | [`03`](../build/evidence/s8/03-strong-glade-frames.jpg) |
| Threat response | Retreat under cover until the final dive widens | [`04`](../build/evidence/s8/state/04-strong-covered-return.json) | [`04`](../build/evidence/s8/browser/04-strong-covered-return.json) | [`04`](../build/evidence/s8/04-strong-covered-return.jpg) |
| Result | Follow the covered return to Fort with four surviving views | [`05`](../build/evidence/s8/state/05-strong-input-result.json) | [`05`](../build/evidence/s8/browser/05-strong-input-result.json) | [`05`](../build/evidence/s8/05-strong-input-result.jpg) |
| Restart | Choose “Take the route again”; restore unexposed plates and zero travel | [`06`](../build/evidence/s8/state/06-strong-clean-restart.json) | [`06`](../build/evidence/s8/browser/06-strong-clean-restart.json) | [`06`](../build/evidence/s8/06-strong-clean-restart.jpg) |

Observed Strong result: 7 evidence, 4 surviving plates, covered return, no shot,
body margin retained, 93.5 seconds remaining. Mixed reached corroborating
evidence 4 with three plates, one shot and the brook callback. Panic spent both
rounds and failed on the second unblocked strike. Each terminal state has its
own clean restart checkpoint.

The runner then repeated the complete Strong input path under Chromium
achromatopsia: field order, first proof, glade proof, covered defense, Strong
result and clean restart. S10 separately records order, glade, attack/defense
and Strong-result checkpoints under protanopia, deuteranopia and tritanopia.
These records prove input and UI-state continuity under the emulator. They leave
human cue readability to the independent review.

## Independent design checks

[`evidence/design-invariants.md`](evidence/design-invariants.md) derives ten
expectations from `PRODUCT_BRIEF.md` and `GAME_DESIGN.md` rather than importing
runtime constants. It independently checks the common source fingerprint, five
verbs, Strong/Mixed/Panic bands, three terminal restarts, the input/network
boundary, both viewport budgets, current visual floors and the colour-vision
evidence matrix: **10/10 PASS**.

This establishes deterministic agreement with the approved thresholds. It does
not make the implementation author independent, and it cannot answer first-time
comprehension or subjective visual questions.

## Evidence boundaries and open gates

First-time players can join through the
[public playtest discussion](https://github.com/worldwonderer/novel-to-game/discussions/7).
Informal play reports and discussion replies do not clear an evidence-qualified
gate until they satisfy the raw-record fields and decision rule in
`PLAYTEST_PROTOCOL.md`.
Independent 3D, animation, illustration, or game-art reviewers can use the
[visual-review discussion](https://github.com/worldwonderer/novel-to-game/discussions/8);
their findings still require the live-run evidence and disposition defined by
`PERCEPTION_REVIEW_PROTOCOL.md`.

| Gate | Status | Publication disposition | Required next evidence |
|---|---|---|---|
| Three first-time players recognize 3D action/exploration and not a text/VN presentation | INFORMAL_PLAY_REPORTED / CRITERION_NOT_RECORDED | accepted for example publication; evidence-qualified PASS remains open | Three raw sessions using [`PLAYTEST_PROTOCOL.md`](PLAYTEST_PROTOCOL.md); at least two meet the stated threshold |
| First meaningful interaction within 90 seconds and result within 15 minutes | INFORMAL_PLAY_REPORTED / CRITERION_NOT_RECORDED | accepted for example publication; evidence-qualified PASS remains open | Timestamped, uncoached player records using the same protocol |
| Players can restate scout/proof/extract rather than “shoot dinosaurs” | INFORMAL_PLAY_REPORTED / CRITERION_NOT_RECORDED | accepted for example publication; evidence-qualified PASS remains open | Verbatim post-run answers linked to each raw session |
| Independent non-compensating visual review | PASS — 100/100; VT01–VT06 PASS | cleared for the source-bound v23 visual promotion | [`evidence/perception/hy3d-v23-independent-review.md`](evidence/perception/hy3d-v23-independent-review.md), [`PERCEPTION_REVIEW_PROTOCOL.md`](PERCEPTION_REVIEW_PROTOCOL.md) |
| Input routes and checkpoints under colour-vision modes | AUTOMATED_PASS / HUMAN_REVIEW_NOT_RUN | accepted risk for example publication | Full-colour + achromatopsia routes and the three specified checkpoint sets exist; an independent reviewer must still judge cue readability |
| Anonymous public HTTPS load, play, result and restart | PASS | cleared | [`evidence/public-host/report.json`](evidence/public-host/report.json): clean Chrome context, source fingerprint, 46 real-input steps, Strong/Mixed/Panic plus achromatopsia Strong, result and restart; zero console errors or third-party runtime hosts |
| Platform upload/transcode for short media | NOT_RUN | not required for the hosted example; still blocks claiming an uploaded attachment | Uploaded file hash and playback check |

No subjective fun, balance, audio-mix or full live colour-cue readability claim
is marked PASS. The strict visual rubric passes anatomy, material, environment,
light, composition, motion, UI and runtime/accessibility for the bound v23
candidate; it does not certify scientific reconstruction or commercial art
quality. Numeric image floors alone still only catch gross occlusion, flat
exposure or missing state.

## Reproduce

From `examples/project-plateau/build/app/`:

```bash
npm ci
npm run verify
```

The command rewrites the stage evidence, design-invariant audit, authoritative
log and structured handoff. A passing run requires every suite and command to
execute in that invocation.
