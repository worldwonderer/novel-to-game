# Project Plateau QA report

`targetFinish: playable-prototype`

## Current verdict · 2026-08-02

**Authoritative runtime QA: PASS. Independent visual review: PASS. Visual promotion: PASS. Demonstrated/publication tier: `playable-prototype`.**

The current `npm run verify` invocation passes 7/7 suites and 17/17 commands,
including input-only Strong/Mixed/Panic paths, terminal results, clean restart,
S10 visual/state coverage and the registered deterministic dual-viewport capture.
The source fingerprint is
`8329da6c8289acfa826e6cfb773e983f9fc270e366f5d375f679f21b5596c6c6`;
the run completed in `481532 ms` with no failed command.

Independent reviewer `/root/visual_review` (`vision`) made no implementation
edits and judged only the approved targets and captured evidence. The verdict is
PASS for `playable-prototype`: 0 blockers, 0 majors and 6 disclosed minors. The
folded diagonal dive and material-response majors are closed. The durable rubric,
minor wording and reviewed paths are in
[`evidence/independent-visual-review-2026-08-02.md`](evidence/independent-visual-review-2026-08-02.md).

Nine focal release assets pass current runtime and review evidence. Audio remains
an explicitly degradable asset: authored sound captions and existing visual/state
feedback are the tested fallback. This supports a playable prototype, not polished
or showcase quality.

## Current authoritative run

| Field | Observed |
|---|---|
| Source commit | Uncommitted current candidate; commit fields remain null until source and evidence are committed together |
| App fingerprint | `8329da6c8289acfa826e6cfb773e983f9fc270e366f5d375f679f21b5596c6c6` |
| Verify | `npm run verify` |
| Result | exit `0`; 7/7 suites; 17/17 commands |
| Duration | `481532 ms` |
| Log | [`evidence/verify.log`](evidence/verify.log) |
| Structured handoff | [`verification.json`](verification.json) |
| Visual review | [`evidence/independent-visual-review-2026-08-02.md`](evidence/independent-visual-review-2026-08-02.md) — PASS, 0 blocker / 0 major / 6 minor |

The earlier `8793fb9` / `e99883ce…` 16-command run is historical gameplay
evidence only and is superseded by the current structured handoff above.

## Environment and budgets

| Surface | Environment | Result |
|---|---|---|
| Runtime | Node.js `v25.9.0`; npm `11.12.1`; Python `3.14.5` | PASS |
| Browser | Google Chrome `150.0.7871.187` | PASS |
| Viewports | target `1440×900`; minimum `1280×720` | PASS |
| Target heaviest state | median `120.5 FPS`; 1% low `106.4 FPS` | PASS vs `45/30` |
| Minimum heaviest state | median `120.5 FPS`; 1% low `107.5 FPS` | PASS vs `45/30` |
| Built payload | `602904` raw bytes; `154906` gzip bytes | PASS vs `50/20 MiB` |
| First local no-cache frame | `2198.3 ms` at simulated 25 Mbps | PASS vs `8000 ms` locally |
| Runtime requests | only `127.0.0.1:4173`; no external host | PASS |
| Historical public preview | `https://plateau.vibecoco.ai`; Google Chrome `150.0.7871.187` | `HISTORICAL / NOT_CURRENT`; the retained run is bound to `e99883ce…`, not the current `8329da6c…` candidate, and does not count as current release proof |

The loading measurement uses Chrome DevTools throttling against local Vite. It
does not measure public-host cold-cache timing. The separate historical
[`public-host`](evidence/public-host/report.json) record proves only the older
`e99883ce…` deployment; it is `HISTORICAL / NOT_CURRENT` for this candidate.
No deployed current-fingerprint PASS is claimed.

## Suite discovery and execution

| Suite | Discovered files or surfaces | Same-run result |
|---|---|---|
| `unit:simulation` | four `test/*.test.js` files, 35 assertions | PASS |
| `build:production` | `index.html`, `src/`, `public/` | PASS; Vite production build |
| `browser:checkpoint-history` | `qa_s0.py`–`qa_s7.py`, `qa_s9.py` | PASS; 9/9 commands |
| `browser:complete-run` | `qa_s8.py` | PASS; Strong/Mixed/Panic plus achromatopsia Strong by keyboard/mouse |
| `browser:current-visual` | `qa_s10.py`, `capture_visual_upgrade.py` | PASS; glade/plates, four-state checkpoints for three additional vision deficiencies and deterministic dual-viewport captures |
| `qa:design-invariants` | `qa/check_design_invariants.py` | PASS; 10/10 design-derived checks |
| `repo:contract` | validator and repository unit discovery | PASS; 7 skills, 63 tests |

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
body margin retained, 100.004 seconds remaining. Mixed reached corroborating
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
| Independent anatomy, motion and composition review | PASS — 0 blocker / 0 major / 6 minor | clears playable-prototype visual gate | [`evidence/independent-visual-review-2026-08-02.md`](evidence/independent-visual-review-2026-08-02.md) |
| Input routes and checkpoints under colour-vision modes | PASS for playable-prototype | current automated matrix plus independent achromatopsia attack judgment | [`verification.json`](verification.json), [`evidence/independent-visual-review-2026-08-02.md`](evidence/independent-visual-review-2026-08-02.md) |
| Anonymous public HTTPS load, play, result and restart | HISTORICAL / NOT_CURRENT | does not count as current release proof; local evidence remains sufficient for the playable-prototype tier | [`evidence/public-host/report.json`](evidence/public-host/report.json) is bound to `e99883ce…`, not the current `8329da6c…` candidate |
| Platform upload/transcode for short media | NOT_RUN | not required for the hosted example; still blocks claiming an uploaded attachment | Uploaded file hash and playback check |

No subjective fun, balance or production audio-mix claim is marked PASS.
Anatomy, motion, composition and colour-cue readability pass only at the
playable-prototype threshold under the named independent review; numeric image
floors remain limited to gross occlusion, flat exposure or missing state.

## Reproduce

From `examples/project-plateau/build/app/`:

```bash
npm ci
npm run verify
```

The command rewrites the stage evidence, design-invariant audit, authoritative
log and structured handoff. A passing run requires every suite and command to
execute in that invocation.
