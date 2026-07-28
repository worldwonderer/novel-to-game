# Progress

> `qa` gate not passed: the slice is playable and mechanically clean (28/28 browser assertions,
> engine invariants hold) and all 6 release-gated **image** keys are now generated and wired.
> Two release gates remain open — the Caslon font subset and the audio set — and no ending has
> been reached yet, so this is not a release build.

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
- gate:qa fail(1 `major` partly cleared: 6 gated image keys now present, but the Caslon fonts and
  the audio set are still absent; 2 `minor` open: 23 s held cold open before the first interactive
  verb, no ending reached yet; integration debt: cold slot and tally plank still flat greybox)
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
- Assets: all 6 release-gated plates generated 2026-07-28 (`plate/paper|title|room|hovel|door|fire`),
  sized to draw size and shipped as WebP — 17 MB PNG → 1.4 MB, total build 1.50 MB against a
  25 MB budget. They enter through `src/skin.js`; a key that fails to load still draws a grey box
  with its key name and the run continues. The 9 degradable keys remain on their named lesser
  expression. Fonts and audio still absent.
- Licence: `public_domain_source`
- Updated: 2026-07-28
