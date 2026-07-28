# Progress

> `qa` gate not passed: the slice is playable and mechanically clean (28/28 browser assertions,
> engine invariants hold), but all 6 release-gated image keys are still grey boxes, so the
> release gate in `ART_DIRECTION` §16.1 cannot be met. This is a working greybox milestone,
> not a finished game.

- Source: Project Gutenberg, *Frankenstein; or, The Modern Prometheus* (1818), public domain
- Mode: `quick`
- Chosen concept: `The Hovel` — the creature's year at the chink, chapters XI–XVI
- Current stage: `qa`
- Completed: `intake`, `analyze`, `concept`, `design`, `art`, `build`
- Coverage: `analysis/_coverage.md` (source 24 / succeeded 24 / failed 0)
- gate:analyze pass
- gate:concept pass
- gate:design pass
- gate:art pass
- gate:build pass
- gate:qa fail(1 `major`: 6 release-gated image keys absent, all on grey-box fallback;
  2 `minor` open: 23 s held cold open before the first interactive verb, no ending reached yet)
- Reflow record: 2026-07-28 first independent QA. 1 `blocker` found and fixed —
  `step()`'s `title` case never called `engine.tick()`, so `phaseTick` stayed 0, `titleBeat`
  stayed 0, and the title text and all three verbs were never drawn; the first screen was two
  blank shapes with no way in. Also fixed 2 `minor` occlusion defects (title crossing the
  platemark; the prompt band covering the tally plank and food heap).
- Evidence: `qa/evidence/automated.json` (28 passed / 0 failed, 0 console errors, 0 external
  request domains, frame p95 10.3 ms, build 0.09 MB), `qa/evidence/browser/` 10 frames,
  `node qa/design_invariants.mjs` all sections hold
- Verified path: boot → title → cold open → night → night 2 → restart, run twice —
  mouse-primary and keyboard-only. Determinism confirmed under a fixed seed.
- Not verified: no ending reached (walk / door / endings untested); timing evidence invalid
  (accelerated run, needs a `QA_SLOW=1` pass); signature frames undecidable while every plate is
  a grey box; no clean-context onboarding judgement; no audio; no human playtest protocol yet
- Assets: image generation attempted 2026-07-28 and did not return inside a 180 s bound, so all
  15 generated keys stay pending on their grey-box / degraded expression, per
  `ART_DIRECTION` §15. Not a blocker for running; is a blocker for release.
- Licence: `public_domain_source`
- Updated: 2026-07-28
